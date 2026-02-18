'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { AdvancedFilters, FilterState } from '@/components/ui/AdvancedFilters';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { mockCourses, categories } from '@/lib/mockData';

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
        <Footer />
      </div>
    }>
      <Courses />
    </Suspense>
  );
}

function Courses() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    priceRange: [0, 200000000],
    minRating: 0,
    duration: 'all',
  });

  // Sync search query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Simulate loading for better UX
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, advancedFilters]);

  const filteredCourses = mockCourses.filter((course) => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    // Price filter
    const matchesPrice = course.price >= advancedFilters.priceRange[0] &&
                        course.price <= advancedFilters.priceRange[1];

    // Rating filter
    const matchesRating = course.rating >= advancedFilters.minRating;

    // Duration filter
    let matchesDuration = true;
    if (advancedFilters.duration === 'short') {
      matchesDuration = course.duration < 18000; // < 5 hours (in seconds)
    } else if (advancedFilters.duration === 'medium') {
      matchesDuration = course.duration >= 18000 && course.duration <= 72000; // 5-20 hours
    } else if (advancedFilters.duration === 'long') {
      matchesDuration = course.duration > 72000; // > 20 hours
    }

    return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesDuration;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.id.localeCompare(a.id);
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return b.enrollmentsCount - a.enrollmentsCount; // popular
    }
  });

  const handleApplyFilters = (filters: FilterState) => {
    setAdvancedFilters(filters);
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      priceRange: [0, 200000000],
      minRating: 0,
      duration: 'all',
    });
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Khám phá khóa học
          </h1>
          <p className="text-gray-400">
            Tìm khóa học phù hợp với mục tiêu của bạn
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 px-4 pl-12 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-semibold text-white">Danh mục:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === category.slug
                    ? 'bg-red text-white shadow-glow-red'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-60">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Header with Advanced Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-gray-400">
              Hiển thị <span className="text-white font-semibold">{sortedCourses.length}</span> khóa học
            </div>
            <AdvancedFilters
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-400 mb-6">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button
              variant="ghost"
              onClick={handleResetFilters}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red to-yellow rounded-2xl p-6 md:p-8 text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
            Không tìm thấy khóa học phù hợp?
          </h2>
          <p className="text-black/80 mb-5 max-w-2xl mx-auto">
            Đề xuất khóa học mà bạn muốn học. Chúng tôi sẽ làm việc với các chuyên gia để tạo nội dung chất lượng cao.
          </p>
          <Button variant="secondary" size="lg" className="bg-black text-white hover:bg-gray-900">
            Đề xuất khóa học
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
