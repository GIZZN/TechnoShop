'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import ThemeProvider from './ThemeProvider/ThemeProvider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
} 