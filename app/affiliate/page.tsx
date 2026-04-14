'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

const steps = [
  {
    number: '01',
    title: 'Đăng ký tài khoản',
    description: 'Tạo tài khoản WEDU miễn phí — bạn sẽ nhận ngay mã giới thiệu riêng dạng WDxxxxxx.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Chia sẻ link giới thiệu',
    description: 'Gửi link cho bạn bè, người thân, đồng nghiệp qua mạng xã hội, email hoặc tin nhắn.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Nhận hoa hồng tự động',
    description: 'Khi bạn bè mua khóa học, bạn tự động nhận 10% hoa hồng vào ví affiliate.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const policies = [
  { label: 'Hoa hồng', value: '10% trên giá trị thực mỗi đơn hàng' },
  { label: 'Thời hạn', value: 'Trọn đời — A giới thiệu B, B mua bất kỳ lúc nào A vẫn nhận' },
  { label: 'Tổng kết', value: 'Cuối mỗi tháng (ngày 30/31)' },
  { label: 'Thanh toán', value: 'Ngày 12 hàng tháng' },
  { label: 'Rút tối thiểu', value: '500.000đ' },
  { label: 'Hình thức', value: 'Chuyển khoản ngân hàng' },
  { label: 'Lưu ý', value: 'Hoa hồng chỉ tính khi đơn hàng hoàn thành' },
];

const faqs = [
  {
    q: 'Tôi có thể bắt đầu ngay không?',
    a: 'Có, tất cả tài khoản WEDU đều tự động có mã giới thiệu. Đăng ký xong là có thể chia sẻ ngay.',
  },
  {
    q: 'Hoa hồng được tính như thế nào?',
    a: '10% trên giá trị đơn hàng thực tế khi đơn hoàn thành. Hoa hồng được cộng tự động vào ví affiliate của bạn.',
  },
  {
    q: 'Tôi giới thiệu được bao nhiêu người?',
    a: 'Không giới hạn. Bạn có thể giới thiệu bao nhiêu người tùy thích.',
  },
  {
    q: 'Khi nào tôi nhận được tiền?',
    a: 'Hoa hồng được tổng kết cuối mỗi tháng và thanh toán vào ngày 12 của tháng tiếp theo.',
  },
  {
    q: 'Làm sao để rút tiền?',
    a: 'Vào Dashboard → Affiliate → Yêu cầu rút tiền. Số tiền tối thiểu để rút là 500.000đ.',
  },
];

export default function AffiliateLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-dark">
      <Header />

      {/* SECTION 1 — Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal/20 via-dark to-dark" />
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal/10 border border-teal/20 rounded-full text-sm text-teal mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Chương trình Affiliate
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Kiếm thu nhập thụ động<br />
            <span className="text-teal">cùng WEDU</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Giới thiệu bạn bè học tập — nhận hoa hồng <span className="text-gold font-semibold">10% trọn đời</span> trên mỗi đơn hàng
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Cách hoạt động */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cách hoạt động</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Chỉ 3 bước đơn giản để bắt đầu kiếm thu nhập</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-teal/30 transition-colors">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal rounded-full flex items-center justify-center text-sm font-bold text-white">
                {step.number}
              </div>
              <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal mx-auto mb-5 mt-2">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — Chính sách affiliate */}
      <section className="bg-white/[0.02]">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Chính sách Affiliate</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Minh bạch, rõ ràng, thanh toán đúng hạn</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
              {policies.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5">
                  <div className="w-2 h-2 bg-teal rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-white font-semibold">{item.label}: </span>
                    <span className="text-gray-400">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Câu hỏi thường gặp</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">Sẵn sàng bắt đầu kiếm thu nhập cùng WEDU?</p>
          <Link href="/register">
            <Button variant="primary" size="lg">
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
