'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './Button';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  bgGradient: string;
}

const banners: Banner[] = [
  {
    id: '1',
    title: 'Ứng Dụng AI',
    subtitle: 'TĂNG TRƯỞNG DOANH SỐ 2026',
    description: 'Học cách ứng dụng AI để tăng trưởng doanh số vượt bậc',
    ctaText: 'NHẬN VÉ MIỄN PHÍ NGAY',
    ctaLink: '/courses/1',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    bgGradient: 'from-red/80 via-purple-900/80 to-blue-900/80',
  },
  {
    id: '2',
    title: 'Video AI Affiliate',
    subtitle: 'LÀM CHỦ CAPCUT A-Z',
    description: 'Tạo video chuyên nghiệp với AI và kiếm tiền từ Affiliate',
    ctaText: 'ĐĂNG KÝ NGAY',
    ctaLink: '/courses/2',
    image: 'https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=1200&h=400&fit=crop',
    bgGradient: 'from-yellow/80 via-orange-600/80 to-red/80',
  },
  {
    id: '3',
    title: 'Marketing 2026',
    subtitle: 'SHOPEE & FACEBOOK ADS',
    description: 'Chiến lược marketing hiệu quả trên Shopee và Facebook',
    ctaText: 'XEM NGAY',
    ctaLink: '/courses/3',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop',
    bgGradient: 'from-blue-600/80 via-cyan-600/80 to-teal-600/80',
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl group">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={currentBanner.image}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient}`} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Animated Title */}
            <h2
              className="text-4xl md:text-6xl font-black text-white mb-4 animate-fade-in"
              style={{
                textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
                animation: 'fadeInUp 0.6s ease-out',
              }}
            >
              {currentBanner.title}
            </h2>

            {/* Subtitle */}
            <h3
              className="text-3xl md:text-5xl font-black text-yellow mb-6"
              style={{
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                animation: 'fadeInUp 0.6s ease-out 0.1s backwards',
              }}
            >
              {currentBanner.subtitle}
            </h3>

            {/* Description */}
            <p
              className="text-lg md:text-xl text-white/90 mb-8"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
              }}
            >
              {currentBanner.description}
            </p>

            {/* CTA Button */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
              <Button
                variant="accent"
                size="xl"
                className="hover:scale-110 transition-transform shadow-glow-yellow"
              >
                {currentBanner.ctaText} →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-8 h-3 bg-yellow rounded-full'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80 rounded-full'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
