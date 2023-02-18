import { getIp } from '@/net/anon.request';
import { TaskConfig } from '../config';
import { logger } from './log';
import { Sleep, random } from './pure';

/**
 * 异步延迟函数
 * @param delayTime 延迟时间(ms)
 * @param delayTime2 延迟时间2(ms)
 */
export function apiDelay(delayTime?: number, delayTime2?: number) {
  return Sleep.wait(getDelay(delayTime, delayTime2));
}

export function apiDelaySync(delayTime?: number, delayTime2?: number) {
  Sleep.waitSync(getDelay(delayTime, delayTime2));
}

export const sleep = apiDelay;
export const sleepSync = apiDelaySync;

function getDelay(delayTime?: number, delayTime2?: number) {
  if (delayTime && delayTime2) {
    return random(delayTime, delayTime2);
  }
  if (delayTime) {
    return delayTime;
  }
  const API_DELAY = TaskConfig.apiDelay;
  if (API_DELAY.length === 1) {
    return API_DELAY[0] * 1000;
  }
  return random(API_DELAY[0] || 2, API_DELAY[1] || 6) * 1000;
}

/**
 * 判断是否支持 ipv6
 */
export async function isSupportIpv6() {
  try {
    const { data, code, message } = await getIp();
    if (code === 0) {
      return data.addr.includes(':');
    }
    logger.fatal('获取 IP', code, message);
  } catch (error) {
    logger.exception('获取 IP', error);
  }
  return false;
}
