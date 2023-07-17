import type { ApiBaseProp } from '@/dto/bili-base-prop';
import type { LotteryResult } from './activity-lottery.dto';
import { TaskConfig } from '@/config';
import { OriginURLs, RefererURLs } from '@/constant/biliUri';
import { biliApi } from '@/net/api';

const wwwHeader = {
  origin: OriginURLs.www,
  Referer: RefererURLs.www,
};
/**
 * 检测抽奖次数
 */
export function getLotteryMyTimes(sid: string) {
  return biliApi.get<ApiBaseProp<{ times: number }>>(`x/lottery/mytimes?sid=${sid}`, {
    headers: wwwHeader,
  });
}

/**
 * 完成
 */
export function doLottery(sid: string, num = 1) {
  return biliApi.post<LotteryResult>(
    'x/lottery/do',
    {
      sid,
      num,
      csrf: TaskConfig.BILIJCT,
    },
    {
      headers: wwwHeader,
    },
  );
}

/**
 * 增加次数
 */
export function addLotteryTimes(sid: string, action_type = 3) {
  return biliApi.post<ApiBaseProp<{ add_num: number }>>(
    'x/lottery/addtimes',
    {
      sid,
      action_type,
      csrf: TaskConfig.BILIJCT,
    },
    {
      headers: wwwHeader,
    },
  );
}

/**
 * 未知
 */
export function awardConf(sid: string) {
  return biliApi.get<ApiBaseProp<{ award_act_id: number }>>(`x/lottery/award/conf?sid=${sid}`, {
    headers: wwwHeader,
  });
}
