import { TaskModule } from '@/config';
import { logger } from '@/utils';
import { shareLiveRoom } from '~/liveIntimacy/intimacy.request';
import { liveWeekTaskService } from './live-task.service';

export default async function liveWeekTask() {
  logger.info(`----【直播周任务】----`);

  try {
    await shareLiveRoom(TaskModule.roomid);
  } catch {}

  await liveWeekTaskService();
}
