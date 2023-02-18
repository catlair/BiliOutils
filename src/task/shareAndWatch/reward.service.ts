import { getDailyTaskRewardInfo } from '@/net/user-info.request';
import { TaskModule } from '@/config';
import { logger } from '@/utils/log';

/**
 * 播放和分享检测
 */
export async function checkShareAndWatch() {
  try {
    const { data, message, code } = await getDailyTaskRewardInfo();
    if (code != 0) {
      logger.warn(`状态获取失败: ${code} ${message}`);
      return;
    }
    const { share, watch } = data;
    share && logger.info(`分享任务已完成`);
    watch && logger.info(`观看任务已完成`);

    TaskModule.share = share;
    TaskModule.watch = watch;
  } catch (error) {
    logger.error(`每日分享/播放检测出现异常: ${error.message}`);
  }
}
