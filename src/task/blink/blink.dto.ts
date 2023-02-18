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

export type ReceiveRewardRecord = ApiBaseProp<{
  rewardRecord: RewardRecord[];
  totalPage: number;
}>;

/** 奖励类型 1 奖励金 3 曝光量 */
type RewardType = 1 | 3;
/** 是否完成 0 未完成 1 完成 */
type FinishType = 0 | 1;

interface RewardRecord {
  /** eg: 2022-12-28 20:13:47 */
  date: string;
  /** 奖励类型 1 奖励金 3 曝光量 */
  rewardType: RewardType;
  /** type 1：n\*1000 3：n\*150 */
  rewardNum: number;
  /** 1 领取成功 3 审核中 */
  rewardStatus: 1 | 3;
  speText: '';
}

export type ReceiveReward = ApiBaseProp<{
  /** 0 */
  status: number;
  /** '' */
  msg: string;
}>;

export type AnchorTaskCenter = ApiBaseProp<{
  taskGroups: TaskGroup[];
  /** 未领取金仓鼠数量 */
  noReceiveHamsterNum: number;
  noReceiveStarNum: number;
  noReceiveRealTimeStarNum: number;
  noReceiveRedPacketNum: number;
  functionSwitch: number;
  styleType: number;
  /** 未完成任务 */
  notFinishReward: RewardInfo;
}>;

interface TaskGroup {
  /**
   * 2081 天天开播领奖励
   * 2087 今日任务
   * 2061 限时|周任务
   * 426 新手任务
   */
  taskGroupId: 426 | 2061 | 2087 | 2081;
  title: string;
  weight: number;
  taskGroupBiz: number;
  isFinish: FinishType;
  peopleTaskId: number;
  taskInfo: TaskInfo[];
  weekTaskInfo: WeekTaskInfo | null;
}

interface WeekTaskInfo {
  weekDateDetail: DateDetail;
  weekStepTask: WeekStepTask;
  weekDailyTask: WeekDailyTask;
  weekContinuousTask?: any;
}

interface WeekDailyTask {
  taskId: number;
  weight: number;
  title: string;
  isFinished: FinishType;
  taskRemark: string;
  subTaskLevelInfo: SubTaskLevelInfo2[];
  dateDetail: DateDetail;
  touchTask: TouchTask;
  actionGuide: any[];
}

interface SubTaskLevelInfo2 {
  isFinished: FinishType;
  subTaskLevel: number;
  subTaskInfo: SubTaskInfo[];
  rewardInfo: any[];
}

interface WeekStepTask {
  taskId: number;
  weight: number;
  title: string;
  isFinished: FinishType;
  taskRemark: string;
  describe: string;
  stepSubTask: StepSubTask[];
}

interface StepSubTask {
  subTaskId: number;
  subTaskType: number;
  isFinished: FinishType;
  subTaskLevel: number;
  /** 目标数量 电池是 100 为单位 */
  targetNum: number;
  /** 当前数量 */
  currentNum: number;
  rewardInfo: RewardInfo[];
}

interface TaskInfo {
  taskId: number;
  weight: number;
  title: string;
  isFinished: FinishType;
  taskRemark: string;
  subTaskLevelInfo: SubTaskLevelInfo[];
  dateDetail: DateDetail;
  touchTask: TouchTask;
  actionGuide: any[];
}

interface TouchTask {
  content: string;
  protocol: string;
  buttonName: string;
}

interface DateDetail {
  startTime: number;
  endTime: number;
  showType: number;
}

interface SubTaskLevelInfo {
  isFinished: FinishType;
  subTaskLevel: number;
  subTaskInfo: SubTaskInfo[];
  rewardInfo: RewardInfo[];
}

interface RewardInfo {
  /** 奖励类型 */
  rewardType: RewardType;
  rewardNum: number;
  /** eg: 金仓鼠 */
  rewardName: string;
  /** 是超级奖励吗（显示一个更大的图片） */
  isSpuer: boolean;
}

interface SubTaskInfo {
  subTaskId: number;
  subTaskType: number;
  targetNum: number;
  currentNum: number;
  videoPcUrl: string;
  videoMobileUrl: string;
  coverImg: string;
  h5Text: string;
  actionProtocol: ActionProtocol;
}

interface ActionProtocol {
  content: string;
  protocol: string;
  protocolId: number;
  protocolName: string;
}
