/**
 * 数据同步引擎
 *
 * 对标八爪鱼的定时同步功能，支持：
 * - 全量同步 / 增量同步模式
 * - 定时调度
 * - 同步状态追踪
 * - 多平台统一调度
 */

import { BasePlatformClient, PlatformSyncResult, SyncMode } from "@/lib/platforms/base"

// ── 类型定义 ──────────────────────────────────────

export interface SyncTask {
  id: string
  platform: string
  type: "order" | "product" | "shop"
  mode: SyncMode
  schedule?: string // cron 表达式，留空表示手动触发
  lastRun?: Date
  status: "idle" | "running" | "success" | "failed"
}

export interface SyncRecord {
  id: string
  taskId: string
  platform: string
  type: string
  mode: SyncMode
  startedAt: Date
  finishedAt?: Date
  status: "running" | "success" | "failed"
  result?: PlatformSyncResult
  error?: string
}

// ── 同步引擎 ──────────────────────────────────────

export class SyncEngine {
  private tasks: Map<string, SyncTask> = new Map()
  private records: SyncRecord[] = []
  private running = false

  /**
   * 注册同步任务
   */
  registerTask(task: SyncTask): void {
    this.tasks.set(task.id, task)
  }

  /**
   * 获取所有已注册任务
   */
  getTasks(): SyncTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 获取任务
   */
  getTask(id: string): SyncTask | undefined {
    return this.tasks.get(id)
  }

  /**
   * 获取同步历史记录
   */
  getRecentRecords(limit: number = 20): SyncRecord[] {
    return this.records.slice(-limit).reverse()
  }

  /**
   * 执行单个同步任务
   */
  async executeTask(
    taskId: string,
    client: BasePlatformClient,
    accessToken: string,
    mode?: SyncMode,
  ): Promise<SyncRecord> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`同步任务 ${taskId} 未注册`)
    }

    const syncMode = mode || task.mode

    const record: SyncRecord = {
      id: `${taskId}_${Date.now()}`,
      taskId,
      platform: task.platform,
      type: task.type,
      mode: syncMode,
      startedAt: new Date(),
      status: "running",
    }
    this.records.push(record)
    task.status = "running"

    try {
      let result: PlatformSyncResult

      switch (task.type) {
        case "order":
          result = await client.syncOrders(accessToken, syncMode)
          break
        case "product":
          result = await client.syncProducts(accessToken, syncMode)
          break
        case "shop":
          result = await client.getShopInfo(accessToken).then((info) => ({
            success: true,
            platformName: task.platform,
            shopId: info.shopId,
            summary: { ordersSynced: 0, productsSynced: 0, ordersSkipped: 0, productsSkipped: 0, errors: [] },
            syncedAt: new Date().toISOString(),
          }))
          break
        default:
          throw new Error(`未知同步类型: ${task.type}`)
      }

      record.status = result.success ? "success" : "failed"
      record.result = result
      record.finishedAt = new Date()
      task.status = result.success ? "success" : "failed"
      task.lastRun = new Date()

      return record
    } catch (error) {
      record.status = "failed"
      record.error = error instanceof Error ? error.message : "同步异常"
      record.finishedAt = new Date()
      task.status = "failed"
      task.lastRun = new Date()
      return record
    }
  }

  /**
   * 获取引擎运行状态
   */
  isRunning(): boolean {
    return this.running
  }

  /**
   * 获取同步统计
   */
  getStats(): {
    totalTasks: number
    running: number
    success: number
    failed: number
    totalRecords: number
  } {
    const tasks = Array.from(this.tasks.values())
    return {
      totalTasks: tasks.length,
      running: tasks.filter((t) => t.status === "running").length,
      success: tasks.filter((t) => t.status === "success").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      totalRecords: this.records.length,
    }
  }
}

/**
 * 全局单例同步引擎
 */
export const syncEngine = new SyncEngine()
