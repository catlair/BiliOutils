import type { ApiBaseProp } from '@/dto/bili-base-prop';

/** 领取每月会员权益 */
export interface ReceiveVipPrivilegeDto extends ApiBaseProp {
  data: null;
}

/** 领取每月会员权益状态 */
export interface ReceiveVipMyDto extends ApiBaseProp {
  data: {
    /** type 1-5 除了 type 和 state 都是固定的 */
    list: {
      type: number;
      /** 1 已经领取 */
      state: 0 | 1;
      // 过期时间
      expire_time: 1656604799;
      // vip_type
      vip_type: 2;
      // 距离下次领取时间 单位天
      next_receive_days: number;
      /** 下次领取时间，eg. 1656777600 **/
      period_end_unix: number;
    }[];
    is_short_vip: boolean;
    is_freight_open: boolean;
  };
}
