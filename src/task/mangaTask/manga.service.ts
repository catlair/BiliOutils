import type { Eplist, SearchMangaDto } from './manga.dto';
import { TaskConfig } from '@/config';
import * as mangaApi from './manga.request';
import { apiDelay, isBoolean, isUnDef, logger, random } from '@/utils';
import { Bilicomic } from '@catlair/bilicomic-dataflow';

let expireCouponNum: number;

/**
 * 获取即将过期的漫读券数量
 */
async function getExpireCouponNum() {
  expireCouponNum = 0;
  try {
    const { code, msg, data } = await mangaApi.getCoupons();
    if (code !== 0) {
      logger.error(`获取漫读券失败：${code} ${msg}`);
      return;
    }
    const { user_coupons } = data;
    if (user_coupons.length === 0) {
      logger.info('漫读券列表为空，跳过任务');
      return;
    }
    return user_coupons
      .filter(coupon => coupon.will_expire !== 0)
      .reduce((acc, coupon) => acc + coupon.remain_amount, 0);
  } catch (error) {
    logger.error(`获取漫读券异常: ${error}`);
  }
}

/**
 * 获取追漫列表
 */
async function getFavoriteList() {
  try {
    const { code, msg, data } = await mangaApi.getFavoriteList();
    if (code === 0) {
      return data;
    }
    logger.error(`获取追漫列表失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`获取追漫列表异常: ${error}`);
  }
}

/**
 * 获取漫画章节
 */
async function getMangaEpList(comic_id: number) {
  try {
    const { code, msg, data } = await mangaApi.getMangaDetail(comic_id);
    if (code !== 0) {
      logger.error(`获取漫画详情失败：${code} ${msg}`);
      return;
    }
    if (!data || !data.ep_list) {
      return;
    }

    const { disable_coupon_amount, ep_list, title } = data;
    // 去掉没有漫读券的章节
    return {
      title,
      ep_list: disable_coupon_amount ? ep_list.slice(disable_coupon_amount) : ep_list,
    };
  } catch (error) {
    logger.error(`获取漫画详情异常: ${error}`);
  }
}

/**
 * 获取购买信息
 */
async function getBuyCoupon(ep_id: number) {
  // web 中自动调取最后一话的
  try {
    const { code, msg, data } = await mangaApi.getBuyInfo(ep_id);
    if (code !== 0) {
      logger.error(`获取购买信息失败：${code} ${msg}`);
      return -1;
    }
    if (!data) {
      return -1;
    }
    if (!data.is_locked) return -2;
    if (!data.allow_coupon) {
      logger.debug(`漫画 ${ep_id} 不支持漫读券`);
      return -3;
    }
    if (data.recommend_coupon_id === 0 || data.remain_coupon === 0) {
      expireCouponNum = 0;
      logger.info('没有足够的漫读券了');
      return -4;
    }
    if (!data.remain_lock_ep_num) {
      logger.info(`漫画${data.comic_id}已经全部购买了`);
      return -5;
    }
    return data.recommend_coupon_id;
  } catch (error) {
    logger.error(`获取购买信息异常: ${error}`);
  }
  return -99;
}

/**
 * 购买漫画的一个章节
 * @return true 则不再购买
 */
async function buyOneEpManga(ep_id: number, countRef: Ref<number>) {
  try {
    const couponId = await getBuyCoupon(ep_id);
    if (couponId < 1) {
      if (couponId === -4) return true;
      if (couponId === -3) countRef.value++;
      return false;
    }
    const { code, msg } = await mangaApi.buyManga(ep_id, couponId);
    if (code !== 0) {
      logger.error(`购买漫画 ${ep_id} 失败：${code} ${msg}`);
      return false;
    }
    // 购买成功，则减少漫读券数量
    if (--expireCouponNum <= 0) {
      logger.verbose('即将过期的漫读券已经用完');
      return true;
    }
  } catch (error) {
    logger.error(`购买漫画异常：`, error);
  }
  return false;
}

/**
 * 搜索漫画
 */
async function searchManga(keyword: string) {
  try {
    const { code, msg, data } = await mangaApi.searchManga(keyword);
    if (code === 0) {
      return data;
    }
    logger.error(`搜索漫画失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`搜索漫画异常: ${error}`);
  }
}

/**
 * 购买漫画
 */
async function buyManga(comic_id: number) {
  const { title, ep_list } = (await getMangaEpList(comic_id)) || {};
  const epList = filterLocked(ep_list);
  if (epList.length === 0) {
    return false;
  }
  logger.info(`购买漫画${comic_id}《${title}》`);
  const countRef = { value: 0 };
  for (let index = 0; index < epList.length; index++) {
    await apiDelay(100, 150);
    if (await buyOneEpManga(epList[index].id, countRef)) return true;
    // 超过 5 个不支持漫读券的章节，则不再购买
    if (countRef.value > 5) return false;
  }

  function filterLocked(epList: Eplist[] = []) {
    return epList.filter(ep => ep.is_locked);
  }
}

/**
 * 通过 mc 购买漫画
 */
async function buyMangaByMc() {
  const { mc } = TaskConfig.manga;
  if (mc.length === 0) {
    return;
  }
  for (let index = 0; index < mc.length; index++) {
    const mcId = mc[index];
    if (await buyManga(mcId)) return true;
  }
}

/**
 * 通过名字购买漫画
 */
async function buyMangaByName() {
  const { name } = TaskConfig.manga;
  if (name.length === 0) return false;
  type SearchList = {
    keyword: string;
    mangas: SearchMangaDto['data']['list'];
  };

  const searchList: SearchList[] = [];
  for (let index = 0; index < name.length; index++) {
    const keyword = name[index];
    const mangas = await searchManga(keyword);
    if (!mangas || mangas.list.length === 0) {
      continue;
    }
    // 先找完全匹配的
    const manga = mangas.list.find(manga => manga.title === keyword);
    if (!manga) {
      searchList.push({
        keyword,
        mangas: mangas.list,
      });
      continue;
    }
    if (await buyManga(manga.id)) return true;
  }

  // 模糊匹配 searchList
  for (const { mangas, keyword } of searchList) {
    const manga = mangas.find(manga => manga.title?.includes(keyword));
    if (!manga) continue;
    if (await buyManga(manga.id)) return true;
  }
}

/**
 * 通过追漫列表购买漫画
 */
async function buyMangaByLove() {
  const { love } = TaskConfig.manga;
  if (!love) return false;
  const favoriteList = await getFavoriteList();
  if (!favoriteList || favoriteList.length === 0) {
    return false;
  }
  for (let index = 0; index < favoriteList.length; index++) {
    const favorite = favoriteList[index];
    if (await buyManga(favorite.comic_id)) return true;
  }
}

export async function buyMangaService() {
  const { buy } = TaskConfig.manga;
  if (!buy) {
    return false;
  }
  const num = await getExpireCouponNum();
  if (isUnDef(num)) {
    return false;
  }
  if (num <= 0) {
    logger.info('没有即将过期的漫读券，跳过任务');
    return false;
  }
  logger.info(`即将过期的漫读券数量：${num}`);
  expireCouponNum = num;
  // 依次购买
  for (const buy of [buyMangaByMc, buyMangaByName, buyMangaByLove]) {
    if (expireCouponNum <= 0) return true;
    logger.debug(`开始购买漫画：${buy.name}`);
    if (await buy()) return true;
  }
  return false;
}

export async function mangaSign() {
  const { sign } = TaskConfig.manga;
  if (!sign) {
    return;
  }
  try {
    const { code, msg } = await mangaApi.clockIn();
    switch (code) {
      case 0:
        return logger.info('漫画签到成功');
      case 1:
      case 'invalid_argument':
        return logger.info('已经签过到了');
      default:
        return logger.warn(`漫画签到失败：${code}-${msg}`);
    }
  } catch (error) {
    /**
     * 这是axios报的错误,重复签到后返回的状态码是400
     * 所以将签到成功的情况忽略掉
     */
    const { status, statusCode } = error.response || {};
    if (status === 400 || statusCode === 400) {
      logger.info('已经签到过了');
    } else {
      logger.error(`漫画签到异常：`, error);
    }
  }
}

async function getSeasonInfo() {
  try {
    const { code, data, msg } = await mangaApi.getSeasonInfo();
    if (code === 0) {
      return data;
    }
    logger.warn(`获取赛季信息失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`获取赛季异常：`, error);
  }
}

export async function takeSeasonGift() {
  try {
    const seasonInfo = await getSeasonInfo();
    if (!seasonInfo) {
      logger.debug('没有赛季信息，跳过任务');
      return;
    }

    const { code, msg } = await mangaApi.takeSeasonGift(seasonInfo.season_id);
    if (code === 0) return;
    if (code === 7) return;
    logger.warn(`获取任务礼包失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`获取任务礼包异常：`, error);
  }
}

/**
 * 每日首次分享
 */
export async function shareComicService() {
  try {
    const { code, msg } = await mangaApi.shareComic();
    if (code === 0) {
      logger.info(msg || '每日分享成功！');
      return;
    }
    logger.warn(`每日分享失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`每日分享异常：`, error);
  }
}

/**
 * 获取需要阅读的漫画
 */
async function getNeedReadManga() {
  try {
    const seasonInfo = await getSeasonInfo();
    if (!seasonInfo) {
      logger.error('获取需要阅读的漫画异常');
      return [];
    }

    const bookTask = seasonInfo?.day_task?.book_task || [];

    return bookTask.filter(task => task.user_read_min < 5);
  } catch (error) {
    logger.exception(`获取需要阅读的漫画`, error);
  }
  return [];
}

async function readManga(comicId: number, needTime: number) {
  const { ep_list } = (await getMangaEpList(comicId)) || {};
  const bilicomic = new Bilicomic(
    TaskConfig.USERID,
    comicId,
    ep_list ? ep_list[0].id : random(1, 1000),
  );
  try {
    await bilicomic.read(needTime * 2 + 2);
    await apiDelay(1000);
  } catch {}
  await apiDelay(5000);
}

/**
 * 每日漫画阅读
 */
export async function readMangaService(isNoLogin?: boolean) {
  if (!TaskConfig.manga.read) {
    return;
  }
  logger.info('开始每日阅读');
  try {
    const seasonInfo = await getSeasonInfo();
    if (isBoolean(seasonInfo)) {
      return seasonInfo;
    }
    const needReadManga = await getNeedReadManga();
    for (const { user_read_min, read_min, id, title } of needReadManga) {
      logger.debug(`开始阅读漫画：${id}[${title}]`);
      await readManga(id, read_min - user_read_min);
    }
    if (isNoLogin) {
      logger.info('非登录状态，不判断阅读结果');
      return;
    }
    logger.debug('阅读结束');
  } catch (error) {
    logger.error(`每日漫画阅读任务异常`, error);
  }
}
