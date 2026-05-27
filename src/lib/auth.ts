import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码")
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          throw new Error("用户不存在")
        }

        if (user.status === 1) {
          throw new Error("账号已被禁用")
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) {
          throw new Error("密码错误")
        }

        return {
          id: user.id,
          username: user.username,
          realName: user.realName,
          tenantId: user.tenantId,
          roles: user.roles.map((ur) => ur.role.code),
          permissions: user.roles.flatMap((ur) =>
            ur.role.permissions.map((rp) => rp.permission.code)
          ),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.tenantId = (user as any).tenantId
        token.roles = (user as any).roles
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        ;(session.user as any).tenantId = token.tenantId as string
        ;(session.user as any).roles = token.roles as string[]
        ;(session.user as any).permissions = token.permissions as string[]
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
})
