/**
 * Peekaboo API Route
 *
 * POST /api/peekaboo — 前端通过此 API 调用 Peekaboo 进行
 * 截图、UI 分析、点击、输入等浏览器自动化操作。
 *
 * 请求格式：
 * { action: "capture" } → { success: true, path: string }
 * { action: "see", analyze?: "描述" } → { success: true, annotatedPath, snapshot, analysis }
 * { action: "click", target: "B3" } → { success: true }
 * { action: "type", text: "hello" } → { success: true }
 * { action: "press", key: "return" } → { success: true }
 * { action: "hotkey", keys: "cmd,c" } → { success: true }
 * { action: "openUrl", url: "..." } → { success: true }
 * { action: "scroll", direction: "down" } → { success: true }
 * { action: "status" } → { success: true, available: boolean, permissions: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { PeekabooClient } from "@/lib/peekaboo/client"
import type { PeekabooApiResponse } from "@/lib/peekaboo/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: "缺少 action 参数" } as PeekabooApiResponse,
        { status: 400 },
      )
    }

    switch (action) {
      case "capture": {
        const path = await PeekabooClient.capture()
        // 返回相对路径（给前端用）
        const relativePath = path.replace(process.cwd() + "/public", "")
        return NextResponse.json({
          success: true,
          path: relativePath,
        } as PeekabooApiResponse)
      }

      case "see": {
        const analyze: string | undefined = body.analyze
        const result = await PeekabooClient.see(analyze)
        const relativePath = result.annotatedPath.replace(process.cwd() + "/public", "")
        return NextResponse.json({
          success: true,
          annotatedPath: relativePath,
          snapshot: result.snapshot,
          analysis: result.analysis,
        } as PeekabooApiResponse)
      }

      case "click": {
        const target = body.target
        if (!target) {
          return NextResponse.json(
            { success: false, error: "缺少 target 参数" } as PeekabooApiResponse,
            { status: 400 },
          )
        }
        await PeekabooClient.click(target)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "type": {
        const text = body.text
        if (!text && text !== "") {
          return NextResponse.json(
            { success: false, error: "缺少 text 参数" } as PeekabooApiResponse,
            { status: 400 },
          )
        }
        await PeekabooClient.type(text)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "press": {
        const key = body.key
        if (!key) {
          return NextResponse.json(
            { success: false, error: "缺少 key 参数" } as PeekabooApiResponse,
            { status: 400 },
          )
        }
        await PeekabooClient.press(key)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "hotkey": {
        const keys = body.keys
        if (!keys) {
          return NextResponse.json(
            { success: false, error: "缺少 keys 参数" } as PeekabooApiResponse,
            { status: 400 },
          )
        }
        await PeekabooClient.hotkey(keys)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "openUrl": {
        const url = body.url
        if (!url) {
          return NextResponse.json(
            { success: false, error: "缺少 url 参数" } as PeekabooApiResponse,
            { status: 400 },
          )
        }
        await PeekabooClient.openUrl(url)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "scroll": {
        const direction = body.direction || "down"
        const amount = body.amount || 5
        await PeekabooClient.scroll(direction, amount)
        return NextResponse.json({ success: true } as PeekabooApiResponse)
      }

      case "status": {
        const status = await PeekabooClient.checkStatus()
        return NextResponse.json({
          success: true,
          ...status,
        } as PeekabooApiResponse)
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `未知 action: ${action}。支持的 action: capture, see, click, type, press, hotkey, openUrl, scroll, status`,
          } as PeekabooApiResponse,
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("[Peekaboo API]", error)
    const message = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json(
      { success: false, error: `Peekaboo 操作失败: ${message}` } as PeekabooApiResponse,
      { status: 500 },
    )
  }
}
