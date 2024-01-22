import { logger } from '@/utils';
import { removeBlacksService } from './removeBlacks.service';

export default async function removeBlacks() {
  logger.info('----【清理黑名单】----');
  try {
    await removeBlacksService();
    logger.info(`清理黑名单结束`);
  } catch (error) {
    logger.exception('removeBlacks', error);
  }
}
