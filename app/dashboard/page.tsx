import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { Header } from '@/components/layout/Header';
import { enrolledCourses } from '@/lib/mockData';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Chào mừng trở lại, Kevin! 👋
          </h1>
          <p className="text-gray-400">
            Tiếp tục hành trình học tập của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Courses Enrolled */}
          <div className="bg-red rounded-xl p-6 hover:shadow-glow-red transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">3</div>
            <div className="text-white/90 text-sm">Khóa học đang học</div>
          </div>

          {/* Hours Learned */}
          <div className="bg-yellow rounded-xl p-6 hover:shadow-glow-yellow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-black mb-1">24.5</div>
            <div className="text-black/90 text-sm">Giờ đã học</div>
          </div>

          {/* Certificates */}
          <div className="bg-black border-2 border-white/10 rounded-xl p-6 hover:border-red transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">1</div>
            <div className="text-white/60 text-sm">Chứng chỉ đã đạt</div>
          </div>

          {/* Current Streak */}
          <div className="bg-black border-2 border-white/10 rounded-xl p-6 hover:border-yellow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">7</div>
            <div className="text-white/60 text-sm">Ngày học liên tiếp 🔥</div>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tiếp tục học</h2>
            <Button variant="ghost" size="sm">
              Xem tất cả
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} showProgress={true} />
            ))}
          </div>
        </div>

        {/* Learning Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weekly Activity Chart */}
          <div className="bg-black border-2 border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Hoạt động tuần này</h3>
            <div className="space-y-4">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => {
                const hours = [2.5, 3.0, 1.5, 4.0, 2.0, 3.5, 1.0][index];
                const percentage = (hours / 4) * 100;
                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">{day}</span>
                      <span className="text-sm text-yellow font-bold">{hours}h</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-black border-2 border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Thành tích gần đây</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-yellow/20">
                <div className="w-12 h-12 bg-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">Học viên kiên trì</h4>
                  <p className="text-sm text-white/60">Hoàn thành 7 ngày học liên tiếp</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-red/20">
                <div className="w-12 h-12 bg-red rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">Hoàn thành xuất sắc</h4>
                  <p className="text-sm text-white/60">Đạt 100% trong khóa học</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">Người mới</h4>
                  <p className="text-sm text-white/60">Đăng ký thành công tài khoản</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black border-2 border-red/30 rounded-xl p-8 text-center hover:border-red hover:shadow-glow-red transition-all">
          <h3 className="text-2xl font-bold text-white mb-4">
            Khám phá thêm khóa học mới
          </h3>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            Mở rộng kiến thức của bạn với 15+ khóa học chất lượng cao
          </p>
          <Button variant="primary" size="lg">
            Xem khóa học →
          </Button>
        </div>
      </div>
    </div>
  );
}
