import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { auth: session, nextUrl } = req
  const pathname = nextUrl.pathname

  // 公开路由：登录/注册页不需要认证
  const publicRoutes = ["/login", "/register", "/api/auth", "/api/ai", "/api/dashboard", "/_next"]
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))

  // 如果是 API 路由，返回 JSON 而非重定向
  const isApiRoute = pathname.startsWith("/api")

  // 未登录访问非公开路由
  if (!session?.user && !isPublic) {
    if (isApiRoute) {
      return NextResponse.json(
        { code: 401, data: null, message: "未登录" },
        { status: 401 }
      )
    }
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (session?.user) {
    const response = NextResponse.next()
    response.headers.set("x-tenant-id", (session.user as any).tenantId || "")
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
