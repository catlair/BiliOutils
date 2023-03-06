import type { ApiBaseProp } from '@/dto/bili-base-prop';
import type { WebUpStreamAddr } from './blink.dto';
import { TaskConfig } from '@/config';
import { liveApi } from '@/net/api';

const liveGet = <T = any>(url: string) => {
  return liveApi.get<T>(url, {
    headers: {
      origin: 'https://link.bilibili.com',
    },
  });
};

const livePost = <T = any>(url: string, data: any) => {
  return liveApi.post<T>(
    url,
    {
      ...data,
      csrf_token: TaskConfig.BILIJCT,
      csrf: TaskConfig.BILIJCT,
    },
    {
      headers: {
        origin: 'https://link.bilibili.com',
      },
    },
  );
};

export function getNewRoomSwitch(area_parent_id: number, area_id: number) {
  return liveGet<ApiBaseProp<{ display_switch: boolean }>>(
    `xlive/app-blink/v1/index/getNewRoomSwitch?platform=pc&area_parent_id=${area_parent_id}&area_id=${area_id}`,
  );
}

export function updateRoomInfo(room_id: number, options: { title?: string; area_id?: number }) {
  return livePost(`room/v1/Room/update`, {
    room_id,
    ...options,
  });
}

export function fetchWebUpStreamAddr() {
  return livePost<WebUpStreamAddr>(`xlive/app-blink/v1/live/FetchWebUpStreamAddr`, {
    platform: 'pc',
  });
}

/**
 * 获取身份认证码
 */
export function operationOnBroadcastCode() {
  return livePost<ApiBaseProp<{ code: string }>>(
    `xlive/open-platform/v1/common/operationOnBroadcastCode`,
    {
      action: 1,
    },
  );
}

export function startLive(room_id: number, area_v2: number) {
  return livePost(`room/v1/Room/startLive`, {
    platform: 'pc',
    room_id,
    area_v2,
  });
}

export function appointmentInfo() {
  return liveGet(`xlive/app-blink/v1/index/appointmentInfo?platform=web`);
}

export function stopLive(room_id: number) {
  return livePost<ApiBaseProp<{ change: 1; status: 'ROUND' }>>(`room/v1/Room/stopLive`, {
    platform: 'pc',
    room_id,
  });
}

export function reportData(type_status = 2) {
  return livePost(`xlive/app-blink/v1/report/ReportData`, {
    platform: 'web',
    type_status,
  });
}

export function getRecordInfo(live_key: number) {
  return liveGet(`xlive/app-blink/v1/record/getRecordInfo?live_key=${live_key}`);
}
