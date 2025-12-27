import axios, { type AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '@/hooks/useAuthStore';
import { RefreshTokenResponse } from './types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: ((token: string) => void)[] = [];

// Response interceptor to handle 401 errors and refresh token
apiClient.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

  // Not 401 error, ignore
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }

  // Prevent infinite loop
  if (originalRequest._retry) {
    return Promise.reject(error);
  }
  originalRequest._retry = true;

  // If already refreshing, queue the request
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingQueue.push((token: string) => {
        if (originalRequest.headers?.Authorization) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        resolve(apiClient(originalRequest));
      });
    });
  }

  isRefreshing = true;

  const { setAccessToken } = useAuthStore.getState();
  try {
    const refreshRes = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token');
    const newAccessToken = refreshRes.data.data.access_token;
    setAccessToken(newAccessToken);

    if (originalRequest.headers?.Authorization) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    }

    // Process pending requests
    pendingQueue.forEach((callback) => callback(newAccessToken));
    pendingQueue = [];

    // Retry original request
    return apiClient(originalRequest);
  } catch (error) {
    setAccessToken(null);
    pendingQueue = [];
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
});

export { apiClient as api };
