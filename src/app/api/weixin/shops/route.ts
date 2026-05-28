/**
 * 视频号店铺列表 API
 *
 * GET /api/weixin/shops → 获取所有已授权的视频号店铺
 * POST /api/weixin/shops → 注册/绑定视频号店铺
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const shops = await prisma.weixinShop.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ code: 200, data: shops, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const shop = await prisma.weixinShop.create({
      data: {
        tenantId: body.tenantId || "default",
        shopName: body.shopName,
        shopId: body.shopId,
        appId: body.appId,
        authStatus: 0,
      },
    })
    return NextResponse.json({ code: 200, data: shop, message: "创建成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}
