import giveGiftService from './live-gift.service';
import { logger } from '@/utils';

export default async function giveGift() {
  logger.info('----【投喂过期食物】----');
  try {
    await giveGiftService();
  } catch (error) {
    logger.error(`投喂过期食物异常：`, error);
  }
}
