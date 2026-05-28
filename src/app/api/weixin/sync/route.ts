/**
 * 视频号数据同步 API
 *
 * POST /api/weixin/sync → 手动触发同步
 * GET /api/weixin/sync?shopId=xxx → 查询同步状态
 */

import { NextRequest, NextResponse } from "next/server"
import { syncWeixinShop, syncAllWeixinShops } from "@/lib/weixin/sync"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { shopId, mode = "incremental" } = body

    if (shopId) {
      const result = await syncWeixinShop(shopId, mode)
      return NextResponse.json({
        code: result.success ? 200 : 500,
        data: result,
        message: result.success ? "同步完成" : "同步部分失败",
      })
    }

    const results = await syncAllWeixinShops(mode)
    const allSuccess = results.every((r) => r.success)
    return NextResponse.json({
      code: allSuccess ? 200 : 500,
      data: results,
      message: allSuccess ? "全部同步完成" : "部分同步失败",
    })
  } catch (error) {
    return NextResponse.json(
      { code: 500, data: null, message: "同步失败" },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get("shopId")

  if (!shopId) {
    return NextResponse.json({ code: 400, data: null, message: "缺少 shopId" }, { status: 400 })
  }

  return NextResponse.json({
    code: 200,
    data: { shopId, status: "idle" },
    message: "success",
  })
}
