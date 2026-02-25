'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useCourses } from '@/contexts/CoursesContext';
import type { MemberLevel } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';

// Helper: detect if URL is a Bunny Stream embed/player URL
function isEmbedUrl(url: string): boolean {
  return /mediadelivery\.net\/(embed|play)/.test(url)
    || /player\.mediadelivery\.net/.test(url)
    || /iframe\.mediadelivery\.net/.test(url)
    || /video\.bunnycdn\.com/.test(url);
}

// Normalize Bunny embed URL: player.mediadelivery.net → iframe.mediadelivery.net
function normalizeBunnyEmbedUrl(url: string): string {
  if (!url) return url;
  return url.replace(/^(https?:\/\/)player\.mediadelivery\.net/, '$1iframe.mediadelivery.net');
}

// Backward compat: convert old { videoId, libraryId } to directPlayUrl
function normalizeChapters(chapters: any[]): Chapter[] {
  return chapters.map((ch: any) => ({
    id: ch.id,
    title: ch.title,
    lessons: (ch.lessons || []).map((ls: any) => ({
      id: ls.id,
      title: ls.title,
      duration: ls.duration || '',
      requiredLevel: ls.requiredLevel || 'Free',
      directPlayUrl: normalizeBunnyEmbedUrl(
        ls.directPlayUrl ||
        (ls.videoId && ls.libraryId
          ? `https://iframe.mediadelivery.net/embed/${ls.libraryId}/${ls.videoId}`
          : '')
      ),
    })),
  }));
}

// Helper: format seconds to MM:SS
function formatSecondsToMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

const initialChapters: Chapter[] = [];

function LevelBadge({ level }: { level: MemberLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        level === 'VIP'
          ? 'bg-gradient-to-r from-gold/20 to-amber-500/20 text-gold border border-gold/30'
          : level === 'Premium'
            ? 'bg-teal/10 text-teal border border-teal/20'
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

export default function CourseContentPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { courses } = useCourses();
  const course = courses.find((c) => c.id === id);

  const storageKey = `wepower-chapters-${id}`;
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return normalizeChapters(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    return initialChapters;
  });
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['ch-1']));
  const [modal, setModal] = useState<ModalType>({ kind: 'none' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [previewVideo, setPreviewVideo] = useState<{ directPlayUrl: string; title: string } | null>(null);

  // Drag & drop state for reordering lessons
  const dragItem = useRef<{ chapterId: string; lessonIndex: number } | null>(null);
  const dragOverItem = useRef<{ chapterId: string; lessonIndex: number } | null>(null);
  const [draggingLesson, setDraggingLesson] = useState<{ chapterId: string; lessonIndex: number } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ chapterId: string; lessonIndex: number } | null>(null);

  // Persist chapters to localStorage
  const saveChapters = useCallback((newChapters: Chapter[]) => {
    setChapters(newChapters);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newChapters));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch { /* ignore */ }
  }, [storageKey]);

  // Form states
  const [chapterTitle, setChapterTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonLevel, setLessonLevel] = useState<MemberLevel>('Free');
  const [lessonDirectPlayUrl, setLessonDirectPlayUrl] = useState('');
  const [durationLoading, setDurationLoading] = useState(false);

  // Auto-detect video duration when URL changes
  const handleUrlChange = useCallback((url: string) => {
    const normalized = normalizeBunnyEmbedUrl(url);
    setLessonDirectPlayUrl(normalized);
    const trimmed = normalized.trim();
    if (!trimmed) return;

    // For embed URLs, try to extract duration via Bunny API pattern
    // For direct video URLs, use hidden <video> element
    if (!isEmbedUrl(trimmed)) {
      setDurationLoading(true);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = trimmed;
      video.onloadedmetadata = () => {
        if (video.duration && isFinite(video.duration)) {
          setLessonDuration(formatSecondsToMMSS(video.duration));
        }
        setDurationLoading(false);
        video.src = '';
      };
      video.onerror = () => {
        setDurationLoading(false);
        video.src = '';
      };
    } else {
      // For embed URLs: try to fetch the embed page and extract duration
      // Bunny embed URLs contain a direct play URL we can probe
      // Pattern: extract libraryId and videoId from embed URL
      const match = trimmed.match(/mediadelivery\.net\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i);
      if (match) {
        const [, libId, vidId] = match;
        // Try the Bunny CDN direct URL pattern to get metadata
        const probeUrl = `https://vz-${libId}.b-cdn.net/${vidId}/original`;
        setDurationLoading(true);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        video.src = probeUrl;
        video.onloadedmetadata = () => {
          if (video.duration && isFinite(video.duration)) {
            setLessonDuration(formatSecondsToMMSS(video.duration));
          }
          setDurationLoading(false);
          video.src = '';
        };
        video.onerror = () => {
          // Probe failed - that's OK, admin can set duration manually
          setDurationLoading(false);
          video.src = '';
        };
      }
    }
  }, []);

  if (!course) {
    return (
      <div className="min-h-screen bg-dark">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 max-w-lg mx-auto">
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
    saveChapters([...chapters, newChapter]);
    setModal({ kind: 'none' });
  };

  const handleEditChapter = () => {
    if (modal.kind !== 'editChapter' || !chapterTitle.trim()) return;
    saveChapters(
      chapters.map((ch) => (ch.id === modal.chapterId ? { ...ch, title: chapterTitle.trim() } : ch))
    );
    setModal({ kind: 'none' });
  };

  const handleDeleteChapter = () => {
    if (modal.kind !== 'deleteChapter') return;
    saveChapters(chapters.filter((ch) => ch.id !== modal.chapterId));
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
    setLessonDirectPlayUrl('');
    setModal({ kind: 'addLesson', chapterId });
  };

  const openEditLesson = (chapterId: string, lessonId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setLessonTitle(lesson.title);
      setLessonDuration(lesson.duration);
      setLessonLevel(lesson.requiredLevel);
      setLessonDirectPlayUrl(lesson.directPlayUrl);
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
      directPlayUrl: lessonDirectPlayUrl.trim(),
    };
    saveChapters(
      chapters.map((ch) =>
        ch.id === modal.chapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch
      )
    );
    setModal({ kind: 'none' });
  };

  const handleEditLesson = () => {
    if (modal.kind !== 'editLesson' || !lessonTitle.trim()) return;
    saveChapters(
      chapters.map((ch) =>
        ch.id === modal.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((ls) =>
                ls.id === modal.lessonId
                  ? { ...ls, title: lessonTitle.trim(), duration: lessonDuration.trim(), requiredLevel: lessonLevel, directPlayUrl: lessonDirectPlayUrl.trim() }
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
    saveChapters(
      chapters.map((ch) =>
        ch.id === modal.chapterId
          ? { ...ch, lessons: ch.lessons.filter((ls) => ls.id !== modal.lessonId) }
          : ch
      )
    );
    setModal({ kind: 'none' });
  };

  // ---- Drag & Drop handlers for lesson reordering ----
  const handleLessonDragStart = (chapterId: string, lessonIndex: number) => {
    dragItem.current = { chapterId, lessonIndex };
    setDraggingLesson({ chapterId, lessonIndex });
  };

  const handleLessonDragOver = (e: React.DragEvent, chapterId: string, lessonIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Only allow reorder within the same chapter
    if (dragItem.current && dragItem.current.chapterId === chapterId) {
      dragOverItem.current = { chapterId, lessonIndex };
      setDragOverTarget({ chapterId, lessonIndex });
    }
  };

  const handleLessonDrop = (e: React.DragEvent, chapterId: string) => {
    e.preventDefault();
    if (!dragItem.current || !dragOverItem.current) return;
    if (dragItem.current.chapterId !== chapterId) return;
    if (dragItem.current.lessonIndex === dragOverItem.current.lessonIndex) return;

    const fromIndex = dragItem.current.lessonIndex;
    const toIndex = dragOverItem.current.lessonIndex;

    saveChapters(
      chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const newLessons = [...ch.lessons];
        const [moved] = newLessons.splice(fromIndex, 1);
        newLessons.splice(toIndex, 0, moved);
        return { ...ch, lessons: newLessons };
      })
    );

    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingLesson(null);
    setDragOverTarget(null);
  };

  const handleLessonDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingLesson(null);
    setDragOverTarget(null);
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  // Helper to get names for delete confirmation
  const getChapterTitle = (chapterId: string) => chapters.find((c) => c.id === chapterId)?.title ?? '';
  const getLessonTitle = (chapterId: string, lessonId: string) =>
    chapters.find((c) => c.id === chapterId)?.lessons.find((l) => l.id === lessonId)?.title ?? '';

  return (
    <div className="min-h-screen bg-dark">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-white">{course.title}</h1>
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã lưu
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {course.instructor} &middot; {chapters.length} chương &middot; {totalLessons} bài học &middot; {formatPrice(course.price)}
              </p>
            </div>
          </div>
          <Link href="/admin?tab=courses">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{chapters.length}</div>
            <p className="text-xs text-gray-400 mt-1">Chuong</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{totalLessons}</div>
            <p className="text-xs text-gray-400 mt-1">Bai hoc</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="text-2xl font-bold text-gold">{course.enrollmentsCount.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">Hoc vien</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-12 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400">Chua co chuong nao. Nhan &quot;Them chuong moi&quot; de bat dau.</p>
            </div>
          )}

          {chapters.map((chapter, chapterIndex) => {
            const isExpanded = expandedChapters.has(chapter.id);
            return (
              <div key={chapter.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
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
                      className="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/5 transition-colors"
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
                  <div className="border-t border-white/[0.06]">
                    {chapter.lessons.length === 0 && (
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500">Chua co bai hoc nao trong chuong nay.</p>
                      </div>
                    )}

                    {chapter.lessons.map((lesson, lessonIndex) => {
                      const isDragging = draggingLesson?.chapterId === chapter.id && draggingLesson?.lessonIndex === lessonIndex;
                      const isDragOver = dragOverTarget?.chapterId === chapter.id && dragOverTarget?.lessonIndex === lessonIndex && draggingLesson?.chapterId === chapter.id && draggingLesson?.lessonIndex !== lessonIndex;
                      return (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={() => handleLessonDragStart(chapter.id, lessonIndex)}
                        onDragOver={(e) => handleLessonDragOver(e, chapter.id, lessonIndex)}
                        onDrop={(e) => handleLessonDrop(e, chapter.id)}
                        onDragEnd={handleLessonDragEnd}
                        className={`flex items-center justify-between px-4 md:px-5 py-3 transition-all ${
                          lessonIndex < chapter.lessons.length - 1 ? 'border-b border-white/[0.06]/50' : ''
                        } ${isDragging ? 'opacity-40 bg-teal/5' : 'hover:bg-white/[0.02]'} ${isDragOver ? 'border-t-2 !border-t-teal' : ''}`}
                        style={{ cursor: 'grab' }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Drag Handle */}
                          <div className="flex-shrink-0 text-gray-600 hover:text-gray-400 transition-colors" title="Kéo để sắp xếp">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="9" cy="5" r="1.5" />
                              <circle cx="15" cy="5" r="1.5" />
                              <circle cx="9" cy="12" r="1.5" />
                              <circle cx="15" cy="12" r="1.5" />
                              <circle cx="9" cy="19" r="1.5" />
                              <circle cx="15" cy="19" r="1.5" />
                            </svg>
                          </div>
                          {lesson.directPlayUrl ? (
                            <button
                              onClick={() => setPreviewVideo({ directPlayUrl: lesson.directPlayUrl, title: lesson.title })}
                              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-green-500/10 hover:bg-green-500/25 transition-colors cursor-pointer"
                              title="Xem trước video"
                            >
                              <svg className="w-3.5 h-3.5 text-green-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-white/5">
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white truncate">{lesson.title}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <LevelBadge level={lesson.requiredLevel} />
                              {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration}</span>}
                              {lesson.directPlayUrl ? (
                                <span className="text-xs text-green-400">Đã có video</span>
                              ) : (
                                <span className="text-xs text-gold">Chưa có video</span>
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
                            className="p-1.5 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/5 transition-colors"
                            title="Xoa bai hoc"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      );
                    })}

                    {/* Add Lesson Button */}
                    <div className="p-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => openAddLesson(chapter.id)}
                        className="flex items-center gap-2 text-sm text-teal hover:text-white transition-colors w-full justify-center py-2 rounded-lg hover:bg-white/5"
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">Them chuong moi</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tieu de chuong</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Vd: Chuong 1: Gioi thieu"
                className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">Chinh sua chuong</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tieu de chuong</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Nhap tieu de chuong"
                className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 h-9 px-4 text-sm bg-teal text-white hover:bg-teal/80"
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
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
                  className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Direct Play URL
                  </span>
                </label>
                <input
                  type="text"
                  value={lessonDirectPlayUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Dán link video URL vào đây"
                  className="w-full h-10 px-3 bg-dark/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal transition-colors font-mono"
                />
                <p className="text-xs text-gray-600 mt-1">Hỗ trợ: Bunny Stream embed URL hoặc direct video URL (.mp4)</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    Thời lượng
                    {durationLoading && (
                      <span className="text-xs text-orange-400 animate-pulse">Đang lấy...</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="Tự động hoặc VD: 10:30"
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cấp độ</label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as MemberLevel)}
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Free" className="bg-white/[0.03] text-white">Free</option>
                    <option value="Premium" className="bg-white/[0.03] text-white">Premium</option>
                    <option value="VIP" className="bg-white/[0.03] text-white">VIP</option>
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
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
                  className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Direct Play URL
                  </span>
                </label>
                <input
                  type="text"
                  value={lessonDirectPlayUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Dán link video URL vào đây"
                  className="w-full h-10 px-3 bg-dark/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-teal transition-colors font-mono"
                />
                <p className="text-xs text-gray-600 mt-1">Hỗ trợ: Bunny Stream embed URL hoặc direct video URL (.mp4)</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    Thời lượng
                    {durationLoading && (
                      <span className="text-xs text-orange-400 animate-pulse">Đang lấy...</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="Tự động hoặc VD: 10:30"
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cấp độ</label>
                  <select
                    value={lessonLevel}
                    onChange={(e) => setLessonLevel(e.target.value as MemberLevel)}
                    className="w-full h-11 px-4 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Free" className="bg-white/[0.03] text-white">Free</option>
                    <option value="Premium" className="bg-white/[0.03] text-white">Premium</option>
                    <option value="VIP" className="bg-white/[0.03] text-white">VIP</option>
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
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setModal({ kind: 'none' })} />
          <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 h-9 px-4 text-sm bg-teal text-white hover:bg-teal/80"
              >
                Xoa bai hoc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={() => setPreviewVideo(null)} />
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              Đóng
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="relative aspect-video bg-dark">
                {isEmbedUrl(previewVideo.directPlayUrl) ? (
                  <iframe
                    key={previewVideo.directPlayUrl}
                    src={normalizeBunnyEmbedUrl(previewVideo.directPlayUrl)}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={previewVideo.directPlayUrl}
                    src={previewVideo.directPlayUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                )}
              </div>
              <div className="p-4 border-t border-white/[0.06]">
                <p className="text-white font-semibold">{previewVideo.title}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
