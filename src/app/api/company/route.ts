import { prisma } from '@/lib/prisma';
import { apiSuccess, apiList, apiError } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNum = parseInt(searchParams.get('pageNum') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const name = searchParams.get('name') || '';

    const where = name ? { name: { contains: name } } : {};

    const [rows, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    return apiList(rows, total, pageNum, pageSize);
  } catch (error) {
    console.error('查询公司列表失败:', error);
    return apiError('查询失败');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const company = await prisma.company.create({ data: body });
    return apiSuccess(company, '创建成功');
  } catch (error) {
    console.error('创建公司失败:', error);
    return apiError('创建失败');
  }
}
