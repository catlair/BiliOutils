import { TaskModule } from '@/config';
import { logger, stringify } from '@/utils';
import { Params, encWbi, getImgKeyAndSubKey } from '@/utils/bili';

async function getWbiUrl() {
  try {
    const { getNav } = await import('@/net/user-info.request');
    const { data, code } = await getNav();
    if (code === 0) {
      return data.wbi_img;
    }
  } catch (error) {
    logger.error(error);
  }
}

/**
 * 如果传入 URLSearchParams 则直接在 URLSearchParams 上修改
 */
export async function getWbiQuery<T extends Params | URLSearchParams>(
  params: T,
): Promise<T extends URLSearchParams ? URLSearchParams : string> {
  const { sub, img } = TaskModule.wbiKeys;
  if (sub && img) {
    return encWbi(params, img, sub);
  }
  const wbiUrl = await getWbiUrl();
  if (!wbiUrl) {
    logger.warn('获取 wbi url 失败');
    return params instanceof URLSearchParams ? params : (stringify(params) as any);
  }
  const { imgKey, subKey } = getImgKeyAndSubKey(wbiUrl);
  TaskModule.wbiKeys.img = imgKey;
  TaskModule.wbiKeys.sub = subKey;
  return encWbi(params, imgKey, subKey);
}
