/**
 * 淘宝平台接入（骨架）
 *
 * TODO: 接入淘宝开放平台 API
 * 文档参考：https://open.taobao.com/
 */

import { BasePlatformClient, PlatformConfig, PlatformToken, PlatformSyncResult, SyncMode } from "@/lib/platforms/base"

export class TaobaoPlatformClient extends BasePlatformClient {
  constructor(config: PlatformConfig) {
    super("taobao", config)
  }

  getAuthorizeUrl(state: string): string {
    const base = "https://oauth.taobao.com/authorize"
    const params = new URLSearchParams({
      client_id: this.config.appKey,
      redirect_uri: this.config.redirectUri || "",
      state,
      response_type: "code",
      view: "web",
    })
    return `${base}?${params.toString()}`
  }

  async authorize(code: string): Promise<PlatformToken> {
    // Mock — 实际需要调用淘宝 OAuth API
    console.warn("[淘宝平台] authorize() 为骨架实现，需接入淘宝开放平台")
    return {
      accessToken: `tb_mock_token_${code}`,
      refreshToken: `tb_mock_refresh_${code}`,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    }
  }

  async refreshToken(refreshToken: string): Promise<PlatformToken> {
    console.warn("[淘宝平台] refreshToken() 为骨架实现")
    return {
      accessToken: `tb_mock_token_refreshed`,
      refreshToken,
      expiresAt: new Date(Date.now() + 86400 * 1000),
    }
  }

  async syncOrders(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[淘宝平台] syncOrders() 为骨架实现")
    return {
      success: true,
      platformName: "taobao",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async syncProducts(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[淘宝平台] syncProducts() 为骨架实现")
    return {
      success: true,
      platformName: "taobao",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async getShopInfo(accessToken: string): Promise<{ shopId: string; shopName: string }> {
    return { shopId: "tb_mock", shopName: "淘宝店铺（Mock）" }
  }
}
