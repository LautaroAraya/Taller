'use client';

import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        // No superar el stock disponible
        const newQuantity = Math.min(existing.quantity + 1, product.stock);
        if (newQuantity === existing.quantity) {
          alert(`No hay más stock disponible. Stock máximo: ${product.stock}`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          stock: product.stock,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // No permitir cantidades negativas
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === productId) {
            // No superar el stock disponible
            const validQuantity = Math.min(quantity, item.stock);
            if (validQuantity < quantity) {
              alert(`No hay suficiente stock. Stock máximo: ${item.stock}`);
            }
            return { ...item, quantity: validQuantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}
