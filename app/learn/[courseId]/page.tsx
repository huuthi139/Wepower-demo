'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockCourses } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import type { MemberLevel } from '@/lib/mockData';

function isEmbedUrl(url: string): boolean {
  return /mediadelivery\.net\/(embed|play)/.test(url) || /player\.mediadelivery\.net/.test(url);
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  requiredLevel: MemberLevel;
  directPlayUrl: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const defaultChapters: Chapter[] = [
  {
    id: 'ch-1',
    title: 'Chương 1: Giới thiệu và chuẩn bị',
    lessons: [
      { id: 'ls-1-1', title: 'Tổng quan về khóa học', duration: '05:30', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-1-2', title: 'Cách học hiệu quả nhất', duration: '08:15', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-1-3', title: 'Chuẩn bị công cụ cần thiết', duration: '12:00', requiredLevel: 'Free', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Chương 2: Kiến thức nền tảng',
    lessons: [
      { id: 'ls-2-1', title: 'Hiểu rõ các khái niệm cơ bản', duration: '15:20', requiredLevel: 'Free', directPlayUrl: '' },
      { id: 'ls-2-2', title: 'Phân tích case study thực tế', duration: '20:00', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-2-3', title: 'Bài tập thực hành cơ bản', duration: '18:45', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-2-4', title: 'Tổng kết và đánh giá', duration: '10:30', requiredLevel: 'Free', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-3',
    title: 'Chương 3: Chiến lược nâng cao',
    lessons: [
      { id: 'ls-3-1', title: 'Chiến lược chuyên sâu', duration: '25:00', requiredLevel: 'Premium', directPlayUrl: '' },
      { id: 'ls-3-2', title: 'Tối ưu hóa quy trình', duration: '22:30', requiredLevel: 'Premium', directPlayUrl: '' },
    ],
  },
  {
    id: 'ch-4',
    title: 'Chương 4: Dự án thực tế và tổng kết',
    lessons: [
      { id: 'ls-4-1', title: 'Phân tích dữ liệu thực tế', duration: '30:00', requiredLevel: 'VIP', directPlayUrl: '' },
      { id: 'ls-4-2', title: 'Xây dựng dự án cuối khóa', duration: '45:00', requiredLevel: 'VIP', directPlayUrl: '' },
      { id: 'ls-4-3', title: 'Tổng kết và hướng đi tiếp theo', duration: '15:00', requiredLevel: 'Premium', directPlayUrl: '' },
    ],
  },
];

const LEVEL_ORDER: Record<MemberLevel, number> = { Free: 0, Premium: 1, VIP: 2 };

interface Comment {
  id: number;
  name: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

const mockComments: Comment[] = [
  { id: 1, name: 'Nguyễn Minh Tuấn', avatar: 'T', time: '2 giờ trước', text: 'Bài giảng rất dễ hiểu, cảm ơn thầy!', likes: 12 },
  { id: 2, name: 'Trần Thu Hà', avatar: 'H', time: '5 giờ trước', text: 'Phần này hay quá, em đã áp dụng được ngay vào project của mình.', likes: 8 },
  { id: 3, name: 'Lê Văn Đức', avatar: 'D', time: '1 ngày trước', text: 'Thầy có thể giải thích thêm phần cuối được không ạ?', likes: 3 },
  { id: 4, name: 'Phạm Thị Lan', avatar: 'L', time: '2 ngày trước', text: 'Video chất lượng, âm thanh rõ ràng. Mong có thêm nhiều bài như vậy!', likes: 15 },
];

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.courseId as string;
  const userLevel: MemberLevel = user?.memberLevel || 'Free';

  const course = mockCourses.find(c => c.id === courseId);

  const [chapters, setChapters] = useState<Chapter[]>(defaultChapters);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'curriculum' | 'comments'>('curriculum');
  const [commentText, setCommentText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load chapters from localStorage (shared with admin)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`wepower-chapters-${courseId}`);
        if (saved) {
          const parsed = JSON.parse(saved) as Chapter[];
          setChapters(parsed);
        }
      } catch { /* ignore */ }
    }
  }, [courseId]);

  // Select first playable lesson on load
  useEffect(() => {
    if (chapters.length > 0 && !currentLessonId) {
      for (const ch of chapters) {
        for (const ls of ch.lessons) {
          if (ls.directPlayUrl && LEVEL_ORDER[ls.requiredLevel] <= LEVEL_ORDER[userLevel]) {
            setCurrentLessonId(ls.id);
            setExpandedChapters(new Set([ch.id]));
            return;
          }
        }
      }
      // fallback: select first lesson
      if (chapters[0]?.lessons[0]) {
        setCurrentLessonId(chapters[0].lessons[0].id);
        setExpandedChapters(new Set([chapters[0].id]));
      }
    }
  }, [chapters, currentLessonId, userLevel]);

  if (!course) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Không tìm thấy khóa học</p>
          <Link href="/courses" className="text-red hover:underline">Quay lại</Link>
        </div>
      </div>
    );
  }

  // Find current lesson data
  let currentLesson: Lesson | null = null;
  let currentChapter: Chapter | null = null;
  let globalIndex = 0;
  let currentGlobalIndex = 0;
  for (const ch of chapters) {
    for (const ls of ch.lessons) {
      globalIndex++;
      if (ls.id === currentLessonId) {
        currentLesson = ls;
        currentChapter = ch;
        currentGlobalIndex = globalIndex;
      }
    }
  }

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  const selectLesson = (lesson: Lesson, chapter: Chapter) => {
    const isLocked = LEVEL_ORDER[lesson.requiredLevel] > LEVEL_ORDER[userLevel];
    if (isLocked) return;
    setCurrentLessonId(lesson.id);
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.add(chapter.id);
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // Navigate to next/prev lesson
  const allLessons = chapters.flatMap(ch => ch.lessons.map(ls => ({ ...ls, chapterId: ch.id })));
  const currentIdx = allLessons.findIndex(ls => ls.id === currentLessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const goToLesson = (ls: typeof allLessons[0] | null) => {
    if (!ls) return;
    if (LEVEL_ORDER[ls.requiredLevel] > LEVEL_ORDER[userLevel]) return;
    setCurrentLessonId(ls.id);
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.add(ls.chapterId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-black border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${courseId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm hidden sm:inline">Quay lại</span>
            </Link>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <Link href="/" className="text-red font-black text-lg tracking-wider hidden sm:block">
              WEPOWER
            </Link>
          </div>

          <h1 className="text-white text-sm font-semibold truncate max-w-[300px] md:max-w-[500px]">
            {course.title}
          </h1>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white text-xs font-medium">{user.name}</p>
                  <span className={`text-[10px] font-bold ${
                    userLevel === 'VIP' ? 'text-yellow' : userLevel === 'Premium' ? 'text-red' : 'text-gray-400'
                  }`}>
                    {userLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
          {/* Video Player */}
          <div className="relative bg-black">
            <div className="aspect-video w-full max-h-[calc(100vh-280px)]">
              {currentLesson?.directPlayUrl ? (
                isEmbedUrl(currentLesson.directPlayUrl) ? (
                  <iframe
                    key={currentLesson.directPlayUrl}
                    src={currentLesson.directPlayUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={currentLesson.directPlayUrl}
                    src={currentLesson.directPlayUrl}
                    controls
                    className="w-full h-full bg-black"
                    controlsList="nodownload"
                    playsInline
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Video chưa được tải lên</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Info + Controls */}
          <div className="px-4 md:px-6 py-4 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-lg md:text-xl font-bold mb-2">
                  {currentLesson?.title || 'Chọn bài học'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {currentChapter && (
                    <span className="text-gray-500">{currentChapter.title}</span>
                  )}
                  {currentLesson?.duration && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {currentLesson.duration}
                    </span>
                  )}
                  {currentLesson && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      currentLesson.requiredLevel === 'VIP'
                        ? 'bg-gradient-to-r from-yellow/20 to-amber-500/20 text-yellow border border-yellow/30'
                        : currentLesson.requiredLevel === 'Premium'
                          ? 'bg-red/10 text-red border border-red/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {currentLesson.requiredLevel === 'Free' ? 'FREE' : currentLesson.requiredLevel.toUpperCase()}
                    </span>
                  )}
                  <span className="text-gray-500">Bài {currentGlobalIndex}/{totalLessons}</span>
                </div>
              </div>

              {/* Prev/Next buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => goToLesson(prevLesson ?? null)}
                  disabled={!prevLesson || (prevLesson && LEVEL_ORDER[prevLesson.requiredLevel] > LEVEL_ORDER[userLevel])}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Bài trước"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => goToLesson(nextLesson ?? null)}
                  disabled={!nextLesson || (nextLesson && LEVEL_ORDER[nextLesson.requiredLevel] > LEVEL_ORDER[userLevel])}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Bài tiếp theo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Toggle sidebar on mobile */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors lg:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs: Danh mục / Bình luận */}
          <div className="px-4 md:px-6 border-b border-white/10">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`py-3 text-sm font-semibold relative transition-colors ${
                  activeTab === 'curriculum' ? 'text-red' : 'text-gray-400 hover:text-white'
                }`}
              >
                Danh mục
                {activeTab === 'curriculum' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red" />}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 text-sm font-semibold relative transition-colors ${
                  activeTab === 'comments' ? 'text-red' : 'text-gray-400 hover:text-white'
                }`}
              >
                Bình luận ({mockComments.length})
                {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red" />}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            {activeTab === 'curriculum' && (
              <div className="space-y-3 lg:hidden">
                {/* Show curriculum on mobile (desktop has sidebar) */}
                {chapters.map(chapter => {
                  const isExpanded = expandedChapters.has(chapter.id);
                  return (
                    <div key={chapter.id} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-white text-sm font-semibold text-left">{chapter.title}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="divide-y divide-white/5">
                          {chapter.lessons.map((lesson, i) => {
                            const isLocked = LEVEL_ORDER[lesson.requiredLevel] > LEVEL_ORDER[userLevel];
                            const isActive = lesson.id === currentLessonId;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson, chapter)}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                                  isActive ? 'bg-red/10 border-l-2 border-red' : 'hover:bg-white/5'
                                } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                  isActive ? 'bg-red text-white' : 'bg-white/10 text-gray-400'
                                }`}>
                                  {isLocked ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  ) : (i + 1)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm truncate ${isActive ? 'text-red font-semibold' : 'text-white'}`}>{lesson.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                                    <LevelBadgeSmall level={lesson.requiredLevel} />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="hidden lg:block">
                <p className="text-gray-500 text-sm">Danh sách bài học hiển thị ở sidebar bên phải.</p>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4 max-w-2xl">
                {/* Comment Input */}
                {user ? (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red transition-colors resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          disabled={!commentText.trim()}
                          className="px-4 py-2 bg-red text-white text-sm font-bold rounded-lg hover:bg-red/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Gửi bình luận
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">Đăng nhập để bình luận</p>
                    <Link href="/login" className="text-red text-sm font-semibold hover:underline">Đăng nhập</Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4 mt-6">
                  {mockComments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{comment.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-semibold">{comment.name}</span>
                          <span className="text-gray-500 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-red text-xs transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {comment.likes}
                          </button>
                          <button className="text-gray-500 hover:text-white text-xs transition-colors">
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Lesson List */}
        <aside className={`${
          sidebarOpen ? 'w-80 xl:w-96' : 'w-0'
        } flex-shrink-0 border-l border-white/10 bg-[#111] hidden lg:flex flex-col overflow-hidden transition-all duration-300`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-white font-bold text-sm mb-1">Nội dung khóa học</h3>
            <p className="text-gray-500 text-xs">{totalLessons} bài học</p>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter, chapterIdx) => {
              const isExpanded = expandedChapters.has(chapter.id);
              let lessonOffset = 0;
              for (let i = 0; i < chapterIdx; i++) {
                lessonOffset += chapters[i].lessons.length;
              }

              return (
                <div key={chapter.id}>
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border-b border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-white text-xs font-semibold truncate">{chapter.title}</span>
                    </div>
                    <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{chapter.lessons.length} bài</span>
                  </button>

                  {/* Lessons */}
                  {isExpanded && chapter.lessons.map((lesson, lessonIdx) => {
                    const isActive = lesson.id === currentLessonId;
                    const isLocked = LEVEL_ORDER[lesson.requiredLevel] > LEVEL_ORDER[userLevel];
                    const lessonNum = lessonOffset + lessonIdx + 1;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson, chapter)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 ${
                          isActive
                            ? 'bg-red/10 border-l-2 border-l-red'
                            : 'hover:bg-white/5'
                        } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {/* Lesson Number / Play indicator */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isActive
                            ? 'bg-red text-white'
                            : isLocked
                              ? 'bg-white/5 text-gray-600'
                              : lesson.directPlayUrl
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-white/5 text-gray-500'
                        }`}>
                          {isLocked ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : isActive ? (
                            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            String(lessonNum).padStart(2, '0')
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${isActive ? 'text-red font-semibold' : 'text-white'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                            <LevelBadgeSmall level={lesson.requiredLevel} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute right-0 top-0 bottom-0 w-80 bg-[#111] border-l border-white/10 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-white font-bold text-sm">Nội dung khóa học</h3>
                  <p className="text-gray-500 text-xs">{totalLessons} bài học</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chapters.map((chapter, chapterIdx) => {
                  const isExpanded = expandedChapters.has(chapter.id);
                  let lessonOffset = 0;
                  for (let i = 0; i < chapterIdx; i++) {
                    lessonOffset += chapters[i].lessons.length;
                  }
                  return (
                    <div key={chapter.id}>
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border-b border-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-white text-xs font-semibold truncate">{chapter.title}</span>
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{chapter.lessons.length} bài</span>
                      </button>
                      {isExpanded && chapter.lessons.map((lesson, lessonIdx) => {
                        const isActive = lesson.id === currentLessonId;
                        const isLocked = LEVEL_ORDER[lesson.requiredLevel] > LEVEL_ORDER[userLevel];
                        const lessonNum = lessonOffset + lessonIdx + 1;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => { selectLesson(lesson, chapter); setSidebarOpen(false); }}
                            disabled={isLocked}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 ${
                              isActive ? 'bg-red/10 border-l-2 border-l-red' : 'hover:bg-white/5'
                            } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              isActive ? 'bg-red text-white' : isLocked ? 'bg-white/5 text-gray-600' : lesson.directPlayUrl ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
                            }`}>
                              {isLocked ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              ) : isActive ? (
                                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              ) : String(lessonNum).padStart(2, '0')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm truncate ${isActive ? 'text-red font-semibold' : 'text-white'}`}>{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{lesson.duration}</span>
                                <LevelBadgeSmall level={lesson.requiredLevel} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function LevelBadgeSmall({ level }: { level: MemberLevel }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
      level === 'VIP'
        ? 'bg-yellow/10 text-yellow'
        : level === 'Premium'
          ? 'bg-red/10 text-red'
          : 'bg-green-500/10 text-green-400'
    }`}>
      {level === 'Free' ? 'FREE' : level.toUpperCase()}
    </span>
  );
}
