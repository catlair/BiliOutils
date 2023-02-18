import { logger } from '@/utils';
import { liveRedPackService } from './red-pack.service';
import { getLastFollow } from '@/service/tags.service';

export default async function liveRedPack() {
  logger.info('----【天选红包】----');
  try {
    // 获取最后一个关注的UP
    const lastFollow = await getLastFollow();
    lastFollow && logger.verbose(`最后一个关注的UP: ${lastFollow.uname}`);
    await liveRedPackService(lastFollow);
  } catch (error) {
    logger.warn(`天选时刻异常: ${error.message}`);
    logger.debug(error);
  }
  logger.info('结束天选红包');
}

export { liveRedPack };
