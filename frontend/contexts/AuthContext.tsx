'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'developer';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getSession();
      // Backend returns either { user: {...} } or { message: 'Not authenticated' }
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // Don't treat 401 as a hard error, just means not authenticated
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error('Auth check error:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(username, password);
      // Backend returns { user: {...} } on successful login
      const userData = response.data.user;
      
      if (userData) {
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
      
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const hasPermission = (roles: string[]): boolean => {
    if (!user || !roles.length) return false;
    return roles.indexOf(user.role) !== -1;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}