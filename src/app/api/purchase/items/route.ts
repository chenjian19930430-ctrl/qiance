import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/purchase/items - 修改采购单项数量、单价等
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }

    const body = await req.json()
    const item = await prisma.purchaseOrderItem.update({
      where: { id },
      data: {
        quantity: body.quantity,
        price: body.price,
        spuName: body.spuName,
        skuSpec: body.skuSpec,
        spuId: body.spuId,
        skuId: body.skuId,
        receivedQty: body.receivedQty,
      },
    })

    // 重新计算采购单总额
    const orderId = item.purchaseOrderId
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: orderId },
    })
    const totalAmount = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { totalAmount },
    })

    return NextResponse.json({ code: 200, data: item, message: "更新成功" })
  } catch (error) {
    console.error("采购单项更新失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/purchase/items - 删除采购单项
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ code: 400, data: null, message: "缺少ID" }, { status: 400 })
    }

    const item = await prisma.purchaseOrderItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ code: 404, data: null, message: "采购单项不存在" }, { status: 404 })
    }

    await prisma.purchaseOrderItem.delete({ where: { id } })

    // 重新计算总额
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: item.purchaseOrderId },
    })
    const totalAmount = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    await prisma.purchaseOrder.update({
      where: { id: item.purchaseOrderId },
      data: { totalAmount },
    })

    return NextResponse.json({ code: 200, data: null, message: "删除成功" })
  } catch (error) {
    console.error("采购单项删除失败:", error)
    return NextResponse.json({ code: 500, data: null, message: "删除失败" }, { status: 500 })
  }
}
