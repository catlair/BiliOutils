import { TaskConfig } from '@/config';
import { sendDmMessage } from '@/service/dm.service';
import { apiDelay, logger } from '@/utils';

export async function liveDmService() {
  const { roomid } = TaskConfig.watchLink;
  logger.verbose(`测试模式：使用 TaskConfig.watchLink.roomid 配置`);
  for (const room of roomid) {
    await sendDmMessage(room);
    await apiDelay(8000, 15000);
  }
}
