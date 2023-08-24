import { checkLocalTime } from '@/utils/bili';
import { liveIntimacyService } from './intimacy.service';
import { logger } from '@/utils';

export default async function liveIntimacy() {
  logger.info('----【直播亲密度】----');
  try {
    if (!(await checkLocalTime())) {
      logger.error('本地时间校验失败，跳过直播亲密度');
      return;
    }
    await liveIntimacyService();
  } catch (error) {
    logger.error(`直播亲密度：`, error);
  }
}
