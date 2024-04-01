import type { ConfigArray } from './types';
import { config, getConfigByItem, runTask, waitForArgs } from './util';
import { getArg, isArg } from './utils/args';

process.env.IS_QING_LONG = 'true';

(async () => {
  let configs: ConfigArray | undefined;
  await waitForArgs();
  if (isArg('config')) {
    configs = await config();
    if (!configs) {
      return;
    }
    return await runTask(configs);
  } else {
    const { getConfig } = await import('./config/utils');
    configs = getConfig(true);
    const itemArg = getArg('item');
    if (itemArg) {
      configs = getConfigByItem(configs, itemArg);
    }
  }
  const taskArg = getArg('task');
  if (taskArg) {
    return await runTask(configs, './bin/inputTask', taskArg);
  }
  return await runTask(configs);
})();
