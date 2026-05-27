import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/inventory?page=1&pageSize=20&search=&warehouseId=&category=&alert=1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""
    const warehouseId = searchParams.get("warehouseId") || ""
    const category = searchParams.get("category") || ""
    const alertOnly = searchParams.get("alert") === "1"

    const where: any = {}

    if (search) {
      where.OR = [
        { spuName: { contains: search } },
        { skuCode: { contains: search } },
        { skuSpec: { contains: search } },
      ]
    }

    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    if (category) {
      where.spuId = {
        in: (
          await prisma.spu.findMany({
            where: { categoryId: category },
            select: { id: true },
          })
        ).map((s) => s.id),
      }
    }

    // 预警筛选：在应用层处理，先获取所有匹配的，再过滤
    // 使用 where 加条件：quantity < threshold
    // 因为 Prisma 不支持在同一模型中比较两个字段，用 apply-level filter
    let [allList, allTotal] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: { warehouse: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.stockItem.count({ where }),
    ])

    // 预警筛选：比较 quantity < threshold
    if (alertOnly) {
      allList = allList.filter((item) => item.quantity < item.threshold || item.quantity <= 0)
      allTotal = allList.length
    }

    // 应用分页
    const paginatedList = allList.slice((page - 1) * pageSize, page * pageSize)

    const data = paginatedList.map((item) => ({
      id: item.id,
      skuName: item.spuName || item.skuCode || "-",
      skuCode: item.skuCode,
      skuSpec: item.skuSpec,
      warehouse: item.warehouse?.name || "-",
      warehouseId: item.warehouseId,
      total: item.quantity,
      locked: item.locked,
      available: Math.max(0, item.quantity - item.locked),
      threshold: item.threshold,
      unit: item.unit,
      status:
        item.quantity <= 0
          ? "out"
          : item.quantity < item.threshold
            ? "low"
            : "normal",
    }))

    return NextResponse.json({
      code: 200,
      data: { list: data, total: allTotal, page, pageSize },
      message: "success",
    })
  } catch (error) {
    console.error("库存查询失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// POST /api/inventory - 入库
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { skuId, warehouseId, quantity, spuName, skuCode, skuSpec, unit, threshold } = body

    if (!skuId && !skuCode) {
      return NextResponse.json({ code: 400, data: null, message: "请指定SKU" }, { status: 400 })
    }

    // 查找或创建库存记录
    const where: any = {}
    if (skuId) where.skuId = skuId
    if (skuCode) where.skuCode = skuCode
    if (warehouseId) where.warehouseId = warehouseId

    const existing = await prisma.stockItem.findFirst({ where })

    if (existing) {
      await prisma.stockItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + (quantity || 0),
        },
      })
    } else {
      await prisma.stockItem.create({
        data: {
          skuId: skuId || null,
          skuCode: skuCode || null,
          warehouseId: warehouseId || null,
          spuName: spuName || null,
          skuSpec: skuSpec || null,
          unit: unit || "个",
          threshold: threshold || 10,
          quantity: quantity || 0,
          tenantId: "default",
        },
      })
    }

    return NextResponse.json({ code: 200, data: null, message: "入库登记成功" })
  } catch (error) {
    console.error("入库失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "入库失败" }, { status: 500 })
  }
}
