import type { ApiBaseProp } from '@/dto/bili-base-prop';

export type AddDto = ApiBaseProp<{
  type: number;
  is_grant: boolean;
}>;
