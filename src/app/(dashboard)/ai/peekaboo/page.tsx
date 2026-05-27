"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Eye,
  MousePointerClick,
  Type,
  Globe,
  Keyboard,
  PanelBottom,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Terminal,
  ImageIcon,
  ExternalLink,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── 类型 ──────────────────────────────────────────

interface LogEntry {
  id: string
  timestamp: Date
  action: string
  status: "success" | "error" | "info"
  message: string
  details?: string
}

interface PeekabooStatus {
  available: boolean
  permissions: string
}

// ── 工具函数 ──────────────────────────────────────

function callPeekabooApi(payload: Record<string, unknown>) {
  return fetch("/api/peekaboo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json())
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ── 主页面 ────────────────────────────────────────

export default function PeekabooPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<PeekabooStatus | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<string>("")

  // 操作参数
  const [clickTarget, setClickTarget] = useState("")
  const [typeText, setTypeText] = useState("")
  const [openUrl, setOpenUrl] = useState("")
  const [hotkeyKeys, setHotkeyKeys] = useState("")
  const [pressKey, setPressKey] = useState("")
  const [analyzePrompt, setAnalyzePrompt] = useState("")

  const logEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动日志
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // 初始化：检查状态
  useEffect(() => {
    checkStatus()
  }, [])

  // ── 日志 ──────────────────────────────────────

  function addLog(action: string, status: "success" | "error" | "info", message: string, details?: string) {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        action,
        status,
        message,
        details,
      },
    ])
  }

  // ── 操作函数 ──────────────────────────────────

  async function checkStatus() {
    setLoading("status")
    try {
      const res = await callPeekabooApi({ action: "status" })
      if (res.success) {
        setStatus({ available: res.available, permissions: res.permissions })
        addLog("status", res.available ? "success" : "info", res.available ? "Peekaboo 可用" : "Peekaboo 不可用", res.permissions)
      } else {
        addLog("status", "error", "状态检查失败", res.error)
      }
    } catch (e) {
      addLog("status", "error", "状态检查异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleCapture() {
    setLoading("capture")
    setScreenshotUrl(null)
    try {
      const res = await callPeekabooApi({ action: "capture" })
      if (res.success) {
        setScreenshotUrl(res.path)
        addLog("capture", "success", "截图成功", res.path)
      } else {
        addLog("capture", "error", "截图失败", res.error)
        toast.error("截图失败: " + res.error)
      }
    } catch (e) {
      addLog("capture", "error", "截图异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleSee() {
    setLoading("see")
    setScreenshotUrl(null)
    setAnalyzeResult("")
    try {
      const res = await callPeekabooApi({ action: "see", analyze: analyzePrompt || undefined })
      if (res.success) {
        setScreenshotUrl(res.annotatedPath)
        setAnalyzeResult(res.snapshot)
        addLog("see", "success", "屏幕分析完成", `标注图: ${res.annotatedPath}`)
      } else {
        addLog("see", "error", "屏幕分析失败", res.error)
        toast.error("屏幕分析失败: " + res.error)
      }
    } catch (e) {
      addLog("see", "error", "屏幕分析异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleClick() {
    if (!clickTarget.trim()) {
      toast.error("请输入目标元素 ID 或坐标")
      return
    }
    setLoading("click")
    try {
      const res = await callPeekabooApi({ action: "click", target: clickTarget })
      if (res.success) {
        addLog("click", "success", `点击: ${clickTarget}`)
        toast.success(`已点击: ${clickTarget}`)
      } else {
        addLog("click", "error", `点击失败: ${clickTarget}`, res.error)
        toast.error("点击失败: " + res.error)
      }
    } catch (e) {
      addLog("click", "error", `点击异常: ${clickTarget}`, String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleType() {
    if (!typeText.trim()) {
      toast.error("请输入要输入的文字")
      return
    }
    setLoading("type")
    try {
      const res = await callPeekabooApi({ action: "type", text: typeText })
      if (res.success) {
        addLog("type", "success", `输入: "${typeText.slice(0, 30)}${typeText.length > 30 ? "..." : ""}"`)
        toast.success("输入完成")
        setTypeText("")
      } else {
        addLog("type", "error", "输入失败", res.error)
        toast.error("输入失败: " + res.error)
      }
    } catch (e) {
      addLog("type", "error", "输入异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleOpenUrl() {
    if (!openUrl.trim()) {
      toast.error("请输入 URL")
      return
    }
    setLoading("openUrl")
    try {
      const url = openUrl.startsWith("http") ? openUrl : `https://${openUrl}`
      const res = await callPeekabooApi({ action: "openUrl", url })
      if (res.success) {
        addLog("openUrl", "success", `打开: ${url}`)
        toast.success("已打开 URL")
      } else {
        addLog("openUrl", "error", "打开 URL 失败", res.error)
        toast.error("打开 URL 失败: " + res.error)
      }
    } catch (e) {
      addLog("openUrl", "error", "打开 URL 异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleHotkey() {
    if (!hotkeyKeys.trim()) {
      toast.error("请输入快捷键")
      return
    }
    setLoading("hotkey")
    try {
      const res = await callPeekabooApi({ action: "hotkey", keys: hotkeyKeys })
      if (res.success) {
        addLog("hotkey", "success", `快捷键: ${hotkeyKeys}`)
        toast.success(`快捷键: ${hotkeyKeys}`)
      } else {
        addLog("hotkey", "error", "快捷键失败", res.error)
        toast.error("快捷键失败: " + res.error)
      }
    } catch (e) {
      addLog("hotkey", "error", "快捷键异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handlePressKey() {
    if (!pressKey.trim()) {
      toast.error("请选择按键")
      return
    }
    setLoading("press")
    try {
      const res = await callPeekabooApi({ action: "press", key: pressKey })
      if (res.success) {
        addLog("press", "success", `按键: ${pressKey}`)
        toast.success(`按键: ${pressKey}`)
      } else {
        addLog("press", "error", `按键失败: ${pressKey}`, res.error)
        toast.error("按键失败: " + res.error)
      }
    } catch (e) {
      addLog("press", "error", `按键异常: ${pressKey}`, String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleScroll(direction: string) {
    setLoading("scroll")
    try {
      const res = await callPeekabooApi({ action: "scroll", direction })
      if (res.success) {
        addLog("scroll", "success", `滚动: ${direction}`)
      } else {
        addLog("scroll", "error", "滚动失败", res.error)
      }
    } catch (e) {
      addLog("scroll", "error", "滚动异常", String(e))
    } finally {
      setLoading(null)
    }
  }

  const scrollAction = (loading === "scroll")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Peekaboo 浏览器控制
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            给 AI 装上"眼睛和手" — 截图看页面，点击输入操作浏览器
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <Badge variant={status.available ? "default" : "destructive"} className="gap-1">
              {status.available ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {status.available ? "可用" : "不可用"}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={loading === "status"}>
            <RefreshCw className={cn("h-4 w-4 mr-1", loading === "status" && "animate-spin")} />
            状态
          </Button>
        </div>
      </div>

      {/* 权限提示 */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-amber-800 dark:text-amber-300">权限说明</p>
            <p className="text-amber-700 dark:text-amber-400">
              Peekaboo 需要 <strong>辅助功能 (Accessibility)</strong> 权限才能执行点击、输入等操作。
              截图功能不需要此权限。请在系统设置中授予 Peekaboo 权限：
            </p>
            <ol className="list-decimal list-inside text-amber-700 dark:text-amber-400 space-y-0.5">
              <li>打开 <strong>系统设置 → 隐私与安全性 → 辅助功能</strong></li>
              <li>点击 <strong>+</strong> 添加 Peekaboo（路径: <code className="text-xs">/Users/openclaw/.local/bin/peekaboo</code>）</li>
              <li>勾选 Peekaboo 的开关 ✅</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：操作面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 视觉 - 截图/看 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" />
                视觉
              </CardTitle>
              <CardDescription>截图和 AI 分析屏幕内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleCapture} disabled={!!loading}>
                {loading === "capture" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                截图 (Capture)
              </Button>
              <div className="space-y-2">
                <Input
                  placeholder="分析提示（可选）如: 描述当前页面"
                  value={analyzePrompt}
                  onChange={(e) => setAnalyzePrompt(e.target.value)}
                  className="text-sm"
                />
                <Button className="w-full" variant="secondary" onClick={handleSee} disabled={!!loading}>
                  {loading === "see" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  看+AI分析 (See)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 手 - 点击/输入 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                操作
              </CardTitle>
              <CardDescription>点击元素、输入文字</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="元素ID 如 B3 / 坐标如 100,200"
                  value={clickTarget}
                  onChange={(e) => setClickTarget(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button size="sm" onClick={handleClick} disabled={!!loading}>
                  {loading === "click" ? <Loader2 className="h-4 w-4 animate-spin" /> : "点击"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="要输入的文字"
                  value={typeText}
                  onChange={(e) => setTypeText(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button size="sm" variant="secondary" onClick={handleType} disabled={!!loading}>
                  {loading === "type" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Type className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 浏览器 - 打开URL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                浏览器
              </CardTitle>
              <CardDescription>打开 URL、滚动页面</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="URL 地址"
                  value={openUrl}
                  onChange={(e) => setOpenUrl(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button size="sm" onClick={handleOpenUrl} disabled={!!loading}>
                  {loading === "openUrl" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleScroll("up")} disabled={scrollAction}>
                  上滚动
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleScroll("down")} disabled={scrollAction}>
                  下滚动
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 键盘 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                键盘
              </CardTitle>
              <CardDescription>快捷键和按键操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="快捷键如 cmd,c"
                  value={hotkeyKeys}
                  onChange={(e) => setHotkeyKeys(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button size="sm" onClick={handleHotkey} disabled={!!loading}>
                  {loading === "hotkey" ? <Loader2 className="h-4 w-4 animate-spin" /> : "执行"}
                </Button>
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {["return", "tab", "escape", "delete", "space", "up", "down", "left", "right"].map((k) => (
                    <Button
                      key={k}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setPressKey(k)
                        setTimeout(() => handlePressKey(), 100)
                      }}
                      disabled={!!loading}
                    >
                      {k}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览 + 日志 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 截图预览 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                截图预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              {screenshotUrl ? (
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
                  <Image
                    src={screenshotUrl}
                    alt="Peekaboo 截图"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-muted rounded-lg border flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Camera className="h-10 w-10 mx-auto opacity-30" />
                    <p className="text-sm">点击左侧"截图"或"看"获取屏幕内容</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI 分析结果 */}
          {analyzeResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  UI 分析结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 w-full">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">{analyzeResult}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* 操作日志 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                操作日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full">
                <div className="space-y-1">
                  {logs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">暂无操作记录</p>
                  )}
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground shrink-0 w-16 text-xs">{formatTime(log.timestamp)}</span>
                      <Badge
                        variant={log.status === "success" ? "default" : log.status === "error" ? "destructive" : "secondary"}
                        className="text-[10px] px-1 py-0 h-5 shrink-0"
                      >
                        {log.action}
                      </Badge>
                      <span className={cn(
                        "flex-1",
                        log.status === "error" && "text-destructive",
                        log.status === "success" && "text-foreground",
                      )}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
