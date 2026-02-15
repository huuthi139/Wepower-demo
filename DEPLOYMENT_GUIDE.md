# WePower LMS - Deployment Guide

> Hướng dẫn deploy demo lên Vercel để có URL public

---

## 🚀 Cách 1: Deploy qua Vercel Web (Khuyến nghị - Dễ nhất)

### Bước 1: Push code lên GitHub

```bash
# Tạo repo mới trên GitHub.com
# 1. Truy cập: https://github.com/new
# 2. Repository name: wepower-demo
# 3. Private/Public: Chọn Public
# 4. Không check "Initialize with README"
# 5. Click "Create repository"

# Push code lên GitHub
cd /Users/kevinnguyen/Downloads/wepower-demo
git remote add origin https://github.com/YOUR_USERNAME/wepower-demo.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy lên Vercel

1. **Truy cập**: https://vercel.com/
2. **Sign up/Login** với GitHub account
3. Click **"Add New Project"**
4. Click **"Import Git Repository"**
5. Authorize Vercel để access GitHub repos
6. Tìm và select repository **wepower-demo**
7. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)
8. Click **"Deploy"**

### Bước 3: Đợi build & deploy

```
⏳ Building...
✅ Build completed in 45s
🚀 Deploying...
✅ Deployment ready

🌐 Production URL: https://wepower-demo.vercel.app
```

**Preview URL sẽ có dạng:**
- Production: `https://wepower-demo.vercel.app`
- Preview: `https://wepower-demo-git-main-yourname.vercel.app`

---

## 🚀 Cách 2: Deploy qua Vercel CLI

### Bước 1: Login vào Vercel

```bash
cd /Users/kevinnguyen/Downloads/wepower-demo
npx vercel login
```

**Output:**
```
> Enter your email: your-email@gmail.com
> We sent an email to your-email@gmail.com. Please follow the steps provided inside it and make sure the security code matches Powerful Duckling.
```

**Action:**
1. Check email inbox
2. Click link trong email để verify
3. Quay lại terminal

### Bước 2: Deploy

```bash
npx vercel --prod
```

**Quá trình deploy:**
```
Vercel CLI 50.17.1
? Set up and deploy "~/Downloads/wepower-demo"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? wepower-demo
? In which directory is your code located? ./
Auto-detected Project Settings (Next.js):
- Build Command: next build
- Output Directory: .next
- Development Command: next dev --port $PORT
? Want to override the settings? [y/N] n

🔗  Linked to yourname/wepower-demo
🔍  Inspect: https://vercel.com/yourname/wepower-demo/xxxxx
✅  Production: https://wepower-demo.vercel.app [copied to clipboard]
```

### Bước 3: Truy cập URL

Mở browser: **https://wepower-demo.vercel.app**

---

## 📋 Checklist Deploy

- [x] Git commit code
- [x] Push lên GitHub (Cách 1) hoặc skip (Cách 2)
- [x] Login Vercel
- [x] Deploy project
- [x] Verify URL hoạt động
- [x] Test 3 pages (Landing, Dashboard, Courses)
- [x] Test responsive (mobile, tablet, desktop)

---

## 🛠 Sau khi deploy

### Custom Domain (Optional)

1. Vào Vercel Dashboard
2. Settings → Domains
3. Add domain: `wepower.com` hoặc `demo.wepower.com`
4. Follow DNS setup instructions
5. Wait for SSL certificate (auto)

### Environment Variables (Nếu cần)

1. Vercel Dashboard → Settings → Environment Variables
2. Add variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.wepower.com
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   ```
3. Redeploy

### Analytics & Monitoring

Vercel tự động bật:
- ✅ **Analytics** - Page views, visitors
- ✅ **Speed Insights** - Core Web Vitals
- ✅ **Logs** - Build & runtime logs
- ✅ **Edge Network** - Global CDN

Xem tại: https://vercel.com/yourname/wepower-demo/analytics

---

## 🔄 Update sau khi deploy

### Mỗi lần code mới:

```bash
# Edit code
# ...

# Commit & push
git add .
git commit -m "Update: Feature XYZ"
git push

# Vercel tự động deploy lại! (nếu dùng Cách 1)
# Hoặc chạy (nếu dùng Cách 2):
npx vercel --prod
```

**Vercel sẽ:**
1. Detect code change
2. Auto build
3. Auto deploy
4. Update production URL

---

## 🐛 Troubleshooting

### Lỗi: "Build failed"

**Check build logs:**
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. View logs

**Common fixes:**
```bash
# Local test build
npm run build

# Fix TypeScript errors
npm run lint

# Fix missing dependencies
npm install
```

### Lỗi: "Image optimization"

Already fixed in `next.config.js`:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' }
  ]
}
```

### Lỗi: "Page not found"

Check:
- File structure: `app/page.tsx`, `app/dashboard/page.tsx`
- Export default component
- No syntax errors

---

## 📊 Performance Tips

### 1. Optimize Images

```tsx
// Current: External Unsplash
<Image src="https://images.unsplash.com/..." />

// Better: Local optimized images
<Image src="/images/course-1.jpg" />
```

### 2. Add Metadata

```tsx
// app/layout.tsx
export const metadata = {
  title: 'WePower LMS - Học kinh doanh chuyên nghiệp',
  description: 'Nền tảng học tập online hàng đầu...',
}
```

### 3. Enable Caching

```tsx
// app/page.tsx
export const revalidate = 3600 // 1 hour
```

---

## 🌐 Demo URLs

Sau khi deploy, anh sẽ có:

- **Production**: https://wepower-demo.vercel.app
- **Preview**: https://wepower-demo-git-[branch].vercel.app
- **Custom**: https://demo.wepower.com (nếu setup domain)

### Share demo:

```
🎉 WePower LMS Demo

✨ Landing: https://wepower-demo.vercel.app
📊 Dashboard: https://wepower-demo.vercel.app/dashboard
📚 Courses: https://wepower-demo.vercel.app/courses

Tech Stack: Next.js 14 + TailwindCSS + TypeScript
Design: Royal Red + Gold Premium Dark Theme
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create issue in repo

---

**Happy deploying! 🚀**
