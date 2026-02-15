'use client';

import { Course } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/providers/ToastProvider';
import { Button } from './Button';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

export function CourseCard({ course, showProgress = false }: CourseCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    setIsAdding(true);
    addToCart(course, () => {
      showToast(`Đã thêm "${course.title}" vào giỏ hàng!`, 'success');
      setTimeout(() => setIsAdding(false), 500);
    });
  };

  return (
    <div className="group bg-black rounded-xl overflow-hidden border border-white/10 hover:border-red hover:shadow-card-hover transition-all duration-300">
      <Link href={`/courses/${course.id}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.badge && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-bold ${
              course.badge === 'BESTSELLER' ? 'bg-yellow text-black' :
              course.badge === 'NEW' ? 'bg-red text-white' :
              'bg-yellow text-black'
            }`}>
              {course.badge}
            </div>
          )}
          {course.isFree && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold bg-white text-black">
              MIỄN PHÍ
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <div className="text-xs text-yellow font-bold mb-2 uppercase min-h-[16px]">
            {course.category}
          </div>

          {/* Title - Fixed height for 2 lines */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red transition-colors min-h-[56px]">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-white/60 mb-3 min-h-[20px]">{course.instructor}</p>

          {/* Progress Bar (if enrolled) */}
          {showProgress && course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Tiến độ</span>
                <span className="text-yellow font-bold">{course.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-white">{course.rating}</span>
              <span>({course.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{course.enrollmentsCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4 text-xs text-white/60 min-h-[20px]">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{course.lessonsCount} bài học</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {course.isFree ? (
              <span className="text-xl font-bold text-yellow">Miễn phí</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-yellow">{formatPrice(course.price)}</span>
                {course.originalPrice && (
                  <span className="text-sm text-white/40 line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          {!showProgress && (
            <div className="mt-4">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Thêm vào giỏ
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
