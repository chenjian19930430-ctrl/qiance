/**
 * 抖店数据同步服务
 *
 * 将抖店 API 数据同步到千策本地数据库
 * 支持全量同步和增量同步
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { callDouyinApi, getAccessToken, DouyinApiError, DouyinTokenExpiredError } from "./client"
import type {
  DouyinOrder,
  DouyinProduct,
  DouyinProductSpec,
  DouyinSyncResult,
  SyncMode,
  DouyinShopDetail,
} from "./types"

// ── 店铺信息同步 ──────────────────────────────────

/**
 * 同步抖店店铺信息
 */
async function syncShopInfo(shopId: string, accessToken: string): Promise<void> {
  try {
    const shopDetail = await callDouyinApi<DouyinShopDetail>({
      method: "/shop/getShopDetail",
      accessToken,
    })

    await prisma.douyinShop.update({
      where: { shopId },
      data: {
        shopName: shopDetail.shop_name || shopDetail.shop_name,
        authStatus: 1,
      },
    })
  } catch (error) {
    // 店铺信息同步失败不阻塞整体流程
    console.warn(`[抖店同步] 店铺信息同步失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }
}

// ── 商品同步 ──────────────────────────────────────

/**
 * 同步抖店商品 → 千策 Spu/Sku
 */
async function syncProducts(shopId: string, accessToken: string, dbShopId: string, tenantId: string): Promise<{ synced: number; skipped: number; errors: string[] }> {
  let synced = 0
  let skipped = 0
  const errors: string[] = []

  try {
    let page = 0
    let hasMore = true

    while (hasMore) {
      try {
        const result = await callDouyinApi<{
          product_list: DouyinProduct[]
          total: number
          has_more: boolean
        }>({
          method: "/product/list",
          accessToken,
          paramJson: {
            page,
            page_size: 100,
            status: "all",
          },
        })

        if (!result.product_list || result.product_list.length === 0) {
          break
        }

        for (const product of result.product_list) {
          try {
            // 查找或创建 SPU
            const existingSpu = await prisma.spu.findFirst({
              where: { code: `dy_${product.product_id}` },
            })

            if (existingSpu && false) { // 增量模式下已存在则跳过
              skipped++
              continue
            }

            // 转换价格：抖店用分，千策用元
            const priceYuan = product.discount_price ? Number(product.discount_price) / 100 : 0
            const marketPriceYuan = product.market_price ? Number(product.market_price) / 100 : 0

            const spu = await prisma.spu.upsert({
              where: existingSpu ? { id: existingSpu.id } : { id: "" },
              create: {
                tenantId,
                companyId: "default",
                shopId: dbShopId,
                name: product.name,
                code: `dy_${product.product_id}`,
                brand: "",
                description: "",
                status: product.status === 1 ? 0 : 1,
              },
              update: {
                name: product.name,
                status: product.status === 1 ? 0 : 1,
              },
            })

            // 同步 SKU
            if (product.specs && product.specs.length > 0) {
              for (const spec of product.specs) {
                const skuPrice = spec.price ? Number(spec.price) / 100 : priceYuan
                const existingSku = await prisma.sku.findFirst({
                  where: { code: `dy_sku_${spec.spec_id}` },
                })

                await prisma.sku.upsert({
                  where: existingSku ? { id: existingSku.id } : { id: "" },
                  create: {
                    tenantId,
                    spuId: spu.id,
                    shopId: dbShopId,
                    name: spec.spec_name || product.name,
                    code: `dy_sku_${spec.spec_id}`,
                    salePrice: skuPrice,
                    costPrice: 0,
                    stock: spec.stock_num || 0,
                    status: 0,
                    spec: spec.spec_name ? { spec_name: spec.spec_name, spec_id: spec.spec_id } as Prisma.InputJsonValue : Prisma.DbNull,
                  },
                  update: {
                    name: spec.spec_name || product.name,
                    salePrice: skuPrice,
                    stock: spec.stock_num || 0,
                  },
                })
              }
            }

            synced++
          } catch (itemError) {
            errors.push(`商品 ${product.product_id} 同步失败: ${itemError instanceof Error ? itemError.message : "未知错误"}`)
          }
        }

        hasMore = result.has_more
        page++
      } catch (pageError) {
        errors.push(`商品列表第 ${page} 页获取失败: ${pageError instanceof Error ? pageError.message : "未知错误"}`)
        break
      }
    }
  } catch (error) {
    errors.push(`商品同步失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }

  return { synced, skipped, errors }
}

// ── 订单同步 ──────────────────────────────────────

/**
 * 同步抖店订单 → 千策 Order/OrderItem
 */
async function syncOrders(shopId: string, accessToken: string, dbShopId: string, tenantId: string, mode: SyncMode): Promise<{ synced: number; skipped: number; errors: string[] }> {
  let synced = 0
  let skipped = 0
  const errors: string[] = []

  try {
    let startTime = 0
    let hasMore = true
    const orderCount = 0
    const maxPages = 50 // 防止无限循环

    while (hasMore && orderCount + synced < 5000) {
      try {
        const paramJson: Record<string, unknown> = {
          page: 0,
          size: 100,
          start_time: startTime,
          end_time: Math.floor(Date.now() / 1000),
          order_by: "create_time",
          order_asc: "asc",
        }

        // 增量模式：只拉取最近7天的订单
        if (mode === "incremental") {
          paramJson.start_time = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)
        }

        const result = await callDouyinApi<{
          order_list: DouyinOrder[]
          total: number
          has_more: boolean
          next_start_time: number
        }>({
          method: "/order/list",
          accessToken,
          paramJson,
        })

        if (!result.order_list || result.order_list.length === 0) {
          break
        }

        for (const order of result.order_list) {
          try {
            // 检查订单是否已存在
            const existingOrder = await prisma.order.findUnique({
              where: { orderNo: order.order_id_str },
            })

            if (existingOrder) {
              // 增量模式已存在跳过，全量模式更新
              if (mode === "incremental") {
                skipped++
                continue
              }
            }

            // 转换金额：分 → 元
            const totalAmount = order.order_amount ? Number(order.order_amount) / 100 : 0
            const payAmount = order.pay_amount ? Number(order.pay_amount) / 100 : 0
            const postAmount = order.post_amount ? Number(order.post_amount) / 100 : 0

            // 创建/更新订单
            const dbOrder = await prisma.order.upsert({
              where: existingOrder ? { id: existingOrder.id } : { id: "" },
              create: {
                tenantId,
                companyId: "default",
                orderNo: order.order_id_str,
                channel: "douyin",
                orderStatus: order.order_status ?? 0,
                totalAmount,
                realAmount: payAmount,
                logisticsFee: postAmount,
                buyerName: order.buyer_info?.buy_name || "",
                buyerPhone: order.buyer_info?.buy_phone || "",
                buyerAddress: "",
                remark: order.remark || "",
                orderTime: order.create_time ? new Date(order.create_time) : null,
              },
              update: {
                orderStatus: order.order_status ?? 0,
                totalAmount,
                realAmount: payAmount,
                logisticsFee: postAmount,
                buyerName: order.buyer_info?.buy_name || "",
                buyerPhone: order.buyer_info?.buy_phone || "",
                remark: order.remark || "",
                orderTime: order.create_time ? new Date(order.create_time) : undefined,
              },
            })

            // 同步订单商品明细
            if (order.product_info && order.product_info.length > 0) {
              for (const item of order.product_info) {
                const itemTotal = item.product_price && item.product_count
                  ? (Number(item.product_price) * item.product_count) / 100
                  : 0

                const existingItem = await prisma.orderItem.findFirst({
                  where: { orderId: dbOrder.id, skuName: item.product_name },
                })

                await prisma.orderItem.upsert({
                  where: existingItem ? { id: existingItem.id } : { id: "" },
                  create: {
                    orderId: dbOrder.id,
                    shopId: dbShopId,
                    skuName: item.product_name || item.spec_name || "未知商品",
                    quantity: item.product_count || 1,
                    unitPrice: item.product_price ? Number(item.product_price) / 100 : 0,
                    subtotal: itemTotal,
                  },
                  update: {
                    quantity: item.product_count || 1,
                    unitPrice: item.product_price ? Number(item.product_price) / 100 : 0,
                    subtotal: itemTotal,
                  },
                })
              }
            }

            synced++
          } catch (itemError) {
            errors.push(`订单 ${order.order_id_str} 同步失败: ${itemError instanceof Error ? itemError.message : "未知错误"}`)
          }
        }

        hasMore = result.has_more
        startTime = result.next_start_time || 0
      } catch (pageError) {
        errors.push(`订单列表获取失败: ${pageError instanceof Error ? pageError.message : "未知错误"}`)
        break
      }
    }
  } catch (error) {
    errors.push(`订单同步失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }

  return { synced, skipped, errors }
}

// ── 主同步入口 ────────────────────────────────────

/**
 * 同步指定抖店的数据
 */
export async function syncDouyinShop(shopId: string, mode: SyncMode = "incremental"): Promise<DouyinSyncResult> {
  const errors: string[] = []

  try {
    // 获取店铺信息
    const shop = await prisma.douyinShop.findUnique({ where: { shopId } })
    if (!shop) {
      return {
        success: false,
        summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: [`店铺 ${shopId} 未找到`] },
        syncedAt: new Date().toISOString(),
      }
    }

    // 获取 access token
    let accessToken: string
    try {
      accessToken = await getAccessToken(shopId)
    } catch (error) {
      return {
        success: false,
        shopName: shop.shopName,
        shopId: shop.shopId,
        summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: [`Token 获取失败: ${error instanceof Error ? error.message : "未知错误"}`] },
        syncedAt: new Date().toISOString(),
      }
    }

    // 查找或创建关联的千策店铺记录
    const tenantId = shop.tenantId || "default"
    const crmShop = await prisma.shop.findFirst({
      where: { code: `douyin_${shopId}` },
    })

    // 如果没有千策店铺记录，自动创建
    const dbShopId = crmShop
      ? crmShop.id
      : (
        await prisma.shop.create({
          data: {
            tenantId,
            companyId: "default",
            name: shop.shopName || `抖店-${shopId}`,
            code: `douyin_${shopId}`,
            channel: "douyin",
            status: 1,
          },
        })
      ).id

    // 1. 同步店铺信息
    await syncShopInfo(shopId, accessToken)

    // 2. 同步商品
    const productResult = await syncProducts(shopId, accessToken, dbShopId, tenantId)

    // 3. 同步订单
    const orderResult = await syncOrders(shopId, accessToken, dbShopId, tenantId, mode)

    // 更新最后同步时间
    await prisma.douyinShop.update({
      where: { shopId },
      data: { lastSyncTime: new Date(), authStatus: 1 },
    })

    const allErrors = [...productResult.errors, ...orderResult.errors, ...errors]

    return {
      success: allErrors.length === 0,
      shopName: shop.shopName,
      shopId: shop.shopId,
      summary: {
        ordersSynced: orderResult.synced,
        productsSynced: productResult.synced,
        ordersSkipped: orderResult.skipped,
        productsSkipped: productResult.skipped,
        errors: allErrors,
      },
      syncedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      success: false,
      summary: {
        ordersSynced: 0,
        productsSynced: 0,
        ordersSkipped: 0,
        productsSkipped: 0,
        errors: [error instanceof Error ? error.message : "未知错误"],
      },
      syncedAt: new Date().toISOString(),
    }
  }
}

/**
 * 同步所有已授权的抖店
 */
export async function syncAllDouyinShops(mode: SyncMode = "incremental"): Promise<DouyinSyncResult[]> {
  const authorizedShops = await prisma.douyinShop.findMany({
    where: { authStatus: 1 },
  })

  if (authorizedShops.length === 0) {
    return []
  }

  const results = await Promise.allSettled(
    authorizedShops.map((shop) => syncDouyinShop(shop.shopId, mode)),
  )

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          success: false,
          summary: {
            ordersSynced: 0,
            productsSynced: 0,
            ordersSkipped: 0,
            productsSkipped: 0,
            errors: [r.reason instanceof Error ? r.reason.message : "同步异常"],
          },
          syncedAt: new Date().toISOString(),
        } as DouyinSyncResult,
  )
}
