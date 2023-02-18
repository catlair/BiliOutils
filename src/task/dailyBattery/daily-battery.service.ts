import * as net from './daily-battery.request';
import { apiDelay, getRandomItem, logger } from '@/utils';
import { sendDmMessage } from '@/service/dm.service';

/**
 * 获取任务进度
 */
async function getTaskStatus() {
  try {
    const { code, message, data } = await net.getUserTaskProgress();
    if (code !== 0) {
      logger.warn(`获取任务进度失败：${code}-${message}`);
      return { s: -1 };
    }
    if (data.is_surplus === -1 || data.target === 0) {
      logger.info('账号无法完成该任务，故跳过');
      return { s: -2 };
    }
    const { status, progress } = data;
    if (status === 0 || status === 1) {
      logger.debug(`任务进度：${progress}`);
      return {
        s: status,
        p: progress,
      };
    }
    return {
      s: status,
    };
  } catch (error) {
    logger.error('获取任务进度异常', error);
  }
  return { s: -1 };
}

/**
 * 领取任务奖励
 */
async function receiveTaskReward() {
  try {
    const { code, message } = await net.receiveTaskReward();
    if (code !== 0) {
      logger.warn(`领取任务奖励失败：${code}-${message}`);
      return true;
    }
    logger.info('领取任务奖励成功');
    return true;
  } catch (error) {
    logger.error('领取任务奖励异常', error);
    return false;
  }
}

/**
 * 每日任务
 */
async function dailyBattery(lastProgress: Ref<number> & { time: number }) {
  const status = await getTaskStatus();
  switch (status.s) {
    case -2: {
      return true;
    }
    case -1: {
      return false;
    }
    case 2: {
      // 领取任务奖励
      return await receiveTaskReward();
    }
    case 3: {
      logger.info('任务已完成');
      return true;
    }
    default: {
      if (status.p === undefined) {
        logger.warn(`任务进度未知，${JSON.stringify(status)}`);
        return true;
      }
      if (status.p === lastProgress.value) {
        lastProgress.time++;
        if (lastProgress.time > 3) {
          logger.debug('任务进度未更新，跳过');
          return true;
        }
      } else {
        lastProgress.time = 0;
      }
      lastProgress.value = status.p;
      await sendLiveDm(5 - status.p);
      return false;
    }
  }
}

async function sendLiveDm(times: number) {
  logger.debug(`发送弹幕 ${times}`);
  for (let index = 0; index < times; index++) {
    await sendDmMessage(getRandomItem([21144080, 7734200, 46936]), 'bili官方');
    await apiDelay(10000, 15000);
  }
}

export async function dailyBatteryService() {
  // value 是当前进度，time 是连续未更新进度的次数
  const lastProgress = { value: 0, time: 0 };
  while (lastProgress.value < 5) {
    const result = await dailyBattery(lastProgress);
    if (result) return;
    await apiDelay(16000);
  }
}
