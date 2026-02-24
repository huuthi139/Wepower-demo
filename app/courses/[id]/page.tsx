'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { mockCourses } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/providers/ToastProvider';
import Image from 'next/image';

import type { MemberLevel } from '@/lib/mockData';

function isEmbedUrl(url: string): boolean {
  return /mediadelivery\.net\/(embed|play)/.test(url) || /player\.mediadelivery\.net/.test(url);
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  requiredLevel: MemberLevel;
  directPlayUrl: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const defaultChapters: Chapter[] = [
  {
    id: 'ch-1',
    title: 'Giới thiệu khóa học',
    lessons: [
      { id: 'ls-1-1', title: 'Tổng quan về khóa học', duration: '05:30', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-1-2', title: 'Cách học hiệu quả nhất', duration: '08:15', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-1-3', title: 'Chuẩn bị công cụ cần thiết', duration: '12:00', requiredLevel: 'Free', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Kiến thức nền tảng',
    lessons: [
      { id: 'ls-2-1', title: 'Hiểu rõ các khái niệm cơ bản', duration: '15:20', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-2-2', title: 'Phân tích case study thực tế', duration: '20:00', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-2-3', title: 'Thực hành bài tập 1', duration: '18:45', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-2-4', title: 'Kiểm tra kiến thức chương 1', duration: '10:00', requiredLevel: 'Premium', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-3',
    title: 'Kỹ thuật nâng cao',
    lessons: [
      { id: 'ls-3-1', title: 'Chiến lược chuyên sâu', duration: '25:00', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-3-2', title: 'Tối ưu hóa quy trình', duration: '22:30', requiredLevel: 'VIP', directPlayUrl: '' },
      { id: 'ls-3-3', title: 'Phân tích dữ liệu thực tế', duration: '30:00', requiredLevel: 'VIP', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-4',
    title: 'Dự án thực hành',
    lessons: [
      { id: 'ls-4-1', title: 'Hướng dẫn dự án cuối khóa', duration: '10:00', requiredLevel: 'VIP', directPlayUrl: '' },
      { id: 'ls-4-2', title: 'Thực hành xây dựng dự án', duration: '45:00', requiredLevel: 'VIP', directPlayUrl: '' },
      { id: 'ls-4-3', title: 'Review & phản hồi', duration: '20:00', requiredLevel: 'VIP', directPlayUrl: '' },
    ],
  },
];

const LEVEL_ORDER: Record<MemberLevel, number> = { Free: 0, Premium: 1, VIP: 2 };

const reviewsData = [
  {
    id: 1,
    name: 'Nguyễn Minh Tuấn',
    avatar: 'T',
    rating: 5,
    date: '2 tuần trước',
    comment: 'Khóa học rất chất lượng! Giảng viên giảng dạy dễ hiểu, nội dung thực tế và áp dụng được ngay. Tôi đã áp dụng thành công vào công việc.',
  },
  {
    id: 2,
    name: 'Trần Thu Hà',
    avatar: 'H',
    rating: 5,
    date: '1 tháng trước',
    comment: 'Đáng đồng tiền bát gạo. Nội dung khóa học rất phong phú, có nhiều bài tập thực hành giúp hiểu sâu hơn.',
  },
  {
    id: 3,
    name: 'Lê Văn Đức',
    avatar: 'D',
    rating: 4,
    date: '1 tháng trước',
    comment: 'Khóa học tốt, tuy nhiên mong có thêm nhiều case study thực tế hơn. Nhìn chung rất hài lòng với chất lượng giảng dạy.',
  },
  {
    id: 4,
    name: 'Phạm Thị Lan',
    avatar: 'L',
    rating: 5,
    date: '2 tháng trước',
    comment: 'Tuyệt vời! Sau khi hoàn thành khóa học, tôi đã tự tin hơn rất nhiều. Cảm ơn WePower Academy!',
  },
];

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userLevel: MemberLevel = user?.memberLevel || 'Free';
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [previewLesson, setPreviewLesson] = useState<{ name: string; sectionTitle: string; directPlayUrl: string } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(defaultChapters);

  // Load chapters from localStorage (shared with admin)
  useEffect(() => {
    if (typeof window !== 'undefined' && params.id) {
      try {
        const saved = localStorage.getItem(`wepower-chapters-${params.id}`);
        if (saved) {
          setChapters(JSON.parse(saved));
        }
      } catch { /* ignore */ }
    }
  }, [params.id]);

  const course = mockCourses.find(c => c.id === params.id);

  if (!course) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Không tìm thấy khóa học</h1>
          <p className="text-gray-400 mb-6">Khóa học bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button variant="primary" onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(course, () => {
      showToast('Đã thêm vào giỏ hàng!', 'success');
    });
  };

  const handleCheckout = () => {
    router.push(`/checkout?course=${course.id}`);
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const relatedCourses = mockCourses
    .filter(c => c.category === course.category && c.id !== course.id)
    .slice(0, 3);

  const totalLessons = chapters.reduce((sum, section) => sum + section.lessons.length, 0);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => router.push('/')} className="hover:text-white transition-colors">Trang chủ</button>
          <span>/</span>
          <button onClick={() => router.push('/courses')} className="hover:text-white transition-colors">Khóa học</button>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{course.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-6">
              {course.badge && (
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold mb-3 ${
                  course.badge === 'BESTSELLER' ? 'bg-yellow text-black' :
                  course.badge === 'NEW' ? 'bg-red text-white' :
                  'bg-yellow text-black'
                }`}>
                  {course.badge}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
              {/* Member Level Required */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${
                course.memberLevel === 'VIP' ? 'bg-gradient-to-r from-yellow/20 to-amber-500/20 text-yellow border border-yellow/30' :
                course.memberLevel === 'Premium' ? 'bg-red/10 text-red border border-red/20' :
                'bg-white/5 text-gray-300 border border-white/10'
              }`}>
                {course.memberLevel === 'VIP' && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                {course.memberLevel === 'Premium' && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )}
                Yêu cầu: {course.memberLevel}
              </div>
              <p className="text-gray-400 text-lg mb-4">
                Khóa học toàn diện giúp bạn nắm vững kiến thức và kỹ năng thực tế từ cơ bản đến nâng cao.
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-white">{course.rating}</span>
                  <span className="text-gray-400">({course.reviewsCount} đánh giá)</span>
                </div>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">{course.enrollmentsCount.toLocaleString()} học viên</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">Giảng viên: <span className="text-white">{course.instructor}</span></span>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer" onClick={() => router.push(`/learn/${course.id}`)}>
                <div className="w-16 h-16 bg-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-glow-red">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-8">
              <div className="flex gap-8">
                {(['overview', 'curriculum', 'reviews'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-semibold transition-colors relative ${
                      activeTab === tab
                        ? 'text-red'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'overview' ? 'Tổng quan' : tab === 'curriculum' ? 'Nội dung' : 'Đánh giá'}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* What you'll learn */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Bạn sẽ học được gì?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Nắm vững kiến thức từ cơ bản đến nâng cao',
                      'Áp dụng vào dự án thực tế ngay lập tức',
                      'Xây dựng portfolio chuyên nghiệp',
                      'Tối ưu hóa quy trình làm việc',
                      'Phân tích và giải quyết vấn đề phức tạp',
                      'Nhận chứng chỉ hoàn thành khóa học',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Yêu cầu</h2>
                  <ul className="space-y-2">
                    {[
                      'Không cần kiến thức nền tảng - phù hợp cho người mới bắt đầu',
                      'Máy tính có kết nối Internet',
                      'Tinh thần ham học hỏi và sẵn sàng thực hành',
                    ].map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Mô tả khóa học</h2>
                  <div className="text-gray-400 space-y-4 leading-relaxed">
                    <p>
                      Đây là khóa học toàn diện được thiết kế bởi đội ngũ chuyên gia tại WePower Academy.
                      Khóa học sẽ đưa bạn từ người mới bắt đầu đến trình độ chuyên nghiệp thông qua
                      các bài giảng chi tiết, bài tập thực hành, và dự án thực tế.
                    </p>
                    <p>
                      Với {course.lessonsCount} bài học được sắp xếp khoa học, bạn sẽ từng bước nắm vững
                      kiến thức cần thiết. Mỗi bài học đều có video hướng dẫn chi tiết, tài liệu bổ trợ,
                      và bài tập kiểm tra giúp bạn củng cố kiến thức.
                    </p>
                    <p>
                      Sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ từ WePower Academy
                      và có thể tự tin áp dụng những gì đã học vào công việc thực tế.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400">
                    {chapters.length} phần - {totalLessons} bài học - {formatDuration(course.duration)}
                  </p>
                  <button
                    onClick={() => setExpandedSections(
                      expandedSections.length === chapters.length
                        ? []
                        : chapters.map((_, i) => i)
                    )}
                    className="text-red text-sm font-semibold hover:underline"
                  >
                    {expandedSections.length === chapters.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                  </button>
                </div>

                {chapters.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedSections.includes(sectionIndex) ? 'rotate-90' : ''
                          }`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold text-white text-left">
                          Phần {sectionIndex + 1}: {section.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{section.lessons.length} bài học</span>
                    </button>

                    {expandedSections.includes(sectionIndex) && (
                      <div className="divide-y divide-white/5">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const isLocked = LEVEL_ORDER[lesson.requiredLevel] > LEVEL_ORDER[userLevel];
                          return (
                            <div
                              key={lessonIndex}
                              className={`flex items-center justify-between p-4 pl-12 transition-colors ${
                                isLocked ? 'opacity-60' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {isLocked ? (
                                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : (
                                  <button
                                    onClick={() => setPreviewLesson({ name: lesson.title, sectionTitle: section.title, directPlayUrl: lesson.directPlayUrl })}
                                    disabled={!lesson.directPlayUrl}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${
                                      lesson.directPlayUrl
                                        ? 'bg-red/20 hover:bg-red/40 text-red cursor-pointer'
                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    }`}
                                    title={lesson.directPlayUrl ? 'Xem trước' : 'Chưa có video'}
                                  >
                                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </button>
                                )}
                                <span className="text-gray-300 text-sm truncate">{lesson.title}</span>
                                {/* Level badge - always show */}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                                  lesson.requiredLevel === 'VIP'
                                    ? 'bg-gradient-to-r from-yellow/10 to-amber-500/10 text-yellow border border-yellow/30'
                                    : lesson.requiredLevel === 'Premium'
                                      ? 'bg-red/10 text-red border border-red/20'
                                      : 'bg-white/5 text-gray-400 border border-white/10'
                                }`}>
                                  {lesson.requiredLevel}
                                </span>
                                {lesson.requiredLevel === 'Free' && (
                                  <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                    FREE
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 flex-shrink-0 ml-3">{lesson.duration}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Rating Summary */}
                <div className="flex flex-col sm:flex-row gap-8 p-6 bg-white/5 rounded-xl">
                  <div className="text-center sm:min-w-[120px]">
                    <div className="text-5xl font-bold text-yellow mb-1">{course.rating}</div>
                    <div className="flex items-center justify-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(course.rating) ? 'text-yellow' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-400">{course.reviewsCount} đánh giá</div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const percentage = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm text-gray-400 w-12">{star} sao</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-10 text-right">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                {reviewsData.map(review => (
                  <div key={review.id} className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-red rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{review.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white">{review.name}</h4>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow' : 'text-gray-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-yellow">{formatPrice(course.price)}</div>
                  {course.originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 line-through text-sm">{formatPrice(course.originalPrice)}</span>
                      <span className="text-red text-sm font-semibold">
                        -{Math.round((1 - course.price / course.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <Button variant="primary" size="lg" className="w-full mb-3" onClick={() => router.push(`/learn/${course.id}`)}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  HỌC NGAY
                </Button>
                <Button variant="secondary" size="lg" className="w-full mb-3" onClick={handleCheckout}>
                  Đăng Ký Ngay
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={handleAddToCart}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm Giỏ Hàng
                </Button>

                <p className="text-center text-gray-500 text-xs mt-3">Đảm bảo hoàn tiền trong 7 ngày</p>

                {/* Course includes */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="font-semibold text-white mb-4">Khóa học bao gồm:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {formatDuration(course.duration)} video bài giảng
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {course.lessonsCount} bài học
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tài liệu bổ trợ
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Truy cập trên mọi thiết bị
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Truy cập trọn đời
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Chứng chỉ hoàn thành
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Khóa học liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map(c => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewLesson(null)} />
          <div className="relative w-full max-w-3xl">
            {/* Close button */}
            <button
              onClick={() => setPreviewLesson(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              Đóng
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {previewLesson.directPlayUrl ? (
                  isEmbedUrl(previewLesson.directPlayUrl) ? (
                    <iframe
                      key={previewLesson.directPlayUrl}
                      src={previewLesson.directPlayUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={previewLesson.directPlayUrl}
                      src={previewLesson.directPlayUrl}
                      controls
                      className="w-full h-full"
                      controlsList="nodownload"
                      playsInline
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Video chưa được tải lên</p>
                  </div>
                )}
              </div>
              {/* Lesson info */}
              <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-1">{previewLesson.sectionTitle}</p>
                <p className="text-white font-semibold">{previewLesson.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
