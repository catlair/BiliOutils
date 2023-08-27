import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { isNumber } from './is';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');
dayjs.locale('zh-cn');

export { dayjs };

interface WaitOptions {
  hour: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  timezone?: string;
}

/**
 * 等待指定时间
 */
export function waitForTime(options: WaitOptions) {
  const { hour, minute = 0, second = 0, timezone = 'Asia/Shanghai', millisecond = 0 } = options;
  return new Promise<void>(resolve => {
    const now = dayjs().tz(timezone);
    const targetTime = now
      .clone()
      .startOf('day')
      // 在使用时不应该使用 0 作为 hour，因为谁都不可能等待今天的 0 点到来，你能回到昨天吗？
      .add(hour === 0 ? 24 : hour, 'hours')
      .add(minute, 'minutes')
      .add(second, 'seconds')
      .add(millisecond, 'milliseconds');
    const timeToWait = targetTime.diff(now);
    if (timeToWait > 0) {
      setTimeout(() => {
        resolve();
      }, timeToWait);
    } else {
      resolve();
    }
  });
}

/**
 * 返回本月拥有天数
 */
export function getMonthHasDays(now?: Date) {
  return dayjs(now || getPRCDate()).daysInMonth();
}

/**
 * 不同时区获取北京时间
 */
export function getPRCTime(data?: Date) {
  return dayjs().add((data || new Date()).getTimezoneOffset() / 60 + 8, 'hour');
}

/**
 * 不同时区获取北京时间
 */
export function getPRCDate(data?: Date): Date {
  return getPRCTime(data).toDate();
}

/**
 * 获取当前日期（自动补齐两位）
 */
export function getDateString(now?: Date) {
  return dayjs(now || getPRCDate()).format('YYYY-MM-DD');
}

/**
 * 今天是否在预设的时间数组中
 * @param timeArr 时间数组（为空则判断为在）
 */
export function isTodayInTimeArr(timeArr: number[]) {
  if (!timeArr || !timeArr.length) {
    return true;
  }
  return timeArr.includes(getPRCTime().hour());
}

export function isToday(date: Date): boolean;
export function isToday(date: number, isUnix?: boolean): boolean;
export function isToday(date: Date | number, isUnix = true): boolean {
  const time = isNumber(date) ? (isUnix ? date * 1000 : date) : date;
  return dayjs().isSame(time, 'day');
}

/**
 * 获取 unix 时间戳
 */
export function getUnixTime() {
  return dayjs().unix();
}

/**
 * 获取服务器时间
 */
export async function getServerTime(): Promise<number> {
  try {
    const { getNow } = await import('../net/utils.request');
    const { data, code } = await getNow();
    if (code !== 0) {
      return getUnixTime();
    }
    return data.now;
  } catch {}
  return getUnixTime();
}

/**
 * 获取服务器时间的日期，且转换为北京时间
 */
export async function getServerDate(): Promise<Date> {
  return getPRCDate(new Date((await getServerTime()) * 1000));
}
