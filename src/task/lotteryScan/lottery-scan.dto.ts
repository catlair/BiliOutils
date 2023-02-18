import type { DoubleMessageProp } from '@/dto/bili-base-prop';

/**
 * code -9999 不存在
 */
export type LotteryDetail = DoubleMessageProp<{
  /** 动态 id */
  business_id: bigint;
  /** 状态 -1 0 进行中 1 2 已结束 */
  status: -1 | 0 | 1 | 2;
  lottery_time: number;
  lottery_at_num: number;
  lottery_feed_limit: number;
  /** 奖励数量 */
  first_prize: number;
  second_prize: number;
  third_prize: number;
  /** 奖励描述，无为空 */
  first_prize_cmt: string;
  second_prize_cmt: string;
  third_prize_cmt: string;
  /** 奖励图片 */
  first_prize_pic: string;
  second_prize_pic: string;
  third_prize_pic: string;
  need_post: 3;
  /** 抽奖类型 1 动态 10 直播 12 充电 */
  business_type: 0 | 1 | 10 | 12;
  /** 奖励结果 */
  lottery_result?: Lotteryresult;
  sender_uid: number;
  prize_type_first: Prizetypefirst;
  prize_type_second: Prizetypefirst;
  prize_type_third: Prizetypefirst;
  pay_status: number;
  ts: number;
  lottery_id: number;
  lottery_detail_url: string;
  _gt_: number;
}>;

interface Prizetypefirst {
  type: number;
  value: Value;
}

interface Value {
  stype: number;
}

interface Lotteryresult {
  first_prize_result: Firstprizeresult[];
  second_prize_result?: Firstprizeresult[];
  third_prize_result?: Firstprizeresult[];
}

interface Firstprizeresult {
  uid: number;
  name: string;
  face: string;
}
