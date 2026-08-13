import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Tenant, TenantRole, TenantContextState } from '../types';
import { TenantService } from '../services/tenantService';
import { useAuth } from './AuthContext';

const TenantContext = createContext<TenantContextState>({} as TenantContextState);

const STORAGE_ACTIVE_TENANT_KEY = 'ism_admin_active_tenant_id';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-ism-hq');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || (user?.email || '').toLowerCase() === 'instsermelhor.adm@gmail.com';

  useEffect(() => {
    async function loadTenantHierarchy() {
      setIsLoading(true);
      try {
        const savedTenantId = localStorage.getItem(STORAGE_ACTIVE_TENANT_KEY);
        const effectiveTenantId = isSuperAdmin 
          ? (savedTenantId || user?.tenantId || 'tenant-ism-hq')
          : (user?.tenantId || 'tenant-ism-hq');

        const tenants = await TenantService.getTenants(isSuperAdmin, effectiveTenantId);
        setAvailableTenants(tenants);

        const current = tenants.find(t => t.id === effectiveTenantId) || tenants[0] || TenantService.getDefaultTenant();
        setActiveTenant(current);
        setActiveTenantId(current.id);
      } catch (err) {
        console.error('[TenantContext] Falha ao inicializar hierarquia de tenant:', err);
        const fallback = TenantService.getDefaultTenant();
        setActiveTenant(fallback);
        setActiveTenantId(fallback.id);
        setAvailableTenants([fallback]);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadTenantHierarchy();
    } else {
      setIsLoading(false);
    }
  }, [user, isSuperAdmin]);

  const switchTenant = async (tenantId: string): Promise<void> => {
    if (!isSuperAdmin && user?.tenantId && user.tenantId !== tenantId) {
      throw new Error('Acesso negado: Usuários com escopo restrito não podem alternar de tenant.');
    }

    setIsLoading(true);
    try {
      const target = availableTenants.find(t => t.id === tenantId) || await TenantService.getTenantById(tenantId);
      if (target) {
        setActiveTenant(target);
        setActiveTenantId(target.id);
        localStorage.setItem(STORAGE_ACTIVE_TENANT_KEY, target.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userRoleInTenant: TenantRole | 'SUPER_ADMIN' | null = isSuperAdmin
    ? 'SUPER_ADMIN'
    : ((user?.role as unknown as TenantRole) || 'TENANT_VIEWER');

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        activeTenant,
        userRoleInTenant,
        isSuperAdmin,
        availableTenants,
        switchTenant,
        isLoading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
