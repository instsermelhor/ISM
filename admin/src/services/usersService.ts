/**
 * usersService.ts
 * ───────────────
 * NC-023 — Serviço de Gestão de Usuários REAL via Firebase Admin API (REST).
 * Substitui o SEED_USERS hardcoded em UsersPage.tsx.
 *
 * Estratégia: O Firebase Client SDK NÃO expõe a lista de usuários
 * (listUsers() é exclusivo do Firebase Admin SDK, que roda no backend).
 *
 * Implementação:
 *   1. Listar usuários: via Cloud Function admin protegida (GET /api/v2/admin/users)
 *   2. Criar usuário: via Cloud Function admin (POST /api/v2/admin/users)
 *   3. Desativar/Ativar: via Cloud Function admin (PATCH /api/v2/admin/users/:id)
 *   4. Excluir: via Cloud Function admin (DELETE /api/v2/admin/users/:id)
 *   5. Definir Role (custom claims): via Cloud Function (POST /api/v2/admin/users/:id/role)
 *
 * Autenticação: Bearer token do usuário autenticado (Firebase Auth ID Token)
 */

import { auth } from '../lib/firebase';

// ─── URL base das Cloud Functions ─────────────────────────────────────────────
// Em produção: https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api
// Em dev local: http://localhost:5001/ismbd-27e84/southamerica-east1/api
const BASE_URL = import.meta.env.VITE_FUNCTIONS_URL
  ?? (import.meta.env.DEV
    ? 'http://localhost:5001/ismbd-27e84/southamerica-east1/api'
    : 'https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api');

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'GESTOR' | 'EDITOR' | 'OPERADOR' | 'CONSULTA' | 'VIEWER';

export interface FirebaseAdminUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  role?: AdminRole;
  createdAt?: string;
  lastLoginAt?: string;
  // do users_profiles (Firestore)
  department?: string;
  phone?: string;
  notes?: string;
}

export interface CreateUserPayload {
  email: string;
  displayName: string;
  role: AdminRole;
  temporaryPassword: string;
  department?: string;
}

// ─── Helper: obtém ID Token do usuário autenticado ────────────────────────────

async function getAuthHeader(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Não autenticado. Faça login para continuar.');
  const token = await user.getIdToken(/* forceRefresh= */ false);
  return { Authorization: `Bearer ${token}` };
}

// ─── Helper: request genérico ─────────────────────────────────────────────────

async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: object
): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try { msg = (await res.json()).detail ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── Serviço ──────────────────────────────────────────────────────────────────

export const UsersAdminService = {
  /**
   * Lista todos os usuários admin (Firebase Auth + perfis Firestore).
   * Requer role ADMIN ou superior.
   */
  async listAll(): Promise<FirebaseAdminUser[]> {
    try {
      const result = await apiRequest<{ users: FirebaseAdminUser[] }>('GET', '/v2/admin/users');
      return result.users ?? [];
    } catch (err) {
      console.error('[UsersAdminService.listAll]', err);
      throw err;
    }
  },

  /**
   * Cria um novo usuário com role e senha temporária.
   */
  async create(payload: CreateUserPayload): Promise<{ uid: string }> {
    return apiRequest<{ uid: string }>('POST', '/v2/admin/users', payload);
  },

  /**
   * Atualiza o role (custom claim) de um usuário.
   * Protegido: não pode demotar SUPER_ADMIN.
   */
  async setRole(uid: string, role: AdminRole): Promise<void> {
    await apiRequest<void>('POST', `/v2/admin/users/${uid}/role`, { role });
  },

  /**
   * Desativa ou reativa uma conta de usuário.
   */
  async setDisabled(uid: string, disabled: boolean): Promise<void> {
    await apiRequest<void>('PATCH', `/v2/admin/users/${uid}`, { disabled });
  },

  /**
   * Exclui permanentemente uma conta (protegido: não exclui SUPER_ADMIN).
   */
  async delete(uid: string): Promise<void> {
    await apiRequest<void>('DELETE', `/v2/admin/users/${uid}`);
  },

  /**
   * Envia e-mail de redefinição de senha.
   */
  async sendPasswordReset(email: string): Promise<void> {
    await apiRequest<void>('POST', '/v2/admin/users/password-reset', { email });
  },
};
