'use client';

import React from 'react';
import styles from './page.module.css';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function FavoritesPage() {
  const { items, removeFromFavorites, loading } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Если пользователь не авторизован, перенаправляем на логин
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className={styles.container}>
          <div className={styles.unauthorized}>
            <h1>Войдите в аккаунт</h1>
            <p>Для просмотра избранных товаров необходимо войти в аккаунт</p>
            <Link href="/auth/login" className={styles.loginButton}>
              Войти
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleAddToCart = async (item: typeof items[0]) => {
    await addToCart({
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      image: item.product_image
    });
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    await removeFromFavorites(productId);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.container}>
          <div className={styles.loading}>
            Загрузка избранного...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h1>Избранное пусто</h1>
            <p>Добавьте товары в избранное, чтобы легко найти их позже</p>
            <Link href="/catalog" className={styles.catalogButton}>
              Перейти в каталог
            </Link>
          </div>
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
          <h1>Избранное</h1>
          <span className={styles.count}>
            {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
          </span>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <button 
                className={styles.removeButton}
                onClick={() => handleRemoveFromFavorites(item.product_id)}
                title="Удалить из избранного"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className={styles.imageContainer}>
                <Image 
                  src={item.product_image || '/images/products/placeholder1.jpg'} 
                  alt={item.product_name}
                  width={280}
                  height={220}
                  style={{ objectFit: 'contain' }}
                  className={styles.image}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.category}>{item.product_category}</div>
                <h3 className={styles.name}>{item.product_name}</h3>
                <div className={styles.price}>
                  {item.product_price.toLocaleString()} ₽
                </div>

                <div className={styles.actions}>
                  <button 
                    className={styles.addToCart}
                    onClick={() => handleAddToCart(item)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
