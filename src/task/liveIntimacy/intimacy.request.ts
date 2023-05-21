import type { ApiBaseProp } from '@/dto/bili-base-prop';
import type { ShareLiveRoomRes } from './intimacy.dto';
import type { LiveHeartBeatRes } from '@/dto/live.dto';
import { TaskConfig } from '@/config';
import { clientSign } from '@/utils/bili';
import { createUUID, createBuvid, randomString } from '@/utils/pure';
import { liveApi, liveTraceApi } from '@/net/api';

/**
 * 分享直播间
 */
export function shareLiveRoom(roomid: number) {
  return liveApi.post<ShareLiveRoomRes>(`xlive/web-room/v1/index/TrigerInteract`, {
    roomid,
    interact_type: 3,
    csrf: TaskConfig.BILIJCT,
    csrf_token: TaskConfig.BILIJCT,
    visit_id: '',
  });
}

/**
 * 点赞直播间
 */
export function likeLiveRoom(roomid: number) {
  return liveApi.post<ApiBaseProp>(`xlive/web-ucenter/v1/interact/likeInteract`, {
    roomid,
    csrf: TaskConfig.BILIJCT,
    csrf_token: TaskConfig.BILIJCT,
  });
}

export interface MobileHeartBeatParams {
  buvid?: string;
  gu_id?: string;
  visit_id?: string;
  uuid?: string;
  click_id?: string;
  room_id: number | string;
  up_id: number | string;
  uid?: number | string;
  up_level?: number | string;
  up_session?: string;
  parent_id?: number | string;
  area_id?: number | string;
}

/**
 * 直播心跳（移动端）
 */
export function liveMobileHeartBeat({
  buvid = createBuvid(),
  gu_id = randomString(43).toLocaleUpperCase(),
  visit_id = randomString(32).toLocaleLowerCase(),
  uuid = createUUID(),
  click_id = createUUID(),
  room_id,
  up_id,
  uid,
  up_level = 40,
  up_session = '',
  parent_id = 11,
  area_id = 376,
}: MobileHeartBeatParams) {
  const baseData = {
    platform: 'android',
    uuid,
    buvid,
    seq_id: '1',
    room_id,
    parent_id,
    area_id,
    timestamp: String(parseInt(String(new Date().getTime() / 1000)) - 60),
    secret_key: 'axoaadsffcazxksectbbb',
    watch_time: '60',
    up_id: up_id || uid || 0,
    up_level,
    jump_from: '30000',
    gu_id,
    play_type: '0',
    play_url: '',
    s_time: '0',
    data_behavior_id: '',
    data_source_id: '',
    up_session,
    visit_id,
    watch_status: '',
    click_id,
    session_id: '-99998',
    player_type: '0',
    client_ts: String(parseInt(String(new Date().getTime() / 1000))),
  };
  const data = {
    ...baseData,
    ts: parseInt(String(new Date().getTime() / 1000)),
    client_sign: clientSign(baseData),
    csrf_token: TaskConfig.BILIJCT,
    csrf: TaskConfig.BILIJCT,
  };
  return liveTraceApi.post<LiveHeartBeatRes>(
    'xlive/data-interface/v1/heartbeat/mobileHeartBeat',
    data,
  );
}
