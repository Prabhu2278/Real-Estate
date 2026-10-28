import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../constants/config';

let inMemoryToken: string | null = null;

export const tokenStorage = {
  getToken: (): string | null => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem('realestate_token') || inMemoryToken;
      } catch {
        return inMemoryToken;
      }
    }
    return inMemoryToken;
  },
  setToken: (token: string | null) => {
    inMemoryToken = token;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (token) {
          window.localStorage.setItem('realestate_token', token);
        } else {
          window.localStorage.removeItem('realestate_token');
        }
      } catch (e) {
        console.warn('Failed to persist token to localStorage', e);
      }
    }
  },
  clearToken: () => {
    inMemoryToken = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('realestate_token');
      } catch (e) {
        console.warn('Failed to remove token from localStorage', e);
      }
    }
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on authentication failure
      tokenStorage.clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;
