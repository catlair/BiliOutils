import * as net from './daily-battery.request';
import { apiDelay, getRandomItem, logger } from '@/utils';
import { generateRandomDm, sendDmMessage } from '@/service/dm.service';
import { TaskConfig } from '@/config';
import { sendMessageApp } from '@/net/live.request';
import type { Tasklist } from './daily-battery.dto';

/**
 * 获取任务进度
 */
async function getTaskStatusV1() {
  try {
    const { code, message, data } = await net.getUserTaskProgressV1();
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
 * 获取任务进度
 */
async function getTaskStatus() {
  try {
    const { code, message, data } = await net.getUserTaskProgress(6);
    if (code !== 0) {
      logger.fatal('获取任务进度', code, message);
      return;
    }
    if (data.is_surplus === -1) {
      logger.warn('账号无法完成该任务，故跳过');
      return;
    }
    const { task_list } = data;
    return task_list;
  } catch (error) {
    logger.exception('获取任务进度', error);
  }
}

/**
 * 获取未完成的任务
 */
async function getUnfinishedTask() {
  const tasks = await getTaskStatus();
  if (!tasks) return;
  const notFinish = tasks.filter(item => item.status !== 3);
  if (notFinish.length === 0) {
    logger.info('所有任务已完成');
    return;
  }
  return notFinish;
}

/**
 * 领取任务奖励
 */
async function receiveTaskReward(version = 2) {
  try {
    const { code, message, data } = await (version === 1
      ? net.receiveTaskRewardV1()
      : net.receiveTaskReward(6, 34));
    switch (code) {
      case 0: {
        if (data?.num === 1) {
          logger.info('领取任务奖励成功');
          return true;
        }
        return false;
      }
      case 27000001: {
        logger.warn(`${message}，建议早点运行`);
        return true;
      }
      default: {
        logger.fatal(`领取任务奖励`, code, message);
        return false;
      }
    }
  } catch (error) {
    logger.exception('领取任务奖励', error);
    return false;
  }
}

/**
 * 获取活动房间
 */
async function getLandingRoom() {
  try {
    const { code, message, data } = await net.getLandingRoom();
    if (code !== 0) {
      logger.fatal('获取活动房间', code, message);
      return;
    }
    const { room_id } = data;
    if (room_id) {
      logger.debug(`获取活动房间成功${room_id}`);
    }
    return room_id;
  } catch (error) {
    logger.exception('获取活动房间', error);
  }
}

async function doOldTask(lastProgress: Ref<number> & { time: number }) {
  const status = await getTaskStatusV1();
  switch (status.s) {
    case -2: {
      return true;
    }
    case -1: {
      return false;
    }
    case 2: {
      // 领取任务奖励
      return await receiveTaskReward(1);
    }
    case 3: {
      logger.info('任务已完成[老任务]');
      return true;
    }
    default: {
      if (status.p === undefined) {
        logger.warn(`任务进度[老任务]未知，${JSON.stringify(status)}`);
        return true;
      }
      if (status.p === lastProgress.value) {
        lastProgress.time++;
        if (lastProgress.time > 3) {
          logger.debug('任务进度[老任务]未更新，跳过');
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

/**
 * 每日任务
 */
async function dailyBattery() {
  const tasks = await getUnfinishedTask();
  if (!tasks) return;

  if (TaskConfig.dailyBattery.task39) {
    await task39(tasks);
  }

  if (TaskConfig.dailyBattery.task34) {
    await task34(tasks);
  }
}

async function task39(tasks: Tasklist[]) {
  const task = tasks.find(item => item.task_title?.includes('鼓励新主播'));
  if (!task) {
    logger.info('[鼓励新主播]任务已完成');
    return true;
  }
  const first = await runTask39(task);
  if (first === 0) return true;

  let result: any;
  while ((result = await runTask39(result))) {
    await apiDelay(3000);
  }
}

async function runTask39(task?: Tasklist | number) {
  if (!task || task !== -1) {
    const tasks = await getUnfinishedTask();
    if (!tasks) return 0;
    if (tasks.length === 0) {
      logger.info('所有任务已完成');
      return 0;
    }
    task = tasks.find(item => item.task_title?.includes('鼓励新主播'));
    if (!task) {
      logger.info('[鼓励新主播]任务已完成');
      return 0;
    }
  }
  await apiDelay(3000);
  // 进行一次
  const roomid = await getLandingRoom();
  if (!roomid) {
    await apiDelay(10000, 30000);
    return -1;
  }
  // 发送弹幕
  const dm = generateRandomDm();
  logger.debug(`发送弹幕[${roomid}] ${dm}`);
  await sendMessageApp(roomid, dm);
  await apiDelay(5000, 10000);
  return 1;
}

async function task34(tasks: Tasklist[]) {
  let task34 = tasks.find(item => item.task_title?.includes('5条弹幕') || item.task_id === 34);
  if (!task34) {
    logger.info('34 任务已完成');
    return true;
  }
  const { status } = task34;
  if (status === 2) {
    await receiveTaskReward();
    return true;
  }
  // 如果先完成了 39 任务，那么可能不需要发送弹幕了
  if (TaskConfig.dailyBattery.task39) {
    const tasks = await getUnfinishedTask();
    if (!tasks) return;
    task34 = tasks.find(item => item.task_title?.includes('5条弹幕') || item.task_id === 34);
    if (!task34) {
      logger.info('34 任务已完成');
      return true;
    }
  }
  const times = task34.target;
  if (times) {
    await sendLiveDm(times);
  }
  await receiveTaskReward();
}

async function sendLiveDm(times: number) {
  logger.debug(`发送弹幕 ${times}`);
  for (let index = 0; index < times; index++) {
    await sendDmMessage(getRandomItem([21144080, 7734200, 46936]), 'bili官方');
    await apiDelay(8000, 15000);
  }
}

export async function dailyBatteryService() {
  const { task34, task34old, task39 } = TaskConfig.dailyBattery;
  if (task34 || task39) {
    await dailyBattery();
  }

  // 旧任务
  if (task34old) {
    // value 是当前进度，time 是连续未更新进度的次数
    const lastProgress = { value: 0, time: 0 };
    while (lastProgress.value < 5) {
      const result = await doOldTask(lastProgress);
      if (result) break;
      await apiDelay(16000);
    }
  }
}
