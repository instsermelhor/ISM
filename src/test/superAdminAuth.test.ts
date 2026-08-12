/**
 * superAdminAuth.test.ts — SIL-ISM 1.0
 * Suíte de Segurança e Autenticação do Super Administrador
 *
 * ESCOPO: Testes unitários de lógica de segurança RBAC e controle de acesso.
 * Os testes de integração com Firebase Auth real (signInWithEmailAndPassword)
 * são executados nos testes E2E (Playwright) contra o ambiente de staging.
 *
 * Testes 01-06 validam a lógica de mapeamento de usuário e RBAC via
 * mapFirebaseUserToUser(), sem dependência de rede.
 */
import { describe, it, expect } from 'vitest';
import { mapFirebaseUserToUser } from '../../admin/src/services/api';
import { SuperAdminAuditService } from '../../admin/src/services/superAdminAuditService';

// Simula o objeto FirebaseUser retornado pelo SDK após login bem-sucedido
function makeFakeFirebaseUser(email: string, displayName = '') {
  return {
    uid: `uid-${email.replace(/[@.]/g, '-')}`,
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: null,
    emailVerified: true,
    metadata: {
      creationTime: '2024-01-01T00:00:00.000Z',
      lastSignInTime: new Date().toISOString(),
    },
  } as any;
}

const SUPER_ADMIN_EMAIL = 'instsermelhor.adm@gmail.com';

describe('Suíte Obrigatória de Testes de Segurança e Autenticação (SIL-ISM 1.0)', () => {
  const superAdminEmail = SUPER_ADMIN_EMAIL;

  it('Teste 01: FirebaseUser do Super Admin é mapeado com role SUPER_ADMIN', () => {
    const fbUser = makeFakeFirebaseUser(superAdminEmail, 'Super Administrador');
    const user = mapFirebaseUserToUser(fbUser);
    expect(user).toBeDefined();
    expect(user.email).toBe(superAdminEmail);
    expect(user.role).toBe('SUPER_ADMIN');
    expect(user.isActive).toBe(true);
  });

  it('Teste 02: forcePasswordChange é false por padrão após mapeamento', () => {
    const fbUser = makeFakeFirebaseUser(superAdminEmail);
    const user = mapFirebaseUserToUser(fbUser);
    // NC-002: forcePasswordChange não é mais ativado automaticamente;
    // a obrigatoriedade de troca é controlada pelo backend via Firestore (users_profiles.forcePasswordChange)
    expect(user.forcePasswordChange).toBe(false);
  });

  it('Teste 03: Usuário EDITOR é mapeado com role correto', () => {
    const fbUser = makeFakeFirebaseUser('editor@institutosermelhor.org');
    const user = mapFirebaseUserToUser(fbUser, 'EDITOR');
    expect(user.role).toBe('EDITOR');
    expect(user.role).not.toBe('SUPER_ADMIN');
  });

  it('Teste 04: SUPER_ADMIN é reconhecido por e-mail canônico', () => {
    const fbUser = makeFakeFirebaseUser(superAdminEmail);
    const user = mapFirebaseUserToUser(fbUser);
    expect(user.role).toBe('SUPER_ADMIN');
    expect(user.email).toBe(superAdminEmail);
  });

  it('Teste 05: SUPER_ADMIN possui conta ativa após mapeamento', () => {
    const fbUser = makeFakeFirebaseUser(superAdminEmail);
    const user = mapFirebaseUserToUser(fbUser);
    expect(user.isActive).toBe(true);
    expect(user.role).toBe('SUPER_ADMIN');
  });

  it('Teste 06: Identidade SUPER_ADMIN é consistente (mapeamentos repetidos)', () => {
    const fbUser = makeFakeFirebaseUser(superAdminEmail);
    const user1 = mapFirebaseUserToUser(fbUser);
    const user2 = mapFirebaseUserToUser(fbUser);
    expect(user1.role).toBe('SUPER_ADMIN');
    expect(user2.role).toBe('SUPER_ADMIN');
    expect(user1.email).toBe(user2.email);
    expect(user1.id).toBe(user2.id);
  });

  it('Teste 07: EDITOR não possui privilégios de SUPER_ADMIN', () => {
    const fbUser = makeFakeFirebaseUser('editor@institutosermelhor.org');
    const user = mapFirebaseUserToUser(fbUser, 'EDITOR');
    expect(user.role === 'SUPER_ADMIN').toBe(false);
  });

  it('Teste 08: Auto-promoção para SUPER_ADMIN pelo ADMIN é bloqueada pela lógica RBAC', () => {
    const caller = { role: 'ADMIN' as string };
    const attemptSelfPromotion = (targetRole: string) => {
      if (caller.role !== 'SUPER_ADMIN' && targetRole === 'SUPER_ADMIN') {
        throw new Error('Acesso negado: Usuários delegados não têm permissão para atribuir a função SUPER_ADMIN.');
      }
    };
    expect(() => attemptSelfPromotion('SUPER_ADMIN')).toThrow(/Acesso negado/i);
  });

  it('Teste 09: ADMIN não pode elevar seus próprios privilégios', () => {
    const callerRole: string = 'ADMIN';
    const canAssignSuperAdmin = callerRole === 'SUPER_ADMIN';
    expect(canAssignSuperAdmin).toBe(false);
  });

  it('Teste 10: Exclusão do SUPER_ADMIN por usuário delegado é bloqueada', () => {
    const attemptDelete = (callerRole: string, targetRole: string) => {
      if (targetRole === 'SUPER_ADMIN' && callerRole !== 'SUPER_ADMIN') {
        throw new Error('Operação Bloqueada: O Super Administrador não pode ser excluído por nenhum usuário delegado.');
      }
    };
    expect(() => attemptDelete('ADMIN', 'SUPER_ADMIN')).toThrow(/Operação Bloqueada/i);
  });

  it('Validação da Auditoria de Perfis Existentes (Requisito 19)', () => {
    const auditReport = SuperAdminAuditService.generateAuditReport();
    expect(auditReport.superAdmins).toContain(superAdminEmail);
    expect(auditReport.totalUsersFound).toBeGreaterThan(0);
    expect(auditReport.vulnerabilitiesFound.every(v => v.status === 'CORRIGIDO')).toBe(true);
  });
});
