import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { mockCourses } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = mockCourses.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  const curriculum = [
    { id: 1, title: 'Giới thiệu khóa học', lessons: 3, duration: 900 },
    { id: 2, title: 'Kiến thức nền tảng', lessons: 8, duration: 3600 },
    { id: 3, title: 'Thực hành project', lessons: 12, duration: 7200 },
    { id: 4, title: 'Kỹ thuật nâng cao', lessons: 10, duration: 5400 },
    { id: 5, title: 'Tổng kết & chứng chỉ', lessons: 2, duration: 1800 },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-black border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                <a href="/courses" className="hover:text-white">Khóa học</a>
                <span>/</span>
                <span className="text-yellow">{course.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-white/70 mb-6">
                Khóa học toàn diện giúp bạn thành thạo {course.title.toLowerCase()} từ cơ bản đến nâng cao.
                Học với WePower Academy - nơi tạo ra những chuyên gia thực thụ.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-white">{course.rating}</span>
                  <span className="text-white/60">({course.reviewsCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{course.enrollmentsCount.toLocaleString()} học viên</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(course.duration)}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-12 h-12 bg-red rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">W</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">Giảng viên</p>
                  <p className="font-bold text-white">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Right: Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-black border-2 border-red/30 rounded-xl p-6 hover:border-red hover:shadow-glow-red transition-all">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
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
                </div>

                {/* Price */}
                <div className="mb-6">
                  {course.isFree ? (
                    <span className="text-3xl font-bold text-yellow">Miễn phí</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-red">{formatPrice(course.price)}</span>
                      {course.originalPrice && (
                        <span className="ml-2 text-lg text-white/40 line-through">
                          {formatPrice(course.originalPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 mb-6">
                  <Button variant="primary" size="lg" className="w-full">
                    Đăng ký ngay
                  </Button>
                  <Button variant="secondary" size="lg" className="w-full">
                    Thêm vào wishlist
                  </Button>
                </div>

                {/* Includes */}
                <div className="space-y-3 text-sm">
                  <h4 className="font-bold text-white mb-3">Khóa học bao gồm:</h4>
                  <div className="flex items-center gap-2 text-white/70">
                    <svg className="w-5 h-5 text-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{formatDuration(course.duration)} video HD</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <svg className="w-5 h-5 text-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{course.lessonsCount} bài học</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <svg className="w-5 h-5 text-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Tài liệu học tập</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <svg className="w-5 h-5 text-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Chứng chỉ hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <svg className="w-5 h-5 text-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Truy cập trọn đời</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">Nội dung khóa học</h2>

            <div className="space-y-3">
              {curriculum.map((section) => (
                <details key={section.id} className="bg-black border border-white/10 rounded-lg group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h3 className="font-bold text-white">Chương {section.id}: {section.title}</h3>
                        <p className="text-sm text-white/60">{section.lessons} bài học • {formatDuration(section.duration)}</p>
                      </div>
                    </div>
                  </summary>
                  <div className="p-4 pt-0 border-t border-white/10">
                    <div className="space-y-2">
                      {Array.from({ length: section.lessons }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded">
                          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-white/70">Bài {i + 1}: {section.title} - Phần {i + 1}</span>
                          <span className="ml-auto text-sm text-white/40">{Math.floor(section.duration / section.lessons / 60)}:00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
