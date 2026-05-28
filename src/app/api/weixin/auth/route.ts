/**
 * 视频号 OAuth 授权 API 路由
 *
 * GET /api/weixin/auth?action=login → 跳转微信授权页
 * GET /api/weixin/auth?action=callback&code=xxx → OAuth回调
 * GET /api/weixin/auth?action=status&shopId=xxx → 查询授权状态
 * DELETE /api/weixin/auth?shopId=xxx → 解除授权
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isWeixinConfigured } from "@/lib/weixin/client"

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get("shopId")
    if (!shopId) {
      return NextResponse.json({ code: 400, data: null, message: "缺少 shopId" }, { status: 400 })
    }
    await prisma.weixinShop.update({
      where: { shopId },
      data: { authStatus: 0, accessToken: null, refreshToken: null, tokenExpire: null },
    })
    return NextResponse.json({ code: 200, data: null, message: "已解除授权" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "解除授权失败" }, { status: 500 })
  }
}

function handleLogin(req: NextRequest) {
  const appId = process.env.WEIXIN_APP_ID
  if (!appId || !isWeixinConfigured()) {
    return NextResponse.redirect(
      new URL("/settings/weixin?error=not_configured", req.url),
    )
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/weixin/auth?action=callback`
  const state = Math.random().toString(36).substring(2, 15)

  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`

  return NextResponse.redirect(authUrl)
}

async function handleCallback(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/settings/weixin?error=no_code", req.url))
  }

  try {
    const { getAccessTokenByCode } = await import("@/lib/weixin/client")
    const tokenData = await getAccessTokenByCode(code)

    const shopId = tokenData.shopId

    await prisma.weixinShop.upsert({
      where: { shopId },
      create: {
        tenantId: "default",
        shopName: tokenData.shopName,
        shopId,
        appId: process.env.WEIXIN_APP_ID || "",
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpire: new Date(Date.now() + tokenData.expiresIn * 1000),
        authStatus: 1,
      },
      update: {
        shopName: tokenData.shopName,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpire: new Date(Date.now() + tokenData.expiresIn * 1000),
        authStatus: 1,
      },
    })

    return NextResponse.redirect(new URL("/settings/weixin?auth=success", req.url))
  } catch (error) {
    console.error("[视频号授权] 回调处理失败:", error)
    return NextResponse.redirect(
      new URL(`/settings/weixin?error=auth_failed&detail=${encodeURIComponent(error instanceof Error ? error.message : "未知错误")}`, req.url),
    )
  }
}

async function handleStatus(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get("shopId")

  if (!shopId) {
    return NextResponse.json({ code: 400, data: null, message: "缺少 shopId" }, { status: 400 })
  }

  const shop = await prisma.weixinShop.findUnique({ where: { shopId } })
  if (!shop) {
    return NextResponse.json({ code: 404, data: null, message: "店铺未找到" }, { status: 404 })
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
