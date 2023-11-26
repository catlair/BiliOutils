import { videoHeartbeat } from '@/net/video.request';
import { getRandomItem, getUnixTime, random } from '@/utils';

interface WatchVidePrams {
  id: number;
  md: number;
  aid: number;
  cid: number;
  season: number;
  time: number;
}

/**
 * 观看视频任务
 */
export async function watchVideo({ id, md, aid, cid, season, time }: WatchVidePrams) {
  // 播放西游记
  return await videoHeartbeat({
    start_ts: getUnixTime() - time,
    realtime: time,
    played_time: random(time, time + 1000),
    real_played_time: time,
    refer_url: `https://www.bilibili.com/bangumi/media/md${md}/`,
    epid: id,
    aid,
    cid,
    sid: season,
  });
}

/**
 * 获取随机视频
 */
export async function getRandomEp() {
  const { bangumiList } = await import('@/constant/bangumi');
  // 随机获取一个番剧
  const bangumi = getRandomItem(bangumiList);
  return {
    name: bangumi.name,
    md: bangumi.md,
    season: bangumi.season,
    ...getRandomItem(bangumi.section),
  };
}

export async function watchVideoOfRandom(lowerTime?: number, upperTime?: number) {
  return await watchVideo({
    ...(await getRandomEp()),
    time: random(lowerTime ?? 0, upperTime || 60000),
  });
}
