import { logger } from '@/utils';
import { linkService } from './blink.service';

export default async function blink() {
  logger.info(`----【直播推流】----`);
  try {
    return await linkService();
  } catch (error) {
    logger.exception(`执行直播推流`, error);
  }
}
