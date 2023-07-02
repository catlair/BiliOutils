import { getWaitTime, isInExchangeTime } from './utils';

describe('isInExchangeTime', () => {
  it('如果当前时间在交易时间范围内，应该返回 true', () => {
    const date = new Date('2022-01-01T03:02:00Z');
    const { startTime, endTime } = getWaitTime(12);
    expect(isInExchangeTime(startTime, endTime, date)).toBe(true);
  });

  it('如果当前时间在交易时间范围外，应该返回 false', () => {
    const date = new Date('2022-01-01T10:30:00Z');
    const { startTime, endTime } = getWaitTime(12);
    expect(isInExchangeTime(startTime, endTime, date)).toBe(false);
  });

  it('应该处理交易时间在整点开始的情况', () => {
    const date = new Date('2022-01-01T02:00:00Z');
    const { startTime, endTime } = getWaitTime(12);
    expect(isInExchangeTime(startTime, endTime, date)).toBe(true);
  });

  it('应该处理交易时间跨越午夜的情况', () => {
    const date = new Date('2022-01-01T15:30:00Z');
    const { startTime, endTime } = getWaitTime(0);
    expect(isInExchangeTime(startTime, endTime, date)).toBe(true);
  });
});
