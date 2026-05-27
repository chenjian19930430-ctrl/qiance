import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { auth: session, nextUrl } = req
  const pathname = nextUrl.pathname

  // 公开路由：登录/注册页不需要认证
  const publicRoutes = ["/login", "/register", "/api/auth"]
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))

  // 未登录访问非公开路由 → 重定向到登录
  if (!session?.user && !isPublic) {
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
