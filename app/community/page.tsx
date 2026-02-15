'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

export default function Community() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'my-posts'>('popular');
  const [newPost, setNewPost] = useState('');

  const posts = [
    {
      id: 1,
      author: 'Nguyễn Văn A',
      avatar: '👨‍💼',
      time: '2 giờ trước',
      title: 'Chia sẻ kinh nghiệm học AI Marketing',
      content: 'Mình vừa hoàn thành khóa học AI Marketing và muốn chia sẻ một số insights với mọi người...',
      likes: 45,
      comments: 12,
      tags: ['AI', 'Marketing', 'Tips'],
    },
    {
      id: 2,
      author: 'Trần Thị B',
      avatar: '👩‍💼',
      time: '5 giờ trước',
      title: 'Câu hỏi về Digital Marketing Fundamentals',
      content: 'Có bạn nào đang học khóa Digital Marketing Fundamentals không? Mình muốn hỏi về phần SEO...',
      likes: 23,
      comments: 8,
      tags: ['Digital Marketing', 'Question'],
    },
    {
      id: 3,
      author: 'Lê Văn C',
      avatar: '👨‍🎓',
      time: '1 ngày trước',
      title: 'Tổng hợp tài liệu học Content Creator hay',
      content: 'Mình đã tổng hợp một số tài liệu và tools hữu ích cho ai đang học Content Creator...',
      likes: 67,
      comments: 15,
      tags: ['Content', 'Resources'],
    },
  ];

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    showToast('Bài viết của bạn đã được đăng!', 'success');
    setNewPost('');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Cộng đồng WEPOWER
          </h1>
          <p className="text-gray-400">
            Kết nối, chia sẻ kinh nghiệm và học hỏi cùng nhau
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red to-yellow flex items-center justify-center text-2xl flex-shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Bạn muốn chia sẻ điều gì?"
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </button>
                    </div>
                    <Button variant="primary" size="sm" onClick={handlePostSubmit}>
                      Đăng bài
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10">
              {[
                { id: 'popular', label: '🔥 Phổ biến' },
                { id: 'recent', label: '🆕 Mới nhất' },
                { id: 'my-posts', label: '📝 Bài của tôi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === tab.id ? 'text-red' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-red/30 transition-colors">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red to-yellow flex items-center justify-center text-xl">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{post.author}</p>
                      <p className="text-sm text-gray-400">{post.time}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 hover:text-red transition-colors cursor-pointer">
                    {post.title}
                  </h3>

                  {/* Content */}
                  <p className="text-gray-300 mb-4">{post.content}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-red transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-yellow transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-semibold">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-4">Thống kê cộng đồng</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Thành viên</span>
                  <span className="font-bold text-yellow">15,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bài viết</span>
                  <span className="font-bold text-yellow">3,245</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Đang online</span>
                  <span className="font-bold text-yellow">892</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-4">Chủ đề phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {['AI Marketing', 'Digital Marketing', 'Content Creator', 'SEO', 'Social Media', 'Data Analytics'].map((tag) => (
                  <button key={tag} className="px-3 py-1 bg-white/5 hover:bg-red text-gray-400 hover:text-white text-sm rounded-full transition-colors">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-4">Người đóng góp hàng đầu</h3>
              <div className="space-y-3">
                {[
                  { name: 'Nguyễn Văn A', posts: 127, avatar: '👨‍💼' },
                  { name: 'Trần Thị B', posts: 98, avatar: '👩‍💼' },
                  { name: 'Lê Văn C', posts: 76, avatar: '👨‍🎓' },
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red to-yellow flex items-center justify-center text-sm">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.posts} bài viết</p>
                    </div>
                    <span className="text-yellow font-bold text-lg">#{index + 1}</span>
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
