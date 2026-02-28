'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCourses } from '@/contexts/CoursesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment } from '@/contexts/EnrollmentContext';

export default function MyCourses() {
  const { courses, isLoading } = useCourses();
  const { user } = useAuth();
  const { enrollments } = useEnrollment();

  // Map enrollments to courses with progress
  const enrolledCourses = enrollments
    .map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) return null;
      return { ...course, progress: enrollment.progress };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter(c => (c.progress ?? 0) < 100);

  // Recommend courses user hasn't enrolled in
  const enrolledIds = new Set(enrollments.map(e => e.courseId));
  const recommendedCourses = courses.filter(c => !enrolledIds.has(c.id)).slice(0, 3);

  return (
    <div className="min-h-screen bg-dark">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Khóa học của tôi
          </h1>
          <p className="text-gray-400">
            Theo dõi tiến độ và tiếp tục hành trình học tập
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-white mb-1">{enrolledCourses.length}</div>
            <div className="text-sm text-gray-400">Tổng khóa học</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-gold mb-1">{inProgressCourses.length}</div>
            <div className="text-sm text-gray-400">Đang học</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal mb-1">{completedCourses.length}</div>
            <div className="text-sm text-gray-400">Đã hoàn thành</div>
          </div>
        </div>

        {/* In Progress */}
        {inProgressCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Đang học</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => (
                <CourseCard key={course.id} course={course} showProgress={true} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Đã hoàn thành</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <CourseCard key={course.id} course={course} showProgress={true} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {enrolledCourses.length === 0 && (
          <div className="mb-12 text-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-400 mb-2">Bạn chưa đăng ký khóa học nào</p>
            <p className="text-gray-500 text-sm mb-4">Hãy khám phá các khóa học và bắt đầu hành trình học tập!</p>
            <Link href="/courses">
              <Button variant="primary" size="md">Khám phá khóa học</Button>
            </Link>
          </div>
        )}

        {/* Recommended */}
        {recommendedCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Khóa học đề xuất</h2>
              <Link href="/courses">
                <Button variant="ghost" size="sm">
                  Xem tất cả →
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
