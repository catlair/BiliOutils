import WebSocket from 'ws';
import { TaskConfig } from '@/config';
import { getDanmuInfo } from '@/net/live.request';
import { OpEnum } from '@/enums/ws.enum';
import { logger } from '@/utils/log';
import { decode, formatDataView, getCertification } from '@/utils/ws';

interface TimerOptions {
  timer?: NodeJS.Timeout;
  timeout?: NodeJS.Timeout;
}

// roomid <=> ws，通过 roomid 查找已经连接的 ws
export const wsMap = new Map<number, WebSocket>();
// roomid <=> timers，通过 roomid 查找 ws 心跳的定时器和连接超时的定时器
const timerMap = new Map<number, TimerOptions>();

/**
 * 关闭 ws
 * @param roomid 直播间id
 */
export function closeWs(roomid: number) {
  closeWsByAll(wsMap.get(roomid), roomid);
  wsMap.delete(roomid);
}

/**
 * 关闭所有 ws 和定时器
 */
export function clearWs() {
  wsMap.forEach(closeWsByAll);
  wsMap.clear();
  timerMap.clear();
}

export function addWs(room_id: number, ws: WebSocket) {
  // 取消旧的 ws
  wsMap.get(room_id)?.close();
  wsMap.set(room_id, ws);
}

function closeWsByAll(ws: WebSocket | undefined, roomid: number) {
  if (ws) {
    ws.close();
    ws.removeAllListeners();
  }
  clearWsTimer(roomid);
}

function clearWsTimer(roomid: number) {
  const options = timerMap.get(roomid);
  if (options) {
    clearTimer(options);
    timerMap.delete(roomid);
  }
}

function clearTimer(options: TimerOptions) {
  const { timer, timeout } = options || {};
  timer && clearInterval(timer);
  timeout && clearTimeout(timeout);
}

async function getWsLink(room_id: number) {
  try {
    const { data } = await getDanmuInfo(room_id);
    return {
      token: data.token,
      uri: data.host_list?.[0].host,
    };
  } catch (error) {
    logger.error(error);
  }
}

export async function biliDmWs(room_id: number, time = 0) {
  const wsLink = await getWsLink(room_id);
  if (!wsLink) return;
  const json = {
    uid: TaskConfig.USERID,
    roomid: room_id,
    protover: 1,
    platform: 'web',
    clientver: '1.6.3',
    key: wsLink.token,
  };
  const ws = new WebSocket(`wss://broadcastlv.chat.bilibili.com/sub`);

  ws.addEventListener('open', () => {
    // 认证
    ws.send(getCertification(JSON.stringify(json)));
    timerMap.set(room_id, sendInterval());
  });

  ws.addEventListener('close', () => {
    closeWs(room_id);
  });

  ws.addEventListener('error', () => {
    logger.error(`直播间${room_id}，ws连接出错`);
    closeWs(room_id);
  });

  function sendInterval() {
    let timeout: NodeJS.Timeout | undefined;
    const timer = setInterval(() => {
      // 心跳包
      ws.send(
        formatDataView({}, [91, 111, 98, 106, 101, 99, 116, 32, 79, 98, 106, 101, 99, 116, 93]),
      );
    }, 30000);
    if (time > 0) {
      timeout = setTimeout(() => {
        closeWs(room_id);
      }, time);
    }
    return { timer, timeout };
  }

  return ws;
}

export function bindMessageForRedPacket(
  ws: WebSocket,
  room_id: number,
  msgCallback?: (body: any, room_id: number) => void,
) {
  ws.addEventListener('message', evt => {
    const packet = decode(evt.data as Uint8Array);
    if (packet.op === OpEnum.接收cmd) {
      packet?.body.forEach(body => {
        msgCallback && msgCallback(body, room_id);
      });
    }
  });
}

export function bindMessageForLottery(ws: WebSocket) {
  ws.addEventListener('message', () => {
    // console.log(evt.data);
  });
}

/**
 * 通过 ws 数量限制并发数
 */
export function waitForWebSocket(conditions = 2) {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (wsMap.size < conditions) {
        clearInterval(timer);
        resolve(true);
      }
    }, 1000);
  });
}
