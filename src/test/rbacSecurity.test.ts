/**
 * rbacSecurity.test.ts — RBAC-MASTER-001
 * Suíte de Testes Automatizados de Segurança, Matriz RBAC, SoD e Isolamento de Escopo
 */

import { describe, it, expect } from 'vitest';

// Simulação da lógica de verificação RBAC (espelha a implementação oficial do AuthContext e Cloud Functions)
export interface UserContext {
  uid: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GESTOR' | 'EDITOR' | 'OPERADOR' | 'CONSULTA' | 'CLIENTE' | 'VIEWER';
}

export function evaluatePermission(
  user: UserContext | null,
  action: string,
  targetScope?: { ownerId?: string; isSuperAdminTarget?: boolean }
): { allowed: boolean; code: string } {
  // 1. Negação por Padrão: Usuário não autenticado -> Deny 401
  if (!user) {
    return { allowed: false, code: 'UNAUTHORIZED' };
  }

  const SUPER_ADMIN_EMAIL = 'instsermelhor.adm@gmail.com';
  const isSuperAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL || user.role === 'SUPER_ADMIN';

  // 2. Proteção de Autoelevação e SoD: Usuário comum alterando o próprio papel para SUPER_ADMIN
  if (action === 'ELEVATE_SUPER_ADMIN') {
    if (!isSuperAdmin) {
      return { allowed: false, code: 'SUPER_ADMIN_PROTECTED' };
    }
    return { allowed: true, code: 'ALLOW' };
  }

  // 3. Proteção SoD: Usuário comum tentando alterar a própria role
  if (action === 'CHANGE_ROLE' && targetScope?.ownerId === user.uid && !isSuperAdmin) {
    return { allowed: false, code: 'SELF_ROLE_CHANGE_FORBIDDEN' };
  }

  // 4. Proteção contra exclusão de SUPER_ADMIN por ADMIN
  if (action === 'DELETE_USER' && targetScope?.isSuperAdminTarget && !isSuperAdmin) {
    return { allowed: false, code: 'SUPER_ADMIN_PROTECTED' };
  }

  // 5. Proteção contra IDOR/BOLA: Acesso a dados de titular (Self-Scope)
  if (action === 'READ_PERSONAL_DATA') {
    if (isSuperAdmin || user.role === 'ADMIN') {
      return { allowed: true, code: 'ALLOW' };
    }
    if (targetScope?.ownerId && targetScope.ownerId === user.uid) {
      return { allowed: true, code: 'ALLOW' };
    }
    return { allowed: false, code: 'FORBIDDEN_IDOR' };
  }

  // 6. Matriz de Autorização Canônica (SUPER_ADMIN libera tudo)
  if (isSuperAdmin) {
    return { allowed: true, code: 'ALLOW' };
  }

  // Matriz por papel
  switch (action) {
    case 'MANAGE_USERS':
    case 'VIEW_AUDIT_LOGS':
    case 'VIEW_FINANCIAL':
      return { allowed: user.role === 'ADMIN', code: user.role === 'ADMIN' ? 'ALLOW' : 'FORBIDDEN' };

    case 'MANAGE_FINANCIAL':
      return { allowed: false, code: 'FORBIDDEN_SUPER_ADMIN_ONLY' };

    case 'EDIT_CONTENT':
    case 'CREATE_CONTENT':
      return { allowed: ['ADMIN', 'EDITOR', 'GESTOR'].includes(user.role), code: ['ADMIN', 'EDITOR', 'GESTOR'].includes(user.role) ? 'ALLOW' : 'FORBIDDEN' };

    case 'VIEW_ANALYTICS':
      return { allowed: ['ADMIN', 'EDITOR', 'GESTOR', 'CONSULTA'].includes(user.role), code: ['ADMIN', 'EDITOR', 'GESTOR', 'CONSULTA'].includes(user.role) ? 'ALLOW' : 'FORBIDDEN' };

    case 'VIEW_PUBLIC':
      return { allowed: true, code: 'ALLOW' };

    default:
      // DENY BY DEFAULT para qualquer ação não cadastrada
      return { allowed: false, code: 'DENY_BY_DEFAULT' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUÍTE DE TESTES RBAC-MASTER-001
// ─────────────────────────────────────────────────────────────────────────────

describe('RBAC-MASTER-001 — Governança de Acessos & Segregação de Funções', () => {

  // ── 1. Negação por Padrão (Deny by Default) ────────────────────────────────

  describe('Princípio Deny by Default', () => {
    it('deve negar acesso (401 UNAUTHORIZED) para usuários nulos ou não autenticados', () => {
      const res = evaluatePermission(null, 'MANAGE_USERS');
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('UNAUTHORIZED');
    });

    it('deve negar ações não mapeadas na matriz (DENY_BY_DEFAULT)', () => {
      const user: UserContext = { uid: 'u1', email: 'editor@ism.org', role: 'EDITOR' };
      const res = evaluatePermission(user, 'ACTION_INEXISTENTE');
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('DENY_BY_DEFAULT');
    });

    it('deve negar por padrão papel VIEWER em ações administrativas', () => {
      const user: UserContext = { uid: 'u2', email: 'viewer@ism.org', role: 'VIEWER' };
      expect(evaluatePermission(user, 'MANAGE_USERS').allowed).toBe(false);
      expect(evaluatePermission(user, 'VIEW_FINANCIAL').allowed).toBe(false);
      expect(evaluatePermission(user, 'EDIT_CONTENT').allowed).toBe(false);
    });
  });

  // ── 2. Super Administrador vs Administrador (Hierarquia) ───────────────────

  describe('Hierarquia SUPER_ADMIN vs ADMIN', () => {
    const superAdmin: UserContext = { uid: 'sa1', email: 'instsermelhor.adm@gmail.com', role: 'SUPER_ADMIN' };
    const adminUser: UserContext = { uid: 'a1', email: 'admin.delegado@ism.org', role: 'ADMIN' };

    it('SUPER_ADMIN possui autoridade máxima sobre todas as permissões', () => {
      expect(evaluatePermission(superAdmin, 'ELEVATE_SUPER_ADMIN').allowed).toBe(true);
      expect(evaluatePermission(superAdmin, 'MANAGE_FINANCIAL').allowed).toBe(true);
      expect(evaluatePermission(superAdmin, 'MANAGE_USERS').allowed).toBe(true);
      expect(evaluatePermission(superAdmin, 'VIEW_AUDIT_LOGS').allowed).toBe(true);
    });

    it('ADMIN comum NÃO pode elevar privilégios para SUPER_ADMIN (SUPER_ADMIN_PROTECTED)', () => {
      const res = evaluatePermission(adminUser, 'ELEVATE_SUPER_ADMIN');
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('SUPER_ADMIN_PROTECTED');
    });

    it('ADMIN comum NÃO pode excluir um conta de SUPER_ADMIN', () => {
      const res = evaluatePermission(adminUser, 'DELETE_USER', { isSuperAdminTarget: true });
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('SUPER_ADMIN_PROTECTED');
    });

    it('ADMIN comum NÃO pode alterar sua própria função (SoD — SELF_ROLE_CHANGE_FORBIDDEN)', () => {
      const res = evaluatePermission(adminUser, 'CHANGE_ROLE', { ownerId: adminUser.uid });
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('SELF_ROLE_CHANGE_FORBIDDEN');
    });
  });

  // ── 3. Segregação de Funções (SoD) — Gestor vs Editor vs Consulta ──────────

  describe('Segregação de Funções (SoD)', () => {
    const editor: UserContext = { uid: 'e1', email: 'editor@ism.org', role: 'EDITOR' };
    const gestor: UserContext = { uid: 'g1', email: 'gestor@ism.org', role: 'GESTOR' };
    const consulta: UserContext = { uid: 'c1', email: 'auditor@ism.org', role: 'CONSULTA' };

    it('EDITOR pode editar conteúdo mas NÃO pode ver dados financeiros nem gerenciar usuários', () => {
      expect(evaluatePermission(editor, 'EDIT_CONTENT').allowed).toBe(true);
      expect(evaluatePermission(editor, 'VIEW_FINANCIAL').allowed).toBe(false);
      expect(evaluatePermission(editor, 'MANAGE_USERS').allowed).toBe(false);
    });

    it('GESTOR pode criar/editar conteúdos e ver analytics do projeto mas NÃO pode ver financeiro global', () => {
      expect(evaluatePermission(gestor, 'EDIT_CONTENT').allowed).toBe(true);
      expect(evaluatePermission(gestor, 'VIEW_ANALYTICS').allowed).toBe(true);
      expect(evaluatePermission(gestor, 'VIEW_FINANCIAL').allowed).toBe(false);
    });

    it('CONSULTA (Auditor Externo) pode ver analytics em modo leitura mas NÃO pode criar/editar conteúdo', () => {
      expect(evaluatePermission(consulta, 'VIEW_ANALYTICS').allowed).toBe(true);
      expect(evaluatePermission(consulta, 'EDIT_CONTENT').allowed).toBe(false);
      expect(evaluatePermission(consulta, 'MANAGE_USERS').allowed).toBe(false);
    });
  });

  // ── 4. Proteção de Escopo & Prevenção contra IDOR/BOLA ─────────────────────

  describe('Proteção contra IDOR/BOLA (Self-Scope Isolation)', () => {
    const clienteA: UserContext = { uid: 'user_A', email: 'clienteA@ism.org', role: 'CLIENTE' };

    it('CLIENTE pode acessar seus próprios dados pessoais (ownerId === uid)', () => {
      const res = evaluatePermission(clienteA, 'READ_PERSONAL_DATA', { ownerId: 'user_A' });
      expect(res.allowed).toBe(true);
      expect(res.code).toBe('ALLOW');
    });

    it('CLIENTE NÃO pode acessar dados de outro cliente (IDOR bloqueado)', () => {
      const res = evaluatePermission(clienteA, 'READ_PERSONAL_DATA', { ownerId: 'user_B' });
      expect(res.allowed).toBe(false);
      expect(res.code).toBe('FORBIDDEN_IDOR');
    });

    it('SUPER_ADMIN e ADMIN podem acessar dados de titulares para fins de atendimento LGPD', () => {
      const adminUser: UserContext = { uid: 'a1', email: 'admin@ism.org', role: 'ADMIN' };
      const res = evaluatePermission(adminUser, 'READ_PERSONAL_DATA', { ownerId: 'user_B' });
      expect(res.allowed).toBe(true);
    });
  });
});
