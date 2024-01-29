import { defHttp } from '@/utils/http/def';
import { defLogger } from '@/utils/log/def';
import { appSignString } from '@/utils/bili';
import { CookieJar } from '@/utils/cookie';
import { cookieToToken } from '@catlair/blogin';

export async function accessKey2Cookie(access_key: string) {
  const cookieJar = new CookieJar();
  await defHttp.get(
    `https://passport.bilibili.com/api/login/sso?${appSignString({
      access_key,
      gourl: 'https://account.bilibili.com/account/home',
    })}`,
    {
      cookieJar,
      requestOptions: { withCredentials: true },
    },
  );
  return cookieJar.getCookieString();
}

export async function cookie2AccessKey(cookie: string) {
  try {
    const { code, data, message } = await cookieToToken(cookie);
    if (code !== 0) {
      defLogger.error(`[${code}]${message}`);
      return '';
    }
    return data.access_token;
  } catch (error) {
    defLogger.error(error);
  }
  return '';
}

export async function getNewCookie(cookie: string) {
  try {
    const { code, data, message } = await cookieToToken(cookie);
    if (code !== 0) {
      defLogger.error(`[${code}]${message}`);
      return '';
    }
    const cookies = data.cookie_info.cookies;
    const cookieJar = new CookieJar(cookie);
    cookieJar.setCookie(cookies.map(({ name, value }) => `${name}=${value}`));
    return cookieJar.getCookieString();
  } catch (error) {
    defLogger.error(error);
  }
  return '';
}
