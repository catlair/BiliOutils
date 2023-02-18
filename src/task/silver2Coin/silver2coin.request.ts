import type { MyWalletDto } from '@/dto/live.dto';
import type { Silver2CoinDto, SilverStatusDto } from './silver2coin.dto';
import { TaskConfig } from '@/config';
import { liveApi } from '@/net/api';

/**
 * 我的钱包
 */
export function getMyWallet() {
  return liveApi.get<MyWalletDto>(
    'xlive/revenue/v1/wallet/myWallet?need_bp=1&need_metal=1&platform=pc',
  );
}

/**
 * 瓜子交换信息
 */
export function exchangeStatus() {
  return liveApi.get<SilverStatusDto>('xlive/revenue/v1/wallet/getStatus');
}

/**
 * 银瓜子兑换硬币
 */
export function exchangeSilver2Coin() {
  return liveApi.post<Silver2CoinDto>('xlive/revenue/v1/wallet/silver2coin', {
    csrf_token: TaskConfig.BILIJCT,
    csrf: TaskConfig.BILIJCT,
  });
}
