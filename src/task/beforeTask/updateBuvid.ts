import { biliHttp } from '@/utils/http';

export async function updateBuvid() {
  biliHttp.get('https://www.bilibili.com/').catch(() => {});
}
