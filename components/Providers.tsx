'use client';

import { SessionProvider } from 'next-auth/react';
import SessionTimeout from './SessionTimeout';
import { CartProvider } from '@/lib/CartContext';
import Cart from './Cart';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <SessionTimeout />
        <Cart />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
