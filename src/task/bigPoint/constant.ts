/** 每天至少的免费积分 */
export const FREE_POINT = 75;

/** 无需完成的任务
 * | 'tvodbuy'  购买付费点播影片
 * | 'dressbuyamount'  购买指定装扮
 * | 'vipmallbuy';  购买指定大会员商品
 */
export const NO_NEED_TASK = ['vipmallbuy', 'dressbuyamount', 'tvodbuy'] as const;
