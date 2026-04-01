import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE as BASE } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null, loading: true,
  login: async () => {}, register: async () => {}, logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('automag_token');
    const savedUser = localStorage.getItem('automag_user');
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登入失敗');
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('automag_token', data.token);
    localStorage.setItem('automag_user', JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '註冊失敗');
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('automag_token', data.token);
    localStorage.setItem('automag_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('automag_token');
    localStorage.removeItem('automag_user');
  };

  return <Ctx.Provider value={{ user, token, loading, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
