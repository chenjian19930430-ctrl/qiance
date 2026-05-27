/**
 * 抖店 API 数据结构类型定义
 *
 * 文档参考：https://op.jinritemai.com/docs
 */

// ── 通用 ──────────────────────────────────────────

/** 抖店 API 通用响应 */
export interface DouyinApiResponse<T = unknown> {
  code: number // 0 表示成功
  msg: string
  sub_code?: string
  sub_msg?: string
  data: T
}

/** 抖店 API 请求签名参数 */
export interface DouyinSignParams {
  app_key: string
  timestamp: number
  access_token: string
  param_json: string
  v: string // API 版本号，默认 "2"
  method: string
}

// ── 店铺 ──────────────────────────────────────────

export interface DouyinShopDetail {
  shop_id: number
  shop_name: string
  shop_logo: string
  shop_type: number
  open_time: string
  shop_status: number
  contact_mobile: string
  shop_owner: string
}

// ── 商品 ──────────────────────────────────────────

export interface DouyinProduct {
  product_id: number
  product_id_str: string
  name: string
  product_img: string
  first_cid: number
  first_cname: string
  second_cid: number
  second_cname: string
  third_cid: number
  third_cname: string
  market_price: number  // 市场价，单位：分
  discount_price: number // 售价，单位：分
  mobile: string
  status: number
  check_status: number
  create_time: string
  update_time: string
  pic: string
  spec_id: number
  spec_detail: string // JSON string
  spec_name: string
  specs: DouyinProductSpec[]
}

export interface DouyinProductSpec {
  spec_id: number
  spec_name: string
  stock_num: number
  price: number
  code: string
  product_id: number
  img: string
}

export interface DouyinProductListResponse {
  product_list: DouyinProduct[]
  total: number
  has_more: boolean
}

// ── 订单 ──────────────────────────────────────────

export interface DouyinOrder {
  shop_id: number
  order_id: number
  order_id_str: string
  order_status: number
  order_type: number
  create_time: string
  update_time: string
  pay_time: string
  finish_time: string
  logistics_info: DouyinLogisticsInfo
  buyer_info: DouyinBuyerInfo
  order_phase_list: DouyinOrderPhase[]
  main_status: number
  sub_status: number
  order_amount: number // 订单金额，单位：分
  post_amount: number  // 运费，单位：分
  pay_amount: number   // 实付金额，单位：分
  promotion_detail: string // JSON string
  cancel_reason: string
  remark: string
  open_id: string
  receive_time: string
  remark_info: string
  order_tag: string
  seller_remark: string
  merge_user_phone: string
  encrypt_post_tel: string
  encrypt_consignee_tel: string
  batch_ship_task_meta: string
  code_type: number
  reach_time: string
  order_phase_v2: number
  product_info: DouyinOrderProductInfo[]
  shop_name: string
}

export interface DouyinBuyerInfo {
  buy_name: string
  buy_phone: string
}

export interface DouyinLogisticsInfo {
  logistics_base: string
  logistics_code: string
  logistics_company: string
  logistics_id: string
  logistics_time: string
  express_type: number
  plan_delivery_time: string
  receive_time: string
}

export interface DouyinOrderPhase {
  phase: number
  phase_name: string
  phase_status: number
  phase_create_time: string
  phase_pay_time: string
  phase_pay_amount: number
}

export interface DouyinOrderProductInfo {
  product_id: number
  product_id_str: string
  product_name: string
  product_img: string
  product_count: number
  product_price: number
  spec_id: number
  spec_name: string
  sku_id: number
  single_refund_amount: number
  platform_fee: number
  total_platform_fee: number
  coupon_amount: number
  coupon_user_amount: number
  coupon_merchant_amount: number
}

export interface DouyinOrderListResponse {
  order_list: DouyinOrder[]
  total: number
  has_more: boolean
  next_start_time: number
}

// ── OAuth ──────────────────────────────────────────

export interface DouyinOAuthTokenResponse {
  access_token: string
  access_token_expire_in: number
  refresh_token: string
  refresh_token_expire_in: number
  scope: string
  shop_id: number
  shop_name: string
  user_id: number
  user_name: string
  expire_time: number
}

// ── 同步 ──────────────────────────────────────────

export interface DouyinSyncResult {
  success: boolean
  shopName?: string
  shopId?: string
  summary: {
    ordersSynced: number
    productsSynced: number
    ordersSkipped: number
    productsSkipped: number
    errors: string[]
  }
  syncedAt: string
}

export type SyncMode = "full" | "incremental"
