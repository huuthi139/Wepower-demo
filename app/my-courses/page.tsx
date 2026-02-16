import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { enrolledCourses, mockCourses } from '@/lib/mockData';

export default function MyCourses() {
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter(c => (c.progress ?? 0) < 100);
  const recommendedCourses = mockCourses
    .filter(c => !enrolledCourses.find(e => e.id === c.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black">
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
            <div className="text-3xl font-bold text-yellow mb-1">{inProgressCourses.length}</div>
            <div className="text-sm text-gray-400">Đang học</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-red mb-1">{completedCourses.length}</div>
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

        {/* Recommended */}
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
      </div>

      <Footer />
    </div>
  );
}
