'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import Link from 'next/link';

const bannerSlides = [
  {
    id: 1,
    title: 'Ứng Dụng AI - Tăng Trưởng Doanh Số 2026',
    description: 'Học cách tận dụng AI để tăng doanh số và tối ưu quy trình kinh doanh',
    ctaText: 'Khám phá ngay',
    ctaLink: '/courses/2',
    bgGradient: 'from-purple/60 via-teal/30 to-dark',
  },
  {
    id: 2,
    title: 'Video AI Affiliate - Làm Chủ CapCut A-Z',
    description: 'Khóa học toàn diện về tạo video AI cho Affiliate Marketing',
    ctaText: 'Đăng ký học',
    ctaLink: '/courses/13',
    bgGradient: 'from-gold/40 via-purple/20 to-dark',
  },
  {
    id: 3,
    title: 'Marketing 2026 - Shopee & Facebook Ads',
    description: 'Chiến lược quảng cáo hiệu quả trên Shopee và Facebook',
    ctaText: 'Xem chi tiết',
    ctaLink: '/courses/6',
    bgGradient: 'from-teal/40 via-dark to-purple/30',
  },
];

export function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  return (
    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
      {/* Slides */}
      {bannerSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`w-full h-full bg-gradient-to-r ${slide.bgGradient} flex items-center justify-center`}>
            <div className="container mx-auto px-8 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in">
                {slide.description}
              </p>
              <Link href={slide.ctaLink}>
                <Button variant="primary" size="xl" className="animate-fade-in">
                  {slide.ctaText} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark/70 hover:bg-dark/90 border border-white/10 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark/70 hover:bg-dark/90 border border-white/10 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
