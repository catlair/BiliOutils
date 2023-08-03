import {
  mangaSign,
  buyMangaService,
  shareComicService,
  readMangaService,
  mangaSummerActivity,
} from './manga.service';
import { logger } from '@/utils/log';

export default async function mangaTask() {
  logger.info('----【漫画任务】----');
  try {
    // 漫画签到
    await mangaSign();
    // 每日分享
    await shareComicService();
    // 每日阅读
    await readMangaService();
    // 购买漫画
    await buyMangaService();
    // 漫画夏季活动
    await mangaSummerActivity();
  } catch (error) {
    logger.error(`漫画任务异常：`, error);
  }
}
