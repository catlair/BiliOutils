import { biliApi } from '@/net/api';
import { appSignString } from '@/utils/bili';
import { AddDto } from './exp.dto';

export function add(csrf: string) {
  return biliApi.post<AddDto>(`x/vip/experience/add?${appSignString({ csrf })}`);
}
