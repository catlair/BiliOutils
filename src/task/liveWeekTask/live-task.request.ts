import { liveApi } from '@/net/api';
import { appSignString } from '@/utils/bili';
import { AnchorTaskCenter, ReceiveReward, ReceiveRewardRecord } from './live-task.dto';

/**
 * 领取奖励记录
 * @param dateType 1: 7天内 2: 15天内
 */
export function getReceiveRewardRecord(dateType: 1 | 2 = 1) {
  return liveApi.get<ReceiveRewardRecord>(
    `xlive/anchor-task-interface/api/v1/GetAnchorTaskCenterReceiveRewardRecord?${appSignString({
      dateType,
      page: 1,
      pageSize: 20,
    })}`,
  );
}

/**
 * 领取奖励
 */
export function getReceiveReward() {
  return liveApi.get<ReceiveReward>(
    `xlive/anchor-task-interface/api/v1/GetAnchorTaskCenterReceiveReward?${appSignString()}`,
  );
}

/**
 * 任务中心
 */
export function getAnchorTaskCenter() {
  return liveApi.get<AnchorTaskCenter>(
    `xlive/anchor-task-interface/api/v1/GetAnchorTaskCenterInfo?${appSignString()}`,
  );
}
