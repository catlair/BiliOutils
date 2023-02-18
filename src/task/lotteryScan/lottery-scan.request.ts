import type { LotteryDetail } from './lottery-scan.dto';
import { defHttp } from '@/utils/http';
import { parseJson } from './utils';

export async function getDetailByLid(lottery_id: number) {
  return await defHttp.get<LotteryDetail>(
    `https://api.vc.bilibili.com/lottery_svr/v1/lottery_svr/detail_by_lid?lottery_id=${lottery_id}`,
    {
      parseJson,
      responseType: 'json',
    },
  );
}
