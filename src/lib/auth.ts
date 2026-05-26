import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: '手机号', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const phone = credentials.phone as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { phone },
          include: {
            role: {
              include: {
                roleMenus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
            tenant: true,
          },
        });

        if (!user) throw new Error('用户不存在');
        if (user.status === 1) throw new Error('账号已禁用');

        const isValid = await compare(password, user.password);
        if (!isValid) throw new Error('密码错误');

        const permissions = user.role?.roleMenus.map((rm) => rm.menu.permission).filter(Boolean) || [];

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          tenantId: user.tenantId,
          role: user.role?.code || 'user',
          permissions,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
