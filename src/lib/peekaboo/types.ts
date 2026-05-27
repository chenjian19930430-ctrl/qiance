/**
 * Peekaboo 类型定义
 *
 * macOS UI 自动化 CLI 工具的类型定义
 */

/** Peekaboo 命令执行结果 */
export interface PeekabooExecResult {
  stdout: string
  stderr: string
  exitCode: number
}

/** see 命令返回的 UI 元素分析结果 */
export interface PeekabooSeeResult {
  /** 标注截图路径 */
  annotatedPath: string
  /** UI 元素快照（JSON 结构化数据） */
  snapshot: string
  /** AI 分析描述（如果指定了 --analyze） */
  analysis?: string
}

/** 截图返回结果 */
export interface PeekabooCaptureResult {
  /** 截图图片路径 */
  path: string
}

/** 可执行的 Peekaboo 动作 */
export type PeekabooAction =
  | { action: "capture" }
  | { action: "see"; analyze?: string }
  | { action: "click"; target: string }
  | { action: "type"; text: string }
  | { action: "press"; key: string; count?: number }
  | { action: "hotkey"; keys: string }
  | { action: "openUrl"; url: string }
  | { action: "scroll"; direction: "up" | "down" | "left" | "right"; amount?: number }
  | { action: "status" }

/** API 响应类型 */
export type PeekabooApiResponse =
  | { success: true; path?: string; annotatedPath?: string; snapshot?: string; analysis?: string }
  | { success: false; error: string }

/** 工具注册表中 Peekaboo 工具的定义 */
export interface PeekabooToolDef {
  name: string
  description: string
  parameters?: Record<string, string>
  handler: (params?: Record<string, unknown>) => Promise<unknown>
}
