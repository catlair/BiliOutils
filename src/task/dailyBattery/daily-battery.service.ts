import * as net from './daily-battery.request';
import { apiDelay, getRandomItem, logger } from '@/utils';
import { generateRandomDm, sendDmMessage } from '@/service/dm.service';
import { TaskConfig } from '@/config';
import { getInfoByRoom, sendMessageApp } from '@/net/live.request';
import type { Tasklist } from './daily-battery.dto';
import { Roominfo } from '@/dto/live.dto';

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
    if (!task_list) {
      logger.warn('获取任务进度失败');
      return;
    }
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
async function receiveTaskReward() {
  try {
    const { code, message, data } = await net.receiveTaskReward(6, 34);
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

/**
 * 每日任务
 */
async function dailyBattery() {
  const tasks = await getTaskStatus();
  if (!tasks) return;

  const tasksConfig = TaskConfig.dailyBattery.tasks;
  try {
    await task20(tasks);
  } catch (error) {
    logger.exception('鼓励新主播', error);
  }

  try {
    if (tasksConfig.includes('5弹幕')) {
      await task5(tasks);
    }
  } catch (error) {
    logger.exception('5条弹幕', error);
  }

  // TODO: fuck 怎么又有新的，暂时就这样搞了，等已知任务多点再重构
  try {
    const task53 = tasks.find(item => item.task_title?.includes('并点赞') || item.task_id === 53);
    if (task53 && task53.status !== 3) {
      logger.info(`[${task53.task_id}]${task53.task_title}`);
      let count = 0;
      while (task53.total_reward > task53.received_reward) {
        if (count > 15) {
          logger.info(`多次尝试无效，跳过任务`);
          break;
        }
        count++;
        const roomid = await getLandingRoom();
        if (!roomid) {
          apiDelay(7000, 10000);
          continue;
        }

        const roominfo = await getRoomInfo(roomid);
        if (!roominfo || roominfo === -1) {
          continue;
        }

        logger.debug(`已经获取 ${task53.received_reward}`);

        await watch30s(roominfo, task53);
      }
    }
  } catch (error) {
    logger.exception('观看10秒并点赞', error);
  }
}

async function task20(tasks: Tasklist[]) {
  const tasksConfig = TaskConfig.dailyBattery.tasks;
  const task1Config = tasksConfig.includes('20弹幕'),
    task2Config = tasksConfig.includes('20弹幕30秒观看');

  if (!task1Config && !task2Config) {
    return true;
  }

  const task1 = tasks.find(item => item.task_title?.includes('鼓励新主播'));
  const task2 = tasks.find(item => item.task_title?.includes('30秒'));

  if (!task1 && !task2) {
    return true;
  }

  // 判断当前用户需要完成的是1还是2
  if (task1 && task1Config) {
    return taskHandle(task1, '弹幕');
  }

  if (task2 && task2Config) {
    return taskHandle(task2, '弹幕/观看');
  }

  async function taskHandle(task: Tasklist, info: string) {
    logger.debug(`[${info}] ${task.task_id} ${task.task_title}`);
    if (task.status === 3) {
      logger.info(`[鼓励新主播（${info}}）]任务已完成 ${task.status}`);
      return true;
    }
    const runTask20Options = info === '弹幕' ? {} : { isWatch30s: true };
    const first = await runTask20({
      task,
      ...runTask20Options,
    });
    if (first === 0) return true;

    let result = first,
      count = 0,
      total = 0,
      prevRoomid = 0;
    while ((result = await runTask20({ num: result, ...runTask20Options }))) {
      const { delay } = TaskConfig.dailyBattery;
      await apiDelay(delay[0], delay[1]);
      if (result > 0) {
        if (result !== prevRoomid) {
          prevRoomid = result;
          count++;
        } else if (result === prevRoomid) {
          const { delayByRoomid } = TaskConfig.dailyBattery;
          await apiDelay(delayByRoomid[0], delayByRoomid[1]);
        }
      }

      total++;
      if (count > 40 || total > 100) {
        logger.warn('任务进度未更新，跳过');
        break;
      }
    }
    return true;
  }
}

type RunTask20Params = {
  task?: Tasklist;
  num?: number;
  isWatch30s?: boolean;
};

async function runTask20({ task, num, isWatch30s }: RunTask20Params) {
  if (num && num !== -1) {
    const tasks = await getUnfinishedTask();
    if (!tasks) return 0;
    if (tasks.length === 0) return 0;
    task = tasks.find(item => item.task_title?.includes(isWatch30s ? '30秒' : '鼓励新主播'));
    if (!task) {
      logger.debug(JSON.stringify(tasks, null, 2));
    }
  }
  if (!task) {
    logger.info(`[鼓励新主播（${isWatch30s ? '弹幕/观看' : '弹幕'}）]任务已完成`);
    return 0;
  }
  if (!task.btn_text.includes('去看看')) {
    // 如果不是去观看，那么就等待并重试
    await apiDelay(3000, 5000);
    return -2;
  }
  await apiDelay(3000);
  // 进行一次
  const roomid = await getLandingRoom();
  if (!roomid) {
    await apiDelay(10000, 30000);
    return -1;
  }
  logger.debug(`已经获取 ${task.received_reward}`);

  const roominfo = await getRoomInfo(roomid);
  if (!roominfo || roominfo === -1) {
    return -1;
  }

  if (isWatch30s) {
    await watch30s(roominfo, task);
  }

  await apiDelay(3000);

  if (!isWatch30s && task.btn_text.includes('去发弹幕')) {
    return -2;
  }

  await sendAppMsg(roominfo);

  return roomid;
}

async function watch30s(room_info: Roominfo, task: Tasklist) {
  try {
    const { room_id, uid } = room_info;
    logger.debug(`观看30秒[${room_id}]`);
    // const options = {
    //   ...getRandomOptions(),
    //   room_id: room_id,
    //   up_id: uid,
    //   up_session: room_info?.up_session,
    //   area_id: room_info?.parent_area_id,
    //   parent_id: room_info?.area_id,
    //   watch_time: '30',
    // };
    // await liveMobileHeartBeat(options);
    // await apiDelay(30200);
    // await liveMobileHeartBeat(options);
    await apiDelay(400, 3000);
    await net.tickerUploadUserTask(uid, task.task_id);
  } catch (error) {
    logger.exception('观看30秒', error);
  }
}

async function task5(tasks: Tasklist[]) {
  let task34 = tasks.find(item => item.task_title?.includes('5条弹幕') || item.task_id === 34);
  if (!task34) {
    return true;
  }
  const { status } = task34;
  if (status === 2) {
    await receiveTaskReward();
    return true;
  }
  // 如果先完成了 39 任务，那么可能不需要发送弹幕了
  if (TaskConfig.dailyBattery.tasks?.length > 1) {
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

async function sendAppMsg(roomInfo: Roominfo) {
  try {
    const dm = generateRandomDm();
    logger.debug(`发送弹幕[${roomInfo.room_id}] ${dm}`);
    const { code, message } = await await sendMessageApp(roomInfo.room_id, dm, roomInfo);
    if (code !== 0) {
      logger.fatal('发送弹幕', code, message);
      return;
    }
  } catch (error) {
    logger.exception('发送弹幕', error);
  }
}

async function getRoomInfo(roomid: number) {
  try {
    const { code, message, data } = await getInfoByRoom(roomid);
    if (code !== 0) {
      logger.fatal('获取房间信息', code, message);
      return -1;
    }
    const { room_info } = data;
    return room_info;
  } catch (error) {
    logger.exception('获取房间信息', error);
  }
}

export async function dailyBatteryService() {
  const { tasks } = TaskConfig.dailyBattery;
  if (tasks.length === 0) return;
  await dailyBattery();
}
