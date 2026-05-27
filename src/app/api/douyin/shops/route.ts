/**
 * 抖店店铺管理 API
 *
 * GET /api/douyin/shops — 已授权店铺列表
 * DELETE /api/douyin/shops?shopId=xxx — 解除授权
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/douyin/shops — 获取已授权的抖店列表
export async function GET() {
  try {
    const shops = await prisma.douyinShop.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shopName: true,
        shopId: true,
        authStatus: true,
        lastSyncTime: true,
        tokenExpire: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      code: 200,
      data: { list: shops, total: shops.length },
      message: "success",
    })
  } catch (error) {
    console.error("[抖店 Shops GET]", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// DELETE /api/douyin/shops?shopId=xxx — 解除授权
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get("shopId")

    if (!shopId) {
      return NextResponse.json({ code: 400, data: null, message: "缺少 shopId" }, { status: 400 })
    }

    const shop = await prisma.douyinShop.findUnique({ where: { shopId } })
    if (!shop) {
      return NextResponse.json({ code: 404, data: null, message: "店铺未找到" }, { status: 404 })
    }

    // 删除关联的千策店铺数据（可选清理）
    const crmShop = await prisma.shop.findFirst({
      where: { code: `douyin_${shopId}` },
    })
    if (crmShop) {
      // 解除同步关联但不删除原始千策店铺
      await prisma.shop.update({
        where: { id: crmShop.id },
        data: { remark: `已解除抖店授权: ${shopId}` },
      })
    }

    // 删除抖店授权记录
    await prisma.douyinShop.delete({ where: { shopId } })

    return NextResponse.json({ code: 200, data: null, message: "已解除授权" })
  } catch (error) {
    console.error("[抖店 Shops DELETE]", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
