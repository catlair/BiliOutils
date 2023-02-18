import type { ApiBaseProp } from '@/dto/bili-base-prop';

/**
 * 抽奖结果
 */
export type LotteryResult = ApiBaseProp<
  {
    id: number;
    mid: number;
    ip: number;
    num: number;
    gift_id: number;
    gift_name: string;
    /** 0 没有 */
    gift_type: number;
    img_url: string;
    type: number;
    ctime: number;
    cid: number;
    extra: unknown;
    award_info?: any;
    order_no: string;
  }[]
>;
