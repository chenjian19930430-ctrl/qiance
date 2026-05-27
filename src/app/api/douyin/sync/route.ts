/**
 * 抖店数据同步 API 路由
 *
 * POST /api/douyin/sync — 同步指定抖店
 *   Body: { shopId: string, mode?: "full" | "incremental" }
 * POST /api/douyin/sync?all=true — 同步所有抖店
 *
 * GET /api/douyin/sync/status — 获取同步状态（预留）
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncDouyinShop, syncAllDouyinShops } from "@/lib/douyin/sync"
import type { SyncMode } from "@/lib/douyin/types"

// POST /api/douyin/sync — 触发同步
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAll = searchParams.has("all")
    const body = await req.json().catch(() => ({}))
    const shopId = body.shopId
    const mode: SyncMode = body.mode || "incremental"

    if (isAll) {
      // 同步所有已授权店铺
      const results = await syncAllDouyinShops(mode)
      const successCount = results.filter((r) => r.success).length
      return NextResponse.json({
        code: 200,
        data: {
          totalShops: results.length,
          successCount,
          failedCount: results.length - successCount,
          results,
        },
        message: `同步完成: ${successCount}/${results.length} 成功`,
      })
    }

    if (!shopId) {
      return NextResponse.json({ code: 400, data: null, message: "缺少 shopId 参数" }, { status: 400 })
    }

    // 验证店铺是否存在
    const shop = await prisma.douyinShop.findUnique({ where: { shopId } })
    if (!shop) {
      return NextResponse.json({ code: 404, data: null, message: "店铺未找到" }, { status: 404 })
    }

    if (shop.authStatus !== 1) {
      return NextResponse.json({ code: 400, data: null, message: "店铺未授权或已过期" }, { status: 400 })
    }

    // 执行同步
    const result = await syncDouyinShop(shopId, mode)

    return NextResponse.json({
      code: result.success ? 200 : 500,
      data: result,
      message: result.success ? "同步完成" : "同步完成，但存在错误",
    })
  } catch (error) {
    console.error("[抖店 Sync POST]", error)
    return NextResponse.json({
      code: 500,
      data: null,
      message: `同步失败: ${error instanceof Error ? error.message : "未知错误"}`,
    }, { status: 500 })
  }
}

// GET /api/douyin/sync/last — 查询最近同步记录（预留）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get("shopId")

    if (!shopId) {
      return NextResponse.json({ code: 400, data: null, message: "缺少 shopId" }, { status: 400 })
    }

    const shop = await prisma.douyinShop.findUnique({
      where: { shopId },
      select: { lastSyncTime: true, authStatus: true },
    })

    if (!shop) {
      return NextResponse.json({ code: 404, data: null, message: "店铺未找到" }, { status: 404 })
    }

    return NextResponse.json({
      code: 200,
      data: shop,
      message: "success",
    })
  } catch (error) {
    console.error("[抖店 Sync GET]", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}
