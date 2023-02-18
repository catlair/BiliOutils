import type { ApiBaseProp } from '@/dto/bili-base-prop';

/** 直播礼物背包列表 */
export interface LiveGiftBagListDto extends ApiBaseProp {
  data: {
    list: {
      bag_id: number;
      /** 1 辣条 30607 小星星 */
      gift_id: number;
      gift_name: string;
      gift_num: number;
      gift_type: number;
      /** 到期时间 unix 时间戳 */
      expire_at: number;
      /** 还剩时间 eg：1天 */
      corner_mark: string;
      corner_color: string;
      count_map: { num: number; text: string }[];
      bind_roomid: number;
      bind_room_text: string;
      type: number;
      // card_image: string;
      // card_gif: string;
      // card_id: number;
      // card_record_id: number;
      // is_show_send: boolean;
    }[];
    time: string;
  };
}

/** 赠送礼物后的响应 */
export interface BagSendResDto extends ApiBaseProp {
  data: {
    uid: number;
    uname: string;
    guard_level: number;
    ruid: number;
    room_id: number;
    rcost: number;
    total_coin: number;
    pay_coin: number;
    blow_switch: number;
    send_tips: string;
    discount_id: number;
    send_master: null;
    button_combo_type: number;
    send_gift_countdown: number;
    blind_gift: null;
    fulltext: '';
    crit_prob: number;
    price: number;
    left_num: number;
    need_num: number;
    available_num: number;
    bp_cent_balance: number;
    gift_list: [
      {
        tid: string;
        gift_id: number;
        gift_type: number;
        gift_name: string;
        gift_num: number;
        gift_action: string;
        /** 赠送礼物的价格，（金瓜子？） */
        gift_price: number;
        coin_type: string;
        tag_image: string;
        effect_block: number;
      },
    ];
    send_id: string;
  };
}
