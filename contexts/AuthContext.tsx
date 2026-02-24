'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MemberLevel = 'Free' | 'Premium' | 'VIP';
export type UserRole = 'admin' | 'user';

export interface User {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  memberLevel: MemberLevel;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage or cookie on mount
  useEffect(() => {
    try {
      let savedUser = localStorage.getItem('wepower-user');

      // Fallback: check cookie if localStorage is empty
      if (!savedUser) {
        const cookies = document.cookie.split(';');
        for (const c of cookies) {
          const trimmed = c.trim();
          if (trimmed.startsWith('wepower-user=')) {
            const encoded = trimmed.substring('wepower-user='.length);
            savedUser = atob(encoded);
            // Sync to localStorage
            if (savedUser) localStorage.setItem('wepower-user', savedUser);
            break;
          }
        }
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // localStorage corrupted, start fresh
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('wepower-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wepower-user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Đăng nhập thất bại' };
    } catch {
      return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
    }
  };

  const register = async (regData: { name: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Đăng ký thất bại' };
    } catch {
      return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
