import { logger } from '@/utils';
import { completeWatch, deleteServerless } from '../bigPoint/big-point.service';
import { dailyHandler } from '@/utils/serverless';

export default async function _bigPoint() {
  logger.info('----【大会员积分】----');
  try {
    if (!dailyHandler.payload) {
      logger.error('获取云函数参数失败，跳过');
      return;
    }
    const payload = JSON.parse(dailyHandler.payload);
    await completeWatch(payload.task_id, payload.token);
    logger.info('删除云函数');
    await deleteServerless();
  } catch (error) {
    logger.error(`大会员积分任务异常: ${error.message}`);
  }
}
