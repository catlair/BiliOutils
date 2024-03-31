import type { TaskCodeType } from './big-point.emum';
import type { CommonTaskItem, SingTaskHistory, Taskinfo } from './big-point.dto';
import {
  complete,
  completeV2,
  getPointList,
  getTaskCombine,
  materialReceive,
  receiveTask,
  showDispatch,
  signIn,
  susWin,
} from './big-point.request';
import { TaskCode } from './big-point.emum';
import { apiDelay, isBoolean, isDef, isToday, Logger, logger, md5, sleep } from '@/utils';
import { TaskConfig, TaskModule } from '@/config';
import { FREE_POINT, NO_NEED_TASK } from './constant';
import { getRandomEp } from '@/service/video.service';

const bigLogger = new Logger({ console: 'debug', file: 'debug', push: 'warn' }, 'big-point');

let isRetry = false;
let isError = false;

/**
 * 查看当前状态
 */
async function getTaskStatus() {
  const data = await getTaskStatusByWhile();

  if (data) return data;

  async function getTaskStatusByWhile(times = 5) {
    for (let count = 0; count < times; count++) {
      const data = await _getTaskStatus();
      if (!data) return;
      if (!data.task_info?.modules?.length) {
        logger.error('获取任务列表失败，列表为空');
        await sleep(1000);
        continue;
      }
      return data;
    }
  }

  async function _getTaskStatus() {
    try {
      const { code, data, message } = await getTaskCombine();
      if (code !== 0) {
        logger.fatal(`查看当前状态`, code, message);
        return;
      }
      return data;
    } catch (error) {
      logger.error(error);
    }
  }
}

export async function bigPointService() {
  isRetry = false;
  isError = false;
  const taskStatus = await getTaskStatus();
  if (!taskStatus) {
    return;
  }
  const {
    vip_info: { status, type },
    point_info: { point, expire_point, expire_days },
  } = taskStatus;
  if (expire_point > 0) {
    logger.warn(`${expire_point}积分即将过期，剩余${expire_days}天`);
  }
  if (!baseInfo(status, type, point)) return;
  // if (score_limit !== 0 && score_month >= score_limit) {
  //   logger.info('本月积分已领取完');
  //   return;
  // }
  const isEmpty = await bigPointTask(taskStatus);
  const todayPoint = await getTodayPonit();
  if (isEmpty || todayPoint) return;
  await retry(taskStatus);
  // 如果积分不足，那再重试一次
  return !(await getTodayPonit()) && (await retry(taskStatus));
}

async function retry(taskStatus: TaskStatus) {
  const cfgIsRetry = TaskConfig.bigPoint.isRetry;
  isRetry = true;
  if (cfgIsRetry) {
    logger.debug('开始尝试重试');
    await apiDelay(isBoolean(cfgIsRetry) ? 20000 : cfgIsRetry * 1000);
    await bigPointTask(taskStatus);
  }
}

type TaskStatus = Defined<UnPromisify<ReturnType<typeof getTaskStatus>>>;

async function bigPointTask(taskStatus: TaskStatus) {
  const { task_info } = taskStatus;
  const signCode = await bigPointSign(task_info.sing_task_item?.histories);
  if (signCode === -401) {
    logger.error('出现非法访问异常，可能账号存在异常，放弃大积分任务');
    isError = true;
    return true;
  }
  await apiDelay(100, 200);
  // 判断是否领取了任务
  if (await getTask(task_info)) {
    await apiDelay(100, 200);
    return await doDailyTask(await getTaskStatus());
  }
  return await doDailyTask(taskStatus);
}

function getTaskSign(timestamp: string, token: string) {
  return md5(`${timestamp}#df2a46fd53&${token}`);
}

/**
 * 完成每日任务
 */
async function doDailyTask(taskStatus: TaskStatus | undefined) {
  if (!taskStatus) {
    return false;
  }

  const waitTaskItems =
    taskStatus.task_info.modules?.at(-1)?.common_task_item?.filter(taskItem => {
      return (
        taskItem.vip_limit <= TaskModule.vipType &&
        taskItem.complete_times < taskItem.max_times &&
        taskItem.state === 1
      );
    }) || [];

  if (!waitTaskItems.some(taskItem => taskItem.state === 1)) {
    logger.info('没有需要完成的每日任务');
    return true;
  }

  const taskFunctions = {
    ogvwatchnew: () => {
      if (TaskConfig.bigPoint.isAsyncWatch) {
        watchTask()
          .then(() => {
            getTodayPonit();
          })
          .catch(logger.error);
        return Promise.resolve('等待 10 分钟');
      }
      return TaskConfig.bigPoint.isWatch && watchTask();
    },
    filmtab: () => completeTask('tv_channel', '浏览影视频道'),
    animatetab: () => completeTask('jp_channel', '浏览追番频道'),
    vipmallview: vipMallView,
    'dress-view': () => completeTask('dress-view', '浏览装扮中心', true),
  };

  await waitTaskItems.reduce(async (previousPromise, { task_code }) => {
    await previousPromise;
    return taskFunctions[task_code]?.();
  }, Promise.resolve());

  await apiDelay(1000, 3000);
}

/**
 * 观看视频任务
 */
async function watchTask() {
  try {
    const { task_id, token } = (await watchRandomEp()) || {};
    if (!task_id || !token) {
      logger.warn('没有获取到观看视频任务');
      return;
    }
    logger.debug('等待十分钟');
    await sleep(10 * 60 * 1000);
    const timestamp = new Date().getTime().toString();
    const task_sign = getTaskSign(timestamp, token);
    const { code, message } = await complete({ task_id, token, task_sign, timestamp });
    if (code !== 0) {
      logger.fatal('观看视频', code, message);
      return;
    }
    await sleep(5000);
    bigLogger.debug(`观看视频每日任务 ✓`);
  } catch (error) {
    logger.exception(`观看视频任务`, error);
  }
}

async function watchRandomEp() {
  try {
    const ep = await getRandomEp();
    bigLogger.debug(`观看《${ep.name}·${ep.title}》`);
    const { code, message, data } = await materialReceive({ ep_id: ep.id, season_id: ep.season });
    if (code !== 0) {
      logger.fatal(`观看随机视频`, code, message);
      return;
    }
    return data.watch_count_down_cfg;
  } catch (error) {
    logger.exception(`观看随机视频`, error);
  }
}

/**
 * complete 每日任务
 * 当 v2 为 true 时，taskCode 为 TaskCodeType 类型
 */
async function completeTask(taskCode: string | TaskCodeType, name: string, v2?: boolean) {
  try {
    let completeFn: (taskCode: string | TaskCodeType) => Promise<{ code: number; message: string }>;
    if (v2) {
      completeFn = completeV2;
    } else {
      completeFn = (position: string) => complete({ position });
      await susWin();
      await apiDelay(1000, 2000);
    }
    const { code, message } = await completeFn(taskCode);
    if (code !== 0) {
      logger.error(`${name}失败: ${code} ${message}`);
      return;
    }
    bigLogger.debug(`${name}每日任务 ✓`);
  } catch (error) {
    logger.error(`每日任务${name}出现异常：`, error);
  }
}

/**
 * 浏览会员购
 */
async function vipMallView() {
  try {
    const { code, message } = await showDispatch('hevent_oy4b7h3epeb');
    if (code === 0) {
      bigLogger.debug(`浏览会员购每日任务 ✓`);
      return;
    }
    logger.error(`浏览会员购失败: ${code} ${message}`);
  } catch (error) {
    logger.error(`每日任务会员购出现异常：`, error);
  }
}

/**
 * 签到
 */
async function bigPointSign(histories?: SingTaskHistory[]) {
  if (!histories || !histories.length) {
    return sign();
  }
  const today = histories.find(history => history.is_today);
  if (today?.signed) {
    !isRetry && bigLogger.debug('今日已签到 ✓');
    return;
  }
  return sign();
}

async function sign() {
  try {
    const { code, message } = await signIn();
    if (code === 0) {
      bigLogger.debug(`签到成功 ✓`);
      return code;
    }
    logger.error(`签到失败: ${code} ${message}`);
    isError = true;
    return code;
  } catch (error) {
    logger.error(error);
  }
  return -1;
}

/**
 * 领取任务
 * @returns true 领取成功
 */
async function getTask(taskinfo: Taskinfo) {
  function filterTask(taskItem: CommonTaskItem) {
    if (!taskItem) return false;
    if (taskItem.vip_limit > TaskModule.vipType) return false;
    if (taskItem.state === 0) return true;
  }
  const taskItems = taskinfo.modules?.at(-1)?.common_task_item?.filter(filterTask);
  if (!taskItems || !taskItems.length) {
    return false;
  }
  await getManyTask(taskItems.map(taskItem => taskItem.task_code));
  bigLogger.debug('领取任务完成');
  return true;
}

/**
 * 基本信息输出和判断
 * @returns true: 可以继续执行任务
 */
async function baseInfo(status: number, type: number, point: number) {
  logger.info(`当前积分: ${point}`);
  if (status === 0 || type === 0) {
    logger.warn('当前无大会员，无法继续执行任务');
    return;
  }
  return true;
}

/**
 * 领取单个任务
 */
async function getOneTask(taskCode: TaskCodeType) {
  try {
    const { code, message } = await receiveTask(taskCode);
    if (code === 0) {
      return true;
    }
    logger.error(`领取任务${TaskCode[taskCode]}-${taskCode}失败: ${code} ${message}`);
  } catch (error) {
    logger.error(error);
  }
}

/**
 * 领取多个任务
 */
async function getManyTask(taskCodes: TaskCodeType[]) {
  for (const taskCode of taskCodes) {
    await getOneTask(taskCode);
    await apiDelay(100, 300);
  }
}

async function getDailyTask() {
  try {
    const taskStatus = await getTaskStatus();
    if (taskStatus)
      return (
        taskStatus.task_info?.modules?.find(task => task.module_title === '日常任务')
          ?.common_task_item || []
      );
  } catch (error) {
    logger.error(error);
  }
  return [];
}

/**
 * 今日任务完成情况
 */
async function checkTodayStatus() {
  const dailyTask = await getDailyTask();
  if (dailyTask.length === 0) return false;
  // 除了 NO_NEED_TASK 中的, 其它全部需要 state === 3
  return dailyTask.every(task =>
    NO_NEED_TASK.includes(task.task_code as unknown as (typeof NO_NEED_TASK)[number])
      ? true
      : task.state === 3,
  );
}

/**
 * 获取今日积分
 */
async function getPoint() {
  const keyword = ['观看任意', '签到', '10秒', '浏览装扮'];
  try {
    const { code, data, message } = await getPointList();
    if (code !== 0) {
      logger.warn(`获取今日积分失败: ${code} ${message}`);
      return;
    }
    return data.big_point_list
      .filter(item => isToday(item.change_time) && keyword.some(key => item.remark.includes(key)))
      .reduce((num, item) => num + item.point, 0);
  } catch (error) {
    logger.error(error);
  }
}

async function getTodayPonit() {
  const todayPoint = await getPoint();
  if (!isDef(todayPoint)) return false;
  if (todayPoint >= FREE_POINT) {
    logger.info(`今日获取积分【${todayPoint}】√`);
    return true;
  }
  if (todayPoint === 35 || todayPoint === 40) {
    if (await checkTodayStatus()) {
      logger.info(`今日获取积分【${todayPoint}】，但并未检测到未完成的任务。`);
      return true;
    }
    if (TaskConfig.bigPoint.isAsyncWatch) {
      logger.info(`今日获取积分【${todayPoint}】，由于您开启了异步观看，所以跳过检测观看结果`);
      return true;
    }
  }
  if (todayPoint === 0 && !isError && isRetry) {
    logger.error(`今日获取积分【${todayPoint}】, 部分任务未成功 ×`);
    logger.info('可能是完成获取，但是接口数据延迟。');
    return false;
  }
  logger.error(`今日获取积分【${todayPoint}】, 未达到预期 ×`);
  return false;
}
