import type { ReservationDto, ReserveButtonDto, ReserveRelation } from './reservation.dto';
import type { ApiBaseProp } from '@/dto/bili-base-prop';
import { TaskConfig } from '@/config';
import { OriginURLs } from '@/constant/biliUri';
import { biliApi, vcApi } from '@/net/api';

function getHeader(vmid: number | string) {
  return {
    origin: OriginURLs.space,
    referer: OriginURLs.space + `/${vmid}/`,
  };
}

/**
 * 获取预约列表
 */
export function reservation(vmid: number | string) {
  return biliApi.get<ReservationDto>(`x/space/reservation?vmid=${vmid}`, {
    headers: getHeader(vmid),
  });
}

/**
 * 预约
 * 75077 重复参加活动!
 */
export function reserve(sid: number, vmid?: number | string) {
  return biliApi.post<Omit<ApiBaseProp, 'data'>>(
    `x/space/reserve`,
    { sid, csrf: TaskConfig.BILIJCT, jsonp: 'jsonp' },
    { headers: getHeader(vmid || TaskConfig.USERID) },
  );
}

/**
 * 预约2/取消预约
 * @param cur_btn_status 1 预约 2 取消预约
 * @default 1
 */
export function reserveAttachCardButton(
  reserve_id: number,
  reserve_total: number,
  cur_btn_status: 1 | 2 = 1,
) {
  return vcApi.post<ReserveButtonDto>(
    `dynamic_mix/v1/dynamic_mix/reserve_attach_card_button`,
    { csrf: TaskConfig.BILIJCT, cur_btn_status, reserve_id, reserve_total },
    {
      headers: {
        origin: OriginURLs.www,
      },
    },
  );
}

/**
 * 获取预约关系
 */
export function getReserveRelation(ids: number[]) {
  return biliApi.get<ReserveRelation>(
    `x/activity/up/reserve/relation/info?csrf=${TaskConfig.BILIJCT}&ids=${ids.join(',')}}`,
  );
}
