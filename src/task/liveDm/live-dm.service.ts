import { TaskConfig } from '@/config';
import { sendDmMessage } from '@/service/dm.service';
import { apiDelay, getRandomItem, isArray, isNotEmpty, logger } from '@/utils';

interface DmMessageOptions {
  roomId: number;
  message?: string;
}

async function sendDmMessageWithOptions(options: DmMessageOptions) {
  const { roomId, message } = options;
  await sendDmMessage(roomId, undefined, message);
}

async function sendCustomDmItem(roomId: number, num = 1, msg?: string[]) {
  const { delay } = TaskConfig.liveDm;
  for (let i = 0; i < num; i++) {
    logger.debug(`直播间【${roomId}】发送第${i + 1}条弹幕`);
    await sendDmMessageWithOptions({ roomId, message: msg && getRandomItem(msg) });
    await apiDelay(delay[0] * 1000, delay[1] * 1000);
  }
}

async function sendCustomDm() {
  const { custom } = TaskConfig.liveDm;
  if (!isNotEmpty(custom)) return false;
  for (const item of custom) {
    if (isArray(item)) {
      const [roomId, num, msg] = item;
      await sendCustomDmItem(roomId, num, msg);
    } else {
      const { id, num, msg } = item;
      await sendCustomDmItem(id, num, msg);
    }
  }
  return true;
}

async function sendLiveDm(roomId: number, num: number, delay: number[]) {
  logger.info(`直播间【${roomId}】开始发送弹幕`);
  for (let i = 0; i < num; i++) {
    logger.debug(`直播间【${roomId}】发送第${i + 1}条弹幕`);
    await sendDmMessageWithOptions({ roomId });
    await apiDelay(delay[0] * 1000, delay[1] * 1000);
  }
}

export async function liveDmService() {
  const { roomid, num, delay } = TaskConfig.liveDm;

  if (await sendCustomDm()) return;

  for (const roomId of roomid) {
    await sendLiveDm(roomId, num, delay);
  }
}
