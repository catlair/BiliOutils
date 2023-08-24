import { biliApi } from './api';

export function getNow() {
  return biliApi.get('x/click-interface/click/now', {
    timeout: 2000,
  });
}
