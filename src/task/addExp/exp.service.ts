import { logger, sleep } from '@/utils';
import { add } from './exp.request';
import { TaskConfig } from '@/config';
import { receiveVipMy } from '../getVipPrivilege/vip.request';
import { watchVideoOfRandom } from '@/service/video.service';

export async function addExpService() {
  return await execute({ value: 0 });
}

async function execute(counter: Ref<number>) {
  if (counter.value++ > 3) return false;
  const expStatus = await getExpStatus();
  if (!expStatus) return true;
  // 无权限 next_receive_days 为 1
  if (expStatus.next_receive_days < 10000) {
    logger.info('大会员不存在或已过期');
    return true;
  }
  return match(expStatus.state, counter);
}

async function match(state: number, counter: Ref<number>) {
  switch (state) {
    case 0:
      return await addExp();
    case 1:
      logger.info(`今日已经领取过经验了哦`);
      return true;
    case 2: {
      return await watchTask(counter);
    }
    default:
      logger.warn(`未知状态${state}`);
      return false;
  }
}

async function addExp() {
  try {
    const { code, message } = await add(TaskConfig.BILIJCT);
    if (code === 69198) {
      // 已经完成
      logger.info(message);
      return true;
    }
    if (code === 0) {
      logger.info(`执行成功`);
      return true;
    }
    logger.fatal('大会员领取经验', code, message);
  } catch (error) {
    logger.exception('大会员领取经验', error);
  }
}

async function getExpStatus() {
  try {
    const { data, code, message } = await receiveVipMy();
    if (code !== 0) {
      logger.fatal(`获取领取状态`, code, message);
      return;
    }
    const { list } = data;
    const expStatus = list.find(item => item.type === 9);
    if (!expStatus) {
      logger.warn(`没有获取经验的任务？`);
      return;
    }
    return expStatus;
  } catch (error) {
    logger.error(`获取领取状态出现异常：${error.message}`);
  }
}

async function watchTask(counter: Ref<number>) {
  await watchVideoOfRandom();
  await sleep(1000);
  return await execute(counter);
}
