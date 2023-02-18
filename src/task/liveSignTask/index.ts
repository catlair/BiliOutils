import { logger } from '@/utils/log';
import { liveSignService } from './live-sign.service';

export default async function liveSignTask() {
  logger.info('----【直播签到】----');
  try {
    await liveSignService();
  } catch (error) {
    logger.error(`直播签到异常：`, error);
  }
}
