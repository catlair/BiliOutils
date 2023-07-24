import { TaskConfig } from '@/config';
import type { RecList, TaskLandingRoom, UserTaskProgress } from './daily-battery.dto';
import { liveApi } from '@/net/api';
import { appSignString } from '@/utils/bili';

/**
 * 获取任务进度
 */
export function getUserTaskProgress(target_id: number) {
  return liveApi.get<UserTaskProgress>(
    `xlive/app-ucenter/v1/userTask/GetUserTaskProgress?${appSignString({
      target_id,
    })}`,
  );
}

/**
 * 领取任务奖励
 */
export function receiveTaskReward(target_id: number, task_id: number) {
  return liveApi.post(
    'xlive/app-ucenter/v1/userTask/UserTaskReceiveRewards',
    appSignString({
      target_id,
      task_id,
      csrf: TaskConfig.BILIJCT,
      reward_index: 1,
    }),
  );
}

/**
 * 获取活动房间
 */
export function getLandingRoom() {
  return liveApi.get<TaskLandingRoom>(
    `xlive/app-interface/v2/index/getUserTaskLandingRoom?${appSignString({
      scale: 'xxhdpi',
      network: 'wifi',
      page: 1,
    })}`,
  );
}

/**
 * 目标直播间列表
 * @param roomid 进入的直播间
 */
export function getRecList(roomid: number) {
  return liveApi.get<RecList>(
    `xlive/app-interface/v2/room/recList?${appSignString({
      exist_ids: roomid,
      landing_room_id: roomid,
      page: 1,
      network: 'wifi',
      scale: 'xxhdpi',
      qn: 0,
      access_key: '0',
    })}`,
  );
}
