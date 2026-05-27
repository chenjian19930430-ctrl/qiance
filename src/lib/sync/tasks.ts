/**
 * 预定义同步任务
 *
 * 注册千策系统的默认同步任务
 */

import { syncEngine, SyncTask } from "./engine"

/**
 * 初始化所有默认同步任务
 */
export function initDefaultSyncTasks() {
  const defaultTasks: SyncTask[] = [
    {
      id: "douyin_orders_daily",
      platform: "douyin",
      type: "order",
      mode: "incremental",
      status: "idle",
    },
    {
      id: "douyin_products_daily",
      platform: "douyin",
      type: "product",
      mode: "incremental",
      status: "idle",
    },
    {
      id: "douyin_shop_info",
      platform: "douyin",
      type: "shop",
      mode: "incremental",
      status: "idle",
    },
    {
      id: "taobao_orders_daily",
      platform: "taobao",
      type: "order",
      mode: "incremental",
      status: "idle",
    },
    {
      id: "kuaishou_orders_daily",
      platform: "kuaishou",
      type: "order",
      mode: "incremental",
      status: "idle",
    },
    {
      id: "weixin_orders_daily",
      platform: "weixin",
      type: "order",
      mode: "incremental",
      status: "idle",
    },
  ]

  for (const task of defaultTasks) {
    syncEngine.registerTask(task)
  }

  return defaultTasks
}

/**
 * 首次初始化（确保只注册一次）
 */
let initialized = false
export function ensureDefaultTasks() {
  if (!initialized) {
    initDefaultSyncTasks()
    initialized = true
  }
}
