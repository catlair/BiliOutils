import type { LiveHeartRuleId } from '@/types/LiveHeart';
import type { ApiBaseProp, DoubleMessageProp, PureDataProp } from './bili-base-prop';

/** 我的钱包 */
export type MyWalletDto = ApiBaseProp<{
  /** 金瓜子，现在为电池（数量需要除以 100，即显示 1000，实际为 10 电池） */
  gold: number;
  /** 银瓜子 */
  silver: number;
  /** b 币 */
  bp: string; // 数字字符串，如："0"
  /** 硬币数 */
  metal: number;
  need_use_new_bp: boolean;
  ios_bp: number; // n * 1000
  common_bp: number; // n * 1000
  new_bp: string; // 数字字符串，如："1"
  /** 可以兑换的电池数量 */
  bp_2_gold_amount: number; // 如果是普通 bp，则可以兑换的金瓜子数量 = bp * 1000，如果是 ios bp，则数量 = ios_bp * 700
}>;

/**
 * b币兑换金瓜子
 */
export type Bp2GoldDto = ApiBaseProp<{
  status: number; // 目前成功了返回了 2
  order_id: string; // 订单号
  gold: number; // 显示 gold，但未知，返回了 0
  bp: number; // 剩余b币数量 * 1000
}>;

export interface FansMedalDto {
  medal: {
    /** 自己的 id */
    uid: number;
    /** 粉丝拥有者的 id */
    target_id: number;
    target_name: '';
    medal_id: number;
    level: number;
    medal_name: string;
    medal_color: number;
    intimacy: number;
    next_intimacy: number;
    day_limit: number;
    today_feed: number;
    medal_color_start: number;
    medal_color_end: number;
    medal_color_border: number;
    is_lighted: number;
    guard_level: number;
    wearing_status: number;
    medal_icon_id: number;
    medal_icon_url: '';
  };
  anchor_info: {
    nick_name: string;
    avatar: string;
    verify: number;
  };
  superscript: null | {
    type: number;
    content: string;
  };
  room_info: {
    room_id: number;
    living_status: number;
    url: string;
  };
}

export interface FansMedalPanelDto extends ApiBaseProp {
  data: {
    list: FansMedalDto[];
    special_list: FansMedalDto[];
    bottom_bar: null;
    page_info: {
      number: number;
      current_page: number;
      has_more: boolean;
      next_page: number;
      next_light_status: number;
      total_page: number;
    };
    total_number: number;
    has_medal: number;
  };
}

/** 心跳返回数据 */
export interface LiveHeartEDto extends ApiBaseProp {
  data: {
    timestamp: number;
    heartbeat_interval: number;
    secret_key: string;
    secret_rule: LiveHeartRuleId;
    patch_status?: number;
    reason?: string[];
  };
}

export interface LiveFansMedalItem {
  can_deleted: boolean;
  day_limit: number;
  guard_level: number;
  guard_medal_title: string;
  intimacy: number;
  is_lighted: number;
  level: number;
  medal_name: string;
  medal_color_border: number;
  medal_color_end: number;
  medal_color_start: number;
  medal_id: number;
  next_intimacy: number;
  today_feed: number;
  roomid: number;
  status: number;
  target_id: number;
  target_name: string;
  uname: string;
}

/** 获取有牌子的 */
export interface LiveFansMedalDto extends PureDataProp {
  data: {
    count: number;
    items: LiveFansMedalItem[];
    page_info: {
      cur_page: number;
      total_page: number;
    };
  };
}

/** 获取直播间信息 */
export interface LiveRoomInfoDto extends DoubleMessageProp {
  data: {
    /** 被查询者的 mid */
    uid: number;
    room_id: number;
    short_id: number;
    attention: number;
    online: number;
    is_portrait: false;
    description: string;
    live_status: number;
    area_id: number;
    parent_area_id: number;
    parent_area_name: string;
    old_area_id: number;
    background: string;
    title: string;
    user_cover: string;
    keyframe: string;
    is_strict_room: false;
    live_time: string;
    tags: string;
    is_anchor: number;
    room_silent_type: string;
    room_silent_level: number;
    room_silent_second: number;
    area_name: string;
    pendants: string;
    area_pendants: string;
    hot_words: string[];
    hot_words_status: number;
    verify: string;
    new_pendants: Record<string, unknown>;
    up_session: string;
    pk_status: number;
    pk_id: number;
    battle_id: number;
    allow_change_area_time: number;
    allow_upload_cover_time: number;
    studio_info: {
      status: number;
      master_list: [];
    };
  };
}

export interface LiveAreaList {
  id: string;
  parent_id: string;
  parent_name: string;
  old_area_id: string;
  name: string;
  pinyin: string;
  act_id: string;
  hot_status: number;
  pk_status: string;
  lock_status: string;
  pic: string;
  area_type: number;
}

/**
 * 分区列表
 */
export interface LiveAreaDto extends ApiBaseProp {
  data: {
    data: {
      id: number;
      name: string;
      list: LiveAreaList[];
    }[];
  };
}

export interface LiveRoomList {
  roomid: number;
  uid: number;
  title: string;
  uname: string;
  pendant_info: {
    [key: number]: {
      /** 504 天选 1096 红包*/
      pendent_id: number;
      content: string;
      position: number;
      type: string;
      name: string;
    };
  };
}

/**
 * 直播间列表
 */
export interface LiveRoomDto extends ApiBaseProp {
  data: {
    banner: unknown[];
    new_tags: unknown[];
    list: LiveRoomList[];
    count: number;
    has_more: number;
    vajra: unknown;
  };
}

/**
 * 已经关注的主播列表
 */
export interface LiveFollowListDto extends ApiBaseProp {
  data: {
    title: string;
    pageSize: number;
    totalPage: number;
    list: LiveFollowDto[];
    count: number;
  };
}

export interface LiveFollowDto {
  roomid: number;
  uid: number;
  uname: string;
  title: string;
  face: string;
  /** 0 为未播 1 为在播 */
  live_status: 0 | 1;
  record_num: 0;
  recent_record_id: '';
  is_attention: 1;
  clipnum: 0;
  fans_num: 0;
  area_name: '';
  area_value: '';
  tags: '';
  recent_record_id_v2: '';
  record_num_v2: 0;
}

/**
 * 检查天选时刻状态（lottery）
 */
export interface LiveCheckLotteryDto {
  id: number;
  room_id: number;
  status: number;
  award_name: string;
  award_num: number;
  award_image: string;
  danmu: string;
  time: number;
  current_time: number;
  join_type: number;
  require_type: number;
  require_value: number;
  require_text: string;
  gift_id: number;
  gift_name: string;
  gift_num: number;
  gift_price: number;
  cur_gift_num: number;
  goaway_time: number;
  award_users: any[];
  show_panel: number;
  lot_status: number;
  send_gift_ensure: number;
  goods_id: number;
}
/**
 * 检查天选时刻状态（lottery）
 */
export interface LiveCheckLotteryRes extends DoubleMessageProp {
  data: LiveCheckLotteryDto;
}

/**
 * 天选时刻返回
 */
export interface JoinLotteryDto extends DoubleMessageProp {
  data: {
    discount_id: number;
    gold: number;
    silver: number;
    cur_gift_num: number;
    goods_id: number;
    new_order_id: string;
  };
}

export interface PopularityRedPocketDto {
  lot_id: number;
  sender_uid: number;
  sender_name: string;
  sender_face: string;
  /** 1 是关注 */
  join_requirement: string;
  danmu: string;
  awards: {
    gift_id: number;
    num: number;
    gift_name: string;
    gift_pic: string;
  }[];
  start_time: number;
  end_time: number;
  /** 总共持续时间 */
  last_time: 180;
  /** 删除红包时间 = end_time + 15 */
  remove_time: number;
  /** 替换红包时间 = end_time + 10 */
  replace_time: number;
  current_time: number;
  /** 1 有效，2 结束 */
  lot_status: number;
  h5_url: string;
  user_status: number;
  lot_config_id: number;
  total_price: number;
  /** 还有几个红包 */
  wait_num: number;
}

/**
 * 检查红包状态
 */
export interface LiveCheckRedRes extends ApiBaseProp {
  data: {
    pk: null;
    guard: null;
    gift: null;
    storm: null;
    silver: null;
    activity_box: {
      ACTIVITY_ID: number | null;
      ACTIVITY_PIC: string | null;
    };
    danmu: null;
    anchor: null;
    red_pocket: null;
    popularity_red_pocket: PopularityRedPocketDto[] | null;
    activity_box_info: null;
  };
}

/**
 * 抢红包响应
 */
export interface JoinRedPacketRes extends ApiBaseProp {
  data: {
    /** 1 是正确 */
    join_status: number;
  };
}

/**
 * 弹幕信息
 */
export type DanmuDto = ApiBaseProp<{
  group: string;
  business_id: number;
  refresh_row_factor: number;
  refresh_rate: number;
  max_delay: number;
  token: string;
  host_list: HostList[];
}>;

interface HostList {
  host: string;
  port: number;
  wss_port: number;
  ws_port: number;
}

export type OnlineGoldRankDto = ApiBaseProp<{
  onlineNum: number;
  OnlineRankItem: OnlineRankItem[];
  ownInfo: OwnInfo;
  tips_text: string;
  value_text: string;
}>;

interface OwnInfo {
  uid: number;
  name: string;
  face: string;
  rank: number;
  needScore: number;
  score: number;
  guard_level: number;
}

interface OnlineRankItem {
  userRank: number;
  uid: number;
  name: string;
  face: string;
  score: number;
  medalInfo: MedalInfo;
  guard_level: number;
}

interface MedalInfo {
  guardLevel: number;
  medalColorStart: number;
  medalColorEnd: number;
  medalColorBorder: number;
  medalName: string;
  level: number;
  targetId: number;
  isLight: number;
}

/**
 * 直播心跳
 */
export type LiveHeartBeatRes = ApiBaseProp<{
  /** 60 */
  heartbeat_interval: number;
  timestamp: number;
  secret_rule: [number, number, number, number, number];
  /** axoaadsffcazxksectbbb */
  secret_key: string;
}>;

export type RoomInfoDto = ApiBaseProp<{
  room_info: Roominfo;
  anchor_info: Anchorinfo;
  news_info: Newsinfo;
  rankdb_info: Rankdbinfo;
  area_rank_info: Arearankinfo;
  battle_rank_entry_info?: any;
  tab_info: Tabinfo;
  activity_init_info: Activityinitinfo;
  voice_join_info: Voicejoininfo;
  ad_banner_info: Adbannerinfo;
  skin_info: Skininfo;
  web_banner_info: Webbannerinfo;
  lol_info?: any;
  pk_info?: any;
  battle_info?: any;
  silent_room_info: Silentroominfo;
  switch_info: Switchinfo;
  record_switch_info?: any;
  room_config_info: Roomconfiginfo;
  gift_memory_info: Giftmemoryinfo;
  new_switch_info: Newswitchinfo;
  super_chat_info: Superchatinfo;
  online_gold_rank_info_v2: Onlinegoldrankinfov2;
  dm_brush_info: Dmbrushinfo;
  dm_emoticon_info: Dmemoticoninfo;
  dm_tag_info: Dmtaginfo;
  topic_info: Topicinfo;
  game_info: Gameinfo;
  watched_show: Watchedshow;
  topic_room_info: Topicroominfo;
  show_reserve_status: boolean;
  second_create_info: Secondcreateinfo;
  play_together_info?: any;
  cloud_game_info: Cloudgameinfo;
  like_info_v3: Likeinfov3;
  live_play_info: Liveplayinfo;
  multi_voice: Multivoice;
  popular_rank_info: Popularrankinfo;
  new_area_rank_info: Newarearankinfo;
  gift_star: Giftstar;
  progress_for_widget: Progressforwidget;
  revenue_demotion: Revenuedemotion;
  revenue_material_md5?: any;
  video_connection_info?: any;
  player_throttle_info: Playerthrottleinfo;
  guard_info: Guardinfo;
  hot_rank_info?: any;
}>;

interface Guardinfo {
  count: number;
  anchor_guard_achieve_level: number;
}

interface Playerthrottleinfo {
  status: number;
  normal_sleep_time: number;
  fullscreen_sleep_time: number;
  tab_sleep_time: number;
  prompt_time: number;
}

interface Revenuedemotion {
  global_gift_config_demotion: boolean;
}

interface Progressforwidget {
  gift_star_process: Giftstarprocess;
  wish_process?: any;
}

interface Giftstarprocess {
  task_info?: any;
  preload_timestamp: number;
  preload: boolean;
  preload_task_info?: any;
  widget_bg: string;
  jump_schema: string;
  ab_group: number;
}

interface Giftstar {
  show: boolean;
  display_widget_ab_group: number;
}

interface Newarearankinfo {
  items?: any;
  rotation_cycle_time_web: number;
}

interface Popularrankinfo {
  rank: number;
  countdown: number;
  timestamp: number;
  url: string;
  on_rank_name: string;
  rank_name: string;
}

interface Multivoice {
  switch_status: number;
  members: any[];
  mv_role: number;
  seat_type: number;
  invoking_time: number;
  version: number;
  pk?: any;
  biz_session_id: string;
  mode_details?: any;
  hat_list?: any;
}

interface Liveplayinfo {
  show_widget_banner: boolean;
  show_left_entry: boolean;
}

interface Likeinfov3 {
  total_likes: number;
  click_block: boolean;
  count_block: boolean;
  guild_emo_text: string;
  guild_dm_text: string;
  like_dm_text: string;
  hand_icons: string[];
  dm_icons: string[];
  eggshells_icon: string;
  count_show_time: number;
  process_icon: string;
  process_color: string;
}

interface Cloudgameinfo {
  is_gaming: number;
}

interface Secondcreateinfo {
  click_permission: number;
  common_permission: number;
  icon_name: string;
  icon_url: string;
  url: string;
}

interface Topicroominfo {
  interactive_h5_url: string;
  watermark: number;
}

interface Watchedshow {
  switch: boolean;
  num: number;
  text_small: string;
  text_large: string;
  icon: string;
  icon_location: number;
  icon_web: string;
}

interface Gameinfo {
  game_status: number;
}

interface Topicinfo {
  topic_id: number;
  topic_name: string;
}

interface Dmtaginfo {
  dm_tag: number;
  platform: any[];
  extra: string;
  dm_chronos_extra: string;
  dm_mode: any[];
  dm_setting_switch: number;
  material_conf?: any;
}

interface Dmemoticoninfo {
  is_open_emoticon: number;
  is_shield_emoticon: number;
}

interface Dmbrushinfo {
  min_time: number;
  brush_count: number;
  slice_count: number;
  storage_time: number;
}

interface Onlinegoldrankinfov2 {
  list: List2[];
}

interface List2 {
  uid: number;
  face: string;
  uname: string;
  score: string;
  rank: number;
  guard_level: number;
  wealth_level: number;
}

interface Superchatinfo {
  status: number;
  jump_url: string;
  icon: string;
  ranked_mark: number;
  message_list: any[];
}

interface Newswitchinfo {
  'room-socket': number;
  'room-prop-send': number;
  'room-sailing': number;
  'room-info-popularity': number;
  'room-danmaku-editor': number;
  'room-effect': number;
  'room-fans_medal': number;
  'room-report': number;
  'room-feedback': number;
  'room-player-watermark': number;
  'room-recommend-live_off': number;
  'room-activity': number;
  'room-web_banner': number;
  'room-silver_seeds-box': number;
  'room-wishing_bottle': number;
  'room-board': number;
  'room-supplication': number;
  'room-hour_rank': number;
  'room-week_rank': number;
  'room-anchor_rank': number;
  'room-info-integral': number;
  'room-super-chat': number;
  'room-tab': number;
  'room-hot-rank': number;
  'fans-medal-progress': number;
  'gift-bay-screen': number;
  'room-enter': number;
  'room-my-idol': number;
  'room-topic': number;
  'fans-club': number;
  'room-popular-rank': number;
  mic_user_gift: number;
  'new-room-area-rank': number;
  wealth_medal: number;
  bubble: number;
  title: number;
}

interface Giftmemoryinfo {
  list?: any;
}

interface Roomconfiginfo {
  dm_text: string;
}

interface Switchinfo {
  close_guard: boolean;
  close_gift: boolean;
  close_online: boolean;
  close_danmaku: boolean;
}

interface Silentroominfo {
  type: string;
  level: number;
  second: number;
  expire_time: number;
}

interface Webbannerinfo {
  id: number;
  title: string;
  left: string;
  right: string;
  jump_url: string;
  bg_color: string;
  hover_color: string;
  text_bg_color: string;
  text_hover_color: string;
  link_text: string;
  link_color: string;
  input_color: string;
  input_text_color: string;
  input_hover_color: string;
  input_border_color: string;
  input_search_color: string;
}

interface Skininfo {
  id: number;
  skin_name: string;
  skin_config: string;
  show_text: string;
  skin_url: string;
  start_time: number;
  end_time: number;
  current_time: number;
}

interface Adbannerinfo {
  data?: any;
}

interface Voicejoininfo {
  status: Status;
  icons: Icons;
  web_share_link: string;
}

interface Icons {
  icon_close: string;
  icon_open: string;
  icon_wait: string;
  icon_starting: string;
}

interface Status {
  open: number;
  anchor_open: number;
  status: number;
  uid: number;
  user_name: string;
  head_pic: string;
  guard: number;
  start_at: number;
  current_time: number;
}

interface Activityinitinfo {
  eventList: any[];
  weekInfo: WeekInfo;
  giftName?: any;
  lego: Lego;
}

interface Lego {
  timestamp: number;
  config: string;
}

interface WeekInfo {
  bannerInfo?: any;
  giftName?: any;
}

interface Tabinfo {
  list: List[];
}

interface List {
  type: string;
  desc: string;
  isFirst: number;
  isEvent: number;
  eventType: string;
  listType: string;
  apiPrefix: string;
  rank_name: string;
}

interface Arearankinfo {
  areaRank: AreaRank;
  liveRank: LiveRank;
}

interface LiveRank {
  rank: string;
}

interface AreaRank {
  index: number;
  rank: string;
}

interface Rankdbinfo {
  roomid: number;
  rank_desc: string;
  color: string;
  h5_url: string;
  web_url: string;
  timestamp: number;
}

interface Newsinfo {
  uid: number;
  ctime: string;
  content: string;
}

interface Anchorinfo {
  base_info: Baseinfo;
  live_info: Liveinfo;
  relation_info: Relationinfo;
  medal_info: Medalinfo;
  gift_info: Giftinfo;
}

interface Giftinfo {
  price: number;
  price_update_time: number;
}

interface Medalinfo {
  medal_name: string;
  medal_id: number;
  fansclub: number;
}

interface Relationinfo {
  attention: number;
}

interface Liveinfo {
  level: number;
  level_color: number;
  score: number;
  upgrade_score: number;
  current: number[];
  next: any[];
  rank: string;
}

interface Baseinfo {
  uname: string;
  face: string;
  gender: string;
  official_info: Officialinfo;
}

interface Officialinfo {
  role: number;
  title: string;
  desc: string;
  is_nft: number;
  nft_dmark: string;
}

export interface Roominfo {
  uid: number;
  room_id: number;
  short_id: number;
  title: string;
  cover: string;
  tags: string;
  background: string;
  description: string;
  live_status: number;
  live_start_time: number;
  live_screen_type: number;
  lock_status: number;
  lock_time: number;
  hidden_status: number;
  hidden_time: number;
  area_id: number;
  area_name: string;
  parent_area_id: number;
  parent_area_name: string;
  keyframe: string;
  special_type: number;
  up_session: string;
  pk_status: number;
  is_studio: boolean;
  pendants: Pendants;
  on_voice_join: number;
  online: number;
  room_type: Roomtype;
  sub_session_key: string;
  live_id: number;
  live_id_str: string;
  official_room_id: number;
  official_room_info?: any;
  voice_background: string;
}

interface Roomtype {
  '2-3': number;
  '3-21': number;
}

interface Pendants {
  frame: Frame;
}

interface Frame {
  name: string;
  value: string;
  desc: string;
}
