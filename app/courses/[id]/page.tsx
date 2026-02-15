'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { mockCourses } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/providers/ToastProvider';
import Image from 'next/image';

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const course = mockCourses.find(c => c.id === params.id);

  if (!course) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Không tìm thấy khóa học</h1>
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
      showToast(`Đã thêm vào giỏ hàng!`, 'success');
    });
  };

  const handleCheckout = () => {
    // Navigate to checkout page with this course
    router.push(`/checkout?course=${course.id}`);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-6">{course.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Image src={course.thumbnail} alt={course.title} width={800} height={450} className="rounded-xl mb-6" />
            <p className="text-gray-300 mb-4">Giảng viên: {course.instructor}</p>
            <p className="text-gray-300">Rating: {course.rating} ⭐ ({course.reviewsCount} đánh giá)</p>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow mb-4">{formatPrice(course.price)}</div>
              <Button variant="primary" size="lg" className="w-full mb-3" onClick={handleCheckout}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Thanh toán ngay
              </Button>
              <Button variant="secondary" size="lg" className="w-full" onClick={handleAddToCart}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
