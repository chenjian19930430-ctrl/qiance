/**
 * 同步管理 API
 *
 * GET  /api/sync        — 查看同步任务状态
 * POST /api/sync        — 触发同步
 *
 * POST Body:
 * {
 *   taskId: "douyin_orders_daily",   // 可选，不指定则执行所有
 *   mode: "incremental" | "full",     // 可选，默认使用任务配置
 *   platform: "douyin",              // 可选，按平台执行
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { syncEngine } from "@/lib/sync/engine"
import { ensureDefaultTasks } from "@/lib/sync/tasks"

// ── GET: 查看同步状态 ──────────────────────────

export async function GET() {
  try {
    ensureDefaultTasks()

    const tasks = syncEngine.getTasks()
    const stats = syncEngine.getStats()
    const recentRecords = syncEngine.getRecentRecords(10)

    return NextResponse.json({
      code: 200,
      data: {
        stats,
        tasks: tasks.map((t) => ({
          id: t.id,
          platform: t.platform,
          type: t.type,
          mode: t.mode,
          status: t.status,
          lastRun: t.lastRun?.toISOString() || null,
        })),
        recentRecords: recentRecords.map((r) => ({
          id: r.id,
          taskId: r.taskId,
          platform: r.platform,
          type: r.type,
          mode: r.mode,
          status: r.status,
          startedAt: r.startedAt.toISOString(),
          finishedAt: r.finishedAt?.toISOString() || null,
          result: r.result
            ? {
                success: r.result.success,
                ordersSynced: r.result.summary.ordersSynced,
                productsSynced: r.result.summary.productsSynced,
                errors: r.result.summary.errors,
              }
            : null,
          error: r.error || null,
        })),
      },
      message: "success",
    })
  } catch (error) {
    console.error("[Sync GET]", error)
    return NextResponse.json({ code: 500, data: null, message: "查询同步状态失败" }, { status: 500 })
  }
}

// ── POST: 触发同步 ─────────────────────────────

export async function POST(request: NextRequest) {
  try {
    ensureDefaultTasks()

    const body = await request.json().catch(() => ({}))
    const { taskId, mode, platform } = body

    let tasksToRun = syncEngine.getTasks()

    // 按 taskId 过滤
    if (taskId) {
      const task = syncEngine.getTask(taskId)
      if (!task) {
        return NextResponse.json({ code: 404, data: null, message: `同步任务 ${taskId} 不存在` }, { status: 404 })
      }
      tasksToRun = [task]
    }

    // 按 platform 过滤
    if (platform) {
      tasksToRun = tasksToRun.filter((t) => t.platform === platform)
    }

    if (tasksToRun.length === 0) {
      return NextResponse.json({ code: 400, data: null, message: "没有可执行的同步任务" }, { status: 400 })
    }

    // 异步执行所有任务（不等待完成）
    const results = await Promise.allSettled(
      tasksToRun.map(async (task) => {
        // 获取对应的平台客户端
        const client = getPlatformClient(task.platform)
        if (!client) {
          throw new Error(`平台 ${task.platform} 未接入`)
        }
        const accessToken = await getPlatformToken(task.platform)
        return syncEngine.executeTask(task.id, client, accessToken, mode as any)
      }),
    )

    const taskResults = results.map((r, i) => ({
      taskId: tasksToRun[i].id,
      platform: tasksToRun[i].platform,
      status: r.status === "fulfilled" ? r.value.status : "failed",
      error: r.status === "rejected" ? r.reason?.message || "执行失败" : null,
    }))

    return NextResponse.json({
      code: 200,
      data: {
        triggered: tasksToRun.length,
        results: taskResults,
      },
      message: "同步任务已触发",
    })
  } catch (error) {
    console.error("[Sync POST]", error)
    return NextResponse.json({ code: 500, data: null, message: "触发同步失败" }, { status: 500 })
  }
}

// ── 辅助函数 ──────────────────────────────────────

/**
 * 获取平台客户端（骨架实现）
 */
function getPlatformClient(platform: string): import("@/lib/platforms/base").BasePlatformClient | null {
  switch (platform) {
    case "douyin": {
      const { DouyinPlatformClient } = require("@/lib/platforms/douyin")
      return new DouyinPlatformClient({ appKey: "", appSecret: "" })
    }
    case "taobao": {
      const { TaobaoPlatformClient } = require("@/lib/platforms/taobao")
      return new TaobaoPlatformClient({ appKey: "", appSecret: "" })
    }
    case "kuaishou": {
      const { KuaishouPlatformClient } = require("@/lib/platforms/kuaishou")
      return new KuaishouPlatformClient({ appKey: "", appSecret: "" })
    }
    case "weixin": {
      const { WeixinPlatformClient } = require("@/lib/platforms/weixin")
      return new WeixinPlatformClient({ appKey: "", appSecret: "" })
    }
    default:
      return null
  }
}

/**
 * 获取平台 Token（骨架实现）
 */
async function getPlatformToken(platform: string): Promise<string> {
  // TODO: 从数据库读取对应平台的 token
  return `mock_token_${platform}`
}
