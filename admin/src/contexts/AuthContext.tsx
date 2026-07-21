import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { AuthService, mapFirebaseUserToUser } from '../services/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (action: 'write' | 'admin' | 'analytics') => boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta em tempo real o estado de autenticação oficial do Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(mapFirebaseUserToUser(fbUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await AuthService.login(email, password);
    setUser(u);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  // RBAC permission helper baseada em papéis
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

