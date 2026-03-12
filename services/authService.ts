import { User } from '../types';
import { apiClient } from './apiClient';

// Keys for localStorage
const USER_KEY = 'autocdb_user';
const TOKEN_KEY = 'autocdb_jwt';

export const AuthService = {
  // Real Google OAuth login flow (connects to backend)
  login: async (): Promise<User> => {
    try {
      // Simulate Google OAuth popup and get user info
      // In production, this would use the real Google OAuth flow
      const googleUserInfo = {
        email: 'alex.chen@example.com',
        name: 'Alex Chen',
        picture: 'https://picsum.photos/id/64/200/200',
      };

      // Send to backend for authentication
      const response: any = await apiClient.auth.googleAuth(googleUserInfo);

      const user: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar || googleUserInfo.picture,
      };

      // Store user and token
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, response.token);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register new user
  register: async (email: string, password: string, name: string): Promise<User> => {
    try {
      const response: any = await apiClient.auth.register({ email, password, name });

      const user: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        avatar: undefined,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, response.token);

      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Email/password login
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    try {
      const response: any = await apiClient.auth.login({ email, password });

      const user: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        avatar: undefined,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, response.token);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};