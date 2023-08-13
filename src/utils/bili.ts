import { TaskConfig } from '@/config';
import { isArray, isNumber, isObject } from './is';
import { getUnixTime, md5, stringify } from './pure';
import * as crypto from 'crypto';

export type Params = Record<string, string | boolean | number | Array<any>>;

/**
 * API 接口签名
 * @param params
 * @param appkey
 * @param appsec
 */
export function appSignString(params: Params = {}, appkey?: string, appsec?: string) {
  return getAppSign(params, appkey, appsec).query;
}

export function appSign(params: Params, appkey?: string, appsec?: string) {
  return getAppSign(params, appkey, appsec).sign;
}

function sortParams(params: Params) {
  return Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]));
}

function getSortQuery(params: Params) {
  return stringify(sortParams(params));
}

export function getSign(params: Params, appsec: string, noSign = false) {
  const query = getSortQuery(params);
  if (noSign) {
    return { query, sign: '' };
  }
  const sign = md5(query + appsec);
  return {
    query: query + '&sign=' + sign,
    sign,
  };
}

function getAppSign(
  params: Params,
  appkey = '1d8b6e7d45233436',
  appsec = '560c52ccd288fed045859ed18bffd973',
) {
  params = {
    platform: 'android',
    mobi_app: 'android',
    device: 'android',
    disable_rcmd: 0,
    channel: 'xiaomi',
    c_locale: 'zh_CN',
    s_locale: 'zh_CN',
    ts: getUnixTime(),
    ...TaskConfig.app.http,
    ...params,
  };
  // 某些情况下不需要也不能从配置文件中读取
  params.access_key = params.access_key || require('../config')?.TaskConfig.access_key;
  if (!params.access_key) {
    delete params.access_key;
    return getSign(params, appsec, true);
  }
  delete params.csrf;
  delete params.csrf_token;
  params = {
    ...params,
    actionKey: 'appkey',
    appkey,
  };
  return getSign(params, appsec);
}

/**
 * 对象值转换为字符串
 */
function objectValueToString(params: Record<string, any>) {
  Object.keys(params).forEach(key => {
    if (isNumber(params[key])) {
      params[key] = params[key].toString();
      return;
    }
    if (isObject(params[key])) {
      objectValueToString(params[key]);
      return;
    }
    if (isArray(params[key])) {
      params[key] = params[key].map(item =>
        isObject(item) ? objectValueToString(item) : item.toString(),
      );
    }
  });
  return params;
}

export function clientSign(params: Params) {
  let data = JSON.stringify(objectValueToString(params));
  for (const a of ['SHA512', 'SHA3-512', 'SHA384', 'SHA3-384', 'BLAKE2b512']) {
    data = crypto.createHash(a).update(data).digest('hex');
  }
  return data;
}

/**
 * 给昵称添加 ** （目的是变简短）
 */
export function conciseNickname(nickname = '') {
  const length = nickname.length;
  if (length <= 3) {
    return nickname;
  }
  const firstWord = nickname[0];
  const lastWord = nickname[length - 1];
  return `${firstWord}**${lastWord}`;
}

/**
 * wbi 签名
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md#JavaScript
 */

// 对 imgKey 和 subKey 进行字符顺序打乱编码
function getMixinKey(orig: string) {
  return [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29,
    28, 14, 39, 12, 38, 41, 13,
  ].reduce((acc, cur) => acc + orig[cur], '');
}

// 从 url 中获取 imgKey 和 subKey
export function getImgKeyAndSubKey({ img_url, sub_url }: { img_url: string; sub_url: string }) {
  function getKey(url: string) {
    return url.split('/').pop()?.split('.')[0] || '';
  }
  return { imgKey: getKey(img_url), subKey: getKey(sub_url) };
}

// 为请求参数进行 wbi 签名
export function encWbi(params: Params, imgKey: string, subKey: string) {
  const queryString = getSortQuery({ ...params, wts: getUnixTime() });
  return `${queryString}&w_rid=${md5(queryString + getMixinKey(imgKey + subKey))}`;
}
