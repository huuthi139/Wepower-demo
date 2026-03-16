# WEDU LMS - Prototype Demo

> Demo tương tác của WEDU LMS với Landing page, Dashboard, và Course Catalog

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/kevinnguyen/Downloads/wedu-demo
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open Browser

Mở trình duyệt và truy cập: **http://localhost:3000**

## 📄 Pages Demo

### Landing Page (`/`)
- Hero section với CTA buttons
- Stats cards (150+ courses, 10K+ students)
- Featured courses grid (6 courses)
- Why choose us section (3 features)
- CTA section
- Footer

**URL:** http://localhost:3000

### Dashboard (`/dashboard`)
- Welcome message
- Stats cards (4 metrics: courses enrolled, hours learned, certificates, streak)
- Continue learning section (enrolled courses với progress bar)
- Weekly activity chart
- Recent achievements

**URL:** http://localhost:3000/dashboard

### Course Catalog (`/courses`)
- Search bar (tìm kiếm theo title, instructor)
- Category filters (7 categories: Tất cả, UI/UX, Marketing, AI, Web Dev, Business, Data)
- Sort dropdown
- Course grid (responsive)
- Empty state (khi không tìm thấy)
- CTA section

**URL:** http://localhost:3000/courses

## 🎨 UI Components

### Button (`components/ui/Button.tsx`)
5 variants:
- `primary` - Red gradient với hover effect
- `secondary` - Border transparent
- `ghost` - Transparent với hover
- `accent` - Gold gradient
- `outline` - Border red

4 sizes: `sm`, `md`, `lg`, `xl`

Ví dụ:
```tsx
<Button variant="primary" size="lg">Click me</Button>
```

### CourseCard (`components/ui/CourseCard.tsx`)
Features:
- Thumbnail với hover zoom effect
- Badge (BESTSELLER, NEW, PREMIUM, MIỄN PHÍ)
- Category tag
- Title, instructor
- Progress bar (nếu enrolled)
- Stats (rating, enrollments)
- Meta info (duration, lessons count)
- Price (discount display)

### Header (`components/layout/Header.tsx`)
- Logo
- Desktop navigation (Khóa học, Dashboard, Định giá)
- CTA buttons (Đăng nhập, Đăng ký)
- Mobile menu (hamburger)
- Sticky với backdrop blur

## 📦 Mock Data

**6 sample courses** (`lib/mockData.ts`):
1. UI/UX Design từ A-Z (BESTSELLER)
2. Marketing Digital toàn diện (PREMIUM)
3. AI & Machine Learning cơ bản (NEW, FREE)
4. Full-stack Web Development
5. Quản trị dự án Agile/Scrum
6. Data Analytics với Python (BESTSELLER)

**7 categories**:
Tất cả, UI/UX, Marketing, AI, Web Dev, Business, Data

**3 enrolled courses** (với progress: 65%, 30%, 100%)

## 🎨 Design System

### Colors
- **Primary Red:** `#DC2626` (primary-600)
- **Accent Gold:** `#FBBF24` (accent-400)
- **Background:** `#000000` (black)
- **Gray Scale:** 950, 900, 800, 400

### Typography
- Font: **Inter** (sans-serif)
- Sizes: sm (0.875rem), base (1rem), lg (1.125rem), xl (1.25rem)

### Shadows
- `shadow-card` - Card default
- `shadow-card-hover` - Card hover
- `shadow-glow-red` - Red glow effect
- `shadow-glow-gold` - Gold glow effect

### Animations
- Shimmer (skeleton loader)
- Scale on hover (buttons, cards)
- Smooth transitions (300ms)

## 🛠 Tech Stack

- **Framework:** Next.js 14.1.0 (App Router)
- **React:** 18
- **TypeScript:** 5
- **Styling:** TailwindCSS 3.3
- **Utilities:**
  - `class-variance-authority` (component variants)
  - `clsx` (conditional classes)
  - `tailwind-merge` (merge Tailwind classes)

## 📁 Project Structure

```
wedu-demo/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── page.tsx            # Landing page
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard page
│   └── courses/
│       └── page.tsx        # Course catalog
├── components/
│   ├── ui/
│   │   ├── Button.tsx      # Button component
│   │   └── CourseCard.tsx  # Course card component
│   └── layout/
│       └── Header.tsx      # Header/Navigation
├── lib/
│   ├── utils.ts            # Utility functions
│   └── mockData.ts         # Mock data
├── tailwind.config.ts      # Tailwind config
├── package.json
└── README.md
```

## 🎯 Features Demo

### ✅ Implemented
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark mode premium design
- [x] Smooth animations & transitions
- [x] Search functionality (client-side)
- [x] Category filtering
- [x] Progress tracking visualization
- [x] Stats cards with gradients
- [x] Hover effects (scale, glow)
- [x] Mobile menu (hamburger)

### 🚧 Not Implemented (Static Demo)
- [ ] Authentication (login/register)
- [ ] Backend API integration
- [ ] Real database
- [ ] Payment processing
- [ ] Video playback
- [ ] User profile
- [ ] Course enrollment logic

## 🚀 Next Steps

Để chuyển từ prototype → production:

1. **Setup Backend**
   - Supabase (Auth + Database)
   - API Routes (Next.js)
   - Redis (Caching)

2. **Add Features**
   - User authentication
   - Course enrollment
   - Video streaming (Bunny.net)
   - Payment (VNPay)
   - Quiz system
   - Certificate generation

3. **Deploy**
   - Vercel (Frontend)
   - Supabase (Backend)
   - Redis Cloud (Cache)

Tham khảo: `WEDU_Implementation_Checklist.md` để biết roadmap đầy đủ.

## 📸 Screenshots

### Landing Page
- Hero section với gradient background
- Featured courses grid (3 columns)
- Feature cards (3 items)
- CTA section với gradient

### Dashboard
- Welcome header
- 4 stats cards với gradients
- Continue learning grid (3 courses với progress)
- Weekly activity chart (7 days)
- Recent achievements (3 badges)

### Course Catalog
- Search bar với icon
- Category filters (7 buttons)
- Sort dropdown
- Course grid (responsive)
- Empty state

## ⏱ Development Time

**Total: ~15 phút**

- Setup project: 3 phút
- Create components: 5 phút
- Create pages: 7 phút

## 🎨 Design Credits

Design System based on: `WEDU_v8_UI_Design_System.md`

---

**Built with ❤️ for WEDU LMS**
