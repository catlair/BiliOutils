// import getNewCookie from '../getNewCookie';
import { updateBuvid } from './updateBuvid';

export default async function beforeTask() {
  // await getNewCookie();
  updateBuvid().catch(() => {});
}
