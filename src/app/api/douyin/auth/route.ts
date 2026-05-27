/**
 * 抖店 OAuth 授权 API 路由
 *
 * GET /api/douyin/auth?action=login → 跳转抖店授权页
 * GET /api/douyin/auth?action=callback&code=xxx&state=yyy → OAuth回调
 * GET /api/douyin/auth?action=status&shopId=xxx → 查询授权状态
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSign, isDouyinConfigured } from "@/lib/douyin/client"

const DOUYIN_API_BASE = "https://openapi-fxg.jinritemai.com"

/**
 * 跳转到抖店 OAuth 授权页
 */
function handleLogin(req: NextRequest) {
  if (!isDouyinConfigured()) {
    return NextResponse.redirect(
      new URL("/settings/douyin?error=not_configured", req.url),
    )
  }

  const appKey = process.env.DOUYIN_APP_KEY!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/douyin/auth?action=callback`
  const state = Math.random().toString(36).substring(2, 15)

  // 抖店 OAuth 授权 URL
  const authUrl = `https://fxg.jinritemai.com/index.html#/oauth2?app_id=${appKey}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authUrl)
}

/**
 * 处理 OAuth 回调
 */
async function handleCallback(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/douyin?error=no_code", req.url),
    )
  }

  try {
    const appKey = process.env.DOUYIN_APP_KEY!
    const appSecret = process.env.DOUYIN_APP_SECRET!

    // 用 code 换取 access token
    const timestamp = Math.floor(Date.now() / 1000)
    const paramJson = JSON.stringify({
      app_id: appKey,
      app_secret: appSecret,
      code,
      grant_type: "authorization_code",
    })

    const sign = generateSign(appSecret, timestamp, appSecret, paramJson)

    const res = await fetch(`${DOUYIN_API_BASE}/token/oauth`, {
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
      throw new Error(`Token 获取失败: HTTP ${res.status}`)
    }

    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(`Token 获取失败: ${data.msg}`)
    }

    const tokenData = data.data

    if (!tokenData.shop_id) {
      throw new Error("未获取到店铺信息")
    }

    const shopId = String(tokenData.shop_id)

    // 保存到数据库
    const expiresIn = tokenData.access_token_expire_in || 86400
    const refreshExpiresIn = tokenData.refresh_token_expire_in || 86400 * 30

    await prisma.douyinShop.upsert({
      where: { shopId },
      create: {
        tenantId: "default",
        shopName: tokenData.shop_name || `抖店-${shopId}`,
        shopId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpire: new Date(Date.now() + expiresIn * 1000),
        authStatus: 1,
      },
      update: {
        shopName: tokenData.shop_name || `抖店-${shopId}`,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpire: new Date(Date.now() + expiresIn * 1000),
        authStatus: 1,
      },
    })

    // 跳转回抖店管理页面
    return NextResponse.redirect(new URL("/settings/douyin?auth=success", req.url))
  } catch (error) {
    console.error("[抖店授权] 回调处理失败:", error)
    return NextResponse.redirect(
      new URL(`/settings/douyin?error=auth_failed&detail=${encodeURIComponent(error instanceof Error ? error.message : "未知错误")}`, req.url),
    )
  }
}

/**
 * 查询授权状态
 */
async function handleStatus(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get("shopId")

  if (!shopId) {
    return NextResponse.json(
      { code: 400, data: null, message: "缺少 shopId 参数" },
      { status: 400 },
    )
  }

  const shop = await prisma.douyinShop.findUnique({ where: { shopId } })
  if (!shop) {
    return NextResponse.json(
      { code: 404, data: null, message: "店铺未找到" },
      { status: 404 },
    )
  }

  return NextResponse.json({
    code: 200,
    data: {
      shopId: shop.shopId,
      shopName: shop.shopName,
      authStatus: shop.authStatus,
      lastSyncTime: shop.lastSyncTime,
      tokenExpire: shop.tokenExpire,
    },
    message: "success",
  })
}

// ── GET Handler ──────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "login"

  switch (action) {
    case "login":
      return handleLogin(req)
    case "callback":
      return await handleCallback(req)
    case "status":
      return await handleStatus(req)
    default:
      return NextResponse.json(
        { code: 400, data: null, message: "未知操作" },
        { status: 400 },
      )
  }
}
