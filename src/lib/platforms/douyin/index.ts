/**
 * 抖店平台接入
 *
 * 继承 BasePlatformClient，封装抖店 API
 * 实际调用委托给 @/lib/douyin/client 和 @/lib/douyin/sync
 */

import { BasePlatformClient, PlatformConfig, PlatformToken, PlatformSyncResult, SyncMode } from "@/lib/platforms/base"

export class DouyinPlatformClient extends BasePlatformClient {
  constructor(config: PlatformConfig) {
    super("douyin", config)
  }

  getAuthorizeUrl(state: string): string {
    const base = "https://fxg.jinritemai.com/open/authorize"
    const params = new URLSearchParams({
      app_id: this.config.appKey,
      state,
      scope: "all",
      response_type: "code",
    })
    return `${base}?${params.toString()}`
  }

  async authorize(code: string): Promise<PlatformToken> {
    // 实际实现参考 src/lib/douyin/client.ts 中的 refreshAccessToken 逻辑
    const { isDouyinConfigured } = await import("@/lib/douyin/client")
    if (!isDouyinConfigured()) {
      throw new Error("抖店未配置 APP_KEY 和 APP_SECRET")
    }

    const res = await fetch("https://openapi-fxg.jinritemai.com/token/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
        code,
        grant_type: "authorization_code",
      }),
    })

    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(`抖店授权失败: ${data.msg}`)
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresAt: new Date(Date.now() + (data.data.access_token_expire_in || 86400) * 1000),
    }
  }

  async refreshToken(refreshToken: string): Promise<PlatformToken> {
    const { isDouyinConfigured } = await import("@/lib/douyin/client")
    if (!isDouyinConfigured()) {
      throw new Error("抖店未配置 APP_KEY 和 APP_SECRET")
    }

    const res = await fetch("https://openapi-fxg.jinritemai.com/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(`抖店 Token 刷新失败: ${data.msg}`)
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresAt: new Date(Date.now() + (data.data.access_token_expire_in || 86400) * 1000),
    }
  }

  async syncOrders(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    // 委托给现有的抖店同步逻辑
    const { syncDouyinShop } = await import("@/lib/douyin/sync")
    // 需要从 token 中获取 shopId，这里简化处理
    const result = await syncDouyinShop("default", mode)
    return {
      success: result.success,
      platformName: "douyin",
      shopId: result.shopId,
      summary: result.summary,
      syncedAt: result.syncedAt,
    }
  }

  async syncProducts(accessToken: string, mode: SyncMode): Promise<PlatformSyncResult> {
    const { syncDouyinShop } = await import("@/lib/douyin/sync")
    const result = await syncDouyinShop("default", mode)
    return {
      success: result.success,
      platformName: "douyin",
      shopId: result.shopId,
      summary: result.summary,
      syncedAt: result.syncedAt,
    }
  }

  async getShopInfo(accessToken: string): Promise<{ shopId: string; shopName: string }> {
    const { callDouyinApi } = await import("@/lib/douyin/client")
    const detail: any = await callDouyinApi({
      method: "/shop/getShopDetail",
      accessToken,
    })
    return {
      shopId: String(detail.shop_id),
      shopName: detail.shop_name || "未知店铺",
    }
  }
}
