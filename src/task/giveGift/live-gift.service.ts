import { TaskConfig } from '@/config';
import { getLiveFansMedal } from '@/net/live.request';
import { getGiftBagList, sendBagGift } from './live-gift.request';
import { getUser } from '@/net/user-info.request';
import type { LiveGiftBagListDto } from './live-gift.dto';
import { apiDelay, random, logger, pushIfNotExist, getRandomItem } from '@/utils';
import { MS2DATE } from '@/constant';

type LiveGiftBag = LiveGiftBagListDto['data']['list'][number];

const EXPIRE_DATE = 2;

export default async function giveGiftService() {
  try {
    const room = await findOneRoom();
    if (!room) return logger.info(`没有找到投喂目标`);

    await apiDelay();
    const gifts = filterGiftList(await getGiftList());
    if (showEmptyBagTip(gifts)) return;

    await sendGift(room, gifts);
  } catch (error) {
    logger.error(`投喂过期食物异常：`, error);
  }
}

async function getGiftList() {
  try {
    const {
      code,
      message,
      data: { list },
    } = await getGiftBagList();
    if (code !== 0 || !list) {
      logger.warn(`获取过期礼物失败：${code} ${message}`);
      return;
    }
    return list;
  } catch (error) {
    logger.error(`获取过期礼物异常：`, error);
  }
}

function filterGiftList(gifts?: LiveGiftBag[]) {
  if (!gifts) return;
  const filterFunc = getFilterFunc();
  if (!filterFunc) return gifts;
  return gifts.filter(filterFunc);
}

async function findOneRoom() {
  const { gift } = TaskConfig;
  const upList = gift.mids || [];
  const getOneUp = () => upList.splice(random(upList.length - 1), 1)[0];
  while (upList.length) {
    const mid = getOneUp();
    const room = await getUserRoom(mid);
    if (room) {
      return {
        mid,
        ...room,
      };
    }
  }
  return await findOneByRandomUp();
}

async function findOneByRandomUp() {
  const {
    data: { count, items: fansMedalList },
  } = await getLiveFansMedal();
  await apiDelay();
  if (!count) return;
  const target = getRandomItem(fansMedalList);
  return {
    mid: target.target_id,
    roomid: target.roomid || 0,
    name: target.uname,
  };
}

async function getUserRoom(mid: number) {
  try {
    const {
      data: { live_room, name },
    } = await getUser(mid);
    await apiDelay();
    if (live_room.roomStatus) {
      return {
        roomid: live_room.roomid,
        name,
      };
    }
  } catch {}
}

async function sendGift(
  { roomid, mid, name }: { roomid: number; mid: number; name: string },
  gifts: LiveGiftBagListDto['data']['list'],
) {
  const success: string[] = [];
  for (const gift of gifts) {
    await apiDelay();
    try {
      const { code, message, data } = await sendBagGift({
        roomid,
        ruid: mid,
        bag_id: gift.bag_id,
        gift_id: gift.gift_id,
        gift_num: gift.gift_num,
      });

      if (code !== 0) {
        logger.warn(`向[${name}]投喂[${gift.gift_name}]，${message || '失败'}`);
        continue;
      }
      // 确保最后不输出一堆相同的日志
      data.gift_list.forEach(gift =>
        pushIfNotExist(success, `成功给 【${name}】 投喂${gift.gift_name}`),
      );
    } catch (error) {
      logger.error(`向【${name}】投喂[${gift.gift_name}]`, error);
    }
  }
  success.forEach(msg => logger.info(msg));
}

function isExpired(gift: LiveGiftBag) {
  if (gift.expire_at <= 0) return false;
  return (gift.expire_at * 1000 - new Date().getTime()) / MS2DATE < EXPIRE_DATE;
}

function isSimple(gift: LiveGiftBag) {
  const { id, name } = TaskConfig.gift;
  return id.includes(gift.gift_id) || name.includes(gift.gift_name);
}

function getFilterFunc() {
  const { all, expire } = TaskConfig.gift;
  if (all) {
    // 所有礼物，包括不是过期的
    if (!expire) return;
    // 所有类型的礼物，但只要过期的
    return (gift: LiveGiftBag) => isExpired(gift);
  }
  if (expire) {
    // 要过期的简单类型礼物
    return (gift: LiveGiftBag) => isExpired(gift) && isSimple(gift);
  }
  // 简单类型礼物，是否过期无所谓
  return (gift: LiveGiftBag) => isSimple(gift);
}

/**
 * 根据配置，输出背包为空的提示
 */
function showEmptyBagTip<T = LiveGiftBag>(gifts?: T[]): gifts is undefined {
  if (!gifts) return true;
  if (gifts.length) return false;
  const { all, expire } = TaskConfig.gift;
  logger.info(
    all
      ? expire
        ? `背包没有${EXPIRE_DATE}天内过期的礼物！`
        : `背包没有任何礼物！`
      : expire
      ? `没有${EXPIRE_DATE}天内过期的简单礼物！`
      : `背包没有简单礼物！`,
  );
  return true;
}
