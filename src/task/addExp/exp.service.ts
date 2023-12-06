import { logger, sleep } from '@/utils';
import { add } from './exp.request';
import { TaskConfig } from '@/config';
import { receiveVipMy } from '../getVipPrivilege/vip.request';
import { watchVideoOfRandom } from '@/service/video.service';

export async function addExpService() {
  return await execute({ value: 0 });
}

enum AddExpError {
  成功 = 0,
  请求频繁 = 6034007,
  前置任务未完成 = 6034005,
  已领取 = 69198,
  未知 = -1,
}

async function execute(counter: Ref<number>) {
  if (counter.value++ > 3) return false;
  const expStatus = await getExpStatus();
  if (!expStatus) return true;
  if (!expStatus.isVip) {
    if (TaskConfig.addExp.needVip) {
      logger.debug(`无大会员，但尝试领取！`);
      await noVipRun();
      return true;
    }
    logger.info('大会员不存在或已过期');
    return true;
  }
  return match(expStatus.state, counter);
}

async function match(state: number, counter: Ref<number>) {
  switch (state) {
    case 0: {
      const code = await addExp();
      if (code === AddExpError.请求频繁) sleep(5000);
      return code === 0;
    }
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
    if (code === AddExpError.已领取) {
      // 已经完成
      logger.info(message);
      return 0;
    }
    if (code === AddExpError.成功) {
      logger.info(`获取经验成功`);
      return 0;
    }
    logger.fatal('大会员领取经验', code, message);
    return code;
  } catch (error) {
    logger.exception('大会员领取经验', error);
  }
  return -1;
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
    return {
      ...expStatus,
      isVip: data.is_vip,
    };
  } catch (error) {
    logger.error(`获取领取状态出现异常：${error.message}`);
  }
}

async function watchTask(counter: Ref<number>): Promise<boolean> {
  await watchVideoOfRandom();
  await sleep(1000);
  return await execute(counter);
}

async function noVipRun() {
  const { watchVideo } = TaskConfig.addExp;
  if (watchVideo) {
    logger.debug(`播放随机视频`);
    await watchVideoOfRandom();
    await sleep(1000);
  }
  await addExp();
}
