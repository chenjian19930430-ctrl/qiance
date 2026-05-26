'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'sms'>('password');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? '手机号或密码错误' : result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确手机号');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setSmsSent(true);
      } else {
        setError(data.msg || '发送失败');
      }
    } catch {
      setError('发送失败，请重试');
    }
  };

  const handleSmsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sms-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode }),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.msg || '验证码错误');
      }
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">千</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">千策AI</h1>
          </div>
          <p className="text-muted-foreground text-sm">电商AI智能体运营平台</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          {/* 模式切换 */}
          <div className="flex gap-2 mb-6 bg-muted rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                mode === 'password' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setMode('password')}
            >
              密码登录
            </button>
            <button
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                mode === 'sms' ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setMode('sms')}
            >
              短信登录
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">手机号</label>
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSmsLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">手机号</label>
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    maxLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsSent}
                    className="px-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {smsSent ? '已发送' : '获取验证码'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-muted-foreground">
            还没有账号？{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
