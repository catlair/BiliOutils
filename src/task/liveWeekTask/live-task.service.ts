import { logger } from '@/utils';
import { linkService } from '../blink/blink.service';
import { getAnchorTaskCenter, getReceiveReward } from './live-task.request';

/**
 * 获取任务是否完成
 */
async function getTaskStatus() {
  try {
    const { code, data, message } = await getAnchorTaskCenter();
    if (code !== 0) {
      logger.fatal('获取任务进度', code, message);
      return;
    }
    const weekTaskInfo = data.taskGroups?.find(t => t.taskGroupId === 2081)?.weekTaskInfo;
    if (!weekTaskInfo) {
      logger.error('获取任务进度失败，未找到任务');
      return;
    }
    logger.debug('获取任务进度');
    return weekTaskInfo.weekDailyTask.isFinished;
  } catch (error) {
    logger.exception('获取任务进度', error);
  }
}

export async function liveWeekTaskService() {
  if (await getTaskStatus()) {
    logger.info('任务已完成');
    return;
  }

  await linkService((stopRef, timeout) => {
    // 任务超时
    const timer = setInterval(async () => {
      if (await getTaskStatus()) {
        stopRef.value = true;
        clearTimeout(timeout);
        clearInterval(timer);
        logger.info('任务已完成');
      }
    }, 3 * 70 * 1000);
  });

  try {
    // 领取
    const { code, message } = await getReceiveReward();
    if (code !== 0) {
      logger.fatal(`领取每日直播奖励`, code, message);
      return;
    }
    logger.info(`领取每日直播奖励成功`);
  } catch (error) {
    logger.exception(`领取每日直播奖励`, error);
  }
}
