import { TaskModule } from '@/config';
import type { LiveIndexRoomItem } from '@/dto/live-index.dto';
import type { LiveAreaDto } from '@/dto/live.dto';
import { PendentID } from '@/enums/live.enum';
import { getArea, getLiveIndex, getLiveInfo } from '@/net/live.request';
import { logger } from '@/utils';

export interface LiveAreaType {
  areaId: string;
  parentId: string;
  name: string;
  parentName: string;
}

/**
 * 分类检测
 */
function pendentLottery(list: LiveIndexRoomItem[]) {
  const lotteryTime: LiveIndexRoomItem[] = [],
    lotteryPacket: LiveIndexRoomItem[] = [];
  list.forEach(item => {
    const pendant = item.pendant_Info[2];
    if (!pendant) return;
    if (pendant.pendant_id === PendentID.Time) {
      lotteryTime.push(item);
    } else if (pendant.pendant_id === PendentID.RedPacket) {
      lotteryPacket.push(item);
    }
  });
  return { lotteryTime, lotteryPacket };
}

/**
 * 获取直播分区
 */
export async function getLiveArea() {
  try {
    const { data, code, message } = await getArea();
    if (code !== 0) {
      logger.info(`获取直播分区失败: ${code}-${message}`);
    }
    return data.data;
  } catch (error) {
    logger.error(`获取直播分区异常：`, error);
    throw error;
  }
}

/**
 * 获取直播间首页
 */
export async function getLiveIndexData() {
  try {
    const { code, data, message } = await getLiveIndex();
    if (code === 0) {
      return data;
    }
    logger.fatal(`获取直播间首页`, code, message);
  } catch (error) {
    logger.exception(`获取直播间首页`, error);
  }
}

/**
 * 获取直播间列表
 * @param areaId
 * @param parentId
 * @param page
 */
export async function getLotteryRoomList(lotType: 'lottery' | 'redPack' = 'lottery') {
  async function getList() {
    const data = await getLiveIndexData();
    if (!data) throw Error('获取直播间首页失败');
    const list = data.room_list.map(({ list }) => list).flat();
    if (list.includes(null as any)) {
      logger.debug(JSON.stringify(list));
    }
    return list.filter(Boolean);
  }

  return pendentLottery(await getList())[lotType === 'lottery' ? 'lotteryTime' : 'lotteryPacket'];
}

export async function getRoomid() {
  if (TaskModule.roomid) return TaskModule.roomid;
  const roomid = await requestRoomid();

  if (!roomid) {
    logger.error(`没有配置 blink.roomid 且获取直播间 id 失败`);
    return;
  }
  TaskModule.roomid = roomid;
  return roomid;
}

/**
 * 获取直播间 id
 */
export async function requestRoomid() {
  try {
    const { code, message, data } = await getLiveInfo();
    if (code !== 0) {
      logger.fatal(`获取直播间 id`, code, message);
      return;
    }
    return data.room_id;
  } catch (error) {
    logger.exception('获取直播间 id', error);
  }
}

/**
 * 通过配置过滤分区
 */
export function filterArea(data: LiveAreaDto['data']['data'], useArea: boolean, config: string[]) {
  const areaList = data.map(({ list }) => list);
  if (!useArea) return areaList;
  const parentNames: string[] = [];
  // 父分区
  const res = areaList.filter(([{ parent_name }]) => {
    const r = config.includes(parent_name);
    r && parentNames.push(parent_name);
    return r;
  });
  // 子分区
  const res1 = areaList
    .filter(([{ parent_name }]) => !parentNames.includes(parent_name))
    .flat()
    .filter(({ name }) => config.includes(name));
  res1.length && res.push(res1);
  return res;
}
