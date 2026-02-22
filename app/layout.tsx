import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/providers/ToastProvider';

export const metadata: Metadata = {
  title: "WePower LMS - Sổ tay hướng dẫn làm kinh doanh chuyên nghiệp",
  description: "Nền tảng học tập trực tuyến Enterprise-grade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="font-sans">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
