import { getDailyTaskRewardInfo } from '@/net/user-info.request';
import { logger } from '@/utils/log';
import { TaskModule } from '@/config';
import { addShare, uploadVideoHeartbeat } from '@/net/video.request';
import { apiDelay, random } from '@/utils';
import { request } from '@/utils/request';
import { getAidByByPriority, getAidByRecommend } from '../addCoins/coin.service';

/**
 * 播放和分享检测
 */
export async function checkShareAndWatch(): Promise<{
  share: boolean;
  watch: boolean;
}> {
  try {
    const { data, message, code } = await getDailyTaskRewardInfo();
    if (code === 0) {
      return data;
    }
    logger.warn(`状态获取失败: ${code} ${message}`);
  } catch (error) {
    logger.error(`每日分享/播放检测出现异常: ${error.message}`);
  }
  return {} as any;
}

export async function shareAndWatchService(share: boolean, watch: boolean) {
  const aid = TaskModule.videoAid || (await getVideoAid());
  if (!aid) {
    return;
  }

  //分享
  if (!share) {
    await apiDelay();
    await request(addShare, { name: '分享视频', okMsg: '分享视频成功！' }, aid);
  }

  //播放视频
  if (!watch) {
    await apiDelay();
    //随机上传4s到60s
    await request(
      uploadVideoHeartbeat,
      { name: '播放视频', okMsg: '播放视频成功！' },
      aid,
      random(4, 60),
    );
  }
}

async function getVideoAid() {
  // 获取aid
  try {
    const biliav = await getVideo();
    if (biliav.code === 0) {
      const { id, author, title } = biliav.data || {};
      logger.debug(`获取视频: ${title} --up【${author}】`);
      return id;
    } else {
      logger.warn(`获取视频失败 ${biliav.msg}`);
      return;
    }
  } catch (error) {
    logger.error(`获取视频出现异常：`, error);
    return;
  }
}

/**
 * 获取视频
 */
export async function getVideo() {
  for (let errCount = 5; errCount > 0; errCount--) {
    const biliav = await getAidByByPriority(['视频']);
    if (biliav.code !== 0) {
      return await getAidByRecommend();
    }
    if (biliav && biliav.data?.coinType === '视频') {
      return biliav;
    }
  }
  return await getAidByRecommend();
}

export async function retry() {
  const { share, watch } = await checkShareAndWatch();
  if (share && watch) {
    return true;
  }
  await apiDelay();
  if (!share) {
    logger.debug('分享失败，重试');
  }
  if (!watch) {
    logger.debug('播放失败，重试');
  }
  await shareAndWatchService(share, watch);
}
