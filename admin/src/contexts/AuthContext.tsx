import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { AuthService, mapFirebaseUserToUser } from '../services/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<User>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (action: 'write' | 'admin' | 'analytics' | 'super_admin') => boolean;
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

  const login = async (email: string, password: string): Promise<User> => {
    const u = await AuthService.login(email, password);
    setUser(u);
    return u;
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<void> => {
    if (!user) throw new Error('Nenhum usuário autenticado.');
    await AuthService.changePassword(user.email, oldPass, newPass);
    setUser(prev => prev ? { ...prev, forcePasswordChange: false, temporaryPassword: false } : null);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const mustChangePassword = !!user?.forcePasswordChange;

  // RBAC permission helper baseada em papéis formais
  const can = (action: 'write' | 'admin' | 'analytics' | 'super_admin'): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (action === 'super_admin') return false;
    if (user.role === 'ADMIN') return true;
    if (action === 'write') return ['EDITOR', 'GESTOR'].includes(user.role);
    if (action === 'analytics') return ['EDITOR', 'ADMIN', 'GESTOR'].includes(user.role);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, mustChangePassword, login, changePassword, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

