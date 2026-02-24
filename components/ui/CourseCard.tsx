'use client';

import { Course } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

export function CourseCard({ course, showProgress = false }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white/[0.02] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {course.badge && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${
              course.badge === 'BESTSELLER' ? 'bg-yellow text-black' :
              course.badge === 'NEW' ? 'bg-red text-white' :
              'bg-white/90 text-black'
            }`}>
              {course.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Category */}
          <div className="text-[10px] text-red font-bold uppercase tracking-wider mb-2">
            {course.category}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-gray-200 transition-colors leading-snug min-h-[2.5rem]">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>

          {/* Progress Bar (if enrolled) */}
          {showProgress && course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Tiến độ</span>
                <span className={`font-bold ${course.progress === 100 ? 'text-green-400' : 'text-yellow'}`}>
                  {course.progress}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${course.progress === 100 ? 'bg-green-400' : 'bg-red'}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-white">{course.rating}</span>
              <span>({course.reviewsCount})</span>
            </div>
            <span className="text-gray-700">·</span>
            <span>{course.enrollmentsCount.toLocaleString()} học viên</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>{formatDuration(course.duration)}</span>
            <span className="text-gray-700">·</span>
            <span>{course.lessonsCount} bài học</span>
          </div>

          {/* Spacer to push price to bottom */}
          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
            <div>
              {course.isFree ? (
                <span className="text-lg font-bold text-yellow">Miễn phí</span>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-yellow">{formatPrice(course.price)}</span>
                  {course.originalPrice && (
                    <span className="text-xs text-gray-600 line-through">
                      {formatPrice(course.originalPrice)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="flex-shrink-0 px-3 py-1.5 bg-red text-white text-xs font-bold rounded-lg group-hover:bg-red/80 transition-colors">
              Đăng Ký Ngay
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
