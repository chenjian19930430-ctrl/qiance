import { NextResponse } from "next/server"
import { agents } from "@/lib/agents/agents"

// GET /api/agents - 智能体列表
export async function GET() {
  try {
    return NextResponse.json({ code: 200, data: agents, message: "success" })
  } catch (error) {
    return NextResponse.json({ code: 500, data: null, message: "查询失败" }, { status: 500 })
  }
}
