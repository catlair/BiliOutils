import { TaskConfig } from '@/config';
import { apiDelay, getPRCDate, logger } from '@/utils';
import { request } from '@/utils/request';
import * as mangaApi from './exchange-coupon.request';

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
  let num: number;
  // 是否设置自动数量
  if (exchangeCouponNum < 1) {
    num = buyCouponNum;
  } else {
    num = Math.min(buyCouponNum, exchangeCouponNum);
  }
  logger.info(`漫读券需要兑换数量：${num}/${buyCouponNum}`);
  return num;
}

/**
 * 等待兑换时间的到来
 */
async function waitExchangeTime() {
  const hour = getPRCDate().getHours(),
    minute = getPRCDate().getMinutes();
  if (hour < 10 || hour > 12 || (hour === 12 && minute > 3)) {
    logger.warn(`当前时间不在 10:00 - 12:03 之间，跳过任务`);
    return true;
  }
  logger.debug(`循环等待，到 12 点才开始兑换...`);
  while (hour !== 12) {
    await apiDelay(100);
  }
  return false;
}

/**
 * 商城兑换
 */
async function exchangeCoupon(num: number) {
  try {
    const { code, msg = '' } = await mangaApi.exchangeMangaShop(195, num * 100, num);
    // 抢的人太多
    if (code === 4) {
      return true;
    }
    if (code === 0) {
      logger.info(`兑换商品成功，兑换数量：${num}`);
      return;
    }
    // 太快
    if (code === 1 && msg.includes('快')) {
      logger.debug(msg);
      return true;
    }
    // 库存不足，且时间是 12:02 之前
    if (
      code === 2 &&
      msg.includes('库存') &&
      getPRCDate().getHours() === 12 &&
      getPRCDate().getMinutes() < 2
    ) {
      logger.debug('库存不足，但时间是 12:02 之前，尝试重新兑换');
      return true;
    }
    logger.warn(`兑换商品失败：${code} ${msg}`);
  } catch (error) {
    logger.error(`商城兑换异常: ${error}`);
  }
}
