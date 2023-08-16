import { dailyBatteryService } from './daily-battery.service';
import { logger } from '@/utils/log';

export default async function dailyBattery() {
  logger.info('----【获取每日电池】----');
  try {
    await dailyBatteryService();
    logger.info(`获取每日电池结束`);
  } catch (error) {
    logger.exception(`获取每日电池`, error);
  }
}
