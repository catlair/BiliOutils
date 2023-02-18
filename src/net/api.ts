import { TaskConfig } from '@/config';
import { baseURLs, RefererURLs } from '../constant/biliUri';
import { biliHttp, createRequest, defHttp } from '../utils/http';

const accountApi = createRequest({
  baseURL: baseURLs.account,
  headers: {
    'user-agent': TaskConfig.userAgent,
  },
});

const liveApi = createRequest({
  baseURL: baseURLs.live,
  headers: {
    Referer: RefererURLs.www,
    'user-agent': TaskConfig.userAgent,
  },
});

const biliApi = createRequest({
  baseURL: baseURLs.api,
  headers: {
    Referer: RefererURLs.www,
    'user-agent': TaskConfig.userAgent,
  },
});

const mangaApi = createRequest({
  baseURL: baseURLs.manga,
  headers: {
    'user-agent': TaskConfig.userAgent,
  },
});

const vcApi = createRequest({
  baseURL: baseURLs.vc,
  headers: {
    'user-agent': TaskConfig.userAgent,
    Referer: RefererURLs.www,
  },
});

const liveTraceApi = createRequest({
  baseURL: baseURLs.liveTrace,
  headers: {
    'user-agent': TaskConfig.userAgent,
  },
});

export { biliApi, vcApi, accountApi, mangaApi, liveApi, biliHttp, defHttp, liveTraceApi };
