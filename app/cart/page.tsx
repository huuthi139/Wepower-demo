'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    // Navigate to checkout with all cart items
    const courseIds = items.map(item => item.id).join(',');
    router.push(`/checkout?courses=${courseIds}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex flex-col">
        <Header />

        <div className="flex-1 container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Empty Cart Icon */}
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-white/60 mb-8">
              Bạn chưa thêm khóa học nào vào giỏ hàng. Hãy khám phá các khóa học tuyệt vời của chúng tôi!
            </p>
            <Link href="/courses">
              <Button variant="primary" size="lg">
                Khám phá khóa học →
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Giỏ hàng ({items.length} khóa học)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-dark border-2 border-white/10 rounded-xl p-4 hover:border-teal/30 transition-all"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <Link href={`/courses/${item.id}`} className="flex-shrink-0">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/courses/${item.id}`}>
                      <h3 className="text-lg font-bold text-white mb-1 hover:text-teal transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/60 mb-2">{item.instructor}</p>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex-1 text-right">
                        <div className="text-xl font-bold text-gold">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-white/60">
                            {formatPrice(item.price)} × {item.quantity}
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/60 hover:text-teal transition-colors p-2"
                        aria-label="Xóa khỏi giỏ hàng"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-white/60 hover:text-teal transition-colors text-sm font-medium"
            >
              Xóa tất cả khóa học
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark border-2 border-white/10 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Tổng đơn hàng</h2>

              {/* Summary Items */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Tạm tính</span>
                  <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Giảm giá</span>
                  <span className="text-gold font-bold">0₫</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Tổng cộng</span>
                    <span className="text-2xl font-bold text-gold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button variant="primary" size="lg" className="w-full mb-3" onClick={handleCheckout}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Thanh toán
              </Button>

              <Link href="/courses">
                <Button variant="outline" size="md" className="w-full">
                  Tiếp tục mua sắm
                </Button>
              </Link>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="block text-sm text-white/60 mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã"
                    className="flex-1 bg-white/5 border-2 border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-teal transition-colors"
                  />
                  <Button variant="accent" size="md">
                    Áp dụng
                  </Button>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Truy cập khóa học trọn đời</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Chứng chỉ khi hoàn thành</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
