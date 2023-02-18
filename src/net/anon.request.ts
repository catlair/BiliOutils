import type { ApiBaseProp } from '@/dto/bili-base-prop';
import { defHttp } from '@/utils/got';

/**
 * 获取 ip 地址
 */
export async function getIp(): Promise<
  ApiBaseProp<{
    addr: string;
    country: string;
    province: string;
    isp: string;
    latitude: number;
    longitude: number;
    zone_id: number;
    country_code: number;
  }>
> {
  try {
    return await defHttp.get('https://api.bilibili.com/x/web-interface/zone', {
      dnsLookupIpVersion: 'ipv6',
    });
  } catch {
    return await defHttp.get('https://api.bilibili.com/x/web-interface/zone');
  }
}
