"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      phone: formData.get("phone"),
    }

    if (data.password !== data.confirmPassword) {
      toast.error("两次密码不一致")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = await res.json()
    if (!res.ok) {
      toast.error(result.message || "注册失败")
      setLoading(false)
      return
    }

    toast.success("注册成功，请登录")
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[400px] shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">注册千策</CardTitle>
          <CardDescription>创建您的千策账号，开启AI电商之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" name="username" placeholder="请输入用户名（至少3位）" required minLength={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input id="phone" name="phone" placeholder="请输入手机号" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" name="password" type="password" placeholder="请输入密码（至少6位）" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="请再次输入密码" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号？
              <a href="/login" className="text-primary hover:underline ml-1">
                立即登录
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
