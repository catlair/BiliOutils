import type { ApiBaseProp } from '@/dto/bili-base-prop';

/**
 * 任务进程
 */
export type UserTaskProgress = ApiBaseProp<{
  is_surplus: number;
  progress: number;
  /** old: 0 未开始 1 进行中 2 可领取 3 已领取  */
  status: number;
  target: number;
  wallet: Wallet;
  linked_actions_progress?: any;
  week_task?: any;
  week_total: number;
  week_group: number;
  day_task?: any;
  anchor_task?: any;
  task_list: Tasklist[];
  task_id: number;
  count_down: number;
}>;

export interface Tasklist {
  task_id: number;
  type: number;
  goal_type: number;
  target: number;
  task_title: string;
  title_param: string[];
  task_sub_title: string;
  sub_title_param?: any;
  total_reward: number;
  received_reward: number;
  reward_type: number;
  rules: string;
  priority: number;
  progress: number;
  /** 0 未开始 1 进行中 2 可领取 3 已领取  */
  status: number;
  schema_dst: number;
  /** 去发弹幕 去看看 */
  btn_text: string;
  finished_text: string;
  finished_sub_text: string;
  num: number;
  available: number;
}

interface Wallet {
  gold: number;
  silver: number;
}

export type TaskLandingRoom = ApiBaseProp<{
  room_id: number;
  title: string;
  cover: string;
  link: string;
  session_id: string;
  group_id: number;
  show_callback: string;
  click_callback: string;
  broadcast_type: number;
  accept_quality: number[];
  current_qn: number;
  current_quality: number;
  play_url: string;
  play_url_h265: string;
  quality_description: Qualitydescription[];
  play_url_card: string;
  p2p_type: number;
  uid: number;
  uname: string;
  face: string;
  head_box?: any;
  verify: Verify;
  app_background: string;
  is_nft: number;
  nft_dmark: string;
}>;

interface Verify {
  role: number;
  title: string;
}

interface Qualitydescription {
  qn: number;
  desc: string;
}

export type RecList = ApiBaseProp<{
  list: List[];
  has_more: number;
  room_cache_limit: number;
  load_trigger: number;
  cycle_rounds: number;
  min_trigger_time: number;
  max_trigger_time: number;
  is_need_refresh: number;
  need_show_guide: number;
  guide_duration: number;
}>;

interface List {
  room_id: number;
  title: string;
  cover: string;
  link: string;
  session_id: string;
  group_id: number;
  show_callback: string;
  click_callback: string;
  broadcast_type: number;
  accept_quality: number[];
  current_qn: number;
  current_quality: number;
  play_url: string;
  play_url_h265: string;
  quality_description: Qualitydescription[];
  play_url_card: string;
  p2p_type: number;
  uid: number;
  uname: string;
  face: string;
  head_box?: Headbox;
  verify: Verify;
  app_background: string;
  is_nft: number;
  nft_dmark: string;
}

interface Verify {
  role: number;
  title: string;
}

interface Headbox {
  name: string;
  value: string;
  desc: string;
}

interface Qualitydescription {
  qn: number;
  desc: string;
}
