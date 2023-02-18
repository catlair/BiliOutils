import type { OnlyMsg } from '@/dto/bili-base-prop';

/**
 * 积分商场购买反馈
 */
export type PointShopBuyDto = OnlyMsg<{
  id: string;
  expire_day: number;
  remain_amount: number;
  deadline: string;
}>;
