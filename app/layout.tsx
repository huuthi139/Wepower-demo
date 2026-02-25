import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CoursesProvider } from '@/contexts/CoursesContext';
import { ToastProvider } from '@/providers/ToastProvider';

export const metadata: Metadata = {
  title: "WePower Academy - Kinh nghiệm thực chiến, Kiến thức chuyên sâu",
  description: "Nền tảng chia sẻ kiến thức và kinh nghiệm về kinh doanh, marketing, digital product.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ToastProvider>
          <AuthProvider>
            <CoursesProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </CoursesProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
