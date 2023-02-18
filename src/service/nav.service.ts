import type { UserInfoNavDto } from '@/dto/user-info.dto';
import { TaskModule } from '@/config';
import { getNav } from '@/net/user-info.request';
import { logger } from '@/utils/log';

type UserNav = UserInfoNavDto['data'];

function getBCoinBalance(data: UserNav) {
  TaskModule.couponBalance = data.wallet?.coupon_balance || 0;
}

export async function updateNav() {
  try {
    const { data, message, code } = await getNav();
    if (code !== 0) {
      logger.warn(`获取用户信息失败：${code} ${message}`);
      return;
    }
    getBCoinBalance(data);
  } catch (error) {
    logger.error(`获取用户信息异常：${error.message}`);
  }
}
