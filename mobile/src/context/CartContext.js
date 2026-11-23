import React, { createContext, useContext, useEffect, useState } from 'react';
import session from '../lib/session';
import { STORAGE_KEYS, scopedKey, storage } from '../lib/storage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [scope, setScope] = useState(session.accountId());
  const [hydratedScope, setHydratedScope] = useState(null);
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => session.subscribe((next) => setScope(session.accountId(next))), []);

  useEffect(() => {
    let active = true;
    setReady(false);
    storage.getJSON(scopedKey(STORAGE_KEYS.CART, scope)).then((stored) => {
      if (!active) return;
      setItems(stored?.items || []);
      setRestaurant(stored?.restaurant || null);
      setHydratedScope(scope);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [scope]);

  useEffect(() => {
    if (ready && hydratedScope === scope) {
      storage.setJSON(scopedKey(STORAGE_KEYS.CART, scope), { items, restaurant });
    }
  }, [items, restaurant, ready, hydratedScope, scope]);

  const addItem = (item, restaurantInfo) => {
    if (restaurant && restaurant._id !== restaurantInfo._id && items.length > 0) {
      setItems([{ ...item, quantity: 1 }]);
      setRestaurant(restaurantInfo);
      return;
    }
    setRestaurant(restaurantInfo);
    setItems((current) => {
      const existing = current.find((i) => i._id === item._id);
      if (existing) {
        return current.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setItems((current) =>
      current
        .map((i) =>
          i._id === id ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) =>
    setItems((current) => current.filter((i) => i._id !== id));

  const clear = () => {
    setItems([]);
    setRestaurant(null);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const serviceFee = items.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        itemCount,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
