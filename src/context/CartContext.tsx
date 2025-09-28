'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  total_price: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: { id: string | number; name: string; price: number; image: string }) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  createOrder: () => Promise<{ success: boolean; error?: string; order?: unknown }>;    
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  // Загрузка корзины при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = useCallback(async (product: { id: string | number; name: string; price: number; image: string }) => {
    if (!isAuthenticated) return;
    
    const productId = String(product.id);
    
    // Предотвращаем дублирование запросов
    if (updatingItems.has(productId)) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Обновляем состояние локально без перезагрузки
        setItems(prevItems => {
          const existingItem = prevItems.find(item => item.product_id === productId);
          
          if (existingItem) {
            // Если товар уже есть, увеличиваем количество
            return prevItems.map(item =>
              item.product_id === productId
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    total_price: (item.quantity + 1) * item.product_price
                  }
                : item
            );
          } else {
            // Если товара нет, добавляем новый
            return [
              ...prevItems,
              {
                id: data.item?.id || `temp-${Date.now()}`,
                product_id: productId,
                product_name: product.name,
                product_price: product.price,
                product_image: product.image,
                quantity: 1,
                total_price: product.price
              }
            ];
          }
        });
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [isAuthenticated, updatingItems]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isAuthenticated || quantity < 0) return;
    
    // Предотвращаем дублирование запросов
    if (updatingItems.has(productId)) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        }),
      });

      if (response.ok) {
        // Обновляем состояние локально без перезагрузки
        setItems(prevItems => {
          if (quantity === 0) {
            // Удаляем товар если количество 0
            return prevItems.filter(item => item.product_id !== productId);
          } else {
            // Обновляем количество и общую цену
            return prevItems.map(item =>
              item.product_id === productId
                ? {
                    ...item,
                    quantity,
                    total_price: quantity * item.product_price
                  }
                : item
            );
          }
        });
      } else {
        console.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [isAuthenticated, updatingItems]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;
    
    // Используем updateQuantity с количеством 0 для удаления
    await updateQuantity(productId, 0);
  }, [isAuthenticated, updateQuantity]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems([]);
      } else {
        console.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [isAuthenticated]);

  const createOrder = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, error: 'Не авторизован' };
    }
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setItems([]); // Очищаем корзину после успешного заказа
        return { success: true, order: data.order };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  }, [isAuthenticated]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        createOrder,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 