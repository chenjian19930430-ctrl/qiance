/**
 * 快手平台接入（骨架）
 *
 * TODO: 接入快手电商开放平台 API
 * 文档参考：https://open.kuaishou.com/
 */

import { BasePlatformClient, PlatformConfig, PlatformToken, PlatformSyncResult, SyncMode } from "@/lib/platforms/base"

export class KuaishouPlatformClient extends BasePlatformClient {
  constructor(config: PlatformConfig) {
    super("kuaishou", config)
  }

  getAuthorizeUrl(state: string): string {
    const base = "https://open.kuaishou.com/oauth/authorize"
    const params = new URLSearchParams({
      app_id: this.config.appKey,
      redirect_uri: this.config.redirectUri || "",
      state,
      response_type: "code",
      scope: "user_info",
    })
    return `${base}?${params.toString()}`
  }

  async authorize(code: string): Promise<PlatformToken> {
    console.warn("[快手平台] authorize() 为骨架实现，需接入快手开放平台")
    return {
      accessToken: `ks_mock_token_${code}`,
      refreshToken: `ks_mock_refresh_${code}`,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    }
  }

  async refreshToken(refreshToken: string): Promise<PlatformToken> {
    console.warn("[快手平台] refreshToken() 为骨架实现")
    return {
      accessToken: `ks_mock_token_refreshed`,
      refreshToken,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    }
  }

  async syncOrders(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[快手平台] syncOrders() 为骨架实现")
    return {
      success: true,
      platformName: "kuaishou",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async syncProducts(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[快手平台] syncProducts() 为骨架实现")
    return {
      success: true,
      platformName: "kuaishou",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async getShopInfo(accessToken: string): Promise<{ shopId: string; shopName: string }> {
    return { shopId: "ks_mock", shopName: "快手店铺（Mock）" }
  }
}
