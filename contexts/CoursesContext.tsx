'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Course, MemberLevel } from '@/lib/mockData';

interface CoursesContextType {
  courses: Course[];
  categories: { id: string; name: string; slug: string; count: number }[];
  isLoading: boolean;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Compute categories from courses
  const categories = (() => {
    const catMap = new Map<string, number>();
    for (const c of courses) {
      if (c.category) {
        catMap.set(c.category, (catMap.get(c.category) || 0) + 1);
      }
    }
    const result = [
      { id: '0', name: 'Tất cả', slug: 'all', count: courses.length },
    ];
    let idx = 1;
    for (const [cat, count] of catMap.entries()) {
      result.push({ id: String(idx++), name: cat, slug: cat, count });
    }
    return result;
  })();

  return (
    <CoursesContext.Provider value={{ courses, categories, isLoading }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
