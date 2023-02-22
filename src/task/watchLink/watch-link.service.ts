import { TaskConfig } from '@/config';
import { getUser } from '@/net/user-info.request';
import { biliDmWs } from '@/service/ws.service';
import { logger } from '@/utils';
import { apiDelaySync } from '@/utils/effect';
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
  return new Promise(resolve => liveHeartPromise(resolve));
}

async function liveHeartPromise(resolve: (value: unknown) => void) {
  const { uid: uids } = TaskConfig.watchLink;
  if (uids.length === 0) return;
  for (const uid of uids) {
    const user = await getUserInfo(uid);
    if (!user) return;
    bindWatchEvent(user);
  }
  resolve('直播间心跳');
}

function bindWatchEvent(user: LiveHeartRunOptions['user']) {
  const { time, wss, heart, parentId, areaId } = TaskConfig.watchLink;

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
