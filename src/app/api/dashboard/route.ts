import { apiSuccess, apiError } from '@/lib/utils';

// Dashboard模拟数据（Phase 1先返回静态示例数据，后续对接真实数据）
export async function GET() {
  try {
    const data = {
      overview: {
        todayRevenue: { value: 128560, change: 12.5, trend: 'up' },
        todayOrders: { value: 326, change: -3.2, trend: 'down' },
        todayVisitors: { value: 2849, change: 8.1, trend: 'up' },
        profitRate: { value: 18.6, change: 2.3, trend: 'up' },
      },
      revenueTrend: [
        { date: '05-20', value: 98000 },
        { date: '05-21', value: 105000 },
        { date: '05-22', value: 112000 },
        { date: '05-23', value: 99000 },
        { date: '05-24', value: 118000 },
        { date: '05-25', value: 125000 },
        { date: '05-26', value: 128560 },
      ],
      topProducts: [
        { name: '商品A', sales: 3280 },
        { name: '商品B', sales: 2450 },
        { name: '商品C', sales: 1890 },
        { name: '商品D', sales: 1560 },
        { name: '商品E', sales: 1230 },
      ],
      orderDistribution: {
        pending: 45,
        shipped: 128,
        completed: 892,
        refunded: 23,
      },
    };

    return apiSuccess(data);
  } catch (error) {
    return apiError('获取数据失败');
  }
}
