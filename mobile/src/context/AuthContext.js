import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import session from '../lib/session';
import {
  DEFAULT_ROLE,
  REGISTRABLE_ROLES,
  normalizeRole,
} from '../constants/roles';

const AuthContext = createContext(null);

const demoUser = (email, name, role = DEFAULT_ROLE) => ({
  id: `demo:${email.toLowerCase()}`,
  name: name || email.split('@')[0].replace(/[._]/g, ' '),
  email,
  phone: '',
  role: normalizeRole(role),
  city: 'Ado-Ekiti',
  addresses: [
    {
      _id: 'demo-address',
      label: 'Home',
      fullAddress: '12 Oyin Street, Ado-Ekiti, Ekiti State',
      landmark: 'Near Odo Ado Junction',
      phone: '0803 000 0000',
      isDefault: true,
    },
  ],
});

const isNetworkIssue = (error) =>
  !error?.response || error?.code === 'ECONNABORTED';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(session.getState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const hydrated = await session.hydrate();
      if (!active) return;
      setAuth(hydrated);
      setLoading(false);

      if (hydrated.token && !hydrated.demo) {
        try {
          const { data } = await api.get('/auth/me');
          if (active) setAuth(await session.setUser(data.user));
        } catch (_) {}
      }
    };

    sync();
    const unsubscribe = session.subscribe(setAuth);
    session.setUnauthorizedHandler(() => setAuth(session.getState()));

    return () => {
      active = false;
      unsubscribe();
      session.setUnauthorizedHandler(null);
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await session.setSession({ token: data.token, user: data.user, demo: false });
      return data;
    } catch (error) {
      if (!isNetworkIssue(error)) throw new Error(getErrorMessage(error));
      const remembered = await session.findDemoUser(email);
      const offlineUser = remembered
        ? { ...remembered, email }
        : demoUser(email);
      await session.rememberDemoUser(offlineUser);
      await session.setSession({
        token: 'demo-token',
        user: offlineUser,
        demo: true,
      });
      return { user: offlineUser };
    }
  };

  const signUp = async ({ name, email, phone, password, city, role }) => {
    const selectedRole = REGISTRABLE_ROLES.includes(role) ? role : DEFAULT_ROLE;
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        city,
        role: selectedRole,
      });
      await session.setSession({ token: data.token, user: data.user, demo: false });
      return data;
    } catch (error) {
      if (!isNetworkIssue(error)) throw new Error(getErrorMessage(error));
      const offlineUser = {
        ...demoUser(email, name, selectedRole),
        phone: phone || '',
        city,
      };
      await session.rememberDemoUser(offlineUser);
      await session.setSession({
        token: 'demo-token',
        user: offlineUser,
        demo: true,
      });
      return { user: offlineUser };
    }
  };

  const updateUser = async (updates) => {
    const current = session.getUser();
    const next = { ...current, ...updates };
    await session.setUser(next);
    if (session.isDemo()) return next;
    try {
      const { data } = await api.put('/auth/me', updates);
      await session.setUser(data.user || next);
    } catch (_) {}
    return next;
  };

  const addAddress = async (address) => {
    const current = session.getUser();

    if (session.isDemo()) {
      const addresses = [...(current.addresses || [])];
      if (address.isDefault) addresses.forEach((a) => (a.isDefault = false));
      const next = [
        ...addresses,
        {
          ...address,
          _id: `addr-${Date.now()}`,
          isDefault: address.isDefault || addresses.length === 0,
        },
      ];
      await session.setUser({ ...current, addresses: next });
      return next;
    }

    const { data } = await api.post('/auth/addresses', address);
    const next = data.addresses || [...(current.addresses || []), address];
    await session.setUser({ ...current, addresses: next });
    return next;
  };

  const signOut = async () => {
    await session.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isDemo: auth.demo,
        loading,
        role: normalizeRole(auth.user?.role),
        can: session.canDo,
        signIn,
        signUp,
        signOut,
        updateUser,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
