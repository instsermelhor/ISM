import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Tenant, TenantMembership, TenantRole } from '../types';

export const TenantService = {
  /**
   * Obtém a lista de tenants acessíveis para o usuário autenticado
   */
  async getTenants(isSuperAdmin: boolean, currentTenantId?: string): Promise<Tenant[]> {
    try {
      if (isSuperAdmin) {
        const snap = await getDocs(
          query(collection(db, 'tenants'), orderBy('createdAt', 'desc'), limit(100))
        );
        if (snap.empty) {
          return [this.getDefaultTenant()];
        }
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Tenant, 'id'>) }));
      }

      if (currentTenantId) {
        const docRef = await getDoc(doc(db, 'tenants', currentTenantId));
        if (docRef.exists()) {
          return [{ id: docRef.id, ...(docRef.data() as Omit<Tenant, 'id'>) }];
        }
      }

      return [this.getDefaultTenant()];
    } catch (err) {
      console.warn('[TenantService] Fallback para tenant institucional padrão:', err);
      return [this.getDefaultTenant()];
    }
  },

  /**
   * Retorna os detalhes de um tenant específico
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const snap = await getDoc(doc(db, 'tenants', tenantId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Tenant, 'id'>) };
    } catch (err) {
      console.error('[TenantService] Erro ao buscar tenant por ID:', err);
      return null;
    }
  },

  /**
   * Cria um novo tenant (exclusivo para governança global)
   */
  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tenantId = `tenant-${tenantData.slug}`;
    await setDoc(doc(db, 'tenants', tenantId), {
      ...tenantData,
      id: tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return tenantId;
  },

  /**
   * Atualiza configurações de um tenant existente
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    await updateDoc(doc(db, 'tenants', tenantId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Lista membresias vinculadas a um tenant
   */
  async getTenantMembers(tenantId: string): Promise<TenantMembership[]> {
    try {
      const q = query(collection(db, 'user_tenants'), where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<TenantMembership, 'id'>) }));
    } catch (err) {
      console.error('[TenantService] Erro ao buscar membros do tenant:', err);
      return [];
    }
  },

  /**
   * Vincula um usuário a um tenant
   */
  async addTenantMember(
    tenantId: string,
    userId: string,
    userEmail: string,
    role: TenantRole,
    grantedBy: string
  ): Promise<void> {
    const membershipId = `${userId}_${tenantId}`;
    await setDoc(doc(db, 'user_tenants', membershipId), {
      id: membershipId,
      userId,
      userEmail,
      tenantId,
      role,
      isDefault: false,
      isActive: true,
      grantedBy,
      grantedAt: serverTimestamp(),
    }, { merge: true });
  },

  /**
   * Tenant Institucional Canônico Padrão (Sede Matriz)
   */
  getDefaultTenant(): Tenant {
    return {
      id: 'tenant-ism-hq',
      name: 'Instituto Ser Melhor — Sede Matriz',
      slug: 'ism-matriz',
      type: 'INSTITUTION_HQ',
      status: 'ACTIVE',
      documentNumber: '09.040.440/0001-47',
      domain: 'institutosermelhor.org',
      settings: {
        primaryColor: '#0A4D68',
        contactEmail: 'contato@institutosermelhor.org',
        contactPhone: '+55 11 99999-9999',
        features: {
          customBranding: true,
          crmLeads: true,
          donationsManagement: true,
          bpmWorkflows: true,
          financialReports: true,
          biAnalytics: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
