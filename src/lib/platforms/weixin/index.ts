/**
 * 微信视频号平台接入（骨架）
 *
 * TODO: 接入微信视频号小店 API
 * 文档参考：https://developers.weixin.qq.com/doc/
 */

import { BasePlatformClient, PlatformConfig, PlatformToken, PlatformSyncResult, SyncMode } from "@/lib/platforms/base"

export class WeixinPlatformClient extends BasePlatformClient {
  constructor(config: PlatformConfig) {
    super("weixin", config)
  }

  getAuthorizeUrl(state: string): string {
    const base = "https://open.weixin.qq.com/connect/oauth2/authorize"
    const params = new URLSearchParams({
      appid: this.config.appKey,
      redirect_uri: this.config.redirectUri || "",
      state,
      response_type: "code",
      scope: "snsapi_base",
    })
    return `${base}?${params.toString()}`
  }

  async authorize(code: string): Promise<PlatformToken> {
    console.warn("[微信平台] authorize() 为骨架实现，需接入微信开放平台")
    return {
      accessToken: `wx_mock_token_${code}`,
      refreshToken: `wx_mock_refresh_${code}`,
      expiresAt: new Date(Date.now() + 7200 * 1000),
    }
  }

  async refreshToken(refreshToken: string): Promise<PlatformToken> {
    console.warn("[微信平台] refreshToken() 为骨架实现")
    return {
      accessToken: `wx_mock_token_refreshed`,
      refreshToken,
      expiresAt: new Date(Date.now() + 7200 * 1000),
    }
  }

  async syncOrders(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[微信平台] syncOrders() 为骨架实现")
    return {
      success: true,
      platformName: "weixin",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async syncProducts(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    console.warn("[微信平台] syncProducts() 为骨架实现")
    return {
      success: true,
      platformName: "weixin",
      summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: ["骨架实现"] },
      syncedAt: new Date().toISOString(),
    }
  }

  async getShopInfo(accessToken: string): Promise<{ shopId: string; shopName: string }> {
    return { shopId: "wx_mock", shopName: "微信视频号店铺（Mock）" }
  }
}
