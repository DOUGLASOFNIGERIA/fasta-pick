import session from '../lib/session';
import { STORAGE_KEYS, scopedKey, storage } from '../lib/storage';

const orderKey = (scope) =>
  scopedKey(
    STORAGE_KEYS.LOCAL_ORDERS,
    scope || session.accountId()
  );

export const getLocalOrders = async (scope) =>
  storage.getJSON(orderKey(scope), []);

export const saveLocalOrder = async (order, scope) => {
  const orders = await getLocalOrders(scope);
  await storage.setJSON(orderKey(scope), [order, ...orders]);
};

export const updateLocalOrder = async (id, updates, scope) => {
  const orders = await getLocalOrders(scope);
  const next = orders.map((order) =>
    order._id === id ? { ...order, ...updates } : order
  );
  await storage.setJSON(orderKey(scope), next);
  return next;
};

export const clearLocalOrders = async (scope) =>
  storage.removeItem(orderKey(scope));
