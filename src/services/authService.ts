import axios from 'axios';
import apiClient from './apiClient';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/admin';

interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    username: string;
    email: string;
  };
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'ventaAccessToken';
  private readonly REFRESH_TOKEN_KEY = 'ventaRefreshToken';
  private readonly USER_KEY = 'ventaUser';

  /**
   * Login with email or username
   */
async loginAdmin(
  emailOrUsername: string,
  password: string
): Promise<LoginResponse> {
  const loginData: LoginRequest = { password };

  if (emailOrUsername.includes('@')) {
    loginData.email = emailOrUsername;
  } else {
    loginData.username = emailOrUsername;
  }

  try {
    // ❌ NO Authorization header here
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      loginData
    );

    // Store tokens
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.admin));

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error || 'Login failed'
    );
  }
}

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      // Update tokens
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);

      return response.data.accessToken;
    } catch (error) {
      // If refresh fails, logout the user
      this.logoutAdmin();
      throw new Error('Session expired. Please login again');
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Logout admin
   */
  async logoutAdmin(): Promise<void> {
    // Clear stored data
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get stored user info
   */
  getAdmin() {
    const admin = localStorage.getItem(this.USER_KEY);
    return admin ? JSON.parse(admin) : null;
  }
}

export default new AuthService();
