import type { ReceiveVipMyDto, ReceiveVipPrivilegeDto } from './vip-privilege.dto';
import { TaskConfig } from '@/config';
import { biliApi } from '@/net/api';
import { OriginURLs, RefererURLs } from '@/constant/biliUri';

/**
 * 领取年度大会员权益
 * @param type 1.大会员B币券；2.大会员福利
 */
export function receiveVipPrivilege(type = 1): Promise<ReceiveVipPrivilegeDto> {
  return biliApi.post(
    '/x/vip/privilege/receive',
    {
      csrf: TaskConfig.BILIJCT,
      type,
    },
    {
      headers: {
        origin: OriginURLs.www,
        referer: RefererURLs.www,
      },
    },
  );
}

/**
 * 查看大会员权益领取状态
 */
export function receiveVipMy() {
  return biliApi.get<ReceiveVipMyDto>('/x/vip/privilege/my', {
    headers: {
      origin: OriginURLs.account,
      referer: RefererURLs.www,
    },
  });
}
