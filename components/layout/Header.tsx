'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-red/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-red tracking-wider">WEPOWER</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-white/70 hover:text-white transition-colors font-medium">
              Khóa học
            </Link>
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/community" className="text-white/70 hover:text-white transition-colors font-medium">
              Cộng Đồng
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="text-white/70 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/5"
            >
              {language === 'vi' ? '🇻🇳 Việt' : '🇬🇧 Eng'}
            </button>

            {/* Cart Button */}
            <Link href="/cart" className="relative">
              <button className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/login">
              <Button variant="ghost" size="md">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="md">
                Đăng ký
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-red/20">
            <nav className="flex flex-col gap-4">
              <Link href="/courses" className="text-white/70 hover:text-white transition-colors">
                Khóa học
              </Link>
              <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/community" className="text-white/70 hover:text-white transition-colors">
                Cộng Đồng
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-red/20">
                <Button variant="ghost" size="md" className="w-full">
                  Đăng nhập
                </Button>
                <Button variant="primary" size="md" className="w-full">
                  Đăng ký
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
