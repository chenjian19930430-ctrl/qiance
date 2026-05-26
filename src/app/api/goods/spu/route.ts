import { prisma } from '@/lib/prisma';
import { apiSuccess, apiList, apiError } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNum = parseInt(searchParams.get('pageNum') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const [rows, total] = await Promise.all([
      prisma.spu.findMany({
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      prisma.spu.count(),
    ]);

    return apiList(rows, total, pageNum, pageSize);
  } catch (error) {
    return apiError('查询失败');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spu = await prisma.spu.create({ data: body });
    return apiSuccess(spu, '创建成功');
  } catch (error) {
    return apiError('创建失败');
  }
}
