/**
 * 视频号数据同步服务
 *
 * 将微信视频号小店数据同步到千策本地数据库
 * 参考抖店 sync.ts 架构
 */

import { prisma } from "@/lib/prisma"
import { getAccessToken, getProductList, getOrderList } from "./client"
import type { SyncMode } from "@/lib/platforms/base"

export interface WeixinSyncResult {
  success: boolean
  shopName?: string
  shopId?: string
  summary: {
    ordersSynced: number
    productsSynced: number
    ordersSkipped: number
    productsSkipped: number
    errors: string[]
  }
  syncedAt: string
}

/**
 * 同步所有视频号店铺
 */
export async function syncAllWeixinShops(mode: SyncMode = "incremental"): Promise<WeixinSyncResult[]> {
  const shops = await prisma.weixinShop.findMany({
    where: { authStatus: 1 },
  })
  const results: WeixinSyncResult[] = []
  for (const shop of shops) {
    const result = await syncWeixinShop(shop.id, mode)
    results.push(result)
  }
  return results
}

/**
 * 同步单个视频号店铺
 */
export async function syncWeixinShop(
  shopId: string,
  mode: SyncMode = "incremental",
): Promise<WeixinSyncResult> {
  const result: WeixinSyncResult = {
    success: false,
    shopId,
    summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: [] },
    syncedAt: new Date().toISOString(),
  }

  try {
    const shop = await prisma.weixinShop.findUnique({ where: { id: shopId } })
    if (!shop) {
      result.summary.errors.push(`视频号店铺未找到: ${shopId}`)
      return result
    }

    result.shopName = shop.shopName

    const accessToken = await getAccessToken(shop.shopId)

    // 同步商品
    await syncProducts(accessToken, shop.tenantId, result, mode)

    // 同步订单
    await syncOrders(accessToken, shop.tenantId, result, mode)

    // 更新同步时间
    await prisma.weixinShop.update({
      where: { id: shopId },
      data: { lastSyncTime: new Date() },
    })

    result.success = true
  } catch (error) {
    result.summary.errors.push(
      `同步失败: ${error instanceof Error ? error.message : "未知错误"}`,
    )
  }

  return result
}

async function syncProducts(
  accessToken: string,
  tenantId: string,
  result: WeixinSyncResult,
  mode: SyncMode,
): Promise<void> {
  try {
    const { getProductList } = await import("./client")
    const data = await getProductList(accessToken, 1, 200)
    for (const product of data.products) {
      const existing = await prisma.spu.findFirst({
        where: { code: `wx_${product.product_id}` },
      })
      if (existing && mode === "incremental") {
        result.summary.productsSkipped++
        continue
      }
      if (existing) {
        await prisma.spu.update({
          where: { id: existing.id },
          data: {
            name: product.title,

            status: product.status,
          },
        })
      } else {
        const shop = await prisma.weixinShop.findFirst({ where: { tenantId } })
        // 使用默认公司
        const company = await prisma.company.findFirst({ where: { tenantId } })
        await prisma.spu.create({
          data: {
            tenantId,
            companyId: company?.id || "default",
            name: product.title,
            code: `wx_${product.product_id}`,
            status: typeof product.status === "number" ? product.status : 0,
          },
        })
      }
      result.summary.productsSynced++
    }
  } catch (error) {
    result.summary.errors.push(
      `商品同步失败: ${error instanceof Error ? error.message : "未知错误"}`,
    )
  }
}

async function syncOrders(
  accessToken: string,
  tenantId: string,
  result: WeixinSyncResult,
  mode: SyncMode,
): Promise<void> {
  try {
    const data = await getOrderList(accessToken, 1, 200)
    const company = await prisma.company.findFirst({ where: { tenantId } })
    for (const order of data.orders) {
      const existing = await prisma.order.findFirst({
        where: { orderNo: `wx_${order.order_id}` },
      })
      if (existing && mode === "incremental") {
        result.summary.ordersSkipped++
        continue
      }
      const orderData = {
        tenantId,
        companyId: company?.id || "default",
        orderNo: `wx_${order.order_id}`,
        totalAmount: order.order_amount || 0,
        realAmount: order.pay_amount || 0,
        orderStatus: order.order_status ?? 0,
        orderTime: order.create_time ? new Date(order.create_time) : null,
      }
      if (existing) {
        await prisma.order.update({
          where: { id: existing.id },
          data: orderData,
        })
      } else {
        await prisma.order.create({ data: orderData })
      }
      result.summary.ordersSynced++
    }
  } catch (error) {
    result.summary.errors.push(
      `订单同步失败: ${error instanceof Error ? error.message : "未知错误"}`,
    )
  }
}
