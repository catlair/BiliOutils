import { apiDelay, logger } from '@/utils';
import { request } from '@/utils/request';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { getDetailByLid } from './lottery-scan.request';

export async function scan() {
  logger.debug('开始');
  let couter = +readFileSync(resolve(__dirname, 'counter.txt'), 'utf-8');
  let errorCount = 20;
  process.on('SIGINT', () => {
    writeFileSync(resolve(__dirname, 'counter.txt'), couter.toString());
    process.exit(0);
  });
  while (errorCount > 0) {
    logger.debug(`当前 ${couter}`);
    try {
      const data = await request(getDetailByLid, undefined, couter++);
      await apiDelay(200);
      if (data.business_id === undefined) {
        errorCount--;
        continue;
      }
      if (data.status === 1) {
        logger.debug(`这是什么啊 ${couter}`);
        continue;
      }
      if (data.status !== 0) {
        continue;
      }
      if (data.business_type === 0) {
        continue;
      }
      const line = `${data.lottery_id}-${data.business_type}-${data.business_id.toString()}-${
        data.first_prize_cmt
      }-${data.second_prize_cmt}-${data.third_prize_cmt}`;
      // 追加到文件
      appendFileSync(resolve(__dirname, 'data.txt'), `${line}\n`);
      logger.info(`加入 ${line}`);
    } catch (error) {
      logger.error(error);
    }

    // 将 coutner 写入到 counter.txt 文件
    writeFileSync(resolve(__dirname, 'counter.txt'), couter.toString());
  }

  logger.debug('结束');
}
