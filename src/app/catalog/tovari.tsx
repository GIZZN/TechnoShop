'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const products = [
  {
    id: 1,
    name: 'MacBook Air M2',
    price: 129990,
    image: '/images/products/placeholder2.jpg',
    category: 'Ноутбуки'
  },
  {
    id: 2,
    name: 'iPad Pro 12.9',
    price: 159990,
    image: '/images/products/placeholder3.jpg',
    category: 'Планшеты'
  },
  {
    id: 3,
    name: 'Apple Watch Series 8',
    price: 45999,
    image: '/images/products/placeholder4.jpg',
    category: 'Умные часы'
  },
  {
    id: 4,
    name: 'AirPods Pro 2',
    price: 22999,
    image: '/images/products/placeholder5.jpg',
    category: 'Аксессуары'
  },
  {
    id: 5,
    name: 'Samsung Galaxy S23 Ultra',
    price: 109999,
    image: '/images/products/placeholder6.jpg',
    category: 'Смартфоны'
  },
];

const categories = [
  'Все',
  'Смартфоны',
  'Ноутбуки',
  'Планшеты',
  'Умные часы',
  'Аксессуары'
];

export default function Tovari() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const searchParams = useSearchParams();

  // Получаем поисковый запрос и категорию из URL
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (category) {
      // Мапинг слагов категорий к названиям
      const categoryMap: { [key: string]: string } = {
        'smartphones': 'Смартфоны',
        'tablets': 'Планшеты',
        'laptops': 'Ноутбуки',
        'smartwatches': 'Умные часы',
        'accessories': 'Аксессуары'
      };
      
      const categoryName = categoryMap[category];
      if (categoryName && categories.includes(categoryName)) {
        setSelectedCategory(categoryName);
      }
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'Все') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Фильтр по цене
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

    switch (sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find(item => item.product_id === String(productId));
    return item?.quantity || 0;
  };

  const handleToggleFavorite = (product: typeof products[0]) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Категории</h2>
        <ul className={styles.categories}>
              {categories.map((category) => (
                <li key={category}>
                  <button 
                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
        </ul>
        
        <div className={styles.filters}>
          <h2>Фильтры</h2>
          <div className={styles.priceFilter}>
            <h3>Цена</h3>
            <div className={styles.priceInputs}>
              <input 
                type="number" 
                placeholder="От" 
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="До" 
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.toolbar}>
                <div className={styles.catalogHeader}>
                  <h1>Каталог товаров</h1>
                  {searchQuery && (
                    <div className={styles.searchInfo}>
                      Результаты поиска: <span className={styles.searchTerm}>{searchQuery}</span>
                      <span className={styles.resultsCount}>({filteredProducts.length})</span>
                    </div>
                  )}
                  {selectedCategory !== 'Все' && !searchQuery && (
                    <div className={styles.categoryInfo}>
                      Категория: <span className={styles.categoryTerm}>{selectedCategory}</span>
                      <span className={styles.resultsCount}>({filteredProducts.length})</span>
                    </div>
                  )}
                </div>
          <div className={styles.sorting}>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">По популярности</option>
              <option value="priceAsc">По возрастанию цены</option>
              <option value="priceDesc">По убыванию цены</option>
              <option value="nameAsc">По названию А-Я</option>
            </select>
          </div>
        </div>

        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <Image 
                  src={product.image} 
                  alt={product.name}
                  width={1100}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.category}>{product.category}</p>
                <p className={styles.price}>{product.price.toLocaleString()} ₽</p>
                <div className={styles.cartActions}>
                  {getItemQuantity(product.id) > 0 ? (
                    <div className={styles.quantityIndicator}>
                      В корзине: {getItemQuantity(product.id)}
                    </div>
                  ) : null}
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.addToCart}
                      onClick={() => handleAddToCart(product)}
                    >
                      {getItemQuantity(product.id) > 0 ? 'Добавить ещё' : 'В корзину'}
                    </button>
                    <button 
                      className={`${styles.favoriteButton} ${isFavorite(product.id) ? styles.favoriteActive : ''}`}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 