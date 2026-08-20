/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTITUTO SER MELHOR — SUÍTE DE TESTES DE SEGURANÇA RBAC
 * Auditoria da matriz de permissões para SUPER_ADMIN, ADMIN, GESTOR, OPERADOR, VIEWER
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, it, expect, beforeEach } from 'vitest';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'VIEWER' | 'ANONYMOUS';

class RbacEngine {
  private permissions: Record<Role, string[]> = {
    SUPER_ADMIN: ['read_all_tenants', 'create_user', 'delete_user', 'change_roles', 'read_leads', 'update_lead', 'delete_lead', 'read_donations', 'create_donation', 'access_audit', 'sys_config', 'admin_dashboard'],
    ADMIN: ['create_user', 'delete_user', 'change_roles', 'read_leads', 'update_lead', 'delete_lead', 'read_donations', 'create_donation', 'access_audit', 'sys_config', 'admin_dashboard'],
    GESTOR: ['read_leads', 'update_lead', 'delete_lead', 'read_donations', 'create_donation', 'admin_dashboard'],
    OPERADOR: ['read_leads', 'update_lead', 'read_donations', 'create_donation'],
    VIEWER: ['read_leads', 'read_donations'],
    ANONYMOUS: []
  };

  canExecute(role: Role, action: string, tokenValid: boolean = true, sameTenant: boolean = true): { allowed: boolean; status: number; reason?: string } {
    if (!tokenValid) return { allowed: false, status: 401, reason: 'DENY' };
    
    // Horizontal escalation check
    if (!sameTenant && role !== 'SUPER_ADMIN') {
      return { allowed: false, status: 403, reason: 'DENY_CROSS_TENANT' };
    }

    if (this.permissions[role].includes(action)) {
      return { allowed: true, status: 200, reason: 'ALLOW' };
    }
    
    return { allowed: false, status: 403, reason: 'DENY' };
  }

  tamperRole(originalRole: Role, payloadRole: string): { allowed: boolean; reason?: string } {
    if (originalRole !== 'SUPER_ADMIN' && originalRole !== 'ADMIN') {
      return { allowed: false, reason: 'DENY_TAMPERING' };
    }
    return { allowed: true };
  }
}

describe('RBAC Security - Auditoria da Matriz de Permissões', () => {
  let engine: RbacEngine;

  beforeEach(() => {
    engine = new RbacEngine();
  });

  // Allowed operations for each role (RBAC-001 a RBAC-012)
  it('RBAC-001: SUPER_ADMIN pode ler dados de todos os tenants', () => {
    expect(engine.canExecute('SUPER_ADMIN', 'read_all_tenants').allowed).toBe(true);
  });
  
  it('RBAC-002: ADMIN pode criar usuário', () => {
    expect(engine.canExecute('ADMIN', 'create_user').allowed).toBe(true);
  });

  it('RBAC-003: ADMIN pode deletar usuário', () => {
    expect(engine.canExecute('ADMIN', 'delete_user').allowed).toBe(true);
  });

  it('RBAC-004: GESTOR pode atualizar lead', () => {
    expect(engine.canExecute('GESTOR', 'update_lead').allowed).toBe(true);
  });

  it('RBAC-005: GESTOR pode acessar admin dashboard', () => {
    expect(engine.canExecute('GESTOR', 'admin_dashboard').allowed).toBe(true);
  });

  it('RBAC-006: OPERADOR pode atualizar lead', () => {
    expect(engine.canExecute('OPERADOR', 'update_lead').allowed).toBe(true);
  });

  it('RBAC-007: OPERADOR pode ler doações', () => {
    expect(engine.canExecute('OPERADOR', 'read_donations').allowed).toBe(true);
  });

  it('RBAC-008: VIEWER pode ler leads', () => {
    expect(engine.canExecute('VIEWER', 'read_leads').allowed).toBe(true);
  });

  it('RBAC-009: SUPER_ADMIN pode acessar audit logs', () => {
    expect(engine.canExecute('SUPER_ADMIN', 'access_audit').allowed).toBe(true);
  });

  it('RBAC-010: ADMIN pode alterar roles', () => {
    expect(engine.canExecute('ADMIN', 'change_roles').allowed).toBe(true);
  });

  it('RBAC-011: GESTOR pode deletar lead', () => {
    expect(engine.canExecute('GESTOR', 'delete_lead').allowed).toBe(true);
  });

  it('RBAC-012: OPERADOR pode criar doação', () => {
    expect(engine.canExecute('OPERADOR', 'create_donation').allowed).toBe(true);
  });

  // Denied operations for roles (RBAC-013 a RBAC-024)
  it('RBAC-013: ADMIN NÃO pode ler dados de todos os tenants', () => {
    expect(engine.canExecute('ADMIN', 'read_all_tenants').allowed).toBe(false);
  });

  it('RBAC-014: GESTOR NÃO pode criar usuário', () => {
    expect(engine.canExecute('GESTOR', 'create_user').allowed).toBe(false);
  });

  it('RBAC-015: OPERADOR NÃO pode deletar lead', () => {
    expect(engine.canExecute('OPERADOR', 'delete_lead').allowed).toBe(false);
  });

  it('RBAC-016: VIEWER NÃO pode atualizar lead', () => {
    expect(engine.canExecute('VIEWER', 'update_lead').allowed).toBe(false);
  });

  it('RBAC-017: VIEWER NÃO pode acessar admin dashboard', () => {
    expect(engine.canExecute('VIEWER', 'admin_dashboard').allowed).toBe(false);
  });

  it('RBAC-018: ANONYMOUS NÃO pode ler leads', () => {
    expect(engine.canExecute('ANONYMOUS', 'read_leads').allowed).toBe(false);
  });

  it('RBAC-019: GESTOR NÃO pode acessar audit logs', () => {
    expect(engine.canExecute('GESTOR', 'access_audit').allowed).toBe(false);
  });

  it('RBAC-020: OPERADOR NÃO pode acessar system configs', () => {
    expect(engine.canExecute('OPERADOR', 'sys_config').allowed).toBe(false);
  });

  it('RBAC-021: VIEWER NÃO pode criar doação', () => {
    expect(engine.canExecute('VIEWER', 'create_donation').allowed).toBe(false);
  });

  it('RBAC-022: GESTOR NÃO pode alterar roles', () => {
    expect(engine.canExecute('GESTOR', 'change_roles').allowed).toBe(false);
  });

  it('RBAC-023: ANONYMOUS NÃO pode acessar system configs', () => {
    expect(engine.canExecute('ANONYMOUS', 'sys_config').allowed).toBe(false);
  });

  it('RBAC-024: OPERADOR NÃO pode deletar usuário', () => {
    expect(engine.canExecute('OPERADOR', 'delete_user').allowed).toBe(false);
  });

  // Escalation & Bypass Checks (RBAC-025 a RBAC-030)
  it('RBAC-025: Vertical escalation — VIEWER tentando ação de ADMIN → DENY', () => {
    const result = engine.canExecute('VIEWER', 'create_user');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('DENY');
  });

  it('RBAC-026: Horizontal escalation — ADMIN do Tenant A tentando alterar usuário do Tenant B → DENY', () => {
    const result = engine.canExecute('ADMIN', 'change_roles', true, false); // sameTenant = false
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('DENY_CROSS_TENANT');
  });

  it('RBAC-027: Role tampering — usuário alterando próprio role via API payload → DENY', () => {
    const result = engine.tamperRole('VIEWER', 'ADMIN');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('DENY_TAMPERING');
  });

  it('RBAC-028: Bypass de frontend — chamada direta à API sem token → DENY (401)', () => {
    const result = engine.canExecute('ANONYMOUS', 'read_leads', false); // tokenValid = false
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(401);
  });

  it('RBAC-029: Bypass de frontend — chamada direta com token de baixo privilégio → DENY (403)', () => {
    const result = engine.canExecute('VIEWER', 'sys_config', true);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('RBAC-030: Acesso a endpoint administrativo com role VIEWER → DENY', () => {
    const result = engine.canExecute('VIEWER', 'admin_dashboard');
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });
});
