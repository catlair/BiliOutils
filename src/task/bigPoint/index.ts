import { bigPointService } from './big-point.service';
import { logger } from '@/utils/log';

export default async function bigPoint() {
  logger.info('----【大会员积分】----');
  try {
    await bigPointService();
  } catch (error) {
    logger.error(`大会员积分任务异常: ${error.message}`);
  }
}
