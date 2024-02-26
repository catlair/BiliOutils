import { logger } from '@/utils/log';
import { checkShareAndWatch, retry, shareAndWatchService } from './reward.service';

/**
 * 每日分享/播放视频
 */
export default async function shareAndWatch() {
  logger.info('----【分享/播放视频】----');
  const { share, watch } = await checkShareAndWatch();
  if (share) {
    logger.info('今日已分享');
  }
  if (watch) {
    logger.info('今日已观看');
  }
  if (share && watch) {
    logger.info('已完成，跳过分享/播放');
    return;
  }

  await retry(await shareAndWatchService(share, watch));
}
