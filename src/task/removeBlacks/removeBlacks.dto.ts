import type { ApiBaseProp } from '@/dto/bili-base-prop';

export type BlacksDto = ApiBaseProp<{
  list: List[];
  re_version: number;
  total: number;
}>;

interface List {
  mid: number;
  attribute: number;
  mtime: number;
  tag?: any;
  special: number;
  uname: string;
  face: string;
  sign: string;
  face_nft: number;
  official_verify: Officialverify;
  vip: Vip;
  nft_icon: string;
  rec_reason: string;
  track_id: string;
}

interface Vip {
  vipType: number;
  vipDueDate: number;
  dueRemark: string;
  accessStatus: number;
  vipStatus: number;
  vipStatusWarn: string;
  themeType: number;
  label: Label;
  avatar_subscript: number;
  nickname_color: string;
  avatar_subscript_url: string;
}

interface Label {
  path: string;
  text: string;
  label_theme: string;
  text_color: string;
  bg_style: number;
  bg_color: string;
  border_color: string;
}

interface Officialverify {
  type: number;
  desc: string;
}
