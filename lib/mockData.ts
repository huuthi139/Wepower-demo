export interface Course {
  id: string;
  thumbnail: string;
  title: string;
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
}

export const mockCourses: Course[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    title: 'UI/UX Design từ A-Z',
    instructor: 'Nguyễn Văn A',
    price: 1990000,
    originalPrice: 2990000,
    rating: 4.8,
    reviewsCount: 156,
    enrollmentsCount: 1243,
    duration: 19800,
    lessonsCount: 45,
    isFree: false,
    badge: 'BESTSELLER',
    category: 'UI/UX',
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    title: 'Marketing Digital toàn diện',
    instructor: 'Trần Thị B',
    price: 2490000,
    originalPrice: 3490000,
    rating: 4.9,
    reviewsCount: 203,
    enrollmentsCount: 2156,
    duration: 21600,
    lessonsCount: 52,
    isFree: false,
    badge: 'PREMIUM',
    category: 'Marketing',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
    title: 'AI & Machine Learning cơ bản',
    instructor: 'Lê Văn C',
    price: 0,
    rating: 4.6,
    reviewsCount: 89,
    enrollmentsCount: 3421,
    duration: 14400,
    lessonsCount: 30,
    isFree: true,
    badge: 'NEW',
    category: 'AI',
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    title: 'Full-stack Web Development',
    instructor: 'Phạm Văn D',
    price: 3990000,
    originalPrice: 4990000,
    rating: 4.7,
    reviewsCount: 312,
    enrollmentsCount: 1876,
    duration: 36000,
    lessonsCount: 78,
    isFree: false,
    category: 'Web Dev',
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=450&fit=crop',
    title: 'Quản trị dự án Agile/Scrum',
    instructor: 'Hoàng Thị E',
    price: 1490000,
    originalPrice: 1990000,
    rating: 4.5,
    reviewsCount: 145,
    enrollmentsCount: 987,
    duration: 10800,
    lessonsCount: 28,
    isFree: false,
    category: 'Business',
  },
  {
    id: '6',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    title: 'Data Analytics với Python',
    instructor: 'Vũ Văn F',
    price: 2990000,
    rating: 4.8,
    reviewsCount: 234,
    enrollmentsCount: 1654,
    duration: 25200,
    lessonsCount: 61,
    isFree: false,
    badge: 'BESTSELLER',
    category: 'Data',
  },
];

export const enrolledCourses: Course[] = [
  {
    ...mockCourses[0],
    progress: 65,
  },
  {
    ...mockCourses[1],
    progress: 30,
  },
  {
    ...mockCourses[2],
    progress: 100,
  },
];

export const categories = [
  { id: '1', name: 'Tất cả', slug: 'all', count: 156 },
  { id: '2', name: 'UI/UX', slug: 'ui-ux', count: 45 },
  { id: '3', name: 'Marketing', slug: 'marketing', count: 38 },
  { id: '4', name: 'AI', slug: 'ai', count: 27 },
  { id: '5', name: 'Web Dev', slug: 'web-dev', count: 62 },
  { id: '6', name: 'Business', slug: 'business', count: 41 },
  { id: '7', name: 'Data', slug: 'data', count: 33 },
];
