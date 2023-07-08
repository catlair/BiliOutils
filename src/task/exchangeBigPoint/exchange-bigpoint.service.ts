import { apiDelay, isNotEmpty, logger } from '@/utils';
import * as bigPointApi from './exchange-bigpoint.request';
import { TaskConfig } from '@/config';
import { waitForTime } from '@/utils/time';
import type { Skus } from './exchange-bigpoint.dto';

export async function exchangeBigPointService() {
  const tokenList = await getTokenList();
  if (!isNotEmpty(tokenList)) {
    logger.info('没有需要兑换的商品');
    return;
  }
  await waitForTime({ hour: 12 });
  await apiDelay(TaskConfig.exchangeBigPoint.startDelay);
  await Promise.all(tokenList.map(token => exchangeBigPointRetry(token)));
}

/**
 * 完成一个流程
 */
async function exchangeBigPoint(token: string) {
  // 验证商品是否可兑换
  const canPurchase = await verifyOrder(token);
  if (!canPurchase) {
    return false;
  }
  // 创建订单
  const order = await createOrder(token);
  if (!order) {
    return false;
  }
  // 支付
  const state = await paymentOrder(order, token);
  if (state === 4 || state === 2) {
    logger.debug(`${token}：${state}`);
    logger.info(`兑换成功：${token}`);
    return true;
  }
  logger.verbose(`${token}：${state}`);
  return false;
}

/**
 * 多次尝试兑换
 */
async function exchangeBigPointRetry(token: string) {
  const { retry, delay } = TaskConfig.exchangeBigPoint;
  for (let index = 0; index < retry; index++) {
    const result = await exchangeBigPoint(token);
    if (result) {
      return true;
    }
    await apiDelay(delay - index, delay + index);
  }
  return false;
}

/**
 * 获取需要兑换商品的token
 */
async function getTokenList() {
  const { token } = TaskConfig.exchangeBigPoint;
  if (token.length) {
    return token;
  }
  logger.debug('获取需要兑换商品的token');
  try {
    const skus = await getSkuList();
    if (!isNotEmpty(skus)) return [];
    const { name } = TaskConfig.exchangeBigPoint;
    return name
      .map(item => {
        const sku = skus.find(sku => sku.title === item);
        if (sku) {
          return sku.token;
        }
        logger.warn(`未找到商品：${item}`);
        return '';
      })
      .filter(Boolean);
  } catch (error) {
    logger.exception('获取需要兑换商品的token', error);
  }
  return [];
}
/**
 * 获取所有商品列表
 */
async function getSkuList() {
  const pageSize = 20; // 每次获取的商品数量
  let page = 1; // 当前页码
  let total = Infinity; // 商品总数，初始值为无穷大
  const allSkus: Skus[] = []; // 所有商品的数组

  while (allSkus.length < total) {
    const { data, code, message } = await bigPointApi.getSkuList(page, pageSize);
    if (code === 0) {
      allSkus.push(...data.skus);
      total = data.page.total;
      page++;
    } else {
      logger.fatal(`获取商品列表`, code, message);
      break;
    }
  }

  return allSkus;
}

/**
 * 验证商品是否可兑换
 */
async function verifyOrder(token: string, price?: number) {
  try {
    const { data, code, message } = await bigPointApi.verifyOrder(token, price);
    if (code === 0) {
      if (data.can_purchase) {
        return Boolean(data.can_purchase);
      }
      logger.warn(`${token}：${data.reject_reason || '未知错误，不可兑换'}`);
      return false;
    }
    logger.fatal(`验证商品是否可兑换`, code, message);
  } catch (error) {
    logger.exception('验证商品是否可兑换', error);
  }
  return false;
}

/**
 * 创建订单
 * @param token
 * @param price
 */
async function createOrder(token: string, price?: number) {
  try {
    const { data, code, message } = await bigPointApi.createOrder(token, price);
    if (code === 0 && data.order) {
      return data.order.order_no;
    }
    logger.fatal(`创建订单`, code, message);
  } catch (error) {
    logger.exception('创建订单', error);
  }
}

/**
 * 支付
 * @param orderNo
 * @param token
 */
async function paymentOrder(orderNo: string, token: string) {
  try {
    const { code, message, data } = await bigPointApi.paymentOrder(orderNo, token);
    if (code === 0) {
      return data.state;
    }
    logger.fatal(`支付`, code, message);
  } catch (error) {
    logger.exception('支付', error);
  }
  return -999;
}
