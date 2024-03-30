import { defHttp } from '../got';
export { defHttp };

export * from '../got/bili';

export async function createAgent(proxy: string) {
  const { HttpsProxyAgent } = await import('hpagent');

  return {
    https: new HttpsProxyAgent({
      maxSockets: 256,
      scheduling: 'lifo',
      proxy,
    }),
  };
}
