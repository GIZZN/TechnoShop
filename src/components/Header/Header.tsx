'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Товары для поиска (те же что в каталоге)
const products = [
  {
    id: 1,
    name: 'iPhone 14 Pro',
    price: 99990,
    image: '/images/products/placeholder1.jpg',
    category: 'Смартфоны'
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    price: 129990,
    image: '/images/products/placeholder2.jpg',
    category: 'Ноутбуки'
  },
  {
    id: 3,
    name: 'iPad Pro 12.9',
    price: 159990,
    image: '/images/products/placeholder3.jpg',
    category: 'Планшеты'
  },
  {
    id: 4,
    name: 'Apple Watch Series 8',
    price: 45999,
    image: '/images/products/placeholder4.jpg',
    category: 'Умные часы'
  },
  {
    id: 5,
    name: 'AirPods Pro 2',
    price: 22999,
    image: '/images/products/placeholder5.jpg',
    category: 'Аксессуары'
  },
  {
    id: 6,
    name: 'Samsung Galaxy S23 Ultra',
    price: 109999,
    image: '/images/products/placeholder6.jpg',
    category: 'Смартфоны'
  },
  {
    id: 7,
    name: 'MacBook Pro 16"',
    price: 199999,
    image: '/images/products/placeholder1.jpg',
    category: 'Ноутбуки'
  },
  {
    id: 8,
    name: 'iPad Air',
    price: 79999,
    image: '/images/products/placeholder2.jpg',
    category: 'Планшеты'
  },
  {
    id: 9,
    name: 'Apple Watch Ultra',
    price: 89999,
    image: '/images/products/placeholder3.jpg',
    category: 'Умные часы'
  },
  {
    id: 10,
    name: 'Magic Keyboard',
    price: 12999,
    image: '/images/products/placeholder4.jpg',
    category: 'Аксессуары'
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

const Header = () => {
  const { totalItems } = useCart();
  const { totalItems: favoritesCount } = useFavorites();
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('');
  };

  // Поиск товаров
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  // Обработка отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length > 0) {
      setShowResults(false);
      setIsSearchFocused(false);
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Обработка клика на результат поиска
  const handleResultClick = (product: typeof products[0]) => {
    setSearchQuery('');
    setShowResults(false);
    setIsSearchFocused(false);
    router.push(`/catalog?search=${encodeURIComponent(product.name)}`);
  };

  // Закрытие результатов при клике вне поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              <Image 
                src="/images/logo.png"
                alt="TechnoShop Logo"
                width={32}
                height={32}
                priority
              />
              <h1>TechnoShop</h1>
            </Link>
          </div>
          
          <nav className={styles.navigation}>
            <Link href="/catalog" className={styles.navLink}>Каталог</Link>
          </nav>
        </div>

        <div className={styles.centerSection}>
          <div className={styles.search} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Поиск товаров..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchQuery.length >= 2 && searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                onBlur={() => {
                  // Небольшая задержка чтобы клик по результату успел сработать
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setShowResults(false);
                  }, 150);
                }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className={styles.clearButton}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <button type="submit" className={styles.searchButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>

            {/* Результаты поиска */}
            {showResults && isSearchFocused && searchQuery.length >= 2 && (
              <div className={styles.searchResults}>
                {searchResults.length > 0 ? (
                  <>
                    <div className={styles.resultsHeader}>
                      <span>Найдено товаров: {searchResults.length}</span>
                    </div>
                    {searchResults.slice(0, 5).map((product) => (
                      <div 
                        key={product.id} 
                        className={styles.searchResultItem}
                        onClick={() => handleResultClick(product)}
                      >
                        <div className={styles.resultImage}>
                               <Image 
                                 src={product.image} 
                                 alt={product.name}
                                 width={55}
                                 height={55}
                                 style={{ objectFit: 'cover' }}
                               />
                        </div>
                        <div className={styles.resultInfo}>
                          <div className={styles.resultName}>{product.name}</div>
                          <div className={styles.resultCategory}>{product.category}</div>
                        </div>
                        <div className={styles.resultPrice}>
                          {product.price.toLocaleString()} ₽
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 5 && (
                      <div className={styles.showAllResults}>
                        <button onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}>
                          Показать все результаты ({searchResults.length})
                        </button>
                      </div>
                    )}
                  </>
                ) : searchQuery.length >= 2 ? (
                  <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className={styles.noResultsText}>
                      Товары не найдены
                    </div>
                    <div className={styles.noResultsSubtext}>
                      Попробуйте изменить запрос
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.userActions}>
            <Link href="/favorites" className={styles.iconButton}>
              <div className={styles.iconWrapper}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {favoritesCount > 0 && <span className={styles.badge}>{favoritesCount}</span>}
              </div>
              <span className={styles.buttonLabel}>Избранное</span>
            </Link>

            <Link href="/cart" className={styles.iconButton}>
              <div className={styles.iconWrapper}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
              </div>
              <span className={styles.buttonLabel}>Корзина</span>
            </Link>

            <div className={styles.divider}></div>

            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <Link href="/profile" className={styles.userButton}>
                  <div className={styles.avatar}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className={styles.userName}>{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className={styles.loginButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 