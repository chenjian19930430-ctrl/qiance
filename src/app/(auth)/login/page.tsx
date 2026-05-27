"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("登录成功")
    router.push("/ai/board")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[400px] shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">千策 QianCe AI</CardTitle>
          <CardDescription>电商AI智能体平台</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">密码登录</TabsTrigger>
              <TabsTrigger value="sms">短信验证码</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input id="username" name="username" placeholder="请输入用户名" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" name="password" type="password" placeholder="请输入密码" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登录中..." : "登录"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  还没有账号？
                  <a href="/register" className="text-primary hover:underline ml-1">
                    立即注册
                  </a>
                </p>
              </form>
            </TabsContent>
            <TabsContent value="sms">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input id="phone" placeholder="请输入手机号" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="flex gap-2">
                    <Input id="code" placeholder="请输入验证码" />
                    <Button variant="outline" className="shrink-0">获取验证码</Button>
                  </div>
                </div>
                <Button className="w-full">登录</Button>
                <p className="text-center text-sm text-muted-foreground">
                  还没有账号？
                  <a href="/register" className="text-primary hover:underline ml-1">
                    立即注册
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
