import { ContentTypeEnum } from '../enums/http.enum';

export const OriginURLs = {
  account: 'https://account.bilibili.com',
  live: 'https://live.bilibili.com',
  space: 'https://space.bilibili.com',
  message: 'https://message.bilibili.com',
  www: 'https://www.bilibili.com',
  manga: 'https://manga.bilibili.com',
};

export const RefererURLs = {
  www: 'https://www.bilibili.com/',
  bigPoint: 'https://big.bilibili.com/mobile/bigPoint',
  bigPointTask: 'https://big.bilibili.com/mobile/bigPoint/task',
  judge: 'https://www.bilibili.com/judgement/',
};

export const baseURLs = {
  account: 'https://account.bilibili.com',
  live: 'https://api.live.bilibili.com',
  api: 'https://api.bilibili.com',
  manga: 'https://manga.bilibili.com',
  vc: 'https://api.vc.bilibili.com',
  liveTrace: 'https://live-trace.bilibili.com',
};

export const defaultHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'content-type': ContentTypeEnum.FORM_URLENCODED,
  'accept-language': 'zh-CN,zh;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  accept: '*/*',
};

interface UAOption {
  version?: string;
  phone?: string;
  build?: string | number;
  channel?: string;
  osVer?: string;
  os?: string;
}

export function getAndroidUA({
  version = '7.72.0',
  phone = 'MI 10 Pro',
  build = '7720210',
  channel = 'xiaomi',
  osVer = '10',
  os = 'android',
}: UAOption = {}) {
  return `Mozilla/5.0 BiliDroid/${version} (bbcallen@gmail.com) os/${os} model/${phone} mobi_app/${os} build/${build} channel/${channel} innerVer/${channel} osVer/${osVer} network/2`;
}
