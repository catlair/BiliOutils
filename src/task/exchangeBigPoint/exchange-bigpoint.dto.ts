import type { ApiBaseProp } from '@/dto/bili-base-prop';

/**
 * 商品列表
 */
export type SkuList = ApiBaseProp<{ category: Category; skus: Skus[]; page: Page }>;

interface Page {
  num: number;
  size: number;
  total: number;
}

interface Skus {
  token: string;
  title: string;
  picture: string;
  rotation_pictures: string[];
  price: Price;
  inventory: Inventory;
  user_type: number;
  exchange_limit_type: number;
  exchange_limit_num: number;
  start_time: number;
  end_time: number;
  state: number;
  priority: number;
}

interface Inventory {
  /** 库存 */
  available_num: number;
  /** 已兑换 */
  used_num: number;
  /** 剩余 */
  surplus_num: number;
}

interface Price {
  /** 原价 */
  origin: number;
  /** 现价 */
  promotion?: Promotion;
  sale: number;
}

interface Promotion {
  price: number;
  type: number;
  discount: number;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Category {}

/**
 * 验证商品是否可兑换
 */
export type VerifyOrder = ApiBaseProp<{
  /** 不可兑换信息 */
  reject_reason?: string;
  /** 可兑换 */
  can_purchase?: true;
}>;

/**
 * 创建订单
 */
export type CreateOrder = ApiBaseProp<{
  order: {
    order_no: string;
    sku_token: string;
    mid: number;
    point: number;
    trade_time: number;
    state: number;
  };
}>;

/**
 * 支付
 */
export type PaymentOrder = ApiBaseProp<{
  state: number;
}>;
