/**
 * 多平台数据接入基类
 *
 * 所有电商平台接入模块继承此类，提供统一的：
 * - Token 管理（授权、刷新）
 * - 数据同步接口（订单、商品）
 */

// ── 通用类型 ──────────────────────────────────────

export interface PlatformConfig {
  appKey: string
  appSecret: string
  redirectUri?: string
}

export interface PlatformToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  scope?: string
}

export interface PlatformSyncResult {
  success: boolean
  platformName: string
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

export interface PlatformOrder {
  orderId: string
  orderStatus: number
  totalAmount: number
  payAmount: number
  buyerName: string
  buyerPhone: string
  createTime: string
  items: PlatformOrderItem[]
}

export interface PlatformOrderItem {
  skuName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface PlatformProduct {
  productId: string
  name: string
  price: number
  status: number
  specs: PlatformProductSpec[]
}

export interface PlatformProductSpec {
  specId: string
  specName: string
  stockNum: number
  price: number
}

// ── 平台接入基类 ──────────────────────────────────

export abstract class BasePlatformClient {
  public readonly platformName: string
  protected config: PlatformConfig

  constructor(platformName: string, config: PlatformConfig) {
    this.platformName = platformName
    this.config = config
  }

  /**
   * 获取授权 URL（OAuth 跳转）
   */
  abstract getAuthorizeUrl(state: string): string

  /**
   * 通过授权码获取 Access Token
   */
  abstract authorize(code: string): Promise<PlatformToken>

  /**
   * 刷新 Access Token
   */
  abstract refreshToken(refreshToken: string): Promise<PlatformToken>

  /**
   * 同步订单
   */
  abstract syncOrders(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult>

  /**
   * 同步商品
   */
  abstract syncProducts(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult>

  /**
   * 获取店铺信息
   */
  abstract getShopInfo(accessToken: string): Promise<{ shopId: string; shopName: string }>

  /**
   * 获取通用 API 请求头
   */
  protected getHeaders(accessToken: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  }
}

/**
 * 平台注册表
 */
export const platformRegistry = new Map<string, new (config: PlatformConfig) => BasePlatformClient>()
