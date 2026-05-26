'use client';

import { Layers } from 'lucide-react';

export default function GoodsSkuPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SKU管理</h1>
        <p className="text-muted-foreground text-sm mt-1">管理商品SKU规格与库存</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Layers size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">SKU管理</p>
          <p className="text-sm">功能开发中...敬请期待</p>
        </div>
      </div>
    </div>
  );
}
