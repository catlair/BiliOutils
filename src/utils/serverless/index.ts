import type { FCContext, FCEvent } from '@/types/fc';
import type { SCFContext, SCFEvent, SLSType } from '@/types';
import type { SlSOptions } from '@/types/sls';
import { getPRCDate } from '../pure';
import { dailyTasks } from '~/dailyTask';
import { JSON5 } from '../json5';

interface Params {
  event: FCEvent | SCFEvent;
  context: FCContext | SCFContext;
  slsType: SLSType;
}

function getPayload(slsType: SLSType, event: Params['event']) {
  return slsType === 'scf' ? (event as SCFEvent).Message : (event as FCEvent).payload;
}

export async function getUpdateTrigger(
  slsType: SLSType,
  event: any,
): Promise<(slsOptions?: SlSOptions) => Promise<boolean>> {
  const caller =
    slsType === 'scf'
      ? (await import('./updateScfTrigger')).default
      : (await import('./updateFcTrigger')).default;
  return slsOptions => caller(event, slsOptions);
}

export async function getClinet<T extends SLSType>(slsType: T) {
  if (slsType === 'scf') {
    return (await import('./updateScfTrigger')).scfClient;
  }
  return (await import('./updateFcTrigger')).fcClient;
}

async function initClient(slsType: SLSType, context: SCFContext | FCContext) {
  const client = await getClinet(slsType);
  if (!client) {
    return false;
  }
  return client.init(context as any);
}

class DailyHandler {
  event: FCEvent | SCFEvent;
  context: SCFContext | FCContext;
  slsType: SLSType;
  payload?: string;
  initialized = false;

  init({ event, context, slsType }: Params) {
    if (!this.needInit()) return;

    this.context = context;
    this.event = event;
    this.slsType = slsType;
    this.payload = getPayload(slsType, event);

    initClient(slsType, context);
    this.initialized = true;

    return this;
  }

  needInit() {
    const ENV_KEYS = ['ALI_SECRET_ID', 'ALI_SECRET_KEY', 'TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY'];
    return ENV_KEYS.some(key => process.env[key]);
  }

  async run() {
    if (!this.initialized) {
      return await dailyTasks();
    }

    let message: { lastTime: string };
    try {
      if (this.payload) {
        message = JSON5.parse(this.payload);
      }
    } catch {}

    if (message! && message.lastTime === getPRCDate().getDate().toString()) {
      return '今日重复执行';
    }

    const updateTrigger = await getUpdateTrigger(this.slsType, this.event);
    return await dailyTasks(updateTrigger);
  }
}

export const dailyHandler = new DailyHandler();
