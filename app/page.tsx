import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { BannerCarousel } from '@/components/ui/BannerCarousel';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { mockCourses } from '@/lib/mockData';

export default function Home() {
  const featuredCourses = mockCourses.slice(0, 6);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Banner Carousel */}
      <section className="container mx-auto px-4 py-8">
        <BannerCarousel />
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-accent-400/20" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">Hơn 10,000+ học viên đã tin tưởng</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Sổ tay hướng dẫn làm kinh doanh chuyên nghiệp
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Học từ các chuyên gia hàng đầu. Nâng cao kỹ năng. Thay đổi sự nghiệp của bạn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="xl">
                Bắt đầu học ngay
              </Button>
              <Button variant="secondary" size="xl">
                Xem demo miễn phí
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-800">
              <div>
                <div className="text-3xl font-bold text-white mb-2">150+</div>
                <div className="text-sm text-gray-400">Khóa học</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm text-gray-400">Học viên</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-sm text-gray-400">Giảng viên</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">4.8★</div>
                <div className="text-sm text-gray-400">Đánh giá TB</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Khóa học nổi bật
              </h2>
              <p className="text-gray-400">
                Những khóa học được yêu thích nhất tháng này
              </p>
            </div>
            <Button variant="ghost">
              Xem tất cả →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tại sao chọn <span className="text-red">WEPOWER</span>?
            </h2>
            <p className="text-white/60 text-lg">
              Nền tảng học tập trực tuyến hàng đầu với công nghệ tiên tiến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Red theme */}
            <div className="bg-black border-2 border-red/30 rounded-xl p-8 hover:border-red hover:shadow-glow-red transition-all group">
              <div className="w-16 h-16 bg-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Video chất lượng cao</h3>
              <p className="text-white/60 leading-relaxed">
                Trải nghiệm học tập tối ưu với video 4K, tốc độ tải nhanh
              </p>
            </div>

            {/* Feature 2 - Yellow theme */}
            <div className="bg-black border-2 border-yellow/30 rounded-xl p-8 hover:border-yellow hover:shadow-glow-yellow transition-all group">
              <div className="w-16 h-16 bg-yellow rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chứng chỉ uy tín</h3>
              <p className="text-white/60 leading-relaxed">
                Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học
              </p>
            </div>

            {/* Feature 3 - Red theme */}
            <div className="bg-black border-2 border-red/30 rounded-xl p-8 hover:border-red hover:shadow-glow-red transition-all group">
              <div className="w-16 h-16 bg-red rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Học mọi lúc mọi nơi</h3>
              <p className="text-white/60 leading-relaxed">
                Truy cập khóa học 24/7 trên mọi thiết bị
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Sẵn sàng bắt đầu học?
          </h2>
          <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn học viên đã thay đổi sự nghiệp của họ
          </p>
          <Button variant="secondary" size="xl" className="bg-black text-white hover:bg-gray-900">
            Đăng ký miễn phí ngay
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
