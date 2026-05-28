import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type PlatformShop } from "./platform"
import { ShoppingBag, Package, Users, DollarSign } from "lucide-react"

export function ShopMetricsCards({ shop }: { shop?: PlatformShop }) {
  const m = shop?.metrics
  if (!m) return null

  const cards = [
    { title: "今日订单", value: m.todayOrders, icon: ShoppingBag, cls: "text-blue-500" },
    { title: "今日营收", value: `¥${(m.todayRevenue / 10000).toFixed(1)}万`, icon: DollarSign, cls: "text-green-500" },
    { title: "商品数", value: m.productCount, icon: Package, cls: "text-purple-500" },
    { title: "粉丝数", value: `${(m.followerCount / 10000).toFixed(1)}万`, icon: Users, cls: "text-orange-500" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.title}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs text-muted-foreground">{c.title}</CardTitle>
            <c.icon className={`h-4 w-4 ${c.cls}`} />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
