import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../lib/supabase';
import type { DjangoUser, CommuteCorridor } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach Supabase JWT Bearer token to all outgoing requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Fetch active session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token && !error) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        // Check if a development mock token was injected in localStorage for testing
        const devToken = localStorage.getItem('veloce_dev_bearer_token');
        if (devToken) {
          config.headers.Authorization = `Bearer ${devToken}`;
        }
      }
    } catch (err) {
      console.warn('[Veloce Axios Interceptor] Error resolving Supabase session token:', err);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token refresh and standardized errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retried, attempt a token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token && !refreshError) {
          originalRequest.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        console.error('[Veloce Axios Interceptor] Token refresh failed:', refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// Backend API Service Helpers
export const api = {
  async getHealth() {
    const res = await apiClient.get('/api/v1/health/');
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: DjangoUser; auth_context: any }> {
    const res = await apiClient.get('/api/v1/auth/me/');
    return res.data;
  },

  async updateProfile(data: Partial<any>): Promise<{ success: boolean; user: DjangoUser }> {
    const res = await apiClient.patch('/api/v1/commuter/profile/', data);
    return res.data;
  },

  async getCorridors(): Promise<{ count: number; corridors: CommuteCorridor[] }> {
    const res = await apiClient.get('/api/v1/commuter/corridors/');
    return res.data;
  },

  async getDriverManifest(): Promise<any> {
    const res = await apiClient.get('/api/v1/driver/manifest/');
    return res.data;
  },

  async getCorporatePass(): Promise<any> {
    const res = await apiClient.get('/api/v1/corporate/transit-pass/');
    return res.data;
  },
};
