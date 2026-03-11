import axios from 'axios';
import {API_BASE_URL} from '@/constants/config';
import {useAuthStore} from '@/store/authStore';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};

// ── Attach bearer token to every request ──
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-refresh on 401 ──
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    // Skip refresh for auth endpoints or already-retried requests
    if (
      !error.response ||
      error.response.status !== 401 ||
      original._retried ||
      original.url?.includes('/api/auth/')
    ) {
      const message =
        error?.response?.data?.message ?? error?.message ?? 'Request failed';
      return Promise.reject(new Error(message));
    }

    original._retried = true;

    try {
      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const {refreshToken, setAuth, logout} = useAuthStore.getState();
          if (!refreshToken) {
            logout();
            throw new Error('No refresh token');
          }
          const {data} = await axios.post(
            `${api.defaults.baseURL}/api/auth/refresh`,
            {refreshToken},
            {headers: {'Content-Type': 'application/json'}},
          );
          if (data.success && data.accessToken) {
            setAuth(data.accessToken, data.refreshToken, data.user);
            return data.accessToken as string;
          }
          logout();
          throw new Error('Refresh failed');
        })();
      }

      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      useAuthStore.getState().logout();
      const message =
        error?.response?.data?.message ?? 'Session expired. Please log in again.';
      return Promise.reject(new Error(message));
    } finally {
      refreshPromise = null;
    }
  },
);
