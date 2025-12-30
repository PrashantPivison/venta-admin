import axios, { AxiosInstance } from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:5000/api/admin';

/**
 * Common axios instance for all services
 * Includes:
 * - Base URL configuration
 * - Authorization header injection
 * - Automatic token refresh on 401 errors
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired) and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await authService.refreshAccessToken();
        if (error.config) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(error.config);
        }
      } catch {
        // Refresh token failed, user needs to login again
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
