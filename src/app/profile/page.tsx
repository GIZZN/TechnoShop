'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Удалили mockOrders - теперь данные будут загружаться через API

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isAuthenticated, updateProfile, loading } = useAuth();
  const router = useRouter();
  
  // Проверяем URL параметры для переключения вкладок
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user, router, loading]);

  // Загрузка заказов при переключении на вкладку заказов
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        console.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');
    setUpdateError('');
    
    try {
      const result = await updateProfile(formData.name, formData.phone);
      
      if (result.success) {
        setUpdateMessage('Профиль успешно обновлен');
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateError(result.error || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateError('Ошибка соединения с сервером');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Загрузка...
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <nav className={styles.navigation}>
              <button 
                className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Личные данные
              </button>
              <button 
                className={`${styles.navButton} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                  <path d="M7 7h.01" />
                </svg>
                История заказов
              </button>
            </nav>
          </div>
          
          <div className={styles.content}>
            {activeTab === 'profile' && (
              <div className={styles.section}>
                <h2>Личные данные</h2>
                
                {updateMessage && (
                  <div className={styles.successMessage}>
                    {updateMessage}
                  </div>
                )}
                
                {updateError && (
                  <div className={styles.errorMessage}>
                    {updateError}
                  </div>
                )}
                
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Телефон</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <button type="submit" className={styles.submitButton} disabled={isUpdating}>
                    {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className={styles.section}>
                <h2>История заказов</h2>
                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Загрузка заказов...
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    У вас пока нет заказов
                  </div>
                ) : (
                  <div className={styles.orders}>
                    {orders.map((order) => (
                    <div key={order.id} className={styles.order}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                          <h3>Заказ {order.id}</h3>
                          <span className={styles.orderDate}>
                            {new Date(order.date).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <span className={`${styles.orderStatus} ${styles[order.status.toLowerCase()]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className={styles.orderItems}>
                        {order.items.map((item, index) => (
                          <div key={index} className={styles.orderItem}>
                            <span>{item.name}</span>
                            <span>{item.quantity} шт.</span>
                            <span>{item.price.toLocaleString()} ₽</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.orderFooter}>
                        <span>Итого:</span>
                        <span className={styles.orderTotal}>
                          {order.total.toLocaleString()} ₽
                        </span>
                      </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 