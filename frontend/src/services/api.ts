import axios from 'axios';
import { firebaseAuth } from '../config/firebase';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor de requisição: obtém sempre um ID Token fresco do Firebase Auth.
 * O SDK do Firebase renova automaticamente quando o token expira (1 hora).
 */
api.interceptors.request.use(async (config) => {
  const currentUser = firebaseAuth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('sf_token', token); // cache para outros usos
    } catch {
      // Se não conseguir token, segue sem header (middleware devolverá 401)
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa cache e deixa o onAuthStateChanged do Firebase lidar com o redirect
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
