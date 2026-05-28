/**
 * 微信视频号小店 API 客户端
 *
 * 封装微信视频号电商开放平台 HTTP API
 * 文档参考：https://developers.weixin.qq.com/doc/store/API/
 */

import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const WECHAT_API_BASE = "https://api.weixin.qq.com"

// ── 配置检查 ──────────────────────────────────────

export function isWeixinConfigured(): boolean {
  return !!(process.env.WEIXIN_APP_ID && process.env.WEIXIN_APP_SECRET)
}

// ── Token 管理 ────────────────────────────────────

/**
 * 用 code 换取视频号 access_token
 */
export async function getAccessTokenByCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  shopId: string
  shopName: string
}> {
  const res = await fetch(
    `${WECHAT_API_BASE}/sns/oauth2/access_token?appid=${process.env.WEIXIN_APP_ID}&secret=${process.env.WEIXIN_APP_SECRET}&code=${code}&grant_type=authorization_code`,
  )
  const data = await res.json()
  if (data.errcode) {
    throw new Error(`微信 OAuth 失败: ${data.errmsg} (${data.errcode})`)
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    shopId: data.openid,
    shopName: data.nickname || `视频号-${data.openid?.slice(-6)}`,
  }
}

/**
 * 从数据库中获取有效的 access token
 */
export async function getAccessToken(shopId: string): Promise<string> {
  const shop = await prisma.weixinShop.findUnique({ where: { shopId } })
  if (!shop) throw new Error(`视频号店铺未找到: ${shopId}`)
  if (shop.authStatus !== 1) throw new Error(`视频号店铺未授权: ${shopId}`)
  if (shop.tokenExpire && shop.tokenExpire < new Date()) {
    // Token 过期，尝试刷新
    if (shop.refreshToken) {
      return await refreshAccessToken(shopId, shop.refreshToken)
    }
    throw new Error(`视频号 Token 已过期，需要重新授权: ${shopId}`)
  }
  return shop.accessToken!
}

/**
 * 刷新 access token
 */
async function refreshAccessToken(shopId: string, refreshToken: string): Promise<string> {
  const appId = process.env.WEIXIN_APP_ID!
  const res = await fetch(
    `${WECHAT_API_BASE}/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`,
  )
  const data = await res.json()
  if (data.errcode) {
    throw new Error(`微信 Token 刷新失败: ${data.errmsg} (${data.errcode})`)
  }
  await prisma.weixinShop.update({
    where: { shopId },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpire: new Date(Date.now() + (data.expires_in || 7200) * 1000),
      authStatus: 1,
    },
  })
  return data.access_token
}

// ── 基础 API 调用 ─────────────────────────────────

interface WeixinApiResponse<T = unknown> {
  errcode: number
  errmsg: string
  result?: T
}

/**
 * 调用微信视频号 API（使用 component access token 或 shop access token）
 */
export async function callWeixinApi<T = unknown>(
  path: string,
  accessToken: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const url = `${WECHAT_API_BASE}${path.startsWith("/") ? "" : "/"}${path}?access_token=${accessToken}`
  const options: RequestInit = params
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) }
    : { method: "GET" }

  const res = await fetch(url, options)
  const data: WeixinApiResponse<T> = await res.json()
  if (data.errcode !== 0) {
    throw new Error(`微信 API 错误: ${data.errmsg} (${data.errcode})`)
  }
  return data.result ?? (data as unknown as T)
}

// ── 店铺 API ──────────────────────────────────────

export interface WeixinShopDetail {
  nickname: string
  headimgurl: string
  shop_name: string
  shop_logo: string
  shop_status: number
  shop_type: number
}

export async function getShopDetail(accessToken: string): Promise<WeixinShopDetail> {
  const data = await callWeixinApi<WeixinShopDetail>("/cgi-bin/user/info", accessToken, {
    lang: "zh_CN",
  })
  return data
}

// ── 商品 API ──────────────────────────────────────

export interface WeixinProduct {
  product_id: string
  title: string
  thumb_url: string
  price: number
  market_price: number
  stock: number
  status: number
  create_time: string
  update_time: string
  category_id: string
  category_name: string
  skus: WeixinProductSku[]
}

export interface WeixinProductSku {
  sku_id: string
  sku_name: string
  price: number
  stock: number
  code: string
  img: string
}

export interface WeixinProductListResponse {
  products: WeixinProduct[]
  total: number
  has_more: boolean
}

export async function getProductList(
  accessToken: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<WeixinProductListResponse> {
  const data = await callWeixinApi<{ product_list: WeixinProduct[]; total: number }>(
    "/shop/product/list",
    accessToken,
    { page, page_size: pageSize, status: 1 },
  )
  return {
    products: data.product_list || [],
    total: data.total || 0,
    has_more: (data.product_list || []).length === pageSize,
  }
}

// ── 订单 API ──────────────────────────────────────

export interface WeixinOrder {
  order_id: string
  order_status: number
  order_amount: number
  pay_amount: number
  create_time: string
  pay_time: string
  product_infos: WeixinOrderProduct[]
  receiver_info: {
    receiver_name: string
    receiver_phone: string
    receiver_address: string
  }
  logistics_info?: {
    logistics_company: string
    logistics_code: string
  }
  remark: string
}

export interface WeixinOrderProduct {
  product_id: string
  product_name: string
  product_count: number
  product_price: number
  sku_id: string
  sku_name: string
}

export interface WeixinOrderListResponse {
  orders: WeixinOrder[]
  total: number
  has_more: boolean
}

export async function getOrderList(
  accessToken: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<WeixinOrderListResponse> {
  const data = await callWeixinApi<{ order_list: WeixinOrder[]; total: number }>(
    "/shop/order/list",
    accessToken,
    { page, page_size: pageSize },
  )
  return {
    orders: data.order_list || [],
    total: data.total || 0,
    has_more: (data.order_list || []).length === pageSize,
  }
}

export async function getOrderDetail(
  accessToken: string,
  orderId: string,
): Promise<WeixinOrder | null> {
  try {
    const data = await callWeixinApi<{ order: WeixinOrder }>(
      "/shop/order/detail",
      accessToken,
      { order_id: orderId },
    )
    return data.order || null
  } catch {
    return null
  }
}
