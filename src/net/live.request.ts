import type { IdType } from '../types';
import type {
  Bp2GoldDto,
  DanmuDto,
  FansMedalPanelDto,
  JoinLotteryDto,
  JoinRedPacketRes,
  LiveAreaDto,
  LiveCheckLotteryRes,
  LiveCheckRedRes,
  LiveFansMedalDto,
  LiveFollowListDto,
  LiveRoomDto,
  LiveRoomInfoDto,
  OnlineGoldRankDto,
} from '../dto/live.dto';
import type { ApiBaseProp, PureDataProp } from '../dto/bili-base-prop';
import { liveApi } from './api';
import { TaskConfig } from '../config';
import { createVisitId, getUnixTime, random } from '../utils';
import { OriginURLs } from '../constant/biliUri';
import { appSignString } from '@/utils/bili';

/**
 * b币兑换电池
 */
export function exchangeBattery(couponBalance: number) {
  const pay_bp = couponBalance * 1000;
  return liveApi.post<Bp2GoldDto>('xlive/revenue/v1/order/createOrder', {
    platform: 'pc',
    pay_bp,
    context_id: 13142548, // 直播间 id
    context_type: 1, // 直播间相关，未知
    goods_id: 1,
    goods_num: couponBalance,
    goods_type: 2, // 未知
    ios_bp: 0, // 消耗
    common_bp: pay_bp, // 消耗
    csrf_token: TaskConfig.BILIJCT,
    csrf: TaskConfig.BILIJCT,
    visit_id: createVisitId(),
  });
}

/**
 * 发送一个直播弹幕
 * @param roomid 直播房间号
 * @param msg 消息
 * @param dm_type 弹幕类型，1 为表情
 */
export function sendMessage(roomid: number, msg: string, dm_type?: number): Promise<PureDataProp> {
  const csrf = TaskConfig.BILIJCT;
  const csrf_token = csrf;
  msg || (msg = random(10).toString());
  const data: Record<string, any> = {
    bubble: 0,
    msg,
    color: 5566168,
    mode: 1,
    fontsize: 25,
    rnd: getUnixTime(),
    roomid,
    csrf,
    csrf_token,
  };
  dm_type && (data.dm_type = dm_type);
  return liveApi.post('/msg/send', data);
}

/**
 * 发送一个直播弹幕（app）
 * @param roomid 直播房间号
 * @param msg 消息
 */
export async function sendMessageApp(roomid: number, msg: string) {
  const info = (await getInfoByRoom(roomid)).data;

  const {
    room_info: { sub_session_key, up_session, uid, area_id, parent_area_id },
  } = info;
  return await liveApi.post(`xlive/app-room/v1/dM/sendmsg?${appSignString()}`, {
    type: 'json',
    fontsize: 25,
    pool: 0,
    mode: 1,
    color: 16777215,
    av_id: -99998,
    screen_status: 2,
    dm_type: 0,
    mid: TaskConfig.USERID,
    cid: roomid,
    msg,
    csrf: TaskConfig.BILIJCT,
    rnd: getUnixTime(),
    data_extend: {
      from_launch_id: '-99998',
      from_session_id: '-99998',
      live_key: up_session,
      sub_session_key,
    },
    bubble: '0',
    msg_type: '0',
    room_type: '0',
    live_statistics: {
      buvid: TaskConfig.buvid.replace(/^XY/, 'XX'),
      session_id: '-99998',
      launch_id: '-99998',
      jumpfrom: '28031',
      jumpfrom_extend: '-99998',
      screen_status: '2',
      live_status: 'live',
      av_id: '-99998',
      flow_extend: '{"position":"1","s_position":"1","slide_direction":"-99998"}',
      bussiness_extend: '{"broadcast_type":"0","stream_scale":"2","watch_ui_type":"2"}',
      data_extend: `{"from_launch_id":"-99998","from_session_id":"-99998","live_key":"${up_session}","sub_session_key":"${sub_session_key}"}`,
      spm_id: '-99998',
      up_id: uid,
      room_id: roomid,
      parent_area_id,
      area_id,
      // simple_id: '347206e5-045f-4687-83e7-1d4158da5781',
      room_category: '0',
      official_channel: '-99998',
      gift_method: '-99998',
      gift_position: '-99998',
      gift_subname: '-99998',
    },
    launch_id: '-99998',
    jumpfrom: '28031',
    bussiness_extend: '{"broadcast_type":"0","stream_scale":"2","watch_ui_type":"2"}',
    flow_extend: '{"position":"1","s_position":"1","slide_direction":"-99998"}',
    jumpfrom_extend: '-99998',
    session_id: '-99998',
    playTime: '0.0',
  });
}

/**
 * 获取直播间信息
 * @param roomid 直播间id
 */
export function getInfoByRoom(roomid: number) {
  return liveApi.get(`xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`);
}

/**
 * 获取勋章
 * @param page 页
 * @param page_size 页大小
 */
export function getFansMedalPanel(page = 1, page_size = 50): Promise<FansMedalPanelDto> {
  return liveApi.get(
    `xlive/app-ucenter/v1/fansMedal/panel?${appSignString({
      page,
      page_size,
    })}`,
  );
}

/**
 * 获取已有粉丝勋章的关注列表
 * @param pageNum 第几页
 */
export function getLiveFansMedal(pageNum = 1, pageSize = 10): Promise<LiveFansMedalDto> {
  if (pageNum > 10) {
    pageNum = 10;
  }
  return liveApi.get(`xlive/app-ucenter/v1/user/GetMyMedals?page=${pageNum}&page_size=${pageSize}`);
}

/**
 * 获取直播间信息
 * @param roomid 直播间id
 */
export function getLiveRoomInfo(roomid: number): Promise<LiveRoomInfoDto> {
  return liveApi.get(`/room/v1/Room/get_info?room_id=${roomid}&from=room`);
}

/**
 * 获取分区信息
 */
export function getArea(): Promise<LiveAreaDto> {
  return liveApi.get('xlive/web-interface/v1/index/getWebAreaList?source_id=2');
}

/**
 * 获取直播间列表
 * @param parentArea
 * @param areaId
 * @param page
 */
export function getLiveRoom(parentArea: IdType, areaId: IdType, page = 1): Promise<LiveRoomDto> {
  return liveApi.get(
    `xlive/web-interface/v1/second/getList?platform=web&parent_area_id=${parentArea}&area_id=${areaId}&page=${page}`,
    {
      headers: {
        Origin: OriginURLs.live,
      },
    },
  );
}

/**
 * 检查天选时刻状态（lottery）
 * @param roomId 直播间id
 */
export function checkLottery(roomId: IdType): Promise<LiveCheckLotteryRes> {
  return liveApi.get(`xlive/lottery-interface/v1/Anchor/Check?roomid=${roomId}`);
}

/**
 * 天选抽奖
 */
export function joinLottery(options: {
  id: IdType;
  gift_id: IdType;
  gift_num: number;
}): Promise<JoinLotteryDto> {
  return liveApi.post(`xlive/lottery-interface/v1/Anchor/Join`, {
    ...options,
    csrf: TaskConfig.BILIJCT,
    csrf_token: TaskConfig.BILIJCT,
    visit_id: createVisitId(),
    platform: 'pc',
  });
}

/**
 * 检查直播红包状态
 * @param roomId 直播间id
 */
export function checkRedPacket(roomId: IdType) {
  return liveApi.get<LiveCheckRedRes>(
    `xlive/lottery-interface/v1/lottery/getLotteryInfoWeb?roomid=${roomId}`,
  );
}

/**
 * 抢直播红包
 * @param params 直播间id，红包id，用户id
 */
export function joinRedPacket(params: { room_id: IdType; ruid: IdType; lot_id: IdType }) {
  return liveApi.post<JoinRedPacketRes>(
    `xlive/lottery-interface/v1/popularityRedPocket/RedPocketDraw`,
    {
      ...params,
      spm_id: '444.8.red_envelope.extract',
      jump_from: '26000',
      c_locale: 'zh_CN',
      device: 'android',
      mobi_app: 'android',
      platform: 'android',
      channel: 'xiaomi',
      version: '6.79.0',
      statistics: { appId: 1, platform: 3, version: '6.79.0', abtest: '' },
      session_id: '',
      csrf_token: TaskConfig.BILIJCT,
      csrf: TaskConfig.BILIJCT,
      visit_id: '',
    },
    {
      headers: {
        'user-agent': TaskConfig.mobileUA,
      },
    },
  );
}

/**
 * 已关注用户的直播间列表
 */
export function getFollowLiveRoomList(page = 1, page_size = 9) {
  return liveApi.get<LiveFollowListDto>(
    `xlive/web-ucenter/user/following?page=${page}&page_size=${page_size}`,
  );
}

/**
 * 获取弹幕信息
 */
export function getDanmuInfo(room_id: number) {
  return liveApi.get<DanmuDto>(`xlive/web-room/v1/index/getDanmuInfo?id=${room_id}`);
}

/**
 * 获取在线排名
 */
export function getOnlineGoldRank(ruid: number, room_id: number) {
  return liveApi.get<OnlineGoldRankDto>(
    `xlive/general-interface/v1/rank/getOnlineGoldRank?ruid=${ruid}&roomId=${room_id}&page=1&pageSize=1`,
  );
}

/**
 * 用户信息
 */
export function getLiveInfo() {
  return liveApi.get<ApiBaseProp<{ room_id: number }>>(`xlive/web-ucenter/user/live_info`);
}
