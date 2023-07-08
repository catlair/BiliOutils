import { logger } from '@/utils/log';
import * as liveSignRequest from './live-sign.request';

export async function liveSignService() {
  if (await getSignInfo()) return;
  await sign();
}

async function getSignInfo() {
  try {
    const { data } = await liveSignRequest.getSignInfo();
    if (data.status === 1) {
      logger.debug('已签到，跳过签到');
      logger.info(`已经签到${data.hadSignDays}天，${data.specialText}`);
      return true;
    }
  } catch (error) {
    logger.debug(`直播签到，${error.message}`);
  }
}

async function sign() {
  try {
    const { code, data, message } = await liveSignRequest.liveSign();
    if (code === 0) {
      logger.info(
        `直播签到成功: ${data.text}，特别信息: ${data.specialText}，本月签到天数: ${data.hadSignDays}天;`,
      );
      return;
    }
    logger.warn(`直播签到失败: ${code} ${message}`);
  } catch (error) {
    logger.error(`直播签到异常：`, error);
  }
}
