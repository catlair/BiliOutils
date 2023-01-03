import {
  fetchWebUpStreamAddr,
  operationOnBroadcastCode,
  startLive,
  stopLive,
} from '@/net/blink.request';
import { logger } from '@/utils';
import path from 'path';

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
      logger.warn(`开播失败：${code} ${message}`);
      return;
    }
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
  } catch (error) {
    logger.error(`下播异常：`, error);
  }
}

async function startLiveByRtmp(addr: { addr: string; code: string }, timeout: number) {
  const { pushToStream } = await import('@/utils/ffmpeg');
  const files = [path.resolve(process.cwd(), './config/demo.mkv')];
  // 根据 files 轮流推流
  return await pushToStream(files, addr.addr + addr.code, timeout);
}

// TDOO: 开发中ing
(async () => {
  const handleClose = () => clickStopLive().then(() => process.exit(0));
  try {
    const { hasCmd } = await import('@/utils/ffmpeg');
    if (!(await hasCmd('ffmpeg'))) {
      logger.error('未安装 ffmpeg');
      return;
    }
    // 获取推流地址
    const { addr } = (await getLink()) || {};
    if (!addr) return;
    if (!(await clickStartLive())) return;
    process.on('SIGINT', handleClose);
    // 开始推流，超时31分钟
    await startLiveByRtmp(addr, 31 * 60 * 1000);
    await clickStopLive();
  } catch (error) {
    logger.error(`直播异常：`, error);
    await clickStopLive();
  }
  process.off('SIGINT', handleClose);
})();
