import type { OnlyMsg } from '@/dto/bili-base-prop';
import type {
  BuyInfoDto,
  ClockInDto,
  CouponDto,
  FavoriteManga,
  GameChooseRoleDto,
  GameGuessDto,
  GameInitDto,
  GameLastResultDto,
  GameRoundStartDto,
  GameStartDto,
  GameTryDto,
  MangaDetailDto,
  MangaPointShopDto,
  SearchMangaDto,
  SeasonInfoDto,
  ShareComicDto,
  TakeSeasonGiftDto,
  WalletDto,
} from './manga.dto';
import { mangaApi } from '@/net/api';
import { TaskConfig } from '@/config';

const MANGA_DATA = {
  is_teenager: 0,
  no_recommend: 0,
  mobi_app: 'android_comic',
  platform: 'android',
  channel: 'bilicomic',
};

/**
 * 漫画签到
 * @param platform 平台
 */
export function clockIn(platform = 'android'): Promise<ClockInDto> {
  return mangaApi.post('twirp/activity.v1.Activity/ClockIn', {
    platform,
  });
}

/**
 * 获取背包
 *
 */
export function getWallet() {
  return mangaApi.post<WalletDto>(`twirp/user.v1.User/GetWallet?platform=web`);
}

/**
 * 追漫列表
 */
export function getFavoriteList(page_num = 1, page_size = 50, order = 1) {
  return mangaApi.post<FavoriteManga>(`twirp/bookshelf.v1.Bookshelf/ListFavorite?platform=web`, {
    page_num,
    page_size,
    order,
    wait_free: 0,
  });
}

/**
 * 获取账户中的漫读券信息
 */
export function getCoupons(page_num = 1, page_size = 50) {
  return mangaApi.post<CouponDto>(`twirp/user.v1.User/GetCoupons?platform=web`, {
    not_expired: true,
    page_num,
    page_size,
    tab_type: 1,
  });
}

/**
 * 获取漫画详情
 */
export function getMangaDetail(comic_id: number) {
  return mangaApi.post<MangaDetailDto>(`twirp/comic.v1.Comic/ComicDetail`, {
    device: 'android',
    version: '4.16.0',
    comic_id: comic_id,
  });
}

/**
 * 获取购买信息
 */
export function getBuyInfo(ep_id: number) {
  return mangaApi.post<BuyInfoDto>(`twirp/comic.v1.Comic/GetEpisodeBuyInfo?platform=web`, {
    ep_id,
  });
}

/**
 * 购买漫画
 */
export function buyManga(
  ep_id: number,
  coupon_id: number,
  buy_method = 2,
  auto_pay_gold_status = 0,
) {
  return mangaApi.post<OnlyMsg>(`twirp/comic.v1.Comic/BuyEpisode?&platform=web`, {
    buy_method,
    ep_id,
    coupon_id,
    auto_pay_gold_status,
  });
}

/**
 * 搜索漫画
 */
export function searchManga(keyword: string, page_num = 1, page_size = 9) {
  return mangaApi.post<SearchMangaDto>(`twirp/comic.v1.Comic/Search?device=pc&platform=web`, {
    keyword,
    page_num,
    page_size,
  });
}

/**
 * 领取大会员权益
 */
export function receiveMangaVipPrivilege() {
  return mangaApi.post<OnlyMsg>('twirp/user.v1.User/GetVipReward', { reason_id: 1 });
}

/**
 * 漫画积分商城列表
 */
export function getMangaPointShopList() {
  return mangaApi.post<MangaPointShopDto>(`twirp/pointshop.v1.Pointshop/ListProduct`);
}

/**
 * 领取任务奖励
 */
export function takeSeasonGift(season_id: number | string = '31') {
  return mangaApi.post<TakeSeasonGiftDto>(`twirp/user.v1.Season/TakeSeasonGifts`, {
    id: 0,
    is_teenager: 0,
    no_recommend: 0,
    season_id,
    take_type: 1,
    mobi_app: 'android_comic',
    ts: new Date().getTime(),
  });
}

/**
 * 获取赛季信息
 */
export function getSeasonInfo() {
  return mangaApi.post<SeasonInfoDto>(
    `twirp/user.v1.SeasonV2/GetSeasonInfo?platform=android&device=android&mobi_app=android_comic`,
    {
      type: 1,
    },
  );
}

/**
 * 分享漫画
 */
export function shareComic() {
  return mangaApi.post<ShareComicDto>(`twirp/activity.v1.Activity/ShareComic`, {
    ...MANGA_DATA,
    ts: new Date().getTime(),
  });
}

/**
 * 游戏 init
 */
export function gameInit() {
  return mangaApi.post<GameInitDto>(`twirp/user.v1.Season/GameInit`, { ...MANGA_DATA });
}

/**
 * 选择角色
 */
export function chooseRole(role: string) {
  return mangaApi.post<GameChooseRoleDto>(`twirp/user.v1.Season/ChooseRole`, {
    ...MANGA_DATA,
    role,
  });
}

/**
 * 完成初次尝试
 */
export function finishTry() {
  return mangaApi.post<GameTryDto>(`twirp/user.v1.Season/FinishTry`, { ...MANGA_DATA });
}

/**
 * 开始游戏
 * code 1 已有进行中的游戏
 */
export function startGame() {
  return mangaApi.post<GameStartDto>(`twirp/user.v1.Season/StartGame`, { ...MANGA_DATA });
}

/**
 * 开始回合
 */
export function startRound() {
  return mangaApi.post<GameRoundStartDto>(`twirp/user.v1.Season/StartRound`, { ...MANGA_DATA });
}

/**
 * 猜拳
 */
export function guessFinger(card: number) {
  return mangaApi.post<GameGuessDto>(`twirp/user.v1.Season/FingerGuess`, { ...MANGA_DATA, card });
}

/**
 * 查看上次结果
 */
export function checkLastResult() {
  return mangaApi.post<GameLastResultDto>(`twirp/user.v1.Season/ListRoundResult`, {
    ...MANGA_DATA,
  });
}

/**
 * 充值活动 w40
 */

class Wd40Activity {
  hashMap = {
    ServerEnv: '0e5bae2246471825ae37772d6c1dbdbaf7eb0612ab3f80a84ab440ae20616990',
    TokenLogs: '81e2040135d3186e72edb9943089d386e7a580d67248fd5ca288abacb8fe88d5',
    Tasks: '4d57a11c2587a79d5f550b764ca70d0d6f317478ec2d44be4eb633ec96768c91',
    TakeTask: '24b8448f2b8be0b16185ee5a9b11987185e206e375e142a753e9a6560f1c9247',
    TokenInfos: 'f32775dd061668d4c37ca3081029b01b11b17569bca5d1ba53ab9a306d6e6b38',
    TimeInfo: '05e7e45f1d580fb0d88a9ca56483c793481db4ebc6314d20ee7f233839760cc4',
    NewSeasonState: '0897502d0136e65aee44f34ed3f660e7bfeea8bf48460e6e2501f1af3979df84',
    MangaSeason: '17e71e6b4deac17bba9c7f28d63687cda75f4214561e9e869178dc56977a2b52',
    MangaUserMeta: '26edfb63d8182e3cccd0cae307d346a28e5980bedb99d3904b4c3f08f91e165e',
    DiscountSeasonsState: 'c74a204dbd30c6a6f7965c7edf1fdbb3180ca94e23ecd68d92256b7560312b75',
    Login: '9d92b2da7493f63a530522294e927859f832ebd326b97b0a6b0ff450692a7394',
    ActivityTimeInfo: 'fbf23a1376d473315649821ea33862940d7a67f3703d8986d985b775e515d31f',
  };

  defHeaders = {
    referer: 'https://manga.bilibili.com/blackboard/activity-GD55upVIp5.html?jumpFrom=0',
    'user-agent': TaskConfig.mobileUA,
    'Content-Type': 'application/json',
  };

  wd40get<T>(op: string, variables: Record<string, any>, superOptions: Record<string, any> = {}) {
    if (this.hashMap[op]) {
      superOptions.extensions = {
        persistedQuery: {
          version: 1,
          sha256Hash: this.hashMap[op],
        },
      };
    }
    return mangaApi.post<{
      data: T;
      errors: any[];
    }>(
      `wd40?op=${op}`,
      {
        operationName: op,
        variables,
        ...superOptions,
      },
      {
        headers: this.defHeaders,
      },
    );
  }

  timeInfo() {
    return this.wd40get<{
      server: {
        time: string;
      };
      activity: {
        common: {
          info: {
            id: number;
            end: string;
          };
        };
      };
    }>('TimeInfo', { id: 870056 });
  }

  tokenInfos() {
    return this.wd40get<{
      activity: {
        common: {
          tokens: {
            id: number;
            actId: number;
            balance: number;
            total: number;
          }[];
        };
      };
    }>('TokenInfos', {
      actId: 870056,
      tokenIds: [27],
    });
  }

  tasks(ids = [270032, 270033, 300052, 210068]) {
    return this.wd40get<{
      activity: {
        common: {
          tasks: {
            id: number;
            /** 0  未完成 1 进行中 2 已完成 */
            status: number;
            available: number;
            progress: number;
            /** 任务进度上限 */
            progressLimit: number;
            count: number;
            countLimit: number;
          }[];
        };
      };
    }>('Tasks', { ids });
  }

  takeTask(id: number) {
    return this.wd40get<{
      activity: {
        common: {
          task: {
            id: number;
            status: number;
            available: number;
            progress: number;
            progressLimit: number;
            count: number;
            countLimit: number;
          };
        };
      };
    }>('TakeTask', {
      id,
      actId: 870056,
    });
  }

  doManner(act_id: number, path: string) {
    return mangaApi.post(
      'twirp/user.v1.Strategy/DoManner',
      {
        act_id,
        path,
      },
      {
        headers: {
          referer: path,
          'user-agent': TaskConfig.mobileUA,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  doMannerVenue() {
    return this.doManner(990002, 'https://manga.bilibili.com/blackboard/activity-tfoshYo7Qx.html');
  }

  doMannerMain() {
    return this.doManner(
      870056,
      'https://manga.bilibili.com/blackboard/activity-GD55upVIp5.html?jumpFrom=0',
    );
  }
}

export const wd40Activity = new Wd40Activity();
