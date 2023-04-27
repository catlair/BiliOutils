import { TaskConfig } from '@/config';
import { getUser } from '@/net/user-info.request';
import { biliDmWs } from '@/service/ws.service';
import { isServerless, logger } from '@/utils';
import { apiDelay, apiDelaySync } from '@/utils/effect';
import { request } from '@/utils/request';
import { getRandomOptions, liveMobileHeart } from '../liveIntimacy/intimacy.service';

type LiveHeartRunOptions = {
  user: {
    name: string;
    roomid: number;
    mid: number;
  };
  options: Record<string, string>;
  countRef: Ref<number>;
  needTime: number;
  timerRef?: Ref<NodeJS.Timer>;
};

export async function watchLinkService() {
  if (isServerless()) return await liveHeartPromiseSync();
  return new Promise(resolve => liveHeartPromise(resolve));
}

async function liveHeartPromiseSync() {
  const { uid: uids, area, heart } = TaskConfig.watchLink;
  if (!heart) return;
  if (uids.length === 0 || area.length === 0) return;
  // area 异步，所以用 foreach
  area.forEach(async areaItem => {
    await Promise.all(uids.map(uid => allLiveHeart(uid, areaItem, { value: 0 })));
  });
  logger.info('直播间心跳结束');
}

/**
 * 完成一个直播间所有轮次的心跳
 * @param options
 * @param countRef
 */
async function allLiveHeart(uid: number, [parentId, areaId]: number[], countRef: Ref<number>) {
  const { time } = TaskConfig.watchLink;
  for (let i = 0; i < time; i++) {
    const user = await getUserInfo(uid);
    if (!user) continue;
    await liveMobileHeart(
      {
        up_id: user.mid,
        room_id: user.roomid,
        uname: user.name,
        ...getRandomOptions(),
        parent_id: parentId,
        area_id: areaId,
      },
      countRef,
      time,
    );
    await apiDelay(60000);
  }
}

async function liveHeartPromise(resolve: (value: unknown) => void) {
  const { uid: uids, area } = TaskConfig.watchLink;
  if (uids.length === 0 || area.length === 0) return;
  area.forEach(async areaItem => {
    for (const uid of uids) {
      const user = await getUserInfo(uid);
      if (!user) return;
      bindWatchEvent(user, areaItem);
    }
  });
  resolve('直播间心跳');
}

function bindWatchEvent(user: LiveHeartRunOptions['user'], [parentId, areaId]: number[]) {
  const { time, wss, heart } = TaskConfig.watchLink;

  if (heart) {
    const timerRef: Ref<NodeJS.Timer> = { value: undefined as unknown as NodeJS.Timer };
    const runOptions = {
      user,
      options: getRandomOptions(),
      countRef: { value: 0 } as Ref<number>,
      needTime: time,
      timerRef,
    };
    run(runOptions);
    timerRef.value = setInterval(run, 60030, runOptions);
    apiDelaySync(50, 150);
  }

  if (wss) {
    createWatchDmWs({ room_id: user.roomid }, time);
    apiDelaySync(50, 150);
  }

  async function run({
    user: { name, roomid, mid },
    options,
    countRef,
    needTime,
    timerRef,
  }: LiveHeartRunOptions) {
    await liveMobileHeart(
      {
        up_id: mid,
        room_id: roomid,
        uname: name,
        ...options,
        parent_id: parentId,
        area_id: areaId,
      },
      countRef,
      needTime,
    );
    const timeDiff = needTime - countRef.value;
    if (timeDiff > 0) return;
    timerRef && timerRef.value && clearInterval(timerRef.value);
  }
}

async function getUserInfo(uid: number | string) {
  const user = await request(getUser, { name: '获取用户直播间' }, uid);
  if (!user) return;
  if (!user.live_room) {
    logger.warn(`目标[${uid}]没有直播间`);
  }
  const { roomStatus, roomid } = user.live_room;
  if (roomStatus !== 1) {
    logger.warn(`目标[${uid}]的roomStatus为${roomStatus}`);
    return;
  }
  return {
    roomid,
    name: user.name,
    mid: user.mid,
  };
}

/**
 * @param wsTime 分
 */
async function createWatchDmWs({ room_id }, wsTime: number) {
  const ws = await biliDmWs(room_id, (wsTime + 20) * 1000 * 60);
  if (!ws) return;
  // bindMessageForRedPacket(ws, room_id, async body => {
  //   if (body.cmd !== 'STOP_LIVE_ROOM_LIST') {
  //     console.log(room_id, JSON.stringify(body));
  //   }
  // });
  return ws;
}
