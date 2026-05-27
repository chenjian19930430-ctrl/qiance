"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">UMENU</h2>
        <p className="text-muted-foreground">功能开发中，敬请期待...</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">数据概览</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">该模块正在开发中，将在后续版本上线。</p>
        </CardContent>
      </Card>
    </div>
  )
}
