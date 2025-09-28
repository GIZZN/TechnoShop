import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.column}>
            <h3>TechnoShop</h3>
            <p>Магазин современной техники и электроники. Официальная гарантия. Доставка по всей России.</p>
            <div className={styles.social}>
              <a href="#" aria-label="Вконтакте">VK</a>
              <a href="#" aria-label="Телеграм">TG</a>
              <a href="#" aria-label="Ютуб">YT</a>
            </div>
          </div>
          
          <div className={styles.column}>
            <h4>Каталог</h4>
            <ul>
              <li><Link href="/catalog?category=smartphones">Смартфоны</Link></li>
              <li><Link href="/catalog?category=tablets">Планшеты</Link></li>
              <li><Link href="/catalog?category=laptops">Ноутбуки</Link></li>
              <li><Link href="/catalog?category=smartwatches">Умные часы</Link></li>
              <li><Link href="/catalog?category=accessories">Аксессуары</Link></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Информация</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>О компании</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Доставка и оплата</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Гарантия</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Сервисный центр</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Контакты</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Контакты</h4>
            <address className={styles.contacts}>
              <p>Москва, ул. Примерная, д. 123</p>
              <p>Телефон: <a href="tel:+79001234567">+7 (900) 123-45-67</a></p>
              <p>Email: <a href="mailto:info@TechnoShop.ru">info@TechnoShop.ru</a></p>
              <p>Ежедневно с 10:00 до 21:00</p>
            </address>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © 2025 TechnoShop. Все права защищены.
          </div>
          <div className={styles.policy}>
            <a href="#" onClick={(e) => e.preventDefault()}>Политика конфиденциальности</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Пользовательское соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 