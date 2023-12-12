import type { RedPacketController } from './red-packet.dto';
import { TaskConfig } from '@/config';
import { logger } from '@/utils/log';
import { biliHttp } from '@/net/api';
import { isArray } from '@/utils';

export async function getRedPacketController() {
  if (TaskConfig.redPack.uri === '') {
    return;
  }
  try {
    const resp = await biliHttp.get<{ _ts_rpc_return_: RedPacketController }>(
      TaskConfig.redPack.uri,
    );
    const resp2 = await biliHttp
      .get<RedPacketController['data']['list']>('https://bo.js.cool/api/redpacket/controller')
      .then(resp => (isArray(resp) ? resp : []))
      .catch(() => []);
    const { code, message, data } = getRedPacket(resp) || {};
    if (code !== 0) {
      logger.debug(`${code} ${message}`);
      return;
    }
    return [...(data?.list || []), ...resp2];
  } catch (error) {
    logger.error(`获取红包列表异常: ${error.message}`);
  }
}

function getRedPacket(resp: {
  _ts_rpc_return_: RedPacketController;
}): RedPacketController | undefined {
  if (Reflect.has(resp, '_ts_rpc_return_')) {
    return resp._ts_rpc_return_;
  }
  if (Reflect.has(resp, 'data') && Reflect.has(resp, 'code')) {
    return resp as unknown as RedPacketController;
  }
  return;
}
