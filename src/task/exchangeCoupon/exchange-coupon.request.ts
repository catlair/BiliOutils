import type { OnlyMsg } from '@/dto/bili-base-prop';
import { mangaApi } from '@/net/api';
import type { PointShopBuyDto } from './exchange-coupon.dto';

/**
 * 获取当前漫画积分
 */
export function getMangaPoint() {
  return mangaApi.post<OnlyMsg<{ point: string }>>('twirp/pointshop.v1.Pointshop/GetUserPoint');
}

/**
 * 漫画积分商城兑换
 */
export function exchangeMangaShop(product_id = 195, point = 100, product_num = 1) {
  return mangaApi.post<PointShopBuyDto>(`twirp/pointshop.v1.Pointshop/Exchange`, {
    product_id,
    point,
    product_num,
  });
}
