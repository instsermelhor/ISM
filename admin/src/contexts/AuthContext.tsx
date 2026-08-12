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

  // RBAC permission helper baseada em papéis formais e permissões granulares (RBAC-MASTER-001)
  const can = (action:
    | 'write' | 'admin' | 'analytics' | 'super_admin'
    | 'manage_users' | 'elevate_super_admin' | 'view_financial' | 'manage_financial' | 'edit_content' | 'view_audit_logs'
  ): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    switch (action) {
      case 'super_admin':
      case 'elevate_super_admin':
      case 'manage_financial':
        return false; // Apenas SUPER_ADMIN
      case 'manage_users':
      case 'view_financial':
      case 'view_audit_logs':
      case 'admin':
        return user.role === 'ADMIN';
      case 'edit_content':
      case 'write':
        return ['ADMIN', 'EDITOR', 'GESTOR'].includes(user.role);
      case 'analytics':
        return ['ADMIN', 'EDITOR', 'GESTOR', 'CONSULTA'].includes(user.role);
      default:
        return false; // DENY BY DEFAULT
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, mustChangePassword, login, changePassword, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

