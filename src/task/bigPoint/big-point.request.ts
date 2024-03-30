import type { PointListDto, TaskCombineDto } from './big-point.dto';
import type { PureDataProp } from '@/dto/bili-base-prop';
import { biliApi, biliHttp } from '@/net/api';
import { TaskConfig } from '@/config';
import type { TaskCodeType } from './big-point.emum';
import { appSignString } from '@/utils/bili';
import { RefererURLs } from '@/constant/biliUri';
import { getUnixTime } from '@/utils/pure';
import type { IdType } from '@/types';

const baseHeader = {
  'app-key': 'android64',
  env: 'prod',
  'user-agent': TaskConfig.mobileUA,
};

/**
 * 大积分签到
 */
export function signIn() {
  return biliApi.post<Omit<PureDataProp, 'data'>>(
    'pgc/activity/score/task/sign',
    appSignString({
      csrf: TaskConfig.BILIJCT,
    }),
    {
      headers: baseHeader,
    },
  );
}

/**
 * 大积分领取任务
 */
export function receiveTask(taskCode: TaskCodeType = 'ogvwatchnew') {
  return biliApi.post<PureDataProp>(
    'pgc/activity/score/task/receive/v2',
    appSignString({
      csrf: TaskConfig.BILIJCT,
      ts: getUnixTime(),
      taskCode,
    }),
    {
      http2: true,
      headers: {
        Referer: RefererURLs.bigPointTask,
        ...baseHeader,
        navtive_api_from: 'h5',
      },
    },
  );
}

export function susWin() {
  return biliApi.post<PureDataProp<Record<string, never>>>(
    'pgc/activity/deliver/susWin/receive',
    appSignString({
      csrf: TaskConfig.BILIJCT,
    }),
    {
      headers: baseHeader,
    },
  );
}

/**
 * 完成大积分每日任务
 */
export function complete(options: Record<string, string>) {
  return biliApi.post<PureDataProp>(
    'pgc/activity/deliver/task/complete',
    appSignString({
      csrf: TaskConfig.BILIJCT,
      ...options,
    }),
    {
      headers: {
        ...baseHeader,
        referer: RefererURLs.bigPoint,
      },
    },
  );
}

export function materialReceive({ season_id, ep_id }: { season_id: IdType; ep_id: IdType }) {
  return biliApi.post<
    PureDataProp<{
      container: any[];
      watch_count_down_cfg: {
        milliseconds: number;
        task_id: string;
        token: string;
      };
    }>
  >(
    'pgc/activity/deliver/material/receive',
    appSignString({
      csrf: TaskConfig.BILIJCT,
      spmid: 'united.player-video-detail.0.0',
      season_id,
      activity_code: '',
      ep_id,
      from_spmid: 'search.search-result.0.0',
    }),
    {
      headers: {
        ...baseHeader,
        referer: RefererURLs.bigPoint,
      },
    },
  );
}

/**
 * 完成大积分每日任务 v2
 */
export function completeV2(taskCode: TaskCodeType) {
  return biliApi.post<PureDataProp>(
    'pgc/activity/score/task/complete/v2',
    appSignString({
      csrf: TaskConfig.BILIJCT,
      taskCode,
    }),
    {
      headers: {
        ...baseHeader,
        referer: RefererURLs.bigPointTask,
      },
    },
  );
}

/**
 * 提交事件
 */
export function showDispatch(eventId: string) {
  return biliHttp.post<{
    code: number;
    message: string;
    data: never;
    errtag: number;
    ttl: number;
  }>(
    `https://show.bilibili.com/api/activity/fire/common/event/dispatch?${appSignString({
      csrf: TaskConfig.BILIJCT,
    })}`,
    {
      eventId,
    },
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...baseHeader,
      },
    },
  );
}

/**
 * 获取大积分任务列表
 */
export function getTaskCombine() {
  return biliApi.get<TaskCombineDto>('x/vip_point/task/combine', {
    headers: baseHeader,
  });
}

/**
 * 积分记录
 */
export function getPointList() {
  return biliApi.get<PointListDto>(
    `x/vip_point/list?${appSignString({
      csrf: TaskConfig.BILIJCT,
      change_type: 1,
      pn: 1,
      ps: 10,
    })}`,
    {
      headers: baseHeader,
    },
  );
}
