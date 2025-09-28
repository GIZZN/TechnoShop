'use client';

import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  slug: string;
}

const categoriesData = [
  { 
    id: 1, 
    name: 'Смартфоны', 
    slug: 'smartphones',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    )
  },
  { 
    id: 2, 
    name: 'Планшеты', 
    slug: 'tablets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    )
  },
  { 
    id: 3, 
    name: 'Ноутбуки', 
    slug: 'laptops',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    )
  },
  { 
    id: 4, 
    name: 'Умные часы', 
    slug: 'smartwatches',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7" />
        <polyline points="12 9 12 12 13.5 13.5" />
        <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
      </svg>
    )
  },
  { 
    id: 5, 
    name: 'Аксессуары', 
    slug: 'accessories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v12" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    )
  }
];

const productsData = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 129999,
    image: '/images/products/placeholder1.jpg',
    category: 'Смартфоны',
    rating: 5,
    slug: 'iphone-15-pro'
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    price: 119999,
    image: '/images/products/placeholder2.jpg',
    category: 'Ноутбуки',
    rating: 4.9,
    slug: 'macbook-air-m2'
  },
  {
    id: 3,
    name: 'iPad Pro 12.9"',
    price: 109999,
    image: '/images/products/placeholder3.jpg',
    category: 'Планшеты',
    rating: 4.8,
    slug: 'ipad-pro-12-9'
  },
  {
    id: 4,
    name: 'Apple Watch Series 8',
    price: 45999,
    image: '/images/products/placeholder4.jpg',
    category: 'Умные часы',
    rating: 4.7,
    slug: 'apple-watch-series-8'
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    price: 22999,
    image: '/images/products/placeholder5.jpg',
    category: 'Аудио',
    rating: 4.8,
    slug: 'airpods-pro-2'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S23 Ultra',
    price: 109999,
    image: '/images/products/placeholder6.jpg',
    category: 'Смартфоны',
    rating: 4.7,
    slug: 'samsung-galaxy-s23-ultra'
  }
];

export default function Home() {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  const handleToggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      });
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <span className={styles.tagline}>Добро пожаловать в</span>
            <h2>TechnoShop</h2>
            <p>Ваш надежный партнер в мире современных технологий. Мы предлагаем широкий ассортимент качественной электроники от ведущих мировых брендов по доступным ценам.</p>
            <div className={styles.welcomeFeatures}>
              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M3 12c0 5.5 4.5 10 10 10s10-4.5 10-10"/>
                </svg>
                <span>Гарантия качества</span>
              </div>
              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Быстрая доставка</span>
              </div>
              <div className={styles.feature}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Выгодные цены</span>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.categories}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.title}>Категории товаров</h2>
              <div className={styles.line}></div>
            </div>
            
            <div className={styles.categoriesGrid}>
              {categoriesData.map((category) => (
                <Link key={category.id} href={`/catalog?category=${category.slug}`} className={styles.category}>
                  <div className={styles.categoryIconWrapper}>
                    <div className={styles.icon}>{category.icon}</div>
                  </div>
                  <h3>{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.products}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.title}>Популярные товары</h2>
              <div className={styles.line}></div>
              <Link href="/catalog" className={styles.viewAll}>
                Смотреть все
              </Link>
            </div>
            
            <div className={styles.productsGrid}>
              {productsData.map((product) => (
                <div key={product.id} className={styles.product}>
                  <div className={styles.productBadge}>Хит</div>
                  <div className={styles.productImageContainer}>
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      width={280}
                      height={220}
                      style={{ objectFit: 'contain' }}
                      className={styles.productImage}
                    />
                  </div>
                  
                  <div className={styles.productContent}>
                    <div className={styles.productCategory}>{product.category}</div>
                    <h3 className={styles.productName}>
                      <Link href={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    
                    <div className={styles.rating}>
                      <div className={styles.ratingStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i}
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    
                    <div className={styles.price}>
                      {product.price.toLocaleString()} ₽
                    </div>
                    
                    <div className={styles.actions}>
                      <button 
                        className={styles.addToCart}
                        onClick={() => handleAddToCart(product)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIcon}>
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        В корзину
                      </button>
                      <button 
                        className={`${styles.favorite} ${isFavorite(product.id) ? styles.favoriteActive : ''}`}
                        onClick={() => handleToggleFavorite(product)}
                        title={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
