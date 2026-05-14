import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('petcare_cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('petcare_cart', JSON.stringify(cart));
  }, [cart]);

  function addItem(product, qty = 1) {
    setCart((prev) => {
      const found = prev.find((p) => p.product === product._id);
      if (found) return prev.map((p) => p.product === product._id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: qty, image: product.images?.[0] }];
    });
  }

  function removeItem(productId) {
    setCart((prev) => prev.filter((p) => p.product !== productId));
  }

  function updateQty(productId, quantity) {
    setCart((prev) => prev.map((p) => p.product === productId ? { ...p, quantity: Math.max(1, quantity) } : p));
  }

  function clear() { setCart([]); }

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
