import { logger } from '@/utils';
import { add } from './exp.request';
import { TaskConfig, TaskModule } from '@/config';

export async function addExpService() {
  if (TaskModule.vipStatus === 0) {
    logger.info('大会员已过期');
    return;
  }
  try {
    const { code, message } = await add(TaskConfig.BILIJCT);
    if (code === 69198) {
      // 已经完成
      logger.info(message);
      return;
    }
    if (code === 0) {
      logger.info(`执行成功`);
      return;
    }
    logger.fatal('大会员领取经验', code, message);
  } catch (error) {
    logger.exception('大会员领取经验', error);
  }
}
