import type { ApiBaseProp } from '@/dto/bili-base-prop';

/** 直播签到 */
export type LiveSignDto = ApiBaseProp<{
  text: string;
  hadSignDays: number;
  specialText: string;
}>;

/** 直播签到信息 */
export type LiveSignInfoDto = ApiBaseProp<{
  text: string;
  hadSignDays: number;
  specialText: string;
  status: 0 | 1;
}>;
