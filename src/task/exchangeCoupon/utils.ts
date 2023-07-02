/**
 * 获取等待时间段
 * @description startHour - 2 ~ startHour，如果 startHour 为 0，则为 22 ~ 0
 */
export function getWaitTime(startHour: number) {
  return {
    startTime: startHour < 2 ? 22 + startHour : startHour - 2,
    endTime: startHour,
  };
}

/**
 * 是否在兑换时间段内
 */
export function isInExchangeTime(startTime = 0, endTime = 0, date: Date) {
  const hour = date.getHours() === 0 ? 24 : date.getHours();
  endTime = endTime === 0 ? 24 : endTime;
  startTime = startTime === 0 ? 24 : startTime;
  if (hour === endTime) {
    return date.getMinutes() < 3;
  }
  return hour >= startTime && hour < endTime;
}
