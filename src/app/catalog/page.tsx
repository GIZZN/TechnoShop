'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Tovari from './tovari';

function CatalogFallback() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div>Загрузка каталога...</div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<CatalogFallback />}>
          <Tovari />
        </Suspense>
      </main>
      <Footer />
    </>
  );
} 