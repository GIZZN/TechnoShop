'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import ThemeProvider from '@/components/ThemeProvider/ThemeProvider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
} 