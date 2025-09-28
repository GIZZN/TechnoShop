'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FavoriteItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  created_at: string;
}

interface FavoritesContextType {
  items: FavoriteItem[];
  loading: boolean;
  addToFavorites: (product: { id: string | number; name: string; price: number; image: string; category: string }) => Promise<void>;
  removeFromFavorites: (productId: string | number) => Promise<void>;
  isFavorite: (productId: string | number) => boolean;
  totalItems: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setItems(data.favorites);
      } else {
        console.error('Failed to load favorites');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = useCallback(async (product: { id: string | number; name: string; price: number; image: string; category: string }) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category
        }),
      });

      if (response.ok) {
        await loadFavorites(); // Перезагружаем избранное
      } else {
        console.error('Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }, [isAuthenticated]);

  const removeFromFavorites = useCallback(async (productId: string | number) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFavorites(); // Перезагружаем избранное
      } else {
        console.error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }, [isAuthenticated]);

  const isFavorite = useCallback((productId: string | number): boolean => {
    return items.some(item => item.product_id === String(productId));
  }, [items]);

  const totalItems = items.length;

  return (
    <FavoritesContext.Provider
      value={{
        items,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        totalItems
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
