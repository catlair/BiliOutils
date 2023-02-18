import type { ApiBaseProp, PureDataProp } from '@/dto/bili-base-prop';

/**
 * 瓜子换硬币
 * 403 今日兑换过
 */
export type Silver2CoinDto = PureDataProp<{
  coin: number;
  gold: number;
  silver: number;
  /** eg: Silver2Coin00000000000000000000000 */
  tid: string;
}>;

/** 获取瓜子状态 */
export type SilverStatusDto = ApiBaseProp<{
  /** 银瓜子 */
  silver: number;
  /** 金瓜子，现在为电池（数量需要除以 1000，即显示 1000，实际为 1 电池） */
  gold: number;
  coin: number; // 硬币
  coin_2_silver_left: number; //
  silver_2_coin_left: 1 | 0; // (银瓜子到硬币)
  status: number;
  vip: number;
}>;
