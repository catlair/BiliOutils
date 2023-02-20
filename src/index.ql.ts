import type { ConfigArray } from './types/config';
import { config, runTask, waitForArgs } from './util';
import { getArg, isArg } from './utils/args';

process.env.IS_QING_LONG = 'true';

(async () => {
  let configs: ConfigArray | undefined;
  await waitForArgs();
  if (isArg('config')) {
    configs = await config();
  }
  const taskArg = getArg('task');
  if (taskArg) {
    return await runTask(configs, './bin/inputTask', taskArg);
  }
  if (!configs) return;
  return await runTask(configs);
})();
