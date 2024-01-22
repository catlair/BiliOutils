import { biliApi } from '@/net/api';
import type { BlacksDto } from './removeBlacks.dto';

/**
 * 获取黑名单
 */
export function getBlacksApi(pageNum = 1, pageSize = 20) {
  return biliApi.get<BlacksDto>(
    `x/relation/blacks?re_version=0&pn=${pageNum}&ps=${pageSize}&jsonp=jsonp&web_location=0.0`,
  );
}
