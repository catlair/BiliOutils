import { TaskModule } from '@/config';
import { getRoomid } from '@/service/live.service';
import { logger } from '@/utils';
import { shareLiveRoom } from '~/liveIntimacy/intimacy.request';
import { liveWeekTaskService } from './live-task.service';

export default async function liveWeekTask() {
  logger.info(`----【直播周任务】----`);

  try {
    await getRoomid();

    await shareLiveRoom(TaskModule.roomid);
    logger.info(`分享直播间`);
  } catch (error) {
    logger.debug(`分享失败，${error.message}`);
  }

  await liveWeekTaskService();
}
