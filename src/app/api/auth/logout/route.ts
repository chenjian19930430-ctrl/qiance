import { NextResponse } from "next/server"

// POST /api/auth/logout - 登出
export async function POST() {
  try {
    return NextResponse.json({ code: 200, data: null, message: "登出成功" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "登出失败" }, { status: 500 })
  }
}
