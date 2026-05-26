'use client';

import { FileCheck } from 'lucide-react';

export default function ReconciliationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">财务对账</h1>
        <p className="text-muted-foreground text-sm mt-1">智能对账，确保账实相符</p>
      </div>
      <div className="bg-white rounded-xl border border-border p-8">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileCheck size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">财务对账</p>
          <p className="text-sm">功能开发中...敬请期待</p>
        </div>
      </div>
    </div>
  );
}
