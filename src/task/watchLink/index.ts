import { logger } from '@/utils/log';
import { watchLinkService } from './watch-link.service';

export default async function watchLink() {
  logger.info('----【直播挂机】----');
  try {
    await watchLinkService();
  } catch (error) {
    logger.exception(`直播挂机`, error);
  }
}
