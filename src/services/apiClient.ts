import axios, { AxiosInstance, AxiosError } from 'axios';
import authService from './authService';

/**
 * API Base URL
 * - Local: http://localhost:5000
 * - Ngrok: https://xxxx.ngrok-free.app
 * - Prod: https://api.yourdomain.com
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',

  },
  withCredentials: true, // safe for future cookies
});

/**
 * Request Interceptor
 * - Attach access token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - Handle expired access token (401)
 * - Refresh token once
 * - Retry original request
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Prevent infinite retry loop
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await authService.refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed → force logout
       
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
