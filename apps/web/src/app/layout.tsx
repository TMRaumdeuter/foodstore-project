import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'FoodStore - Đặt đồ ăn & đồ uống online',
  description: 'Gọi món yêu thích, giao hàng tận nơi. Gà rán, burger, đồ uống và nhiều hơn nữa!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ minHeight: `calc(100vh - var(--header-height) - 200px)`, paddingTop: 'var(--header-height)' }}>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
