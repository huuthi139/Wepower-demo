'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  progress: number; // 0-100
  completedLessons: string[]; // lesson IDs
  lastAccessedAt: string;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  courses: { id: string; title: string; price: number }[];
  total: number;
  paymentMethod: string;
  status: 'Hoàn thành' | 'Đang chờ' | 'Đang xử lý';
  date: string;
}

interface EnrollmentContextType {
  enrollments: Enrollment[];
  orders: Order[];
  enrollCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getProgress: (courseId: string) => number;
  markLessonComplete: (courseId: string, lessonId: string, totalLessons: number) => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  totalHoursLearned: number;
  completedCoursesCount: number;
  currentStreak: number;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

const STORAGE_KEY_ENROLLMENTS = 'wepower-enrollments';
const STORAGE_KEY_ORDERS = 'wepower-orders';
const STORAGE_KEY_STREAK = 'wepower-streak';

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedEnrollments = localStorage.getItem(STORAGE_KEY_ENROLLMENTS);
      if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));

      const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(enrollments));
    }
  }, [enrollments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  const enrollCourse = useCallback((courseId: string) => {
    setEnrollments(prev => {
      if (prev.find(e => e.courseId === courseId)) return prev;
      return [...prev, {
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date().toISOString(),
      }];
    });
  }, []);

  const isEnrolled = useCallback((courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  }, [enrollments]);

  const getProgress = useCallback((courseId: string) => {
    return enrollments.find(e => e.courseId === courseId)?.progress ?? 0;
  }, [enrollments]);

  const markLessonComplete = useCallback((courseId: string, lessonId: string, totalLessons: number) => {
    setEnrollments(prev => prev.map(e => {
      if (e.courseId !== courseId) return e;
      const completedLessons = e.completedLessons.includes(lessonId)
        ? e.completedLessons
        : [...e.completedLessons, lessonId];
      const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
      return { ...e, completedLessons, progress, lastAccessedAt: new Date().toISOString() };
    }));

    // Update streak
    try {
      const streakData = JSON.parse(localStorage.getItem(STORAGE_KEY_STREAK) || '{}');
      const today = new Date().toISOString().split('T')[0];
      if (streakData.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        streakData.count = streakData.lastDate === yesterday ? (streakData.count || 0) + 1 : 1;
        streakData.lastDate = today;
        localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streakData));
      }
    } catch { /* ignore */ }
  }, []);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'Đang chờ',
    };
    setOrders(prev => [newOrder, ...prev]);

    // Auto-enroll courses from the order
    orderData.courses.forEach(c => {
      enrollCourse(c.id);
    });
  }, [enrollCourse]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const totalHoursLearned = enrollments.reduce((sum, e) => {
    return sum + Math.round(e.completedLessons.length * 0.25 * 10) / 10;
  }, 0);

  const completedCoursesCount = enrollments.filter(e => e.progress === 100).length;

  let currentStreak = 0;
  try {
    const streakData = JSON.parse(localStorage.getItem(STORAGE_KEY_STREAK) || '{}');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streakData.lastDate === today || streakData.lastDate === yesterday) {
      currentStreak = streakData.count || 0;
    }
  } catch { /* ignore */ }

  return (
    <EnrollmentContext.Provider value={{
      enrollments,
      orders,
      enrollCourse,
      isEnrolled,
      getProgress,
      markLessonComplete,
      addOrder,
      updateOrderStatus,
      totalHoursLearned,
      completedCoursesCount,
      currentStreak,
    }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}
