'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ChangePassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Không thể đổi mật khẩu');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <span className="text-4xl font-bold text-teal tracking-wider">WEDU</span>
      </Link>

      <div className="w-full max-w-md bg-white/[0.03] rounded-2xl border border-white/[0.06] p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Đổi mật khẩu</h1>
        <p className="text-gray-400 text-center mb-8">
          Vui lòng đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-white mb-2">
              Mật khẩu m���i
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-white/[0.06] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
              placeholder="Ít nhất 8 ký tự"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-white/[0.06] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
              placeholder="Nhập lại mật khẩu"
              minLength={8}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </div>
    </div>
  );
}
