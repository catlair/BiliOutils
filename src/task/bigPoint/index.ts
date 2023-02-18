import { TaskModule } from '@/config';
import { bigPointService } from './big-point.service';
import { logger } from '@/utils/log';

export default async function bigPoint() {
  logger.info('----【大会员积分】----');
  try {
    if (TaskModule.vipType === 0 || TaskModule.vipStatus === 0) {
      logger.info('当前不是大会员，跳过任务');
      return;
    }
    await bigPointService();
  } catch (error) {
    logger.error(`大会员积分任务异常: ${error.message}`);
  }
}
