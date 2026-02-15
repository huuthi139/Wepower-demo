import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="bg-black border-2 border-white/10 rounded-xl p-8 hover:border-red/30 transition-all">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Tạo tài khoản mới
              </h1>
              <p className="text-white/60">
                Bắt đầu hành trình học tập của bạn
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullname" className="block text-white font-medium mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullname"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-white font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red transition-colors"
                  placeholder="0912 345 678"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-white font-medium mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-white/40 text-xs mt-1">Tối thiểu 8 ký tự</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-white font-medium mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 bg-white/5 border-2 border-white/10 rounded accent-red"
                />
                <span className="text-white/70 text-sm">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-red hover:underline">
                    Điều khoản dịch vụ
                  </Link>
                  {' '}và{' '}
                  <Link href="/privacy" className="text-red hover:underline">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <Button variant="primary" size="lg" className="w-full">
                Đăng ký ngay
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-white/40 text-sm">HOẶC</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Social Register */}
            <div className="space-y-3">
              <button className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Đăng ký với Google
              </button>

              <button className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Đăng ký với Facebook
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-white/60 text-sm mt-6">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-red hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
