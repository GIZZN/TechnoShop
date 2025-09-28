'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, createOrder, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsOrdering(true);
    setOrderError('');

    try {
      const result = await createOrder();
      
      if (result.success) {
        router.push('/profile?tab=orders');
      } else {
        setOrderError(result.error || 'Ошибка при создании заказа');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setOrderError('Ошибка при создании заказа');
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.emptyCart}>
          <h1>Загрузка корзины...</h1>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.emptyCart}>
          <h1>Войдите в аккаунт</h1>
          <p>Для просмотра корзины необходимо войти в систему</p>
          <Link href="/auth/login" className={styles.continueButton}>
            Войти
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className={styles.emptyCart}>
          <h1>Корзина пуста</h1>
          <p>Перейдите в каталог, чтобы добавить товары</p>
          <Link href="/catalog" className={styles.continueButton}>
            Перейти в каталог
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Корзина</h1>
          <button onClick={clearCart} className={styles.clearButton}>
            Очистить корзину
          </button>
        </div>

        <div className={styles.content}>
          {orderError && (
            <div className={styles.errorMessage}>
              {orderError}
            </div>
          )}
          
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                       <div className={styles.itemImage}>
                         <Image 
                           src={item.product_image || '/images/products/placeholder1.jpg'} 
                           alt={item.product_name}
                           width={80}
                           height={80}
                           style={{ objectFit: 'cover' }}
                         />
                </div>
                <div className={styles.itemInfo}>
                  <h3>{item.product_name}</h3>
                  <p className={styles.itemPrice}>{Number(item.product_price).toLocaleString()} ₽</p>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product_id)}
                    className={styles.removeButton}
                  >
                    Удалить
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  {Number(item.total_price).toLocaleString()} ₽
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Итого</h2>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span>Товары ({items.length})</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span>Бесплатно</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>К оплате</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
              <button 
                className={styles.checkoutButton} 
                onClick={handleCheckout}
                disabled={isOrdering}
              >
                {isOrdering ? 'Оформление...' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 