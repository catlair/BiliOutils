import type { ApiBaseProp, PureDataProp, ResponseCode } from '@/dto/bili-base-prop';

/** 给 UP 充电 */
export type ChargingDto = ApiBaseProp<{
  /** 用户ID */
  mid: number;
  /** 目标ID */
  up_mid: number;
  /** 用于添加充电留言 */
  order_no: string;
  /** 充电贝壳数 */
  bp_num: number;
  /** 获得经验数 */
  exp: number;
  /** 4 成功 -2 低于20电池 -4 B币不足 */
  status: 4 | -2 | -4;
  /** 错误信息或空 '' */
  msg: string;
}>;

export type ChargingMessageDto = PureDataProp<{
  message: '0';
  /** 88203：不能重复留言 */
  code: ResponseCode | 88203;
}>;
