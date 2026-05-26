'use client';

import { PieChart } from 'lucide-react';

export default function FinanceDashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">财务综合看板</h1>
        <p className="text-muted-foreground text-sm mt-1">财务数据总览与分析</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <PieChart size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">财务综合看板</p>
          <p className="text-sm">功能开发中...敬请期待</p>
        </div>
      </div>
    </div>
  );
}
