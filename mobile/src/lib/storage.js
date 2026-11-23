import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@fastapick:';

export const STORAGE_KEYS = Object.freeze({
  SESSION: `${PREFIX}session`,
  TOKEN: `${PREFIX}token`,
  USER: `${PREFIX}user`,
  DEMO: `${PREFIX}demo`,
  DEMO_USERS: `${PREFIX}demo-users`,
  CART: `${PREFIX}cart`,
  LOCAL_ORDERS: `${PREFIX}local-orders`,
  NOTIFICATIONS: `${PREFIX}notifications`,
});

export const scopedKey = (key, scope) =>
  scope ? `${key}:${scope}` : key;

export const storage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  multiRemove: (keys) => AsyncStorage.multiRemove(keys),
  getJSON: async (key, fallback = null) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  },
  setJSON: (key, value) => AsyncStorage.setItem(key, JSON.stringify(value)),
};
