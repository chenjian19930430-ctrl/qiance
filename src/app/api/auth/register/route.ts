import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { phone, password, companyName, name } = await request.json();

    if (!phone || !password || !companyName || !name) {
      return apiError('缺少必要参数');
    }

    // 查重
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return apiError('手机号已注册');
    }

    const hashedPassword = await hash(password, 10);

    // 创建租户
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        code: `TENANT_${Date.now()}`,
      },
    });

    // 创建默认管理员角色
    const role = await prisma.role.create({
      data: {
        name: '管理员',
        code: 'admin',
        tenantId: tenant.id,
      },
    });

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        tenantId: tenant.id,
        roleId: role.id,
      },
    });

    return apiSuccess({ userId: user.id }, '注册成功');
  } catch (error) {
    console.error('注册失败:', error);
    return apiError('注册失败');
  }
}
