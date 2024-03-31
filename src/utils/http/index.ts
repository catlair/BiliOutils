import { HttpsProxyAgent } from 'hpagent';
export { defHttp, defHttpWithoutProxy } from '../got';

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
