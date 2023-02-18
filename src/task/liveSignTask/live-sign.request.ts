import { liveApi } from '@/net/api';
import type { LiveSignDto, LiveSignInfoDto } from './live-sign.dto';

/**
 * 直播签到信息
 */
export function getSignInfo() {
  return liveApi.get<LiveSignInfoDto>('xlive/web-ucenter/v1/sign/WebGetSignInfo');
}

/**
 * 直播签到
 */
export function liveSign() {
  return liveApi.get<LiveSignDto>('xlive/web-ucenter/v1/sign/DoSign');
}
