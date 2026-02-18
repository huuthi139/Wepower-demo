'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { mockCourses } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

type Tab = 'overview' | 'courses' | 'orders' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const stats = {
    totalRevenue: mockCourses.reduce((sum, c) => sum + c.price * Math.floor(c.enrollmentsCount * 0.3), 0),
    totalCourses: mockCourses.length,
    totalStudents: mockCourses.reduce((sum, c) => sum + c.enrollmentsCount, 0),
    totalOrders: 128,
  };

  const recentOrders = [
    { id: 'WP1708200001', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', course: 'Business Automation', amount: 2499000, status: 'Hoàn thành', date: '18/02/2026' },
    { id: 'WP1708200002', name: 'Trần Thị B', email: 'tranthib@gmail.com', course: 'Marketing Online', amount: 1899000, status: 'Đang chờ', date: '18/02/2026' },
    { id: 'WP1708200003', name: 'Lê Văn C', email: 'levanc@gmail.com', course: 'Thiết kế Website', amount: 3299000, status: 'Hoàn thành', date: '17/02/2026' },
    { id: 'WP1708200004', name: 'Phạm Thị D', email: 'phamthid@gmail.com', course: 'YouTube Mastery', amount: 0, status: 'Hoàn thành', date: '17/02/2026' },
    { id: 'WP1708200005', name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', course: 'AI cho người mới', amount: 4599000, status: 'Đang xử lý', date: '16/02/2026' },
  ];

  const users = [
    { name: 'Admin WePower', email: 'admin@wepower.vn', role: 'Admin', level: 'Expert', courses: 15, status: 'Active' },
    { name: 'Hữu Thi', email: 'huuthi.139@gmail.com', role: 'Admin', level: 'Expert', courses: 12, status: 'Active' },
    { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'Học viên', level: 'Intermediate', courses: 3, status: 'Active' },
    { name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'Học viên', level: 'Beginner', courses: 1, status: 'Active' },
    { name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'Học viên', level: 'Advanced', courses: 5, status: 'Inactive' },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'courses', label: 'Khóa học' },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'users', label: 'Người dùng' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Quản trị Admin</h1>
            </div>
            <p className="text-gray-400">Quản lý khóa học, đơn hàng và người dùng</p>
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
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.key ? 'text-red' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red" />}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red/20 to-red/5 border border-red/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-sm text-gray-400">Tổng doanh thu</p>
              </div>

              <div className="bg-gradient-to-br from-yellow/20 to-yellow/5 border border-yellow/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-yellow/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalCourses}</div>
                <p className="text-sm text-gray-400">Khóa học</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalStudents.toLocaleString()}</div>
                <p className="text-sm text-gray-400">Học viên</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalOrders}</div>
                <p className="text-sm text-gray-400">Đơn hàng</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">Đơn hàng gần đây</h3>
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
                        <td className="p-4 text-sm text-gray-300">{order.course}</td>
                        <td className="p-4 text-sm text-yellow font-semibold">
                          {order.amount === 0 ? 'Miễn phí' : formatPrice(order.amount)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-400' :
                            order.status === 'Đang chờ' ? 'bg-yellow/10 text-yellow' :
                            'bg-red/10 text-red'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Tất cả khóa học ({mockCourses.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên khóa học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Giảng viên</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Giá</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Học viên</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Đánh giá</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Danh mục</th>
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
                      </td>
                      <td className="p-4 text-sm text-gray-300">{course.instructor}</td>
                      <td className="p-4 text-sm text-yellow font-semibold">
                        {course.isFree ? 'Miễn phí' : formatPrice(course.price)}
                      </td>
                      <td className="p-4 text-sm text-white">{course.enrollmentsCount.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-white">{course.rating}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                          {course.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Đơn hàng ({recentOrders.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Mã đơn</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khách hàng</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Số tiền</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-white font-mono">{order.id}</td>
                      <td className="p-4 text-sm text-white">{order.name}</td>
                      <td className="p-4 text-sm text-gray-400">{order.email}</td>
                      <td className="p-4 text-sm text-gray-300">{order.course}</td>
                      <td className="p-4 text-sm text-yellow font-semibold">
                        {order.amount === 0 ? 'Miễn phí' : formatPrice(order.amount)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-400' :
                          order.status === 'Đang chờ' ? 'bg-yellow/10 text-yellow' :
                          'bg-red/10 text-red'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Người dùng ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tên</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Vai trò</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Level</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Khóa học</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.email} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red to-yellow rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'Admin' ? 'bg-red/10 text-red' : 'bg-white/5 text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.level === 'Expert' ? 'bg-yellow/10 text-yellow' :
                          user.level === 'Advanced' ? 'bg-red/10 text-red' :
                          user.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-white/5 text-gray-400'
                        }`}>
                          {user.level}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white">{user.courses}</td>
                      <td className="p-4">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm text-gray-400">{user.status}</span>
                      </td>
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
