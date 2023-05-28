import { getNav } from '@/net/user-info.request';
import { logger, stringify } from '@/utils';
import { Params, encWbi, getImgKeyAndSubKey } from '@/utils/bili';

async function getWbiUrl() {
  try {
    const { data, code } = await getNav();
    if (code === 0) {
      return data.wbi_img;
    }
  } catch {}
}

export async function getWbiQuery(params: Params) {
  const wbiUrl = await getWbiUrl();
  if (!wbiUrl) {
    logger.warn('获取 wbi url 失败');
    return stringify(params);
  }
  const { imgKey, subKey } = getImgKeyAndSubKey(wbiUrl);
  return encWbi(params, imgKey, subKey);
}
