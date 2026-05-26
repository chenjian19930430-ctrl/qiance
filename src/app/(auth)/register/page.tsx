'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('两次密码不一致');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
          companyName: form.companyName,
          name: form.name,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/login');
      } else {
        setError(data.msg || '注册失败');
      }
    } catch {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">千</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">千策AI</h1>
          </div>
          <p className="text-muted-foreground text-sm">创建您的企业账号</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">公司名称</label>
              <input
                type="text"
                placeholder="请输入公司名称"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">姓名</label>
              <input
                type="text"
                placeholder="请输入您的姓名"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">手机号</label>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">密码</label>
              <input
                type="password"
                placeholder="至少6位密码"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">确认密码</label>
              <input
                type="password"
                placeholder="再次输入密码"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            已有账号？{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
