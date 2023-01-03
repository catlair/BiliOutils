import type { RedPacketController } from '@/dto/red-packet.dto';
import { TaskConfig } from '@/config/globalVar';
import { logger } from '@/utils/log';
import { biliHttp } from './api';

export async function getRedPacketController() {
  if (TaskConfig.redPack.uri === '') {
    return;
  }
  try {
    const resp = await biliHttp.get<{ _ts_rpc_return_: RedPacketController }>(
      TaskConfig.redPack.uri,
    );
    const { code, message, data } = getRedPacket(resp) || {};
    if (code !== 0) {
      logger.debug(`${code} ${message}`);
      return;
    }
    return data?.list;
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
