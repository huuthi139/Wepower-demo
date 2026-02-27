'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  likedBy: string[];
}

const POSTS_STORAGE_KEY = 'wepower-community-posts';

const defaultPosts: Post[] = [
  {
    id: 'post-1',
    author: 'Nguyễn Văn A',
    avatar: 'N',
    time: '2 giờ trước',
    title: 'Chia sẻ kinh nghiệm học AI Marketing',
    content: 'Mình vừa hoàn thành khóa học AI Marketing và muốn chia sẻ một số insights với mọi người. Khóa học rất bổ ích, đặc biệt phần ứng dụng AI trong phân tích dữ liệu khách hàng...',
    likes: 45,
    comments: 12,
    tags: ['AI', 'Marketing', 'Tips'],
    likedBy: [],
  },
  {
    id: 'post-2',
    author: 'Trần Thị B',
    avatar: 'T',
    time: '5 giờ trước',
    title: 'Câu hỏi về Digital Marketing Fundamentals',
    content: 'Có bạn nào đang học khóa Digital Marketing Fundamentals không? Mình muốn hỏi về phần SEO, cụ thể là cách tối ưu on-page SEO cho website thương mại điện tử...',
    likes: 23,
    comments: 8,
    tags: ['Digital Marketing', 'Question'],
    likedBy: [],
  },
  {
    id: 'post-3',
    author: 'Lê Văn C',
    avatar: 'L',
    time: '1 ngày trước',
    title: 'Tổng hợp tài liệu học Content Creator hay',
    content: 'Mình đã tổng hợp một số tài liệu và tools hữu ích cho ai đang học Content Creator. Bao gồm các công cụ thiết kế, viết content, và phân tích hiệu quả nội dung...',
    likes: 67,
    comments: 15,
    tags: ['Content', 'Resources'],
    likedBy: [],
  },
];

function loadPosts(): Post[] {
  if (typeof window === 'undefined') return defaultPosts;
  try {
    const saved = localStorage.getItem(POSTS_STORAGE_KEY);
    if (saved) {
      const posts = JSON.parse(saved);
      if (posts.length > 0) return posts;
    }
  } catch { /* ignore */ }
  return defaultPosts;
}

function savePosts(posts: Post[]) {
  try { localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts)); } catch { /* ignore */ }
}

export default function Community() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'my-posts'>('popular');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    setPosts(loadPosts());
  }, []);

  const handlePostSubmit = () => {
    if (!newPost.trim() || !newPostTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề và nội dung bài viết', 'error');
      return;
    }
    if (!user) {
      showToast('Vui lòng đăng nhập để đăng bài', 'error');
      return;
    }
    const post: Post = {
      id: `post-${Date.now()}`,
      author: user.name,
      avatar: user.name.charAt(0).toUpperCase(),
      time: 'Vừa xong',
      title: newPostTitle,
      content: newPost,
      likes: 0,
      comments: 0,
      tags: [],
      likedBy: [],
    };
    const updated = [post, ...posts];
    setPosts(updated);
    savePosts(updated);
    setNewPost('');
    setNewPostTitle('');
    showToast('Bài viết của bạn đã được đăng!', 'success');
  };

  const handleLike = (postId: string) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thích bài viết', 'error');
      return;
    }
    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.likedBy.includes(user.email);
      return {
        ...p,
        likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
        likedBy: alreadyLiked
          ? p.likedBy.filter(e => e !== user.email)
          : [...p.likedBy, user.email],
      };
    });
    setPosts(updated);
    savePosts(updated);
  };

  const filteredPosts = activeTab === 'popular'
    ? [...posts].sort((a, b) => b.likes - a.likes)
    : activeTab === 'recent'
      ? posts
      : posts.filter(p => user && p.author === user.name);

  return (
    <div className="min-h-screen bg-dark">
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
            {user ? (
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Tiêu đề bài viết..."
                      className="w-full px-4 py-2 mb-2 bg-dark border border-white/[0.06] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal text-sm font-semibold"
                    />
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Bạn muốn chia sẻ điều gì?"
                      className="w-full px-4 py-3 bg-dark border border-white/[0.06] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-end mt-3">
                      <Button variant="primary" size="sm" onClick={handlePostSubmit}>
                        Đăng bài
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6 text-center">
                <p className="text-gray-400 mb-3">Đăng nhập để tham gia cộng đồng</p>
                <Link href="/login">
                  <Button variant="primary" size="sm">Đăng nhập</Button>
                </Link>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10">
              {[
                { id: 'popular' as const, label: 'Phổ biến' },
                { id: 'recent' as const, label: 'Mới nhất' },
                { id: 'my-posts' as const, label: 'Bài của tôi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === tab.id ? 'text-teal' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                <div key={post.id} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6 hover:border-teal/30 transition-colors">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white font-bold">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{post.author}</p>
                      <p className="text-sm text-gray-400">{post.time}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold text-white mb-2 hover:text-teal transition-colors cursor-pointer"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  >
                    {post.title}
                  </h3>

                  {/* Content */}
                  <p className={`text-gray-300 mb-4 ${expandedPost === post.id ? '' : 'line-clamp-3'}`}>
                    {post.content}
                  </p>
                  {post.content.length > 150 && expandedPost !== post.id && (
                    <button
                      onClick={() => setExpandedPost(post.id)}
                      className="text-teal text-sm font-semibold hover:underline mb-4 block"
                    >
                      Xem thêm
                    </button>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        user && post.likedBy.includes(user.email)
                          ? 'text-teal'
                          : 'text-gray-400 hover:text-teal'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={user && post.likedBy.includes(user.email) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors">
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
              )) : (
                <div className="text-center py-12 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-400">Chưa có bài viết nào</p>
                  <p className="text-gray-500 text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
              <h3 className="font-bold text-white mb-4">Thống kê cộng đồng</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Thành viên</span>
                  <span className="font-bold text-gold">15,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bài viết</span>
                  <span className="font-bold text-gold">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lượt thích</span>
                  <span className="font-bold text-gold">{posts.reduce((s, p) => s + p.likes, 0)}</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
              <h3 className="font-bold text-white mb-4">Chủ đề phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {['AI Marketing', 'Digital Marketing', 'Content Creator', 'SEO', 'Social Media', 'Data Analytics'].map((tag) => (
                  <button key={tag} className="px-3 py-1 bg-white/5 hover:bg-teal text-gray-400 hover:text-white text-sm rounded-full transition-colors">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
              <h3 className="font-bold text-white mb-4">Người đóng góp hàng đầu</h3>
              <div className="space-y-3">
                {(() => {
                  // Calculate from actual posts
                  const authorCounts: Record<string, { name: string; avatar: string; count: number }> = {};
                  posts.forEach(p => {
                    if (!authorCounts[p.author]) {
                      authorCounts[p.author] = { name: p.author, avatar: p.avatar, count: 0 };
                    }
                    authorCounts[p.author].count++;
                  });
                  return Object.values(authorCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((contributor, index) => (
                      <div key={contributor.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white text-sm font-bold">
                          {contributor.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{contributor.name}</p>
                          <p className="text-xs text-gray-400">{contributor.count} bài viết</p>
                        </div>
                        <span className="text-gold font-bold text-lg">#{index + 1}</span>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
