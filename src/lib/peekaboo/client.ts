/**
 * Peekaboo Client
 *
 * Node.js 端封装调用 Peekaboo CLI 的工具函数。
 * 所有函数通过 child_process.execFile 调用 `peekaboo <cmd>` shell 命令，
 * 并自动处理 peekaboo 路径和 PATH 环境变量。
 */

import { execFile } from "child_process"
import { promisify } from "util"
import { writeFile, mkdtemp, unlink } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"
import type { PeekabooSeeResult, PeekabooCaptureResult } from "./types"

// ── 常量 ──────────────────────────────────────────

const PEEKABOO_PATH = "/Users/openclaw/.local/bin/peekaboo"

const DEFAULT_ENV: typeof process.env = {
  ...process.env,
  PATH: `/Users/openclaw/.local/bin:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:${process.env.PATH || ""}`,
}

const execFileAsync = promisify(execFile)

// ── 内部工具 ──────────────────────────────────────

/** 重置 PATH 后执行 peekaboo 命令 */
async function runPeekaboo(args: string[], timeout = 60_000): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync(PEEKABOO_PATH, args, {
    env: DEFAULT_ENV,
    timeout,
    maxBuffer: 10 * 1024 * 1024, // 10MB
  })
  return { stdout, stderr }
}

/** 运行 peekaboo 并解析 JSON 输出 */
async function runPeekabooJson<T = unknown>(args: string[], timeout = 60_000): Promise<T> {
  const { stdout } = await runPeekaboo([...args, "--json"], timeout)
  try {
    return JSON.parse(stdout) as T
  } catch {
    throw new Error(`Peekaboo JSON parse failed. Raw output: ${stdout.slice(0, 500)}`)
  }
}

// ── 截图临时目录 ──────────────────────────────────

async function getScreenshotDir(): Promise<string> {
  const dir = join(process.cwd(), "public", "peekaboo-captures")
  const { mkdir } = await import("fs/promises")
  await mkdir(dir, { recursive: true })
  return dir
}

// ── 公共 API ─────────────────────────────────────

export class PeekabooClient {
  /**
   * 截图当前屏幕，返回图片路径
   */
  static async capture(): Promise<string> {
    const dir = await getScreenshotDir()
    const timestamp = Date.now()
    const outputPath = join(dir, `capture-${timestamp}.png`)

    await runPeekaboo(["image", "--path", outputPath, "--mode", "screen", "--retina"], 30_000)

    return outputPath
  }

  /**
   * 看屏幕并分析当前页面内容
   */
  static async see(analyze?: string): Promise<PeekabooSeeResult> {
    const dir = await getScreenshotDir()
    const timestamp = Date.now()
    const outputPath = join(dir, `see-${timestamp}.png`)

    const args = ["see", "--path", outputPath, "--annotate", "--mode", "screen"]

    if (analyze) {
      args.push("--analyze", analyze)
    }

    const { stdout } = await runPeekaboo(args, 120_000)

    return {
      annotatedPath: outputPath,
      snapshot: stdout,
      analysis: analyze ? `已使用 AI 分析: ${analyze}` : undefined,
    }
  }

  /**
   * 点击 UI 元素
   * @param target 元素标记（如 B3）或坐标（如 "100,200"）
   */
  static async click(target: string): Promise<void> {
    // 判断是坐标还是元素 ID
    if (/^\d+,\d+$/.test(target)) {
      await runPeekaboo(["click", "--coords", target], 30_000)
    } else {
      await runPeekaboo(["click", "--id", target], 30_000)
    }
  }

  /**
   * 输入文字
   */
  static async type(text: string): Promise<void> {
    // 使用临时文件写入要输入的文字，避免 shell 转义问题
    const tmpDir = await mkdtemp(join(tmpdir(), "peekaboo-type-"))
    const textFile = join(tmpDir, "text.txt")
    await writeFile(textFile, text, "utf-8")
    const textContent = text.replace(/\n/g, "\\n")
    await runPeekaboo(["type", textContent], 30_000)
  }

  /**
   * 按键盘按键
   */
  static async press(key: string): Promise<void> {
    await runPeekaboo(["press", key], 15_000)
  }

  /**
   * 快捷键
   */
  static async hotkey(keys: string): Promise<void> {
    await runPeekaboo(["hotkey", "--keys", keys], 15_000)
  }

  /**
   * 打开 URL
   */
  static async openUrl(url: string): Promise<void> {
    await runPeekaboo(["open", url], 15_000)
  }

  /**
   * 滚动
   */
  static async scroll(direction: string, amount = 5): Promise<void> {
    await runPeekaboo(["scroll", "--direction", direction, "--amount", String(amount)], 15_000)
  }

  /**
   * 检查 Peekaboo 是否可用
   */
  static async checkStatus(): Promise<{ available: boolean; permissions: string }> {
    try {
      const { stdout } = await runPeekaboo(["permissions"], 10_000)
      return { available: true, permissions: stdout.trim() }
    } catch {
      return { available: false, permissions: "Peekaboo 不可用或权限不足" }
    }
  }
}
