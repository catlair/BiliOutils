export interface RedPacketController {
  code: number;
  message: string;
  data: {
    list: {
      lotId: string;
      ruid: string;
      roomId: string;
      runame: string;
      face: string;
      countDown: number;
    }[];
  };
  errors: Record<string, unknown>;
}

export interface RedPackListDto {
  lot_id: number;
  total_num: number;
  winner_info: [number, string, number, number][];
  awards: Awards;
  version: number;
}

type Awards = Record<number, AwardType>;

interface AwardType {
  award_type: number;
  award_name: string;
  award_pic: string;
  award_big_pic: string;
  award_price: number;
}

export interface PacketBody<T = any> {
  cmd: string;
  data: T;
}
