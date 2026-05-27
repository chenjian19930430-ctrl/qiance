/**
 * 抖店 API 客户端
 *
 * 功能：
 * - 请求签名（MD5 hex 大写）
 * - token 管理 & 自动刷新
 * - 基础请求封装
 *
 * API 文档：https://op.jinritemai.com
 */

import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const DOUYIN_API_BASE = "https://openapi-fxg.jinritemai.com"

// ── 签名算法 ──────────────────────────────────────

/**
 * 抖店 API 签名算法
 *
 * sign = MD5(app_secret + timestamp + access_token + param_json).toUpperCase()
 *
 * @see https://op.jinritemai.com/docs/guide-docs/01-introduction/01-create-app
 */
export function generateSign(
  appSecret: string,
  timestamp: number,
  accessToken: string,
  paramJson: string,
): string {
  const raw = appSecret + timestamp + accessToken + paramJson
  return crypto.createHash("md5").update(raw, "utf-8").digest("hex").toUpperCase()
}

// ── 配置 ──────────────────────────────────────────

interface DouyinConfig {
  appKey: string
  appSecret: string
}

function getConfig(): DouyinConfig {
  return {
    appKey: process.env.DOUYIN_APP_KEY || "",
    appSecret: process.env.DOUYIN_APP_SECRET || "",
  }
}

// ── Token 管理 ────────────────────────────────────

/**
 * 获取指定抖店的 access token（自动刷新过期 token）
 */
export async function getAccessToken(shopId: string): Promise<string> {
  const shop = await prisma.douyinShop.findUnique({ where: { shopId } })
  if (!shop || !shop.accessToken) {
    throw new Error(`抖店 ${shopId} 未授权或 Token 不存在`)
  }

  // 检查是否过期
  if (shop.tokenExpire && shop.tokenExpire <= new Date() && shop.refreshToken) {
    // 尝试刷新 token
    return await refreshAccessToken(shopId, shop.refreshToken)
  }

  return shop.accessToken
}

/**
 * 刷新 access token
 */
async function refreshAccessToken(shopId: string, refreshToken: string): Promise<string> {
  try {
    const { appKey, appSecret } = getConfig()

    const timestamp = Math.floor(Date.now() / 1000)
    const paramJson = JSON.stringify({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    })

    const sign = generateSign(appSecret, timestamp, appSecret, paramJson)

    const res = await fetch(`${DOUYIN_API_BASE}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: appKey,
        timestamp,
        sign,
        param_json: paramJson,
      }),
    })

    if (!res.ok) {
      throw new Error(`刷新 Token 失败: HTTP ${res.status}`)
    }

    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(`刷新 Token 失败: ${data.msg}`)
    }

    const tokenData = data.data

    // 更新数据库中的 token
    await prisma.douyinShop.update({
      where: { shopId },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpire: new Date(Date.now() + (tokenData.access_token_expire_in || 86400) * 1000),
        authStatus: 1,
      },
    })

    return tokenData.access_token
  } catch (error) {
    // 刷新失败 → 标记为过期
    await prisma.douyinShop.update({
      where: { shopId },
      data: { authStatus: 2 },
    })
    throw error
  }
}

// ── 请求封装 ──────────────────────────────────────

export interface ApiRequestOptions {
  method: string
  accessToken: string
  paramJson?: Record<string, unknown>
}

/**
 * 调用抖店 API
 */
export async function callDouyinApi<T = unknown>(
  options: ApiRequestOptions,
): Promise<T> {
  const { method, accessToken, paramJson = {} } = options
  const { appKey, appSecret } = getConfig()

  const timestamp = Math.floor(Date.now() / 1000)
  const paramJsonStr = JSON.stringify(paramJson)
  const sign = generateSign(appSecret, timestamp, accessToken, paramJsonStr)

  const url = `${DOUYIN_API_BASE}${method}`
  const body = {
    app_key: appKey,
    timestamp,
    access_token: accessToken,
    param_json: paramJsonStr,
    v: "2",
    method,
    sign,
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`抖店 API 请求失败: HTTP ${res.status} | ${method}`)
  }

  const result = await res.json()

  if (result.code !== 0) {
    // Token 过期特殊处理
    if (result.code === 10001 || result.code === 10002) {
      throw new DouyinTokenExpiredError(result.msg || "Token 已过期")
    }
    throw new DouyinApiError(result.code, result.msg || result.sub_msg || "抖店 API 错误", method)
  }

  return result.data as T
}

// ── 自定义错误 ────────────────────────────────────

export class DouyinApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public method: string,
  ) {
    super(`[抖店 ${code}] ${message} (${method})`)
    this.name = "DouyinApiError"
  }
}

export class DouyinTokenExpiredError extends Error {
  constructor(message: string) {
    super(`Token 已过期: ${message}`)
    this.name = "DouyinTokenExpiredError"
  }
}

// ── App 信息获取 ──────────────────────────────────

/**
 * 获取已配置的抖店 app_key（无敏感信息泄露）
 */
export function getDouyinAppKey(): string {
  return process.env.DOUYIN_APP_KEY || ""
}

/** 检查抖店配置是否完整 */
export function isDouyinConfigured(): boolean {
  return !!(process.env.DOUYIN_APP_KEY && process.env.DOUYIN_APP_SECRET)
}
