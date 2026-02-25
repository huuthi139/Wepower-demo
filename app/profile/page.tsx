'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import Image from 'next/image';

export default function Profile() {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    bio: 'Yêu thích học tập và phát triển bản thân thông qua các khóa học trực tuyến.',
    location: 'Hà Nội, Việt Nam',
    occupation: 'Marketing Manager',
  });

  const [avatar, setAvatar] = useState('/images/default-avatar.jpg');

  const handleSave = () => {
    showToast('Đã cập nhật hồ sơ thành công!', 'success');
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        showToast('Đã cập nhật ảnh đại diện!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Khóa học đã học', value: '12', icon: '📚' },
    { label: 'Hoàn thành', value: '8', icon: '✅' },
    { label: 'Chứng chỉ', value: '5', icon: '🏆' },
    { label: 'Điểm trung bình', value: '4.8', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hồ sơ của tôi
          </h1>
          <p className="text-gray-400">
            Quản lý thông tin cá nhân và theo dõi tiến độ học tập
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal">
                    <div className="w-full h-full bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white text-4xl font-bold">
                      {profileData.name.charAt(0)}
                    </div>
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-teal rounded-full flex items-center justify-center cursor-pointer hover:bg-teal/80 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{profileData.name}</h2>
                <p className="text-gray-400 text-sm">{profileData.occupation}</p>
                <div className="flex items-center gap-1 mt-2 text-gold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">Member cấp Vàng</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Thông tin cá nhân</h3>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Địa chỉ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.location}</p>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Nghề nghiệp</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.occupation}
                      onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.occupation}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Giới thiệu</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-dark border border-white/[0.06] rounded-lg text-white focus:outline-none focus:border-teal resize-none"
                    />
                  ) : (
                    <p className="text-gray-400">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] mt-6">
              <h3 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h3>
              <div className="space-y-4">
                {[
                  { action: 'Hoàn thành khóa học', course: 'AI Marketing 2026', time: '2 giờ trước', icon: '✅' },
                  { action: 'Đạt chứng chỉ', course: 'Digital Marketing Pro', time: '1 ngày trước', icon: '🏆' },
                  { action: 'Bắt đầu học', course: 'Content Creator', time: '3 ngày trước', icon: '📚' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-dark rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.course}</p>
                    </div>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
