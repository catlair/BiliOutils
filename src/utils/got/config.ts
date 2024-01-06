import type { VGotOptions, NormalizedOptions } from '@catlair/node-got';
import { defaultHeaders } from '@/constant/biliUri';

type HooksOptions = NormalizedOptions & VGotOptions;

const wbiArrays = ['/x/click-interface/web/heartbeat'];

export function getOptions(): VGotOptions {
  return {
    timeout: 10000,
    headers: {
      'content-type': defaultHeaders['content-type'],
      'user-agent': defaultHeaders['user-agent'],
      'accept-language': defaultHeaders['accept-language'],
      'accept-encoding': defaultHeaders['accept-encoding'],
    },
    // 配置项，下面的选项都可以在独立的接口请求中覆盖
    requestOptions: {
      // 需要对返回数据进行处理
      isTransformResponse: true,
      // 忽略重复请求
      ignoreCancelToken: true,
      // 是否携带 bili cookie
      withBiliCookie: true,
      withAppSign: false,
      withBiliCsrf: false,
    },
    throwHttpErrors: false,
    hooks: {
      beforeRequest: [
        async (options: HooksOptions) => {
          // const { TaskConfig } = await import('@/config');
          const { getWbiQuery } = await import('@/service/sgin.service');
          const searchParams = new URLSearchParams(options.url.search);
          // if (options.requestOptions?.withBiliCsrf) {
          //   searchParams.set('csrf', TaskConfig.BILIJCT);
          // }
          // if (options.requestOptions?.withAppSign) {
          //   appSign(searchParams);
          // }
          if (['x/space/wbi/arc/search'].includes(options.url.pathname)) {
            searchParams.set('dm_img_list', '[]');
            searchParams.set('dm_img_str', 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ');
            searchParams.set(
              'dm_cover_img_str',
              'QU5HTEUgKEludGVsLCBJbnRlbChSKSBVSEQgR3JhcGhpY3MgNjMwICgweDAwMDAzRTkyKSBEaXJlY3QzRDExIHZzXzVfMCBwc181XzAsIEQzRDExKUdvb2dsZSBJbmMuIChJbnRlbC',
            );
          }
          if (
            options.url.pathname.includes('/wbi') ||
            wbiArrays.some(url => options.url.pathname === url)
          ) {
            await getWbiQuery(searchParams);
          }
          options.url.search = searchParams.toString();
        },
      ],
    },
  };
}
