import type { SCFContext, SCFEvent } from './types/scf';
import { JSON5 } from './utils/json5';

export async function main_handler(event: SCFEvent, context: SCFContext) {
  try {
    return await main(event, context);
  } catch (error) {
    const { sendMessage } = await import('@/utils/sendNotify');
    await sendMessage('bilioutils 未知错误', error.message);
  }
}

async function main(event: SCFEvent, context: SCFContext) {
  const { dailyHandler } = await import('./utils/serverless');
  dailyHandler.init({
    event,
    context,
    slsType: 'scf',
  });
  let isReturn = false;
  if (event.Message) {
    isReturn = await runTasks(event.Message);
  }
  if (isReturn) return 'success';
  return await dailyHandler.run();
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
