# WePower LMS - Setup Guide

> Hướng dẫn cài đặt và chạy prototype demo

## ⚠️ Yêu cầu

Trước khi chạy demo, bạn cần cài đặt:

### 1. Node.js (bắt buộc)

**Cách cài:**

#### Option A: Sử dụng Homebrew (khuyến nghị cho macOS)
```bash
# Cài Homebrew (nếu chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài Node.js
brew install node
```

#### Option B: Download từ trang chính thức
1. Truy cập: https://nodejs.org/
2. Download bản **LTS** (Long Term Support)
3. Chạy file installer (.pkg)
4. Follow hướng dẫn cài đặt

**Verify cài đặt:**
```bash
node --version   # Should show: v18.x.x or higher
npm --version    # Should show: 9.x.x or higher
```

---

## 🚀 Chạy Demo (Sau khi đã cài Node.js)

### Bước 1: Mở Terminal
```bash
cd /Users/kevinnguyen/Downloads/wepower-demo
```

### Bước 2: Install Dependencies (lần đầu tiên)
```bash
npm install
```

**Output sẽ trông như thế này:**
```
added 234 packages, and audited 235 packages in 15s
```

### Bước 3: Run Development Server
```bash
npm run dev
```

**Output sẽ trông như thế này:**
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.5s
```

### Bước 4: Mở trình duyệt
Truy cập: **http://localhost:3000**

---

## 📄 Các trang có thể truy cập

| Page | URL | Mô tả |
|------|-----|-------|
| Landing | http://localhost:3000 | Trang chủ với hero, featured courses |
| Dashboard | http://localhost:3000/dashboard | Student dashboard với stats, progress |
| Courses | http://localhost:3000/courses | Course catalog với search, filters |

---

## 🛠 Commands

```bash
# Install dependencies (lần đầu)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🐛 Troubleshooting

### Lỗi: "command not found: npm"
**Nguyên nhân:** Chưa cài Node.js

**Giải pháp:** Cài Node.js theo hướng dẫn ở trên

---

### Lỗi: "Port 3000 already in use"
**Nguyên nhân:** Có app khác đang chạy trên port 3000

**Giải pháp 1:** Tắt app đang chạy trên port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

**Giải pháp 2:** Chạy trên port khác
```bash
PORT=3001 npm run dev
# Mở http://localhost:3001
```

---

### Lỗi: "Module not found"
**Nguyên nhân:** Dependencies chưa được install

**Giải pháp:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Lỗi: "next: command not found"
**Nguyên nhân:** Global PATH issue

**Giải pháp:** Chạy với npx
```bash
npx next dev
```

---

## 📦 File Structure Quick View

```
wepower-demo/
├── app/                    # Pages (Next.js App Router)
│   ├── page.tsx           # Landing page (/)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard (/dashboard)
│   └── courses/
│       └── page.tsx       # Courses (/courses)
├── components/            # UI Components
│   ├── ui/
│   │   ├── Button.tsx    # Button component
│   │   └── CourseCard.tsx # Course card
│   └── layout/
│       └── Header.tsx    # Navigation header
├── lib/                  # Utilities
│   ├── utils.ts         # Helper functions
│   └── mockData.ts      # Mock data (6 courses)
├── package.json         # Dependencies
└── tailwind.config.ts   # Tailwind config
```

---

## 🎯 Next Steps

Sau khi demo chạy thành công:

1. **Xem các pages:**
   - Landing: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Courses: http://localhost:3000/courses

2. **Test features:**
   - Search courses (type trong search bar)
   - Filter by category (click category buttons)
   - Responsive design (resize browser)
   - Mobile menu (click hamburger icon)

3. **Modify code:**
   - Edit `lib/mockData.ts` để thêm courses
   - Edit `tailwind.config.ts` để đổi màu
   - Edit `app/page.tsx` để custom landing page

4. **Deploy (optional):**
   ```bash
   # Push to GitHub first
   git init
   git add .
   git commit -m "Initial WePower LMS demo"
   git remote add origin <your-repo-url>
   git push -u origin main

   # Deploy to Vercel
   npx vercel --prod
   ```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Terminal output có error gì không
2. Check Browser Console (F12) có lỗi gì không
3. Đọc `README.md` để biết thêm chi tiết
4. Tham khảo `WePower_Implementation_Checklist.md` cho roadmap đầy đủ

---

**Happy coding! 🚀**
