export type MemberLevel = 'Free' | 'Premium' | 'VIP';

export interface Course {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  enrollmentsCount: number;
  duration: number;
  lessonsCount: number;
  isFree: boolean;
  badge?: 'NEW' | 'BESTSELLER' | 'PREMIUM';
  progress?: number;
  category: string;
  memberLevel: MemberLevel;
}
