import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError('未登录', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        tenantId: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return apiError('用户不存在');
    }

    return apiSuccess(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return apiError('获取失败');
  }
}
