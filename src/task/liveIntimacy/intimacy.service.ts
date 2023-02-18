import type { FansMedalDto } from '@/dto/live.dto';
import { TaskConfig, TaskModule } from '@/config';
import * as liveRequest from '@/net/live.request';
import {
  apiDelay,
  logger,
  Logger,
  apiDelaySync,
  randomString,
  createUUID,
  isServerless,
  getOnceFunc,
  isString,
  getRandomItem,
} from '@/utils';
import { likeLiveRoom, liveMobileHeartBeat } from './intimacy.request';
import type { MobileHeartBeatParams } from './intimacy.request';
import { SeedMessageResult } from '@/enums/dm.emum';
import { sendDmMessage } from '@/service/dm.service';
import {
  MEDAL_ADD_MINUTES,
  MEDAL_LIST_PAGE_COUNT,
  MEDAL_LIST_PAGE_SIZE,
  TODAY_MAX_FEED,
} from './constant';

const liveLogger = new Logger(
  { console: 'debug', file: 'debug', push: 'warn', payload: TaskModule.nickname },
  'live',
);

// 发送弹幕失败的直播间
const sendMessageFailList = new Map<number, FansMedalDto>();
// 重试次数
let retryCount = 0,
  retryRoom = 0;

export async function getFansMealList(numRef: { total: number; current: number }) {
  const list: FansMedalDto[] = [];
  try {
    // 先获取一次 第一页，避免获取漏掉牌子
    const { data } = await liveRequest.getFansMedalPanel(1, 2);
    if (data.special_list?.length > 0) {
      list.push(...data.special_list);
    }
    for (let index = 0; index < MEDAL_LIST_PAGE_COUNT; index++) {
      await apiDelay(200, 600);
      const { code, message, data } = await liveRequest.getFansMedalPanel(
        numRef.current + 1,
        MEDAL_LIST_PAGE_SIZE,
      );
      if (code !== 0) {
        logger.verbose(`获取勋章信息失败 ${code} ${message}`);
        return list;
      }

      if (!data) return list;

      numRef.total = data.page_info.total_page || 0;
      numRef.current = data.page_info.current_page;
      list.push(...data.special_list, ...data.list);
    }
  } catch (error) {
    logger.error(`获取勋章异常：`, error);
  }
  // list 去重
  return [...new Map(list.map(t => [t.medal.medal_id, t])).values()];
}

/**
 * 过滤掉不需要发送的直播间
 */
export function filterFansMedalList(list: FansMedalDto[]) {
  if (!list || list.length === 0) return [];
  return list.filter(fansMedalFilter);
}

function fansMedalFilter({ room_info, medal }: FansMedalDto) {
  // 没有直播间
  if (!room_info?.room_id) return false;
  // 粉丝牌已经满了或者为舰长
  if (medal.level >= 20) return false;
  // 今日够了
  if (medal.today_feed >= medal.day_limit) return false;
  // 今天达到了 TODAY_MAX_FEED（默认获取最大）
  if (medal.today_feed >= TODAY_MAX_FEED) return false;
  // 不存在白名单
  const { whiteList, blackList } = TaskConfig.intimacy;
  if (!whiteList.length) {
    // 判断是否存在黑名单中
    return !blackList.includes(medal.target_id);
  }
  // 如果存在白名单，则只发送白名单里的
  return whiteList.includes(medal.target_id);
}

async function likeLive(roomId: number) {
  try {
    const { code, message, data } = await likeLiveRoom(roomId);
    if (code === 0) {
      return data;
    }
    logger.info(`【${roomId}】直播间点赞失败 ${code} ${message}`);
  } catch (error) {
    logger.warn(`点赞直播间异常 ${error.message}`);
  }
}

async function liveMobileHeart(
  heartbeatParams: MobileHeartBeatParams & { uname: string },
  countRef: Ref<number>,
  needTime = 75,
) {
  if (countRef.value >= needTime) {
    return;
  }
  try {
    const { code, message } = await liveMobileHeartBeat(heartbeatParams);
    if (code !== 0) {
      logger.warn(`直播间心跳失败 ${code} ${message}`);
      return;
    }
    countRef.value++;
    liveLogger.debug(`心跳 ${heartbeatParams.uname}（${countRef.value}/${needTime}）`);
  } catch (error) {
    if (error.message.includes('Timeout awaiting')) {
      liveLogger.debug(error.message);
      return;
    }
    liveLogger.error(error);
    logger.error(`直播间心跳异常 ${error.message}`);
  }
}

async function likeAndShare(fansMealList: FansMedalDto[], doneNumber = 0) {
  const { liveLike, liveSendMessage } = TaskConfig.intimacy;
  if (![liveLike, liveSendMessage].every(Boolean)) return;

  const fansLength = fansMealList.length,
    skipNum = TaskConfig.intimacy.skipNum;
  if (skipNum >= 0 && fansLength === doneNumber && doneNumber > skipNum) {
    return;
  }
  for (let index = 0; index < fansLength; index++) {
    const fansMedal = fansMealList[index];
    await liveInteract(fansMedal);
  }
}

async function liveHeart(fansMealList: FansMedalDto[], useAsync = false) {
  if (fansMealList.length === 0) return;
  const { liveHeart } = TaskConfig.intimacy;
  if (!liveHeart) return;
  if (isServerless() || useAsync) return await liveHeartPromiseSync(fansMealList);
  logger.info('直播间心跳（异步，不推送结果）');
  return new Promise(resolve => liveHeartPromise(resolve, fansMealList));
}

export function getRandomOptions() {
  return {
    buvid: TaskConfig.buvid,
    gu_id: randomString(43).toLocaleUpperCase(),
    visit_id: randomString(32).toLocaleLowerCase(),
    uuid: createUUID(),
    click_id: createUUID(),
  };
}

type NeedTimeType = {
  value: number;
  increase?: boolean;
};

function getLiveHeartNeedTime(medal = { today_feed: 0 }): NeedTimeType {
  const { limitFeed } = TaskConfig.intimacy;
  // 今日还需要 feed
  const { today_feed } = medal;
  let needFeed = limitFeed - today_feed;
  // < 200 则其它活动没做，如果做完可以增加 200 点
  if (today_feed < 200) {
    needFeed -= 200;
  }
  if (needFeed <= 0) {
    return {
      value: 0,
      increase: true,
    };
  }
  // 所需要挂机时间 （每 100 feed 需要挂机 5 分钟）,加 1 是因为 1 分钟需要 1 + 1 次
  return {
    value: Math.ceil(needFeed / 100) * MEDAL_ADD_MINUTES + 1,
    increase: today_feed < 200,
  };
}

type LiveHeartRunOptions = {
  fansMedal: FansMedalDto;
  options: Record<string, string>;
  countRef: Ref<number>;
  needTime: NeedTimeType;
  timerRef?: Ref<NodeJS.Timer>;
};

async function liveHeartPromise(resolve: (value: unknown) => void, roomList: FansMedalDto[]) {
  const retryLiveHeartOnce = await getOnceFunc(retryLiveHeart);
  for (const fansMedal of roomList) {
    const timerRef: Ref<NodeJS.Timer> = { value: undefined as unknown as NodeJS.Timer };
    const runOptions = {
      fansMedal,
      options: getRandomOptions(),
      countRef: { value: 0 } as Ref<number>,
      needTime: getLiveHeartNeedTime(fansMedal.medal),
      timerRef,
    };
    run(runOptions);
    timerRef.value = setInterval(run, 60030, runOptions);
    apiDelaySync(50, 150);
  }
  resolve('直播间心跳');
  async function run({
    fansMedal: { medal, room_info, anchor_info },
    options,
    countRef,
    needTime,
    timerRef,
  }: LiveHeartRunOptions) {
    await liveMobileHeart(
      {
        up_id: medal.target_id,
        room_id: room_info.room_id,
        uname: anchor_info.nick_name,
        ...options,
      },
      countRef,
      needTime.value,
    );
    const timeDiff = needTime.value - countRef.value;
    if (timeDiff <= 2 && needTime.increase && sendMessageFailList.has(room_info.room_id)) {
      needTime.value += MEDAL_ADD_MINUTES;
      retryRoom = room_info.room_id;
      sendMessageFailList.delete(room_info.room_id);
      return;
    }
    if (timeDiff > 0) return;
    timerRef && timerRef.value && clearInterval(timerRef.value);
    if (retryRoom === room_info.room_id) {
      await retryLiveHeartOnce();
    } else if (retryRoom === 0) {
      await retryLiveHeart();
    }
  }
}

async function liveHeartPromiseSync(roomList: FansMedalDto[]) {
  await Promise.all(
    roomList.map(fansMedal => allLiveHeart(fansMedal, getRandomOptions(), { value: 0 })),
  );
  await retryLiveHeart();
  logger.info('直播间心跳结束');
}

/**
 * 完成一个直播间所有轮次的心跳
 * @param fansMedal
 * @param options
 * @param countRef
 */
async function allLiveHeart(
  fansMedal: FansMedalDto,
  options: Record<string, string>,
  countRef: Ref<number>,
) {
  const needTime = getLiveHeartNeedTime(fansMedal.medal);
  for (let i = 0; i < needTime.value; i++) {
    const { medal, anchor_info, room_info } = fansMedal;
    if (needTime.increase && sendMessageFailList.has(room_info.room_id)) {
      needTime.value += MEDAL_ADD_MINUTES;
      sendMessageFailList.delete(room_info.room_id);
    }
    await liveMobileHeart(
      {
        up_id: medal.target_id,
        room_id: room_info.room_id,
        uname: anchor_info.nick_name,
        ...options,
      },
      countRef,
      needTime.value,
    );
    await apiDelay(60000);
  }
}

export async function liveInteract(fansMedal: FansMedalDto) {
  const { room_info, anchor_info } = fansMedal;
  if (!room_info || !anchor_info) {
    return;
  }
  const { liveLike, liveSendMessage } = TaskConfig.intimacy,
    nickName = anchor_info.nick_name,
    roomid = room_info.room_id;

  // 发送直播弹幕
  if (liveSendMessage) {
    const sendMessageResult = await sendLiveDm(roomid, nickName, fansMedal.medal.target_id);
    if (sendMessageResult !== SeedMessageResult.Success) {
      sendMessageFailList.set(roomid, fansMedal);
    }
  }

  // 点赞直播
  if (liveLike) {
    await apiDelay(100, 300);
    liveLogger.debug(`为 [${nickName}] 直播间点赞`);
    await likeLive(roomid);
  }

  await apiDelay(11000, 16000);
}

/**
 * 发送直播弹幕
 */
async function sendLiveDm(roomid: number, nickName: string, uid: number) {
  liveLogger.verbose(`为[${nickName}]发送直播弹幕`);
  const dmConf = Reflect.get(TaskConfig.intimacy.dm, uid);
  let dm: string | undefined = undefined;
  if (isString(dmConf)) {
    dm = dmConf;
  } else if (Array.isArray(dmConf)) {
    dm = getRandomItem(dmConf);
  }
  return await sendDmMessage(roomid, nickName, dm);
}

/**
 * 重试心跳
 */
async function retryLiveHeart() {
  if (!TaskConfig.intimacy.isRetryHeart) {
    return;
  }
  if (retryCount > 1) {
    return;
  }
  retryCount++;
  liveLogger.debug('尝试检查直播心跳');
  await liveIntimacyService();
  logger.debug('直播心跳检查完成');
}

// 发送直播弹幕 1 次 间隔 10s 以上
// 点赞 1 次 间隔 3s 以上

export async function liveIntimacyService() {
  const numRef = { total: 999, current: 0 };
  let multipleRun = false;
  while (numRef.current < numRef.total) {
    // 获取到可能需要操作的粉丝牌
    const fansMealList = filterFansMedalList(await getFansMealList(numRef));

    if (fansMealList.length === 0) {
      logger.info('今日任务已完成，无需再进行');
      return;
    }

    if (numRef.current < numRef.total) {
      multipleRun = true;
    }

    const doneLength = fansMealList.filter(fans => fans.medal?.today_feed > 200).length;
    // 获取到点亮的粉丝牌
    await Promise.allSettled([
      likeAndShare(fansMealList, doneLength),
      liveHeart(fansMealList, multipleRun),
    ]);
  }
}
