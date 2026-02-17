import Link from 'next/link';
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow/8 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-300">Hơn 10,000+ học viên đã tin tưởng</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Sổ tay hướng dẫn làm</span>
              <br />
              <span className="text-gradient">kinh doanh chuyên nghiệp</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Học từ các chuyên gia hàng đầu. Nâng cao kỹ năng.
              <br className="hidden sm:block" />
              Thay đổi sự nghiệp của bạn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/courses">
                <Button variant="primary" size="xl">
                  Bắt đầu học ngay
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="xl">
                  Xem bảng giá
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-10 border-t border-white/10">
              {[
                { value: '150+', label: 'Khóa học' },
                { value: '10K+', label: 'Học viên' },
                { value: '50+', label: 'Giảng viên' },
                { value: '4.8', label: 'Đánh giá TB' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="container mx-auto px-4 pb-16">
        <BannerCarousel />
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-red text-sm font-bold uppercase tracking-wider mb-2">Nổi bật</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Khóa học được yêu thích nhất
              </h2>
            </div>
            <Link href="/courses" className="hidden sm:block">
              <Button variant="ghost">
                Xem tất cả →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/courses">
              <Button variant="ghost">
                Xem tất cả khóa học →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-red/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-yellow/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-yellow text-sm font-bold uppercase tracking-wider mb-2">Ưu điểm</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tại sao chọn <span className="text-red">WEPOWER</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Nền tảng học tập trực tuyến hàng đầu với công nghệ tiên tiến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-red/50 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-14 h-14 bg-red/10 border border-red/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red/20 transition-colors">
                <svg className="w-7 h-7 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Video chất lượng cao</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Trải nghiệm học tập tối ưu với video 4K, tốc độ tải nhanh trên mọi thiết bị.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-yellow/50 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-14 h-14 bg-yellow/10 border border-yellow/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow/20 transition-colors">
                <svg className="w-7 h-7 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Chứng chỉ uy tín</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học từ WePower Academy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-red/50 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-14 h-14 bg-red/10 border border-red/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red/20 transition-colors">
                <svg className="w-7 h-7 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Học mọi lúc mọi nơi</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Truy cập khóa học 24/7 trên mọi thiết bị. Học lúc nào cũng được, ở đâu cũng tiện.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-red text-sm font-bold uppercase tracking-wider mb-2">Phản hồi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Học viên nói gì về chúng tôi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Nguyễn Minh Tuấn',
                role: 'Marketing Manager',
                text: 'Khóa học rất chất lượng! Tôi đã áp dụng thành công kiến thức vào công việc thực tế và tăng doanh thu 30%.',
                avatar: 'T',
              },
              {
                name: 'Trần Thu Hà',
                role: 'Freelancer',
                text: 'Nội dung rất phong phú, giảng viên nhiệt tình. Đặc biệt phần thực hành giúp tôi hiểu sâu hơn.',
                avatar: 'H',
              },
              {
                name: 'Lê Văn Đức',
                role: 'CEO Startup',
                text: 'WePower giúp tôi xây dựng hệ thống kinh doanh online hiệu quả. Đầu tư xứng đáng!',
                avatar: 'D',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red to-yellow rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-gray-500 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-red/20 via-red/10 to-yellow/10 border border-red/20 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/10 rounded-full blur-[80px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Tham gia cùng hàng ngàn học viên đã thay đổi sự nghiệp của họ với WePower Academy
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button variant="primary" size="lg">
                    Đăng ký miễn phí
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="ghost" size="lg">
                    Xem khóa học →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
