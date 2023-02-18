import type { Reservation, ReserveRelationItem } from './reservation.dto';
import { getReserveRelation, reservation, reserveAttachCardButton } from './reservation.request';
import { getUnixTime, logger, sleep } from '@/utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 请求指定用户的预约列表
 */
async function fetchReservation(vmid: string) {
  const { code, message, data } = await reservation(vmid);
  if (code !== 0) {
    logger.warn(`获取预约列表失败：${code} ${message}`);
    return;
  }
  return data?.filter(res => filterLotteryByReservation(res));
}

/**
 * 过滤出符合要求的预约
 */
function filterLotteryByReservation(data: Reservation) {
  // 参与过了？
  if (data.reserve_record_ctime) {
    return false;
  }
  // 已经开奖了
  if (getUnixTime() > data.live_plan_start_time) {
    return false;
  }
  // 其它
  if (Reflect.has(data, 'lottery_prize_info') && Reflect.has(data, 'lottery_type')) {
    return true;
  }
  return false;
}

/**
 * 过滤出符合要求的预约
 */
function filterLotteryByReserveRelationItem(data: ReserveRelationItem) {
  // 参与过了？
  if (data.reserveRecordCtime) {
    return false;
  }
  // 已经开奖了
  if (getUnixTime() > data.livePlanStartTime) {
    return false;
  }
  // 其它
  if (Reflect.has(data, 'prizeInfo') && Reflect.has(data, 'lotteryType')) {
    return true;
  }
  return false;
}

type ReserveLiveBase = { name: string; sid: number; total: number };

type ReservationOption = ReserveLiveBase & {
  live_plan_start_time: number;
  lottery_prize_info: {
    text: string;
    jump_url: string;
  };
  up_mid: number;
};

type ReserveRelationOption = ReserveLiveBase & {
  upmid: number;
  prizeInfo: {
    text: string;
    jumpUrl: string;
  };
  livePlanStartTime: number;
};

type ReserveLiveOptions = ReservationOption | ReserveRelationOption;

function isReservationOption(data: ReserveLiveOptions): data is ReservationOption {
  return Reflect.has(data, 'up_mid');
}

function isisReservationPrize(data: any): data is ReservationOption['lottery_prize_info'] {
  return Reflect.has(data, 'jump_url');
}

/**
 * 进行一个预约
 */
async function reserveLive(res: ReserveLiveOptions) {
  const isReservation = isReservationOption(res);
  const mid = isReservation ? res.up_mid : res.upmid;
  const start = isReservation ? res.live_plan_start_time : res.livePlanStartTime;
  const prize = isReservation ? res.lottery_prize_info : res.prizeInfo;
  const jumpUrl = isisReservationPrize(prize) ? prize.jump_url : prize.jumpUrl;

  logger.debug(`预约直播：${res.name}(${res.sid}/${mid})`);
  logger.debug(`奖励列表：${prize.text}`);
  logger.debug(`活动链接：${jumpUrl}`);
  logger.debug(`开奖时间：${new Date(start * 1000).toLocaleString('zh-CN')}`);

  const { code, message, data } = await reserveAttachCardButton(res.sid, res.total, 1);
  if (code !== 0) {
    logger.warn(`预约直播${res.sid}失败：${code} ${message}`);
    return false;
  }
  logger.debug(`预约成功：${data.toast}，${data.desc_update}`);
  return true;
}

export async function reservationService() {
  // TODO: demo
  const demo = [];
  for (const d of demo) {
    const list = await fetchReservation(d);
    await sleep(1000);
    if (!list || list.length < 1) {
      continue;
    }
    // 一个人不至于有几个直播预约吧
    await Promise.all(list.map(res => reserveLive(res)));
  }
}

(async () => {
  // 读取 data.txt
  const data = readFileSync(resolve(__dirname, '../lotteryScan/data.txt'), 'utf-8');
  const lines = data.split('\n');
  const ids = lines
    .map(line => {
      const [, dType, dId] = line.split('-');
      if (dType !== '10') return;
      return +dId;
    })
    .filter(Boolean) as number[];
  // 将 ids 分为 10 个一组，放入数组
  const idGroups: number[][] = [];
  for (let i = 0; i < ids.length; i += 10) {
    idGroups.push(ids.slice(i, i + 10));
  }
  // 逐组请求
  for (const idGroup of idGroups) {
    const { code, message, data } = await getReserveRelation(idGroup);
    if (code !== 0) {
      logger.warn(`获取预约列表失败：${code} ${message}`);
      continue;
    }
    const list = Object.values(data.list).filter(filterLotteryByReserveRelationItem);
    if (!list || list.length < 1) {
      continue;
    }
    for (const res of list) {
      try {
        await reserveLive(res);
        await sleep(60000);
      } catch (error) {
        logger.error(`预约直播失败`, error);
      }
    }
  }
})();
