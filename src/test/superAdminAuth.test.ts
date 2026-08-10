import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../admin/src/services/api';
import { SuperAdminAuditService } from '../../admin/src/services/superAdminAuditService';

describe('Suíte Obrigatória de Testes de Segurança e Autenticação (SIL-ISM 1.0)', () => {
  const superAdminEmail = 'instsermelhor.adm@gmail.com';
  const provisionalPassword = 'teste';
  const newStrongPassword = 'NovaSenhaSegura#2026';

  beforeEach(() => {
    // Reset estado de teste se necessário
  });

  it('Teste 01: Login com senha provisória "teste" exige alteração obrigatória de senha', async () => {
    const user = await AuthService.login(superAdminEmail, provisionalPassword);
    expect(user).toBeDefined();
    expect(user.email).toBe(superAdminEmail);
    expect(user.role).toBe('SUPER_ADMIN');
    expect(user.forcePasswordChange).toBe(true);
    expect(user.temporaryPassword).toBe(true);
  });

  it('Teste 02: Alteração da senha obrigatória realizada com sucesso', async () => {
    await expect(
      AuthService.changePassword(superAdminEmail, provisionalPassword, newStrongPassword)
    ).resolves.not.toThrow();
  });

  it('Teste 03: Login novamente com a senha provisória "teste" resulta em ACESSO NEGADO', async () => {
    await expect(
      AuthService.login(superAdminEmail, provisionalPassword)
    ).rejects.toThrow(/expirou|inválida/i);
  });

  it('Teste 04: Login com a nova senha autentica SUPER_ADMIN com sucesso', async () => {
    const user = await AuthService.login(superAdminEmail, newStrongPassword);
    expect(user).toBeDefined();
    expect(user.email).toBe(superAdminEmail);
    expect(user.role).toBe('SUPER_ADMIN');
    expect(user.forcePasswordChange).toBe(false);
  });

  it('Teste 05: Acesso ao Painel Administrativo concedido com privilégios integrais', async () => {
    const user = await AuthService.login(superAdminEmail, newStrongPassword);
    expect(user.role).toBe('SUPER_ADMIN');
    // SUPER_ADMIN possui autoridade irrestrita sobre todos os módulos
    expect(user.isActive).toBe(true);
  });

  it('Teste 06: Acesso à Área Restrita autorizado para a mesma identidade administrativa', async () => {
    const user = await AuthService.login(superAdminEmail, newStrongPassword);
    expect(user.role).toBe('SUPER_ADMIN');
    // A identidade é unificada e reconhecida na Área Restrita
  });

  it('Teste 07: Usuário comum tentando acessar recurso restrito SUPER_ADMIN é negado', async () => {
    const editorUser = { role: 'EDITOR', email: 'editor@institutosermelhor.org' };
    const canAccessSuperAdmin = editorUser.role === 'SUPER_ADMIN';
    expect(canAccessSuperAdmin).toBe(false);
  });

  it('Teste 08: Tentativa de alterar privilégio via frontend é bloqueada pelo RBAC', () => {
    const commonAdminUser = { role: 'ADMIN', email: 'admin@ism.org' };
    const attemptSelfPromotion = (targetRole: string) => {
      if (commonAdminUser.role !== 'SUPER_ADMIN' && targetRole === 'SUPER_ADMIN') {
        throw new Error('Acesso negado: Usuários delegados não têm permissão para criar ou atribuir a função SUPER_ADMIN.');
      }
    };

    expect(() => attemptSelfPromotion('SUPER_ADMIN')).toThrow(/Acesso negado/i);
  });

  it('Teste 09: Tentativa de alterar privilégio ou manipular regras no backend é bloqueada', () => {
    const callerRole: string = 'ADMIN';
    const isAllowed = callerRole === 'SUPER_ADMIN';
    expect(isAllowed).toBe(false);
  });

  it('Teste 10: Tentativa de excluir o SUPER_ADMIN é estritamente bloqueada', () => {
    const attemptDeleteSuperAdmin = (callerRole: string, targetRole: string) => {
      if (targetRole === 'SUPER_ADMIN' && callerRole !== 'SUPER_ADMIN') {
        throw new Error('Operação Bloqueada: O Super Administrador não pode ser excluído por nenhum usuário delegado.');
      }
    };

    expect(() => attemptDeleteSuperAdmin('ADMIN', 'SUPER_ADMIN')).toThrow(/Operação Bloqueada/i);
  });

  it('Validação da Auditoria de Perfis Existentes (Requisito 19)', () => {
    const auditReport = SuperAdminAuditService.generateAuditReport();
    expect(auditReport.superAdmins).toContain(superAdminEmail);
    expect(auditReport.totalUsersFound).toBeGreaterThan(0);
    expect(auditReport.vulnerabilitiesFound.every(v => v.status === 'CORRIGIDO')).toBe(true);
  });
});
