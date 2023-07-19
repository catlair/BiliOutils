import { kaomoji } from '@/constant';
import { SeedMessageResult } from '@/enums/dm.emum';
import { getRandomItem, logger, random } from '@/utils';
import * as liveRequest from '@/net/live.request';

const messageArray = kaomoji.concat('1', '2', '3', '4', '5', '6', '7', '8', '9', '签到', '哈哈');

export async function sendDmMessage(roomid: number, msg?: string, nickName?: string) {
  msg = msg || generateRandomDm();
  nickName = nickName || roomid.toString();
  try {
    logger.debug(`【${nickName}】${roomid}-发送弹幕 ${msg}`);
    const { code, message } = await liveRequest.sendMessage(roomid, msg);

    if (code === SeedMessageResult.Success) {
      return 0;
    }
    if (code === SeedMessageResult.Unresistant) {
      logger.warn(`【${nickName}】${roomid}-可能未开启评论`);
      return SeedMessageResult.Unresistant;
    }
    logger.warn(`【${nickName}】${roomid}-发送失败 ${code} ${message}`);
    return code;
  } catch (error) {
    logger.verbose(`发送弹幕异常 ${error.message}`);
  }
  return SeedMessageResult.Unknown;
}

/**
 * 生成随机弹幕
 */
export function generateRandomDm() {
  // 获取 1 - 10 数字
  const num = random(1, 10);
  // 如果是 4 以内，返回时间问候
  if (num <= 7) {
    // 根据时间段返回不同的问候语
    const hour = new Date().getHours();
    let greeting = '夜里好';
    if (hour < 6) {
      greeting = '凌晨好';
    } else if (hour < 9) {
      greeting = '早上好';
    } else if (hour < 12) {
      greeting = '上午好';
    } else if (hour < 14) {
      greeting = '中午好';
    } else if (hour < 17) {
      greeting = '下午好';
    } else if (hour < 19) {
      greeting = '傍晚好';
    } else if (hour < 22) {
      greeting = '晚上好';
    }
    const num = random(1, 10);
    return num < 8
      ? `${greeting}，${getRandomItem(messageArray)}`
      : num === 9
      ? `${greeting}${getRandomItem(['', '啊', '呀', '呢', '啦', '嘛', '吧', '哦', '哇', '呗'])}`
      : `${getRandomItem(['大家', '各位', '兄弟们', '姐妹们', '朋友们', ''])}${greeting}`;
  }
  // 如果是 5 - 8，返回随机表情
  if (num <= 9) {
    const msg = getRandomItem(messageArray);
    // msg 必须要有中文，否则添加
    if (!/[\u4e00-\u9fa5]/.test(msg)) {
      // 将 msg 填充到 3 个字及以上
      return msg.padEnd(
        Math.max(3, msg.length + 1),
        getRandomItem(['啊', '呀', '呢', '啦', '嘛', '吧', '哦', '哇', '呗']),
      );
    }
    return msg;
  }
  // 如果是 9，返回到此一游之类的，大于 3 个字
  return getRandomItem([
    '到此一游',
    '路过了',
    '水一下',
    '占个位置',
    '先走了',
    '先占个位置',
    '先水一下',
    '先mark',
    '先收藏',
    '先点赞',
    '先围观',
    '先划个水',
    '先留个爪',
    '先留个爪印',
    '先留个脚印',
    '先留个脚',
    '先留个爪子',
    '先留个爪爪',
    '先留个爪爪印',
    '先留个脚脚',
    '先留个脚脚印',
    '先留个脚印',
  ]);
}
