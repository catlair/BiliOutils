import type { FCCallback, FCContext, FCEvent } from './types/fc';
import { JSON5 } from './utils/json5';

export async function handler(event: Buffer, context: FCContext, callback: FCCallback) {
  try {
    await main(event, context, callback);
  } catch (error) {
    const { sendMessage } = await import('@/utils/sendNotify');
    await sendMessage('bilioutils 未知错误', error.message);
  }
}

async function main(event: Buffer, context: FCContext, callback: FCCallback) {
  try {
    const eventJson: FCEvent = JSON5.parse(event.toString());
    const { dailyHandler } = await import('./utils/serverless');
    dailyHandler.init({
      event: eventJson,
      context,
      slsType: 'fc',
    });
    let isReturn = false;
    if (eventJson.payload) {
      isReturn = await runTasks(eventJson.payload);
    }
    if (isReturn) {
      callback(null, 'success');
      return;
    }
    const message = await dailyHandler.run();
    callback(null, message);
  } catch (error) {
    callback(error);
  }
}

export async function runTasks(payload: string) {
  try {
    const { runInputBiliTask } = await import('./task');
    const payloadJson = JSON5.parse(payload);
    if (payloadJson.task) {
      await runInputBiliTask(payloadJson.task);
      return true;
    }
  } catch {}
  return false;
}
