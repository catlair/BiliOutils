import { logger } from '@/utils';
import { addExpService } from './exp.service';

export default async function activityLottery() {
  logger.info('----【大会员领取经验】----');
  try {
    await addExpService();
  } catch (error) {
    logger.exception(`大会员领取经验`, error);
  }
}
