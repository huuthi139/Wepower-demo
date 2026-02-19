'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { mockCourses } from '@/lib/mockData';
import type { MemberLevel } from '@/lib/mockData';
import { formatPrice, formatDuration } from '@/lib/utils';

type Tab = 'overview' | 'students' | 'courses' | 'videos' | 'orders';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberLevel: MemberLevel;
  enrolledCourses: number;
  totalSpent: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

interface Video {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: string;
  requiredLevel: MemberLevel;
  views: number;
  status: 'Published' | 'Draft' | 'Processing';
}

const students: Student[] = [
  { id: 'S001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', memberLevel: 'VIP', enrolledCourses: 8, totalSpent: 68000000, joinDate: '15/01/2025', status: 'Active', lastActive: '18/02/2026' },
  { id: 'S002', name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678', memberLevel: 'Premium', enrolledCourses: 4, totalSpent: 12000000, joinDate: '20/03/2025', status: 'Active', lastActive: '18/02/2026' },
  { id: 'S003', name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0923456789', memberLevel: 'Premium', enrolledCourses: 3, totalSpent: 8500000, joinDate: '05/05/2025', status: 'Active', lastActive: '17/02/2026' },
  { id: 'S004', name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0934567890', memberLevel: 'Free', enrolledCourses: 1, totalSpent: 0, joinDate: '10/08/2025', status: 'Active', lastActive: '16/02/2026' },
  { id: 'S005', name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phone: '0945678901', memberLevel: 'Free', enrolledCourses: 2, totalSpent: 1868000, joinDate: '22/09/2025', status: 'Inactive', lastActive: '01/01/2026' },
  { id: 'S006', name: 'Đỗ Thị F', email: 'dothif@gmail.com', phone: '0956789012', memberLevel: 'VIP', enrolledCourses: 12, totalSpent: 150000000, joinDate: '01/01/2025', status: 'Active', lastActive: '18/02/2026' },
  { id: 'S007', name: 'Bùi Văn G', email: 'buivang@gmail.com', phone: '0967890123', memberLevel: 'Premium', enrolledCourses: 5, totalSpent: 25000000, joinDate: '14/06/2025', status: 'Active', lastActive: '15/02/2026' },
  { id: 'S008', name: 'Vũ Thị H', email: 'vuthih@gmail.com', phone: '0978901234', memberLevel: 'Free', enrolledCourses: 1, totalSpent: 868000, joinDate: '30/11/2025', status: 'Active', lastActive: '14/02/2026' },
];

const videos: Video[] = [
  { id: 'V001', title: 'Tổng quan về khóa học', courseId: '1', courseName: 'Thiết kế website với Wordpress', duration: '5:30', requiredLevel: 'Free', views: 3245, status: 'Published' },
  { id: 'V002', title: 'Cách học hiệu quả nhất', courseId: '1', courseName: 'Thiết kế website với Wordpress', duration: '8:15', requiredLevel: 'Free', views: 2890, status: 'Published' },
  { id: 'V003', title: 'Chuẩn bị công cụ cần thiết', courseId: '1', courseName: 'Thiết kế website với Wordpress', duration: '12:00', requiredLevel: 'Premium', views: 1567, status: 'Published' },
  { id: 'V004', title: 'Hiểu rõ các khái niệm cơ bản', courseId: '2', courseName: 'Khởi nghiệp kiếm tiền online với AI', duration: '15:20', requiredLevel: 'Free', views: 4521, status: 'Published' },
  { id: 'V005', title: 'Phân tích case study thực tế', courseId: '2', courseName: 'Khởi nghiệp kiếm tiền online với AI', duration: '20:00', requiredLevel: 'Premium', views: 2134, status: 'Published' },
  { id: 'V006', title: 'Chiến lược chuyên sâu', courseId: '3', courseName: 'Xây dựng hệ thống Automation với N8N', duration: '25:00', requiredLevel: 'Premium', views: 987, status: 'Published' },
  { id: 'V007', title: 'Tối ưu hóa quy trình', courseId: '3', courseName: 'Xây dựng hệ thống Automation với N8N', duration: '22:30', requiredLevel: 'VIP', views: 456, status: 'Published' },
  { id: 'V008', title: 'Phân tích dữ liệu thực tế', courseId: '4', courseName: 'Thiết kế hệ thống chatbot AI', duration: '30:00', requiredLevel: 'VIP', views: 312, status: 'Published' },
  { id: 'V009', title: 'Dự án cuối khóa nâng cao', courseId: '8', courseName: 'Map To Success', duration: '45:00', requiredLevel: 'VIP', views: 89, status: 'Draft' },
  { id: 'V010', title: 'Hướng dẫn xây dựng funnel', courseId: '5', courseName: 'Xây dựng hệ thống thu hút 1000 khách hàng', duration: '18:00', requiredLevel: 'Premium', views: 0, status: 'Processing' },
];

const recentOrders = [
  { id: 'WP-2026-0001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', course: 'Business Automation Mystery', amount: 168868000, status: 'Hoàn thành' as const, date: '18/02/2026', method: 'Chuyển khoản' },
  { id: 'WP-2026-0002', name: 'Trần Thị B', email: 'tranthib@gmail.com', course: 'Marketing Online', amount: 1899000, status: 'Đang chờ' as const, date: '18/02/2026', method: 'MoMo' },
  { id: 'WP-2026-0003', name: 'Lê Văn C', email: 'levanc@gmail.com', course: 'Thiết kế Website', amount: 868000, status: 'Hoàn thành' as const, date: '17/02/2026', method: 'Thẻ tín dụng' },
  { id: 'WP-2026-0004', name: 'Phạm Thị D', email: 'phamthid@gmail.com', course: 'Unlock Your Power', amount: 1868000, status: 'Hoàn thành' as const, date: '17/02/2026', method: 'ZaloPay' },
  { id: 'WP-2026-0005', name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', course: 'Khởi nghiệp kiếm tiền online với AI', amount: 1868000, status: 'Đang xử lý' as const, date: '16/02/2026', method: 'Chuyển khoản' },
  { id: 'WP-2026-0006', name: 'Đỗ Thị F', email: 'dothif@gmail.com', course: 'Map To Success', amount: 38868000, status: 'Hoàn thành' as const, date: '15/02/2026', method: 'Chuyển khoản' },
  { id: 'WP-2026-0007', name: 'Bùi Văn G', email: 'buivang@gmail.com', course: 'Design With AI', amount: 1868000, status: 'Hoàn thành' as const, date: '14/02/2026', method: 'MoMo' },
];

function LevelBadge({ level }: { level: MemberLevel }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
      level === 'VIP' ? 'bg-gradient-to-r from-yellow/20 to-amber-500/20 text-yellow border border-yellow/30' :
      level === 'Premium' ? 'bg-red/10 text-red border border-red/20' :
      'bg-white/5 text-gray-400 border border-white/10'
    }`}>
      {level === 'VIP' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {level === 'Premium' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )}
      {level}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [studentFilter, setStudentFilter] = useState<'all' | MemberLevel>('all');
  const [videoFilter, setVideoFilter] = useState<'all' | MemberLevel>('all');

  const totalRevenue = recentOrders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.amount, 0);
  const freeCount = students.filter(s => s.memberLevel === 'Free').length;
  const premiumCount = students.filter(s => s.memberLevel === 'Premium').length;
  const vipCount = students.filter(s => s.memberLevel === 'VIP').length;

  const filteredStudents = studentFilter === 'all' ? students : students.filter(s => s.memberLevel === studentFilter);
  const filteredVideos = videoFilter === 'all' ? videos : videos.filter(v => v.requiredLevel === videoFilter);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'overview', label: 'Tổng quan',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      key: 'students', label: 'Học viên',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      key: 'courses', label: 'Khóa học',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      key: 'videos', label: 'Video',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    },
    {
      key: 'orders', label: 'Đơn hàng',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Quản trị Admin</h1>
                <p className="text-sm text-gray-400">Quản lý học viên, khóa học, video và đơn hàng</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard học viên
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key ? 'text-red' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red" />}
              </button>
            ))}
          </div>
        </div>

        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-red/20 to-red/5 border border-red/20 rounded-xl p-5">
                <div className="w-10 h-10 bg-red/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-gray-400">Doanh thu</p>
              </div>

              <div className="bg-gradient-to-br from-yellow/20 to-yellow/5 border border-yellow/20 rounded-xl p-5">
                <div className="w-10 h-10 bg-yellow/20 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{students.length}</div>
                <p className="text-xs text-gray-400">Học viên</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{mockCourses.length}</div>
                <p className="text-xs text-gray-400">Khóa học</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{videos.length}</div>
                <p className="text-xs text-gray-400">Video</p>
              </div>
            </div>

            {/* Member Level Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-5">Phân bổ hạng thành viên</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LevelBadge level="VIP" />
                        <span className="text-sm text-gray-400">{vipCount} học viên</span>
                      </div>
                      <span className="text-sm text-white font-bold">{Math.round(vipCount / students.length * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow to-amber-500 rounded-full" style={{ width: `${vipCount / students.length * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LevelBadge level="Premium" />
                        <span className="text-sm text-gray-400">{premiumCount} học viên</span>
                      </div>
                      <span className="text-sm text-white font-bold">{Math.round(premiumCount / students.length * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red rounded-full" style={{ width: `${premiumCount / students.length * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LevelBadge level="Free" />
                        <span className="text-sm text-gray-400">{freeCount} học viên</span>
                      </div>
                      <span className="text-sm text-white font-bold">{Math.round(freeCount / students.length * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: `${freeCount / students.length * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-5">Khóa học theo Level</h3>
                <div className="space-y-4">
                  {(['Free', 'Premium', 'VIP'] as MemberLevel[]).map(level => {
                    const count = mockCourses.filter(c => c.memberLevel === level).length;
                    const totalEnrollments = mockCourses.filter(c => c.memberLevel === level).reduce((s, c) => s + c.enrollmentsCount, 0);
                    return (
                      <div key={level} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <LevelBadge level={level} />
                          <div>
                            <div className="text-sm text-white font-semibold">{count} khóa học</div>
                            <div className="text-xs text-gray-500">{totalEnrollments.toLocaleString()} học viên</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-yellow font-bold">
                            {formatPrice(mockCourses.filter(c => c.memberLevel === level).reduce((s, c) => s + c.price, 0) / count)}
                          </div>
                          <div className="text-xs text-gray-500">Giá TB</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Đơn hàng gần đây</h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-red hover:underline">Xem tất cả</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Mã đơn</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khách hàng</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Số tiền</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                        <td className="p-4 text-sm text-white font-mono">{order.id}</td>
                        <td className="p-4">
                          <div className="text-sm text-white">{order.name}</div>
                          <div className="text-xs text-gray-500">{order.email}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate">{order.course}</td>
                        <td className="p-4 text-sm text-yellow font-semibold">{formatPrice(order.amount)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-400' :
                            order.status === 'Đang chờ' ? 'bg-yellow/10 text-yellow' :
                            'bg-red/10 text-red'
                          }`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ STUDENTS TAB ============ */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Lọc theo hạng:</span>
              {(['all', 'Free', 'Premium', 'VIP'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStudentFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    studentFilter === f ? 'bg-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f} {f !== 'all' && `(${students.filter(s => s.memberLevel === f).length})`}
                </button>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">Học viên ({filteredStudents.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">ID</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Học viên</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">SĐT</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Hạng</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Chi tiêu</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tham gia</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                        <td className="p-4 text-sm text-gray-400 font-mono">{student.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              student.memberLevel === 'VIP' ? 'bg-gradient-to-br from-yellow to-amber-500' :
                              student.memberLevel === 'Premium' ? 'bg-red' : 'bg-gray-600'
                            }`}>
                              <span className="text-white text-xs font-bold">{student.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm text-white font-medium">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{student.phone}</td>
                        <td className="p-4"><LevelBadge level={student.memberLevel} /></td>
                        <td className="p-4 text-sm text-white">{student.enrolledCourses}</td>
                        <td className="p-4 text-sm text-yellow font-semibold">
                          {student.totalSpent === 0 ? '-' : formatPrice(student.totalSpent)}
                        </td>
                        <td className="p-4 text-sm text-gray-400">{student.joinDate}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <span className="text-sm text-gray-400">{student.status === 'Active' ? 'Hoạt động' : 'Ngưng'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ COURSES TAB ============ */}
        {activeTab === 'courses' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Tất cả khóa học ({mockCourses.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên khóa học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Level</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Giá</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Học viên</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Bài học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Thời lượng</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCourses.map(course => (
                    <tr key={course.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-gray-400 font-mono">#{course.id}</td>
                      <td className="p-4">
                        <Link href={`/courses/${course.id}`} className="text-sm text-white hover:text-red transition-colors font-medium">
                          {course.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5">{course.category}</div>
                      </td>
                      <td className="p-4"><LevelBadge level={course.memberLevel} /></td>
                      <td className="p-4 text-sm text-yellow font-semibold">{formatPrice(course.price)}</td>
                      <td className="p-4 text-sm text-white">{course.enrollmentsCount.toLocaleString()}</td>
                      <td className="p-4 text-sm text-gray-400">{course.lessonsCount}</td>
                      <td className="p-4 text-sm text-gray-400">{formatDuration(course.duration)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-white">{course.rating}</span>
                          <span className="text-xs text-gray-500">({course.reviewsCount})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ VIDEOS TAB ============ */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Lọc theo level:</span>
              {(['all', 'Free', 'Premium', 'VIP'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setVideoFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    videoFilter === f ? 'bg-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f} {f !== 'all' && `(${videos.filter(v => v.requiredLevel === f).length})`}
                </button>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">Quản lý Video ({filteredVideos.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">ID</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên video</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Level</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Thời lượng</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Lượt xem</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map(video => (
                      <tr key={video.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                        <td className="p-4 text-sm text-gray-400 font-mono">{video.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <span className="text-sm text-white font-medium">{video.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-300 max-w-[180px] truncate">{video.courseName}</td>
                        <td className="p-4"><LevelBadge level={video.requiredLevel} /></td>
                        <td className="p-4 text-sm text-gray-400">{video.duration}</td>
                        <td className="p-4 text-sm text-white">{video.views.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            video.status === 'Published' ? 'bg-green-500/10 text-green-400' :
                            video.status === 'Draft' ? 'bg-yellow/10 text-yellow' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>{
                            video.status === 'Published' ? 'Đã xuất bản' :
                            video.status === 'Draft' ? 'Nháp' : 'Đang xử lý'
                          }</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ ORDERS TAB ============ */}
        {activeTab === 'orders' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Đơn hàng ({recentOrders.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Mã đơn</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khách hàng</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Số tiền</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Phương thức</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-white font-mono">{order.id}</td>
                      <td className="p-4">
                        <div className="text-sm text-white">{order.name}</div>
                        <div className="text-xs text-gray-500">{order.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate">{order.course}</td>
                      <td className="p-4 text-sm text-yellow font-semibold">{formatPrice(order.amount)}</td>
                      <td className="p-4 text-sm text-gray-400">{order.method}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-400' :
                          order.status === 'Đang chờ' ? 'bg-yellow/10 text-yellow' :
                          'bg-red/10 text-red'
                        }`}>{order.status}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
