'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedOptions: { name: string; choice: string; extraPrice: number }[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setContent: (items: CartItem[]) => void;
  totalItems: number;
  subtotal: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const key = newItem.productId + JSON.stringify(newItem.selectedOptions);
      const existing = prev.find(
        (i) => i.productId + JSON.stringify(i.selectedOptions) === key,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId + JSON.stringify(i.selectedOptions) === key
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, selectedOptions?: { name: string; choice: string; extraPrice: number }[]) => {
    setItems((prev) => prev.filter((i) => {
      if (selectedOptions) {
        const key = i.productId + JSON.stringify(i.selectedOptions);
        const removeKey = productId + JSON.stringify(selectedOptions);
        return key !== removeKey;
      }
      return i.productId !== productId;
    }));
  };

  const updateQuantity = (productId: string, quantity: number, selectedOptions?: { name: string; choice: string; extraPrice: number }[]) => {
    if (quantity <= 0) {
      removeItem(productId, selectedOptions);
      return;
    }
    setItems((prev) => prev.map((i) => {
      if (selectedOptions) {
        const key = i.productId + JSON.stringify(i.selectedOptions);
        const updateKey = productId + JSON.stringify(selectedOptions);
        return key === updateKey ? { ...i, quantity } : i;
      }
      return i.productId === productId ? { ...i, quantity } : i;
    }));
  };

  const clearCart = () => setItems([]);

  const setContent = (newItems: CartItem[]) => {
    setItems(newItems);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const optionsExtra = i.selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
    return sum + (i.price + optionsExtra) * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setContent,
        totalItems,
        subtotal,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
