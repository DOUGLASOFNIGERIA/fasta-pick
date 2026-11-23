import { normalizeRole, can as roleCan } from '../constants/roles';
import { STORAGE_KEYS, storage } from './storage';

const emptyState = Object.freeze({
  token: null,
  user: null,
  demo: false,
  ready: false,
});

let state = { ...emptyState };
let unauthorizedHandler = null;
const listeners = new Set();

const getState = () => state;

const emit = () => {
  listeners.forEach((listener) => listener(getState()));
};

const normalizeUser = (user) =>
  user ? { ...user, role: normalizeRole(user.role) } : null;

const persist = async () => {
  const { token, user, demo } = state;
  await storage.setJSON(STORAGE_KEYS.SESSION, { token, user, demo });
};

const setSession = async ({ token, user, demo = false }) => {
  state = {
    token: token || null,
    user: normalizeUser(user),
    demo: Boolean(demo),
    ready: true,
  };
  await persist();
  emit();
  return getState();
};

const setUser = async (user) => {
  state = { ...state, user: normalizeUser(user), ready: true };
  await persist();
  emit();
  return getState();
};

const hydrate = async () => {
  let next = await storage.getJSON(STORAGE_KEYS.SESSION);

  if (!next || !next.token || !next.user) {
    const [legacyToken, legacyUser, legacyDemo] = await Promise.all([
      storage.getItem(STORAGE_KEYS.TOKEN),
      storage.getItem(STORAGE_KEYS.USER),
      storage.getItem(STORAGE_KEYS.DEMO),
    ]);
    if (legacyToken && legacyUser) {
      try {
        next = {
          token: legacyToken,
          user: JSON.parse(legacyUser),
          demo: legacyDemo === 'true',
        };
      } catch (_) {
        next = null;
      }
    }
  }

  state = next && next.token && next.user
    ? {
        token: next.token,
        user: normalizeUser(next.user),
        demo: Boolean(next.demo),
        ready: true,
      }
    : { ...emptyState, ready: true };

  await persist();
  await storage.multiRemove([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.DEMO,
  ]);
  emit();
  return getState();
};

const clear = async () => {
  state = { ...emptyState, ready: true };
  await Promise.all([
    storage.removeItem(STORAGE_KEYS.SESSION),
    storage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.DEMO,
    ]),
  ]);
  emit();
  return getState();
};

const getToken = () => state.token;
const getUser = () => state.user;
const getRole = () => normalizeRole(state.user && state.user.role);
const isDemo = () => state.demo;
const canDo = (permission) => roleCan(getRole(), permission);

const accountId = (current = state) => {
  const user = current.user;
  if (user && (user.id || user._id)) return String(user.id || user._id);
  if (user && user.email) return String(user.email).toLowerCase();
  return 'guest';
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const handleUnauthorized = async () => {
  if (state.demo) return;
  await clear();
  if (unauthorizedHandler) unauthorizedHandler();
};

const rememberDemoUser = async (user) => {
  const users = await storage.getJSON(STORAGE_KEYS.DEMO_USERS, {});
  users[user.email.toLowerCase()] = user;
  await storage.setJSON(STORAGE_KEYS.DEMO_USERS, users);
};

const findDemoUser = async (email) => {
  if (!email) return null;
  const users = await storage.getJSON(STORAGE_KEYS.DEMO_USERS, {});
  return users[email.trim().toLowerCase()] || null;
};

export default {
  getState,
  getToken,
  getUser,
  getRole,
  isDemo,
  canDo,
  accountId,
  hydrate,
  setSession,
  setUser,
  clear,
  subscribe,
  setUnauthorizedHandler,
  handleUnauthorized,
  rememberDemoUser,
  findDemoUser,
};
