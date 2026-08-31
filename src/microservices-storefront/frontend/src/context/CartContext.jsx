import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartApi } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      const data = await cartApi.addItem(productId, quantity);
      setCart(data);
    },
    []
  );

  const updateItem = useCallback(async (productId, quantity) => {
    const data = await cartApi.updateItem(productId, quantity);
    setCart(data);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const data = await cartApi.removeItem(productId);
    setCart(data);
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, refresh, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
