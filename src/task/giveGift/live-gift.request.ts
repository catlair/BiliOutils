import type { IdType } from '@/types';
import type { BagSendResDto, LiveGiftBagListDto } from './live-gift.dto';
import { TaskConfig } from '@/config';
import { OriginURLs } from '@/constant/biliUri';
import { liveApi } from '@/net/api';

/**
 * 获取礼物背包列表
 * @param roomId 房间号(默认陈睿-嘻嘻)
 */
export function getGiftBagList(roomId: IdType = 3394945): Promise<LiveGiftBagListDto> {
  return liveApi.get(`xlive/web-room/v1/gift/bag_list?t=${new Date().getTime()}&room_id=${roomId}`);
}

/**
 * 赠送礼物
 */
export function sendBagGift({
  ruid,
  gift_num,
  bag_id,
  gift_id,
  roomid,
}: {
  ruid: IdType;
  gift_num: number;
  bag_id: number;
  gift_id: number;
  roomid: number;
}): Promise<BagSendResDto> {
  const csrf = TaskConfig.BILIJCT;
  const csrf_token = csrf;
  const postData = {
    gift_id,
    ruid,
    gift_num,
    bag_id,
    biz_id: roomid,
    rnd: new Date().getTime(),
    send_ruid: 0,
    storm_beat_id: 0,
    metadata: '',
    price: 0,
    visit_id: '',
    csrf,
    platform: 'pc',
    biz_code: 'Live',
    csrf_token,
    uid: TaskConfig.USERID,
  };
  return liveApi.post('xlive/revenue/v2/gift/sendBag', postData, {
    headers: {
      Origin: OriginURLs.live,
    },
  });
}
