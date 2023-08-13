import { TaskConfig } from '@/config';
import { apiDelay, getPRCDate, logger } from '@/utils';
import { request } from '@/utils/request';
import * as mangaApi from './exchange-coupon.request';
import { getWaitTime, isInExchangeTime } from './utils';
import { waitForTime } from '@/utils/time';

// 兑换时间与兑换 id 对应关系
const exchangeTimeMap = {
  0: {
    id: 1938,
    cost: 100,
  },
  10: {
    id: 1939,
    cost: 300,
  },
  12: {
    id: 1940,
    cost: 500,
  },
} as const;

export async function exchangeCouponService() {
  const num = await getExchangeNum();
  if (!num) return;
  if (await waitExchangeTime()) return;
  const { delay } = TaskConfig.exchangeCoupon;
  // 尝试兑换
  while (await exchangeCoupon(num)) {
    await apiDelay(delay - 50, delay + 150);
  }
}

async function getExchangeNum() {
  const { num: exchangeCouponNum, keepAmount = 0 } = TaskConfig.exchangeCoupon;
  const { point } = await request(mangaApi.getMangaPoint, { name: '获取积分' });
  const pointNum = parseInt(point, 10) || 0;
  logger.info(`当前积分：${pointNum}`);
  if (pointNum <= keepAmount) {
    logger.info(`积分不足，需保留，跳过任务`);
    return 0;
  }
  const buyCouponNum = Math.floor((pointNum - keepAmount) / 100);
  if (buyCouponNum < 1) {
    logger.info('可兑换的漫读券数量不足 1，跳过任务');
    return 0;
  }
  const num = exchangeCouponNum < 1 ? buyCouponNum : Math.min(buyCouponNum, exchangeCouponNum);
  logger.info(`漫读券需要兑换数量：${num}/${buyCouponNum}`);
  return num;
}

/**
 * 等待兑换时间的到来
 */
async function waitExchangeTime() {
  const { startTime, endTime } = getWaitTime(getStartTime());
  if (endTime === 12) {
    logger.debug('当前目标时间为 12 点，直接开始兑换');
    return false;
  }
  if (!isInExchangeTime(startTime, endTime, getPRCDate())) {
    logger.warn(`当前时间不在 ${startTime}:00 - ${endTime}:03 之间，跳过任务`);
    return true;
  }
  logger.debug(`等待，到 ${endTime} 点才开始兑换...`);
  await waitForTime({ hour: endTime });
  return false;
}

function getStartTime() {
  const { startHour } = TaskConfig.exchangeCoupon;
  // startHour 会是 (0, 10, 12)[] 类型
  // 当前时间是在哪个之前一点的时候，就取哪个
  const nowHour = getPRCDate().getHours();
  if (nowHour < 10 && startHour.includes(10)) return 10;
  if (nowHour < 12 && startHour.includes(12)) return 12;
  if (nowHour < 24 && startHour.includes(0)) return 0;
  return 12;
}

/**
 * 商城兑换
 */
async function exchangeCoupon(num: number) {
  try {
    const startHour = getStartTime();
    const { id, cost } = exchangeTimeMap[startHour];
    const { code, msg = '' } = await mangaApi.exchangeMangaShop(id, num * cost, num);
    // 抢的人太多
    if (code === 4) {
      return true;
    }
    if (code === 0) {
      logger.info(`兑换商品成功，兑换数量：${num}`);
      return false;
    }
    // 太快
    if (code === 1 && msg.includes('快')) {
      logger.debug(msg);
      return true;
    }
    // 库存不足，且时间是 xx:02 之前
    if (
      code === 2 &&
      msg.includes('库存') &&
      getPRCDate().getHours() === startHour &&
      getPRCDate().getMinutes() < 2
    ) {
      logger.debug(`库存不足，但时间是 ${startHour}:02 之前，尝试重新兑换`);
      return true;
    }
    logger.fatal('商城兑换', code, msg);
  } catch (error) {
    logger.exception('商城兑换', error);
  }
}
