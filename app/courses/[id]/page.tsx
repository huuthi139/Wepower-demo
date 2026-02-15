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

  const handleEnroll = () => {
    setIsEnrolled(true);
    showToast('Chúc mừng! Bạn đã đăng ký khóa học thành công!', 'success');
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
              {isEnrolled ? (
                <Button variant="primary" size="lg" className="w-full mb-3">Vào học ngay</Button>
              ) : (
                <>
                  <Button variant="primary" size="lg" className="w-full mb-3" onClick={handleEnroll}>Đăng ký ngay</Button>
                  <Button variant="secondary" size="lg" className="w-full" onClick={handleAddToCart}>Thêm vào giỏ</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
