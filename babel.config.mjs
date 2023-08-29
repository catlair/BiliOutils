import { baseConfig } from './build/babel.base.mjs';

export default function (api) {
  api.cache(true);
  return baseConfig();
}
