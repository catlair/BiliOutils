import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface WaitOptions {
  hour: number;
  minute?: number;
  second?: number;
  timezone?: string;
}

/**
 * 等待指定时间
 */
export function waitForTime(options: WaitOptions) {
  const { hour, minute = 0, second = 0, timezone = 'Asia/Shanghai' } = options;
  return new Promise<void>(resolve => {
    const now = dayjs().tz(timezone);
    const targetTime = now
      .clone()
      .startOf('day')
      .add(hour, 'hours')
      .add(minute, 'minutes')
      .add(second, 'seconds');
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
 * 返回当前时间的中国时区时间
 */
export function getShanghaiDate() {
  return dayjs().add(new Date().getTimezoneOffset() / 60 + 8, 'hour');
}
