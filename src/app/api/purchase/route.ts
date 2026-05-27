import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/purchase - 分页查询采购单
// GET /api/purchase?id=xxx - 查询采购单详情
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    // 查询单条详情
    if (id) {
      const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: true,
        },
      })
      if (!order) {
        return NextResponse.json({ code: 404, data: null, message: "采购单不存在" }, { status: 404 })
      }
      return NextResponse.json({
        code: 200,
        data: {
          ...order,
          totalAmountYuan: (order.totalAmount / 100).toFixed(2),
          paidAmountYuan: (order.paidAmount / 100).toFixed(2),
          freightYuan: (order.freight / 100).toFixed(2),
          items: order.items.map((item) => ({
            ...item,
            priceYuan: (item.price / 100).toFixed(2),
          })),
        },
        message: "success",
      })
    }

    // 分页查询
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const supplierId = searchParams.get("supplierId")

    const where: any = {}
    if (search) {
      where.orderNo = { contains: search }
    }
    if (status && status !== "") {
      where.status = parseInt(status)
    }
    if (supplierId) {
      where.supplierId = supplierId
    }

    const [list, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, items: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.purchaseOrder.count({ where }),
    ])

    const data = list.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      supplierId: order.supplierId,
      supplierName: order.supplier.name,
      status: order.status,
      totalAmount: order.totalAmount,
      totalAmountYuan: (order.totalAmount / 100).toFixed(2),
      paidAmount: order.paidAmount,
      paidAmountYuan: (order.paidAmount / 100).toFixed(2),
      freight: order.freight,
      freightYuan: (order.freight / 100).toFixed(2),
      itemCount: order.items.length,
      creator: order.creator,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))

    return NextResponse.json({
      code: 200,
      data: { list: data, total, page, pageSize },
      message: "success",
    })
  } catch (error) {
    console.error("采购单查询失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}

// POST /api/purchase - 新建采购单
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 生成采购单号：PO-YYYYMMDD-NNN
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const prefix = `PO-${dateStr}`

    // 查找当天最大序号
    const lastOrder = await prisma.purchaseOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: "desc" },
    })
    let seq = 1
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNo.slice(-3))
      seq = lastSeq + 1
    }
    const orderNo = `${prefix}-${String(seq).padStart(3, "0")}`

    // 计算总额
    const items = body.items || []
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
      0
    )

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNo,
        supplierId: body.supplierId,
        status: body.status ?? 0,
        totalAmount,
        paidAmount: body.paidAmount || 0,
        freight: body.freight || 0,
        remark: body.remark,
        creator: body.creator || "admin",
        items: {
          create: items.map((item: any) => ({
            spuId: item.spuId,
            skuId: item.skuId,
            spuName: item.spuName,
            skuSpec: item.skuSpec,
            quantity: item.quantity,
            price: item.price,
            receivedQty: 0,
          })),
        },
      },
      include: { supplier: true, items: true },
    })

    return NextResponse.json({ code: 200, data: order, message: "采购单创建成功" })
  } catch (error) {
    console.error("采购单创建失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "创建失败" }, { status: 500 })
  }
}

// PUT /api/purchase - 更新采购单
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }

    const body = await req.json()
    const existing = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 404, data: null, message: "采购单不存在" }, { status: 404 })
    }

    // 状态流转验证
    const statusFlow: Record<number, number[]> = {
      0: [1, 5], // 草稿 -> 待审核 | 取消
      1: [2, 5], // 待审核 -> 已确认 | 取消
      2: [4],    // 已确认 -> 已完成
      3: [4],    // 部分入库 -> 已完成
      4: [],     // 已完成（终态）
      5: [],     // 已取消（终态）
    }

    if (body.status !== undefined) {
      const allowed = statusFlow[existing.status]
      if (!allowed || !allowed.includes(body.status)) {
        return NextResponse.json({
          code: 400,
          data: null,
          message: `不允许从状态 ${existing.status} 流转到 ${body.status}`,
        }, { status: 400 })
      }
    }

    // 如果更新 items
    let updateData: any = { ...body }
    if (body.items) {
      // 删除旧 items，重建
      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })

      const items = body.items
      const totalAmount = items.reduce(
        (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
        0
      )
      updateData.totalAmount = totalAmount

      updateData.items = {
        create: items.map((item: any) => ({
          spuId: item.spuId,
          skuId: item.skuId,
          spuName: item.spuName,
          skuSpec: item.skuSpec,
          quantity: item.quantity,
          price: item.price,
          receivedQty: item.receivedQty || 0,
        })),
      }
    }

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: { supplier: true, items: true },
    })

    return NextResponse.json({ code: 200, data: order, message: "更新成功" })
  } catch (error) {
    console.error("采购单更新失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/purchase - 删除采购单（仅草稿状态可删除）
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }

    const existing = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 404, data: null, message: "采购单不存在" }, { status: 404 })
    }
    if (existing.status !== 0) {
      return NextResponse.json({ code: 400, data: null, message: "仅草稿状态可删除" }, { status: 400 })
    }

    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    await prisma.purchaseOrder.delete({ where: { id } })

    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("采购单删除失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
