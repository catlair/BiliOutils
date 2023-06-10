import { TaskConfig } from '@/config';
import { sendDmMessage } from '@/service/dm.service';
import { apiDelay, logger } from '@/utils';

export async function liveDmService() {
  const { roomid, num, delay } = TaskConfig.liveDm;
  for (const room of roomid) {
    logger.info(`直播间【${room}】开始发送弹幕`);
    for (let i = 0; i < num; i++) {
      logger.debug(`直播间【${room}】发送第${i + 1}条弹幕`);
      await sendDmMessage(room);
      await apiDelay(delay[0] * 1000, delay[1] * 1000);
    }
  }
}
