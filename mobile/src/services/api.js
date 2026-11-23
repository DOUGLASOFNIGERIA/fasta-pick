import axios from 'axios';
import Constants from 'expo-constants';
import session from '../lib/session';

const FALLBACK_URL = 'http://192.168.1.10:5000/api';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  FALLBACK_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token && !session.isDemo()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !session.isDemo()) {
      await session.handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond.';
  if (error?.message === 'Network Error') return 'Could not reach the server.';
  return error?.message || 'Something went wrong. Please try again.';
};

export default api;
