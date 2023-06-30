import { exchangeBigPointService } from './exchange-bigpoint.service';
import { logger } from '@/utils/log';

export default async function exchangeBigPoint() {
  logger.info('----【会员大积分兑换任务】----');
  try {
    await exchangeBigPointService();
  } catch (error) {
    logger.exception('会员大积分兑换任务', error);
  }
}
