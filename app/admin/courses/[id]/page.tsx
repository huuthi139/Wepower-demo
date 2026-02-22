'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { mockCourses } from '@/lib/mockData';
import type { MemberLevel } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  requiredLevel: MemberLevel;
  videoId: string;
  libraryId: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const initialChapters: Chapter[] = [
  {
    id: 'ch-1',
    title: 'Chương 1: Giới thiệu và chuẩn bị',
    lessons: [
      { id: 'ls-1-1', title: 'Tổng quan về khóa học', duration: '05:30', requiredLevel: 'Free', videoId: 'abc-123-def', libraryId: '87654' },
      { id: 'ls-1-2', title: 'Cách học hiệu quả nhất', duration: '08:15', requiredLevel: 'Free', videoId: 'abc-456-ghi', libraryId: '87654' },
      { id: 'ls-1-3', title: 'Chuẩn bị công cụ cần thiết', duration: '12:00', requiredLevel: 'Free', videoId: '', libraryId: '' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Chương 2: Kiến thức nền tảng',
    lessons: [
      { id: 'ls-2-1', title: 'Hiểu rõ các khái niệm cơ bản', duration: '15:20', requiredLevel: 'Free', videoId: 'xyz-789-abc', libraryId: '87654' },
      { id: 'ls-2-2', title: 'Phân tích case study thực tế', duration: '20:00', requiredLevel: 'Premium', videoId: 'xyz-012-def', libraryId: '87654' },
      { id: 'ls-2-3', title: 'Bài tập thực hành cơ bản', duration: '18:45', requiredLevel: 'Premium', videoId: '', libraryId: '' },
      { id: 'ls-2-4', title: 'Tổng kết và đánh giá', duration: '10:30', requiredLevel: 'Free', videoId: 'xyz-345-ghi', libraryId: '87654' },
    ],
  },
  {
    id: 'ch-3',
    title: 'Chương 3: Chiến lược nâng cao',
    lessons: [
      { id: 'ls-3-1', title: 'Chiến lược chuyên sâu', duration: '25:00', requiredLevel: 'Premium', videoId: 'pqr-111-aaa', libraryId: '87654' },
      { id: 'ls-3-2', title: 'Tối ưu hóa quy trình', duration: '22:30', requiredLevel: 'Premium', videoId: 'pqr-222-bbb', libraryId: '87654' },
    ],
  },
  {
    id: 'ch-4',
    title: 'Chương 4: Dự án thực tế và tổng kết',
    lessons: [
      { id: 'ls-4-1', title: 'Phân tích dữ liệu thực tế', duration: '30:00', requiredLevel: 'VIP', videoId: 'stu-333-ccc', libraryId: '87654' },
      { id: 'ls-4-2', title: 'Xây dựng dự án cuối khóa', duration: '45:00', requiredLevel: 'VIP', videoId: '', libraryId: '' },
      { id: 'ls-4-3', title: 'Tổng kết và hướng đi tiếp theo', duration: '15:00', requiredLevel: 'Premium', videoId: 'stu-444-ddd', libraryId: '87654' },
    ],
  },
];

function LevelBadge({ level }: { level: MemberLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        level === 'VIP'
          ? 'bg-gradient-to-r from-yellow/20 to-amber-500/20 text-yellow border border-yellow/30'
          : level === 'Premium'
            ? 'bg-red/10 text-red border border-red/20'
            : 'bg-white/5 text-gray-400 border border-white/10'
      }`}
    >
      {level === 'VIP' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {level === 'Premium' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      )}
      {level}
    </span>
  );
}

type ModalType =
  | { kind: 'none' }
  | { kind: 'addChapter' }
  | { kind: 'editChapter'; chapterId: string }
  | { kind: 'deleteChapter'; chapterId: string }
  | { kind: 'addLesson'; chapterId: string }
  | { kind: 'editLesson'; chapterId: string; lessonId: string }
  | { kind: 'deleteLesson'; chapterId: string; lessonId: string };

export default function CourseContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const course = mockCourses.find((c) => c.id === id);

  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['ch-1']));
  const [modal, setModal] = useState<ModalType>({ kind: 'none' });

  // Form states
  const [chapterTitle, setChapterTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonLevel, setLessonLevel] = useState<MemberLevel>('Free');
  const [lessonVideoId, setLessonVideoId] = useState('');
  const [lessonLibraryId, setLessonLibraryId] = useState('');

  if (!course) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 max-w-lg mx-auto">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Khong tim thay khoa hoc</h2>
            <p className="text-gray-400 mb-6">Khoa hoc voi ID &quot;{id}&quot; khong ton tai.</p>
            <Link href="/admin">
              <Button variant="primary" size="md">Quay lai Admin</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // ---- Chapter CRUD ----
  const openAddChapter = () => {
    setChapterTitle('');
    setModal({ kind: 'addChapter' });
  };

  const openEditChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setChapterTitle(chapter.title);
      setModal({ kind: 'editChapter', chapterId });
    }
  };

  const openDeleteChapter = (chapterId: string) => {
    setModal({ kind: 'deleteChapter', chapterId });
  };

  const handleAddChapter = () => {
    if (!chapterTitle.trim()) return;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: chapterTitle.trim(),
      lessons: [],
    };
    setChapters((prev) => [...prev, newChapter]);
    setModal({ kind: 'none' });
  };

  const handleEditChapter = () => {
    if (modal.kind !== 'editChapter' || !chapterTitle.trim()) return;
    setChapters((prev) =>
      prev.map((ch) => (ch.id === modal.chapterId ? { ...ch, title: chapterTitle.trim() } : ch))
    );
    setModal({ kind: 'none' });
  };

  const handleDeleteChapter = () => {
    if (modal.kind !== 'deleteChapter') return;
    setChapters((prev) => prev.filter((ch) => ch.id !== modal.chapterId));
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.delete(modal.chapterId);
      return next;
    });
    setModal({ kind: 'none' });
  };

  // ---- Lesson CRUD ----
  const openAddLesson = (chapterId: string) => {
    setLessonTitle('');
    setLessonDuration('');
    setLessonLevel('Free');
    setLessonVideoId('');
    setLessonLibraryId('');
    setModal({ kind: 'addLesson', chapterId });
  };

  const openEditLesson = (chapterId: string, lessonId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setLessonTitle(lesson.title);
      setLessonDuration(lesson.duration);
      setLessonLevel(lesson.requiredLevel);
      setLessonVideoId(lesson.videoId);
      setLessonLibraryId(lesson.libraryId);
      setModal({ kind: 'editLesson', chapterId, lessonId });
    }
  };

  const openDeleteLesson = (chapterId: string, lessonId: string) => {
    setModal({ kind: 'deleteLesson', chapterId, lessonId });
  };

  const handleAddLesson = () => {
    if (modal.kind !== 'addLesson' || !lessonTitle.trim()) return;
    const newLesson: Lesson = {
      id: `ls-${Date.now()}`,
      title: lessonTitle.trim(),
      duration: lessonDuration.trim(),
      requiredLevel: lessonLevel,
      videoId: lessonVideoId.trim(),
      libraryId: lessonLibraryId.trim(),
    };
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === modal.chapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch
      )
    );
    setModal({ kind: 'none' });
  };

  const handleEditLesson = () => {
    if (modal.kind !== 'editLesson' || !lessonTitle.trim()) return;
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === modal.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((ls) =>
                ls.id === modal.lessonId
                  ? { ...ls, title: lessonTitle.trim(), duration: lessonDuration.trim(), requiredLevel: lessonLevel, videoId: lessonVideoId.trim(), libraryId: lessonLibraryId.trim() }
                  : ls
              ),
            }
          : ch
      )
    );
    setModal({ kind: 'none' });
  };

  const handleDeleteLesson = () => {
    if (modal.kind !== 'deleteLesson') return;
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === modal.chapterId
          ? { ...ch, lessons: ch.lessons.filter((ls) => ls.id !== modal.lessonId) }
          : ch
      )
    );
    setModal({ kind: 'none' });
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  // Helper to get names for delete confirmation
  const getChapterTitle = (chapterId: string) => chapters.find((c) => c.id === chapterId)?.title ?? '';
  const getLessonTitle = (chapterId: string, lessonId: string) =>
    chapters.find((c) => c.id === chapterId)?.lessons.find((l) => l.id === lessonId)?.title ?? '';

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{course.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {course.instructor} &middot; {chapters.length} chuong &middot; {totalLessons} bai hoc &middot; {formatPrice(course.price)}
              </p>
            </div>
          </div>
          <Link href="/admin?tab=courses">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lai
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{chapters.length}</div>
            <p className="text-xs text-gray-400 mt-1">Chuong</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{totalLessons}</div>
            <p className="text-xs text-gray-400 mt-1">Bai hoc</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow">{course.enrollmentsCount.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">Hoc vien</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-2xl font-bold text-white">{course.rating}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{course.reviewsCount} danh gia</p>
          </div>
        </div>

        {/* Add Chapter Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Noi dung khoa hoc</h2>
          <Button variant="primary" size="sm" onClick={openAddChapter}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Them chuong moi
          </Button>
        </div>

        {/* Chapters Accordion */}
        <div className="space-y-4">
          {chapters.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400">Chua co chuong nao. Nhan &quot;Them chuong moi&quot; de bat dau.</p>
            </div>
          )}

          {chapters.map((chapter, chapterIndex) => {
            const isExpanded = expandedChapters.has(chapter.id);
            return (
              <div key={chapter.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Chapter Header */}
                <div className="flex items-center justify-between p-4 md:p-5">
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                  >
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{chapter.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {chapter.lessons.length} bai hoc
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => openEditChapter(chapter.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Chinh sua chuong"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteChapter(chapter.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red hover:bg-red/5 transition-colors"
                      title="Xoa chuong"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Lessons List (expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-800">
                    {chapter.lessons.length === 0 && (
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500">Chua co bai hoc nao trong chuong nay.</p>
                      </div>
                    )}

                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between px-4 md:px-5 py-3 hover:bg-white/[0.02] transition-colors ${
                          lessonIndex < chapter.lessons.length - 1 ? 'border-b border-gray-800/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${lesson.videoId ? 'bg-green-500/10' : 'bg-white/5'}`}>
                            <svg className={`w-3.5 h-3.5 ${lesson.videoId ? 'text-green-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white truncate">{lesson.title}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <LevelBadge level={lesson.requiredLevel} />
                              {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration}</span>}
                              {lesson.videoId ? (
                                <span className="text-xs text-green-400">ID: {lesson.videoId}</span>
                              ) : (
                                <span className="text-xs text-yellow">Chưa có video</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                          <button
                            onClick={() => openEditLesson(chapter.id, lesson.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Chinh sua bai hoc"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteLesson(chapter.id, lesson.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red hover:bg-red/5 transition-colors"
                            title="Xoa bai hoc"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Lesson Button */}
                    <div className="p-3 border-t border-gray-800">
                      <button
                        onClick={() => openAddLesson(chapter.id)}
                        className="flex items-center gap-2 text-sm text-red hover:text-white transition-colors w-full justify-center py-2 rounded-lg hover:bg-white/5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Them bai hoc
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =============== MODALS =============== */}

      {/* Add Chapter Modal */}
      {modal.kind === 'addChapter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">Them chuong moi</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tieu de chuong</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Vd: Chuong 1: Gioi thieu"
                className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddChapter();
                }}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Huy
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddChapter} disabled={!chapterTitle.trim()}>
                Them chuong
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Chapter Modal */}
      {modal.kind === 'editChapter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">Chinh sua chuong</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tieu de chuong</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Nhap tieu de chuong"
                className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditChapter();
                }}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Huy
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditChapter} disabled={!chapterTitle.trim()}>
                Luu thay doi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chapter Confirmation Modal */}
      {modal.kind === 'deleteChapter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xoa chuong</h3>
                <p className="text-sm text-gray-400">Hanh dong nay khong the hoan tac.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-1">
              Ban co chac chan muon xoa chuong:
            </p>
            <p className="text-sm text-white font-semibold mb-4">
              &quot;{getChapterTitle(modal.chapterId)}&quot;?
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Tat ca {chapters.find((c) => c.id === modal.chapterId)?.lessons.length ?? 0} bai hoc trong chuong nay cung se bi xoa.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Huy
              </Button>
              <button
                onClick={handleDeleteChapter}
                className="inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 h-9 px-4 text-sm bg-red text-white hover:bg-red/80"
              >
                Xoa chuong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {modal.kind === 'addLesson' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-1">Thêm bài học mới</h3>
            <p className="text-sm text-gray-400 mb-4">
              Vào chương: {getChapterTitle(modal.chapterId)}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tiêu đề bài học</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="VD: Giới thiệu tổng quan"
                  className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                  autoFocus
                />
              </div>
              <div className="p-3 bg-white/[0.02] border border-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-400">Bunny Stream</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Video ID</label>
                    <input
                      type="text"
                      value={lessonVideoId}
                      onChange={(e) => setLessonVideoId(e.target.value)}
                      placeholder="VD: abc-123-def-456"
                      className="w-full h-10 px-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Library ID</label>
                    <input
                      type="text"
                      value={lessonLibraryId}
                      onChange={(e) => setLessonLibraryId(e.target.value)}
                      placeholder="VD: 87654"
                      className="w-full h-10 px-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Thời lượng</label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="VD: 10:30"
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cấp độ</label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as MemberLevel)}
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Free" className="bg-gray-900 text-white">Free</option>
                    <option value="Premium" className="bg-gray-900 text-white">Premium</option>
                    <option value="VIP" className="bg-gray-900 text-white">VIP</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddLesson}
                disabled={!lessonTitle.trim()}
              >
                Thêm bài học
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {modal.kind === 'editLesson' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-1">Chỉnh sửa bài học</h3>
            <p className="text-sm text-gray-400 mb-4">
              Trong chương: {getChapterTitle(modal.chapterId)}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tiêu đề bài học</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài học"
                  className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                  autoFocus
                />
              </div>
              <div className="p-3 bg-white/[0.02] border border-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-400">Bunny Stream</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Video ID</label>
                    <input
                      type="text"
                      value={lessonVideoId}
                      onChange={(e) => setLessonVideoId(e.target.value)}
                      placeholder="VD: abc-123-def-456"
                      className="w-full h-10 px-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Library ID</label>
                    <input
                      type="text"
                      value={lessonLibraryId}
                      onChange={(e) => setLessonLibraryId(e.target.value)}
                      placeholder="VD: 87654"
                      className="w-full h-10 px-3 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Thời lượng</label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="VD: 10:30"
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cấp độ</label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as MemberLevel)}
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Free" className="bg-gray-900 text-white">Free</option>
                    <option value="Premium" className="bg-gray-900 text-white">Premium</option>
                    <option value="VIP" className="bg-gray-900 text-white">VIP</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEditLesson}
                disabled={!lessonTitle.trim()}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lesson Confirmation Modal */}
      {modal.kind === 'deleteLesson' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xoa bai hoc</h3>
                <p className="text-sm text-gray-400">Hanh dong nay khong the hoan tac.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-1">
              Ban co chac chan muon xoa bai hoc:
            </p>
            <p className="text-sm text-white font-semibold mb-6">
              &quot;{getLessonTitle(modal.chapterId, modal.lessonId)}&quot;?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setModal({ kind: 'none' })}>
                Huy
              </Button>
              <button
                onClick={handleDeleteLesson}
                className="inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 h-9 px-4 text-sm bg-red text-white hover:bg-red/80"
              >
                Xoa bai hoc
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
