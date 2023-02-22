import type { ApiBaseProp } from '@/dto/bili-base-prop';

export type WebUpStreamAddr = ApiBaseProp<{
  addr: WebUpStreamAddrAddr;
  line: WebUpStreamAddrLine[];
  srt_addr: WebUpStreamAddrAddr;
}>;

interface WebUpStreamAddrLine {
  cdn_name: string;
  line_name: string;
  src: number;
  checked: number;
}

export interface WebUpStreamAddrAddr {
  addr: string;
  code: string;
}

export type StartLive = ApiBaseProp<{
  change: 1;
  status: 'LIVE';
  try_time: string;
  room_type: number;
  live_key: string;
  /** live_key + sub_time: + 时间戳秒 */
  sub_session_key: string;
  rtmp: Rtmp;
  protocols: Protocol[];
  notice: Notice;
  qr: '';
  need_face_auth: boolean;
  service_source: 'room-service';
}>;

interface Notice {
  type: number;
  status: number;
  title: string;
  msg: string;
  button_text: string;
  button_url: string;
}

interface Protocol {
  protocol: string;
  addr: string;
  code: string;
  new_link: string;
  provider: string;
}

interface Rtmp {
  addr: string;
  code: string;
  new_link: string;
  provider: 'live';
}
