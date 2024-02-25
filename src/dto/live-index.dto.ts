import type { ApiBaseProp } from './bili-base-prop';

export type LiveIndexList = ApiBaseProp<{
  area_entrance_v2: Areaentrancev2;
  room_list: Roomlist[];
  activity_card_v2?: any;
  recommend_room_list: Recommendroomlist[];
  banner: Banner[];
}>;

export interface Banner {
  id: number;
  title: string;
  location: string;
  position: number;
  pic: string;
  link: string;
  weight: number;
  room_id: number;
  up_id: number;
  parent_area_id: number;
  area_id: number;
  live_status: number;
  av_id: number;
  is_ad: boolean;
  ad_transparent_content?: Adtransparentcontent;
  show_ad_icon: boolean;
}

export interface Adtransparentcontent {
  request_id: string;
  source_id: number;
  resource_id: number;
  is_ad_loc: boolean;
  server_type: number;
  client_ip: string;
  index: number;
  src_id: number;
}

export interface Recommendroomlist {
  area_v2_id: number;
  area_v2_parent_id: number;
  area_v2_name: string;
  area_v2_parent_name: string;
  cover: string;
  link: string;
  online: number;
  roomid: number;
  title: string;
  uname: string;
  face: string;
  rec_status: number;
  show_callback: string;
  click_callback: string;
  session_id: string;
  group_id: number;
  special_id: number;
  pk_id: number;
  up_id: number;
  new_switch_info: Newswitchinfo;
  watched_show: Watchedshow;
  is_ad: boolean;
  ad_transparent_content?: any;
  show_ad_icon: boolean;
  mid: number;
}

export interface Newswitchinfo {
  'room-recommend-live_off': number;
  'room-player-watermark': number;
}

export interface Roomlist {
  module_info: Moduleinfo;
  list: LiveIndexRoomItem[];
  extra?: Extra;
}

export interface Extra {
  follow_AB: number;
  follow_Online: number;
}

export interface LiveIndexRoomItem {
  head_box?: (Headbox | null)[];
  area_v2_id: number;
  area_v2_parent_id: number;
  area_v2_name: string;
  area_v2_parent_name: string;
  broadcast_type: number;
  cover: string;
  link: string;
  online: number;
  pendant_Info: PendantInfo;
  roomid: number;
  title: string;
  uname: string;
  face: string;
  verify: Verify;
  uid: number;
  keyframe: string;
  is_auto_play: number;
  head_box_type: number;
  flag: number;
  session_id: string;
  group_id: number;
  show_callback: string;
  click_callback: string;
  special_id: number;
  watched_show: Watchedshow;
  is_nft: number;
  nft_dmark: string;
  is_ad: boolean;
  ad_transparent_content?: any;
  show_ad_icon: boolean;
  status: boolean;
  followers: number;
}

export interface Watchedshow {
  switch: boolean;
  num: number;
  text_small: string;
  text_large: string;
  icon: string;
  icon_location: number;
  icon_web: string;
}

export interface Verify {
  role: number;
  desc: string;
  type: number;
}

export interface PendantInfo {
  '1'?: _1;
  '2'?: _1;
}

export interface _1 {
  type: string;
  name: string;
  position: number;
  text: string;
  bg_color: string;
  bg_pic: string;
  pendant_id: number;
  priority: number;
  created_at: number;
}

export interface Headbox {
  name: string;
  value: string;
  desc: string;
}

export interface Moduleinfo {
  id: number;
  link: string;
  pic: string;
  title: string;
  type: number;
  sort: number;
  count: number;
}

export interface Areaentrancev2 {
  list: List[];
}

export interface List {
  id: number;
  link: string;
  pic: string;
  title: string;
  area_v2_id: number;
  area_v2_parent_id: number;
  tag_type: number;
  is_hot: number;
}
