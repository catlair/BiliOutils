import { biliApi } from '@/net/api';
import { appSignString } from '@/utils/bili';
import type { CreateOrder, PaymentOrder, SkuList, VerifyOrder } from './exchange-bigpoint.dto';
import { TaskConfig } from '@/config';

function getHeaders(token: string) {
  return {
    Referer: `https://big.bilibili.com/mobile/bigPoint/sku/${token}`,
  };
}

/**
 * 获取商品列表
 */
export function getSkuList(pn = 1, ps = 20) {
  return biliApi.get<SkuList>(`x/vip_point/sku/list?${appSignString({ in_review: 0, pn, ps })}`);
}

/**
 * 验证商品是否可兑换
 * @param token 商品token
 * @param price 商品价格
 */
export function verifyOrder(token: string, price?: number) {
  // 可选参数
  const options: { price?: number } = {};
  if (price) {
    options.price = price;
  }
  return biliApi.post<VerifyOrder>(
    'x/vip_point/trade/order/verify',
    appSignString({ token, csrf: TaskConfig.BILIJCT, ...options }),
    {
      headers: getHeaders(token),
    },
  );
}

/**
 * 创建订单
 * @param token 商品token
 * @param price 商品价格
 */
export function createOrder(token: string, price?: number) {
  // 可选参数
  const options: { price?: number } = {};
  if (price) {
    options.price = price;
  }
  return biliApi.post<CreateOrder>(
    'x/vip_point/trade/order/create',
    appSignString({ token, csrf: TaskConfig.BILIJCT, ...options }),
    {
      headers: getHeaders(token),
    },
  );
}

/**
 * 支付
 * @param order_no 订单号
 * @param token 商品token
 */
export function paymentOrder(order_no: string, token: string) {
  return biliApi.get<PaymentOrder>(
    `x/vip_point/trade/order/payment?${appSignString({ order_no, csrf: TaskConfig.BILIJCT })}`,
    {
      headers: {
        ...getHeaders(token),
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}

/**
 * 获取订单详情
 * @param order_no 订单号
 */
export function getOrderDetail(order_no: string) {
  return biliApi.get(
    `x/vip_point/trade/order/detail?${appSignString({ order_no, csrf: TaskConfig.BILIJCT })}`,
    {
      headers: {
        Referer: `https://big.bilibili.com/mobile/bigPoint/orderResult?order_no=${order_no}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}
