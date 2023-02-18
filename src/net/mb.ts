import type { VGotOptions } from '@catlair/node-got';
import { deepMergeObject } from '@/utils';
import { BiliGot } from '@/utils/got/BiliGot';
import { getOptions } from '@/utils/got/config';
import { TaskConfig } from '@/config';

function createRequest(opt: Partial<VGotOptions> = {}) {
  return new BiliGot(deepMergeObject(getOptions(), opt));
}

export const mbBiliHttp = createRequest({
  headers: {
    'user-agent': TaskConfig.mobileUA,
    Buivd: TaskConfig.buvid,
  },
  http2: true,
});
