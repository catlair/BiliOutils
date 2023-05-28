import type { AccountBaseProp, ApiBaseProp } from './bili-base-prop';

/** 硬币数量 */
export interface CoinBalanceDto extends AccountBaseProp {
  data: { money: number };
}

/** 关注列表 */
export interface TagsFollowingsDto extends ApiBaseProp {
  data: {
    mid: number;
    attribute: number;
    tag: number;
    special: number;
    uname: string;
    sign: string;
    official_verify: {
      type: number;
      desc: string;
    };
    vip: unknown;
    live: {
      live_status: number;
      jump_url: string;
    };
  }[];
}

/** 关注列表 */
export interface FollowingsDto extends ApiBaseProp {
  data: {
    total: number;
    re_version: number;
    list: {
      mid: number;
      attribute: number;
      mtime: number;
      tag: string;
      special: number;
      uname: string;
      sign: string;
      official_verify: {
        type: number;
        desc: string;
      };
      vip: unknown;
    }[];
  };
}

/** 获取指定up主的视频 */
export interface VideosByUpIdDto extends ApiBaseProp {
  data: {
    media_list: Array<{
      id: number;
      page: number;
      title: string;
      type: number;
      link: number;
      bv_id: number;
      short_link: number;
      coin: {
        max_num: 1 | 2;
        coin_number: 0 | 1 | 2;
      };
    }>;
    has_more: boolean;
    total_count: number;
  };
}

/** 用户信息 */
export type UserInfoNavDto = ApiBaseProp<{
  isLogin: boolean;
  email_verified: number;
  face: string;
  face_nft: number;
  face_nft_type: number;
  level_info: {
    current_level: number;
    current_min: number;
    current_exp: number;
    next_exp: string | number;
  };
  mid: number;
  mobile_verified: number;
  money: number;
  moral: number;
  official: {
    role: number;
    title: string;
    desc: string;
    type: number;
  };
  officialVerify: {
    type: number;
    desc: string;
  };
  pendant: {
    pid: number;
    name: string;
    image: string;
    expire: number;
    image_enhance: string;
    image_enhance_frame: string;
  };
  scores: number;
  uname: string;
  /** 会员到期时间 */
  vipDueDate: number;
  /** 0无 1有 */
  vipStatus: 0 | 1;
  /** 0:无 1:月度 2:年度及以上 */
  vipType: 0 | 1 | 2;
  vip_pay_type: number;
  vip_theme_type: number;
  vip_label: Viplabel;
  vip_avatar_subscript: number;
  vip_nickname_color: string;
  vip: {
    type: number;
    status: number;
    due_date: number;
    vip_pay_type: number;
    theme_type: number;
    label: Viplabel;
    avatar_subscript: number;
    nickname_color: string;
    role: number;
    avatar_subscript_url: string;
    tv_vip_status: number;
    tv_vip_pay_type: number;
    tv_due_date: number;
  };
  wallet: {
    mid: number;
    /** b 币数量（包含券） */
    bcoin_balance: number;
    /** b 币券数量 */
    coupon_balance: number;
    coupon_due_time: number;
  };
  has_shop: boolean;
  shop_url: string;
  allowance_count: number;
  answer_status: number;
  is_senior_member: number;
  wbi_img: Wbiimg;
  is_jury: boolean;
}>;

interface Viplabel {
  path: string;
  text: string;
  label_theme: string;
  text_color: string;
  bg_style: number;
  bg_color: string;
  border_color: string;
  use_img_label: boolean;
  img_label_uri_hans: string;
  img_label_uri_hant: string;
  img_label_uri_hans_static: string;
  img_label_uri_hant_static: string;
}
export interface Wbiimg {
  img_url: string;
  sub_url: string;
}

/** 每日任务完成情况 */
export interface RewardDto extends ApiBaseProp {
  data: {
    login: boolean;
    watch: boolean;
    coins: number;
    share: boolean;
    email: boolean;
    tel: boolean;
    safe_question: boolean;
    identify_card: boolean;
  };
}

/** 获取投币获得的经验 */
export interface CoinTodayExpDto extends ApiBaseProp {
  data: number;
}

/** 获取硬币历史记录 */
export type CoinHistoryDto = ApiBaseProp<{
  list: {
    time: string;
    delta: number;
    reason: string;
  }[];
}>;

export interface OtherUserDto extends ApiBaseProp {
  data: {
    mid: number;
    name: string;
    sex: string;
    face: string;
    sign: string;
    rank: number;
    level: number;
    jointime: number;
    moral: number;
    silence: number;
    coins: number;
    fans_badge: true;
    fans_medal: { show: false; wear: false; medal: null };
    official: { role: number; title: string; desc: string; type: number };
    vip: {
      type: number;
      status: number;
      due_date: number;
      vip_pay_type: number;
      theme_type: number;
      label: {
        path: string;
        text: string;
        label_theme: string;
        text_color: string;
        bg_style: number;
        bg_color: string;
        border_color: string;
      };
      avatar_subscript: number;
      nickname_color: string;
      role: number;
      avatar_subscript_url: string;
    };
    pendant: {
      pid: number;
      name: string;
      image: string;
      expire: number;
      image_enhance: string;
      image_enhance_frame: string;
    };
    nameplate: {
      nid: number;
      name: string;
      image: string;
      image_small: string;
      level: string;
      condition: string;
    };
    user_honour_info: { mid: number; colour: null; tags: [] };
    is_followed: boolean;
    top_photo: string;
    theme: Record<string, unknown>;
    sys_notice: Record<string, unknown>;
    live_room: {
      /** 0 未知 1 存在 */
      roomStatus: number;
      /** 0 未直播 1 直播中 */
      liveStatus: number;
      url: string;
      title: string;
      cover: string;
      online: number;
      roomid: number;
      roundStatus: number;
      broadcast_type: number;
    };
    birthday: string;
    school: { name: string };
    profession: { name: string };
    tags: [string];
    series: { user_upgrade_status: number; show_upgrade_window: false };
  };
}

/**
 * 创建 Tag 的返回值
 */
export interface CreateTagDto extends ApiBaseProp {
  /** 0 成功 22106 已存在 */
  code: number;
  data: { tagid: number };
}

/**
 * 分组列表
 */
export interface TagListDto extends ApiBaseProp {
  data: { tagid: number; name: string; count: number; tip: string }[];
}
