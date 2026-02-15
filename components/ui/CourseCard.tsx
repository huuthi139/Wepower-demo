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
    <Link href={`/courses/${course.id}`}>
      <div className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-primary-600 hover:shadow-card-hover transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.badge && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold ${
              course.badge === 'BESTSELLER' ? 'bg-accent-400 text-black' :
              course.badge === 'NEW' ? 'bg-primary-600 text-white' :
              'bg-gradient-to-r from-accent-400 to-primary-600 text-black'
            }`}>
              {course.badge}
            </div>
          )}
          {course.isFree && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold bg-green-600 text-white">
              MIỄN PHÍ
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <div className="text-xs text-accent-400 font-semibold mb-2 uppercase">
            {course.category}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-gray-400 mb-3">{course.instructor}</p>

          {/* Progress Bar (if enrolled) */}
          {showProgress && course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Tiến độ</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-accent-400 transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-white">{course.rating}</span>
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
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
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
          <div className="flex items-center justify-between">
            {course.isFree ? (
              <span className="text-xl font-bold text-green-400">Miễn phí</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{formatPrice(course.price)}</span>
                {course.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
