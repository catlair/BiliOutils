import { logger } from '@/utils/log';
import { liveDmService } from './live-dm.service';

export default async function liveDm() {
  logger.info('----【直播弹幕】----');
  try {
    await liveDmService();
  } catch (error) {
    logger.exception(`直播挂机`, error);
  }
}
