import {
  fetchWebUpStreamAddr,
  getAnchorTaskCenter,
  getReceiveReward,
  operationOnBroadcastCode,
  startLive,
  stopLive,
} from './blink.request';
import { logger, random } from '@/utils';
import { eventSwitch, hasCmd } from '@/utils/node';
import { dirname, resolve } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { VIDEO_EXT } from './constant';

/**
 * 获取链接
 */
async function getLink() {
  try {
    const { code, data, message } = await fetchWebUpStreamAddr();
    if (code !== 0) {
      logger.warn(`获取链接失败：${code} ${message}`);
      return;
    }
    return data;
  } catch (error) {
    logger.error(`获取链接异常：`, error);
  }
}

async function clickStartLive() {
  try {
    const { code, message } = await startLive(13142548);
    if (code !== 0) {
      // 4 没有权限
      logger.warn(`开播失败：${code} ${message}`);
      return;
    }
    logger.info(`开播成功`);
    return operationOnBroadcastCode();
  } catch (error) {
    logger.error(`开播异常：`, error);
  }
}

async function clickStopLive() {
  try {
    const { code, message } = await stopLive(13142548);
    if (code !== 0) {
      logger.warn(`下播失败：${code} ${message}`);
    }
    logger.info(`下播成功`);
  } catch (error) {
    logger.error(`下播异常：`, error);
  }
}

async function startLiveByRtmp(addr: string, stopRef: Ref<boolean>) {
  const { pushToStream } = await import('@/utils/ffmpeg');
  // 根据 files 轮流推流
  const sf = () => random(true) - 0.5;
  const files = await getConfigVideoPaths();
  if (!files.length) return -1;
  return await pushToStream(files.sort(sf).sort(sf), addr, stopRef);
}

async function getConfigVideoPaths() {
  const videoPaths = resolve(dirname(process.env.__BT_CONFIG_PATH__), 'video');
  if (!existsSync(videoPaths) || !statSync(videoPaths).isDirectory()) return [];
  return readdirSync(videoPaths)
    .filter(f => VIDEO_EXT.some(e => f.endsWith(e)))
    .map(f => resolve(videoPaths, f));
}

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

/**
 * 初始化
 */
function init() {
  const stopRef = { value: false };
  // 总超时
  const timeout = setTimeout(() => (stopRef.value = true), 70 * 60 * 1000);
  // 任务超时
  const timer = setInterval(async () => {
    if (await getTaskStatus()) {
      stopRef.value = true;
      clearTimeout(timeout);
      clearInterval(timer);
      logger.info('任务已完成');
    }
  }, 3 * 70 * 1000);
  const sigintSwitch = eventSwitch('SIGINT', () =>
    clickStopLive().finally(() => {
      clearTimeout(timeout);
      process.exit(0);
    }),
  );
  return {
    stopRef,
    sigintSwitch,
  };
}

export async function linkService() {
  const { stopRef, sigintSwitch } = init();

  try {
    if (!(await hasCmd('ffmpeg'))) {
      logger.error('未安装 ffmpeg');
      return;
    }
    // 获取推流地址
    const {
      addr: { addr, code },
    } = (await getLink()) || { addr: {} };

    if (!addr || !code) return;
    if (!(await clickStartLive())) return;

    sigintSwitch.on();
    await startLiveByRtmp(addr + code, stopRef);
    await clickStopLive();
  } catch (error) {
    logger.exception('直播推流', error);
    await clickStopLive();
  }
  sigintSwitch.off();
}

// TODO: 开发中ing
(async () => {
  logger.info('开始直播推流');
  if (await getTaskStatus()) {
    logger.info('任务已完成');
    return;
  }
  await linkService();
  // 领取
  await getReceiveReward()
    .then(({ code, message }) => {
      if (code !== 0) {
        logger.fatal(`领取每日直播奖励`, code, message);
        return;
      }
      logger.info(`领取每日直播奖励成功`);
    })
    .catch(logger.error);
})();
