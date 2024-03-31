import { HttpsProxyAgent } from 'hpagent';
import { defHttp } from '../got';
export { defHttp };

export * from '../got/bili';

export function createAgent(proxy: string) {
  return {
    https: new HttpsProxyAgent({
      maxSockets: 256,
      scheduling: 'lifo',
      proxy,
    }),
  };
}
