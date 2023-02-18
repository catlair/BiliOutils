import type { ApiBaseProp, DoubleMessageProp } from '@/dto/bili-base-prop';

export type ReservationDto = ApiBaseProp<Reservation[]>;

export interface Reservation {
  sid: number;
  name: string;
  total: number;
  stime: number;
  etime: number;
  /** 是否参与 */
  is_follow: number;
  state: number;
  oid: string;
  type: number;
  up_mid: number;
  /** 参与时间 unix */
  reserve_record_ctime: number;
  /** 开奖时间 unix */
  live_plan_start_time: number;
  lottery_type: number;
  lottery_prize_info: {
    text: string;
    lottery_icon: string;
    jump_url: string;
  };
  show_total: boolean;
  subtitle: string;
  attached_badge_text: string;
}

/**
 * code: 7604003 操作失败，请稍后重试
 */
export type ReserveButtonDto = DoubleMessageProp<{
  btn_mode: number;
  /** 1-未预约 2-已预约 */
  final_btn_status: 1 | 2;
  desc_update: string;
  reserve_update: number;
  toast: string;
  has_activity: boolean;
  _gt_: number;
}>;

export type ReserveRelation = ApiBaseProp<{
  list: Record<number, ReserveRelationItem>;
}>;

export interface ReserveRelationItem {
  sid: number;
  name: string;
  /** 参与总人数 */
  total: number;
  stime: number;
  etime: number;
  isFollow: number;
  state: number;
  oid: string;
  type: number;
  upmid: number;
  reserveRecordCtime: number;
  livePlanStartTime: number;
  upActVisible: number;
  lotteryType: number;
  prizeInfo: {
    jumpUrl: string;
    text: string;
  };
  dynamicId: string;
  reserveTotalShowLimit: number;
  desc: string;
  start_show_time: number;
  hide?: any;
  ext: string;
}
