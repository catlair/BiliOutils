import type { ApiBaseProp } from '@/dto/bili-base-prop';
import type {
  ShareAddDto,
  RegionRankingVideosDto,
  DonatedCoinsForVideoDto,
  RecommendVideoDto,
  BangumiFollowDto,
} from '../dto/video.dto';
import { biliApi } from './api';
import { TaskConfig } from '../config';
import { isString } from '@/utils/is';
import { appSignString } from '@/utils/bili';

/**
 * 分享视频
 * @param oid 分享的视频av号
 */
export function addShare(oid: number | string): Promise<ShareAddDto> {
  const reqData = {
    csrf: TaskConfig.BILIJCT,
    oid,
    platform: 'android',
    share_channel: 'QQ',
    share_id: 'main.ugc-video-detail.0.0.pv',
    share_origin: 'vinfo_share',
  };
  return biliApi.post('x/share/finish', appSignString(reqData));
}

/**
 * 获取视频分区列表
 * @param rid 分区编号
 * @param day 排行方式
 */
export function getRegionRankingVideos(rid = 1, day = 3): Promise<RegionRankingVideosDto> {
  return biliApi.get('x/web-interface/ranking/region', {
    params: {
      rid,
      day,
    },
  });
}

/**
 * 获取推荐视频列表
 */
export function getRecommendVideos(ps = 2) {
  return biliApi.get<RecommendVideoDto>(
    `x/web-interface/index/top/rcmd?fresh_type=12&version=1&ps=${ps}`,
  );
}

/**
 * 给该视频投币数量
 * @param aid 视频av号
 */
export function donatedCoinsForVideo(aid: number): Promise<DonatedCoinsForVideoDto> {
  return biliApi.get('x/web-interface/archive/coins', {
    params: { aid },
  });
}

/**
 * 上传视频已经观看时间
 * @param id av号/bv号
 * @param playedTime 观看时间
 */
export function uploadVideoHeartbeat(id: number | string, playedTime: number) {
  const options: HeartbeatParams = {
    start_ts: Math.floor(Date.now() / 1000) - playedTime,
    played_time: playedTime,
    type: 3,
    sub_type: 0,
  };
  if (isString(id) && id.toLowerCase().startsWith('bv')) {
    options.bvid = id;
  } else {
    options.aid = Number(id);
  }
  return webHeartbeat(options);
}

/**
 * 视频观看心跳
 */
export function videoHeartbeat(params: HeartbeatParams) {
  return webHeartbeat({
    aid: 243332804,
    cid: 209599683,
    type: 4,
    sub_type: 5,
    dt: 2,
    play_type: 0,
    realtime: 0,
    played_time: 10,
    real_played_time: 0,
    sid: 33622,
    epid: 327107,
    ...params,
  });
}

interface HeartbeatParams {
  mid?: number;
  /**开始播放时刻  */
  start_ts: number;
  /** 稿件aid 与 bvid 二选一 */
  aid?: number;
  /** 稿件bvid 与 aid 二选一 */
  bvid?: string;
  /** 稿件cid 识别分P */
  cid?: number;
  /** 视频类型  3：投稿视频 4：剧集 10：课程 */
  type?: number;
  /** 0：无 1：番剧 2：电影 3：纪录片 4：国创 5：电视剧 7：综艺 */
  sub_type?: number;
  /** ？ 2 */
  dt?: number;
  /** 0：播放中 1：开始播放 2：暂停 3：继续播放 4：播放结束  */
  play_type?: number;
  /** 总计播放时间 单位 s */
  realtime?: number;
  /** 播放进度 单位 s，-1 为播放结束 */
  played_time?: number;
  /** 实际总播放时间（非单次）??? */
  real_played_time?: number;
  refer_url?: string;
  /** 番剧sid */
  sid?: number;
  /** 番剧epid */
  epid?: number;
  session?: string;
  /** {"player_version":"4.7.12"} */
  extra?: string;
  csrf?: string;
  /** 333.788.0.0 */
  spmid?: string;
  /** 333.1007.tianma.1-2-2.click 333.788.recommend_more_video.0 */
  from_spmid?: string;
  /** 0 */
  outer?: number;
  /** 进度条时间，这不和 played_time 一样吗 */
  last_play_progress_time?: number;
  /** 视频长度（视频播放结束后是 长度 - 1，怪） */
  video_duration?: number;
  /** 最大已播放进度（该值最大值会随 video_duration 变化，video_duration - 1 时它也会）  ？ */
  max_play_progress_time?: number;
  quality?: number;
  bsource?: string;
}

/**
 * 视频观看心跳
 */
export function webHeartbeat(params: HeartbeatParams) {
  const options: HeartbeatParams = {
    dt: 2,
    play_type: 0,
    realtime: 0,
    played_time: 10,
    real_played_time: 0,
    refer_url: '',
    bsource: '',
    spmid: '666.25',
    from_spmid: '..0.0',
    mid: TaskConfig.USERID,
    csrf: TaskConfig.BILIJCT,
    ...params,
  };
  if (options.aid && options.bvid) {
    Reflect.deleteProperty(options, 'bvid');
  }
  return biliApi.post<Omit<ApiBaseProp, 'data'>>(
    `x/click-interface/web/heartbeat?w_start_ts=${options.start_ts}&w_mid=${options.mid}&w_${
      options.aid ? `aid=${options.aid}` : `bvid=${options.bvid}`
    }&w_dt=${options.dt}&w_realtime=${options.realtime}&w_played_time=${
      options.played_time
    }&w_real_played_time=${options.real_played_time}&w_video_duration=${
      options.video_duration
    }&w_last_play_progress_time=${
      options.last_play_progress_time || options.played_time
    }&web_location=1315873`,
    options,
  );
}

/**
 * 追剧
 */
export function addBangumi(season_id: number | string) {
  return biliApi.post<BangumiFollowDto>('pgc/web/follow/add', {
    season_id,
    csrf: TaskConfig.BILIJCT,
  });
}

/**Promise<BangumiFollowD
 * 取消追剧
 */
export function cancelBangumi(season_id: number | string) {
  return biliApi.post<BangumiFollowDto>('pgc/web/follow/del', {
    season_id,
    csrf: TaskConfig.BILIJCT,
  });
}
