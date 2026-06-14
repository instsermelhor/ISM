import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { AuthService } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (action: 'write' | 'admin' | 'analytics') => boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await AuthService.login(email, password);
    setUser(u);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  // RBAC permission helper
  const can = (action: 'write' | 'admin' | 'analytics'): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (action === 'write') return user.role === 'EDITOR';
    if (action === 'analytics') return ['EDITOR', 'ADMIN'].includes(user.role);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
