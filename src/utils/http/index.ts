export { defHttp, defHttpWithoutProxy } from '../got';

export * from '../got/bili';

export function createAgent(proxy: string) {
  const { hostname, port, username, password } = new URL(proxy);
  return {
    https: require('tunnel').httpsOverHttp({
      proxy: {
        host: hostname,
        port: Number(port),
        proxyAuth: username + ':' + password,
      },
    }),
  };
}
