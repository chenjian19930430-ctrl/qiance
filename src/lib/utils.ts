import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function paginate<T>(data: T[], pageNum: number, pageSize: number) {
  const start = (pageNum - 1) * pageSize;
  const items = data.slice(start, start + pageSize);
  return {
    rows: items,
    total: data.length,
    pageNum,
    pageSize,
  };
}

export function apiSuccess<T>(data: T, msg = '操作成功') {
  return Response.json({ code: 200, msg, data });
}

export function apiError(msg: string, code = 500) {
  return Response.json({ code, msg, data: null }, { status: code });
}

export function apiList<T>(rows: T[], total: number, pageNum = 1, pageSize = 10) {
  return Response.json({ code: 200, msg: '查询成功', rows, total, pageNum, pageSize });
}
