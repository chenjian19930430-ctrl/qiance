'use client';

import { Warehouse } from 'lucide-react';

export default function InventoryOverviewPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">库存概览</h1>
        <p className="text-muted-foreground text-sm mt-1">实时掌握库存动态</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Warehouse size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">库存概览</p>
          <p className="text-sm">功能开发中...敬请期待</p>
        </div>
      </div>
    </div>
  );
}
