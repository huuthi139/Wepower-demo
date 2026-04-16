'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/ui/NotificationBell';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const adminRef = useRef<HTMLDivElement>(null);

  // Close admin dropdown on outside click
  useEffect(() => {
    if (!adminDropdown) return;
    const handler = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) setAdminDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [adminDropdown]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-bold text-gold tracking-wider">WEDU</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors font-medium">
              Trang Chủ
            </Link>
            <Link href="/courses" className="text-white/70 hover:text-white transition-colors font-medium">
              Khóa Học
            </Link>
            <Link href="/community" className="text-white/70 hover:text-white transition-colors font-medium">
              Cộng Đồng
            </Link>
            {(user?.role === 'admin' || user?.role === 'sub_admin') && (
              <div className="relative" ref={adminRef}>
                <button
                  onClick={() => setAdminDropdown(p => !p)}
                  className="flex items-center gap-1 text-teal hover:text-teal/80 transition-colors font-medium"
                >
                  Admin
                  <svg className={`w-3.5 h-3.5 transition-transform ${adminDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50">
                    {[
                      { label: 'Tổng quan', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
                      { label: 'Học viên', href: '/admin?tab=students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                      { label: 'Khóa học', href: '/admin?tab=courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                      { label: 'Đơn hàng', href: '/admin?tab=orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
                      { label: 'Nhân sự', href: '/admin?tab=staff', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { label: 'Kho Video', href: '/admin?tab=videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                      { label: 'Affiliate', href: '/admin?tab=affiliate', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAdminDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 px-4 pl-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/5"
              aria-label="Chuyển ngôn ngữ"
            >
              {language === 'vi' ? '🇻🇳 Việt' : '🇬🇧 Eng'}
            </button>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Cart Button */}
            <Link href="/cart" className="relative text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" aria-label="Giỏ hàng">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {/* User Info */}
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm text-white font-medium leading-tight">{user.name}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {user.role === 'admin' ? 'Admin' : user.role === 'sub_admin' ? 'Admin phụ' : user.memberLevel}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  aria-label="Đăng xuất"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Cart + Notif + Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Notification */}
            {user && <NotificationBell />}

            {/* Mobile Cart */}
            <Link href="/cart" className="relative text-white/70 hover:text-white transition-colors p-2" aria-label="Giỏ hàng">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/[0.06] animate-slideDown">
            <nav className="flex flex-col gap-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="md:hidden">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 px-4 pl-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              {/* User info on mobile */}
              {user && (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.role === 'admin' ? 'Admin' : user.role === 'sub_admin' ? 'Admin phụ' : user.memberLevel}</p>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang Chủ
              </Link>
              <Link
                href="/courses"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Khóa Học
              </Link>
              <Link
                href="/community"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cộng Đồng
              </Link>
              {user && (
                <>
                  <Link
                    href="/certificates"
                    className="text-white/70 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chứng chỉ
                  </Link>
                  <Link
                    href="/dashboard/affiliate"
                    className="text-white/70 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Affiliate
                  </Link>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'sub_admin') && (
                <div className="py-2">
                  <span className="text-teal font-medium text-sm">Admin</span>
                  <div className="ml-3 mt-1 flex flex-col gap-1">
                    {[
                      { label: 'Tổng quan', href: '/admin' },
                      { label: 'Học viên', href: '/admin?tab=students' },
                      { label: 'Khóa học', href: '/admin?tab=courses' },
                      { label: 'Đơn hàng', href: '/admin?tab=orders' },
                      { label: 'Nhân sự', href: '/admin?tab=staff' },
                      { label: 'Kho Video', href: '/admin?tab=videos' },
                      { label: 'Affiliate', href: '/admin?tab=affiliate' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white/60 hover:text-white text-sm py-1 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Switcher Mobile */}
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="text-white/70 hover:text-white transition-colors py-2 text-left"
              >
                {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
              </button>

              <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="md" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="primary" size="md" className="w-full" onClick={handleLogout}>
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="md" className="w-full">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        Đăng ký
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
