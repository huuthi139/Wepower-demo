'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '@/lib/mockData';

interface CartItem extends Course {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  updateQuantity: (courseId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (course: Course) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === course.id);

      if (existingItem) {
        // Already in cart, just increase quantity
        return prevItems.map((item) =>
          item.id === course.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item
        return [...prevItems, { ...course, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== courseId));
  };

  const updateQuantity = (courseId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(courseId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === courseId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
