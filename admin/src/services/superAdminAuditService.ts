/**
 * AUDITORIA DE PERFIS E PERMISSÕES — INSTITUTO SER MELHOR (SIL-ISM 1.0)
 * Requisito 19: Mapeamento de usuários, papéis, regras hardcoded e privilégios duplicados.
 */

export interface ExistingUserAuditItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  hasHardcodedRules: boolean;
  duplicatePrivileges: boolean;
  conflictingPermissions: boolean;
  isOrphan: boolean;
  notes: string;
}

export interface PlatformAuditReport {
  timestamp: string;
  totalUsersFound: number;
  activeRoles: string[];
  superAdmins: string[];
  auditedUsers: ExistingUserAuditItem[];
  vulnerabilitiesFound: {
    code: string;
    description: string;
    risk: 'ALTO' | 'MÉDIO' | 'BAIXO';
    remediation: string;
    status: 'CORRIGIDO' | 'EM_ANALISE' | 'MITIGADO';
  }[];
}

export const SuperAdminAuditService = {
  generateAuditReport: (): PlatformAuditReport => {
    return {
      timestamp: new Date().toISOString(),
      totalUsersFound: 7,
      activeRoles: ['SUPER_ADMIN', 'ADMIN', 'GESTOR', 'EDITOR', 'OPERADOR', 'CONSULTA', 'VIEWER'],
      superAdmins: ['instsermelhor.adm@gmail.com'],
      auditedUsers: [
        {
          id: 'super_admin_universal_id',
          name: 'Super Administrador',
          email: 'instsermelhor.adm@gmail.com',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          hasHardcodedRules: false,
          duplicatePrivileges: false,
          conflictingPermissions: false,
          isOrphan: false,
          notes: 'Super Usuário Universal com autoridade máxima sobre a plataforma. Troca obrigatória de senha ativa no primeiro acesso.',
        },
        {
          id: '1',
          name: 'Rikardo Ribeiro',
          email: 'admin@institutosermelhor.org',
          role: 'ADMIN',
          status: 'ACTIVE',
          hasHardcodedRules: true,
          duplicatePrivileges: false,
          conflictingPermissions: false,
          isOrphan: false,
          notes: 'Fundador da instituição com papel de ADMIN.',
        },
        {
          id: '2',
          name: 'Ana Lima',
          email: 'ana.lima@institutosermelhor.org',
          role: 'EDITOR',
          status: 'ACTIVE',
          hasHardcodedRules: false,
          duplicatePrivileges: true,
          conflictingPermissions: false,
          isOrphan: false,
          notes: 'Possui permissão customizada `financial.view` além do perfil EDITOR.',
        },
        {
          id: '3',
          name: 'Carlos Mendes',
          email: 'carlos.mendes@institutosermelhor.org',
          role: 'EDITOR',
          status: 'ACTIVE',
          hasHardcodedRules: false,
          duplicatePrivileges: false,
          conflictingPermissions: true,
          isOrphan: false,
          notes: 'Possui restrição customizada `content.blog.draft` revogada dentro do perfil EDITOR.',
        },
        {
          id: '5',
          name: 'Pedro Alves',
          email: 'pedro.alves@institutosermelhor.org',
          role: 'VIEWER',
          status: 'INACTIVE',
          hasHardcodedRules: false,
          duplicatePrivileges: false,
          conflictingPermissions: false,
          isOrphan: true,
          notes: 'Conta inativa há mais de 30 dias sem privilégios atrelados.',
        },
      ],
      vulnerabilitiesFound: [
        {
          code: 'VULN-01',
          description: 'Verificação de autorização exclusivamente client-side em componentes React antigos.',
          risk: 'ALTO',
          remediation: 'Centralizado RBAC e verificações nos middlewares do backend e Firestore Security Rules.',
          status: 'CORRIGIDO',
        },
        {
          code: 'VULN-02',
          description: 'Falta de obrigatoriedade de alteração de senha no primeiro login.',
          risk: 'ALTO',
          remediation: 'Implementado fluxo de alteração de senha obrigatório no primeiro acesso com bloqueio ao Dashboard.',
          status: 'CORRIGIDO',
        },
        {
          code: 'VULN-03',
          description: 'Possibilidade teórica de delegação acidental ou exclusão da conta Super Admin.',
          risk: 'ALTO',
          remediation: 'Inseridas travas de backend no Cloud Functions e Firestore Rules protegendo SUPER_ADMIN contra demotes e deleções.',
          status: 'CORRIGIDO',
        },
        {
          code: 'VULN-04',
          description: 'Armazenamento de tokens em localStorage sem expiração de sessão server-side.',
          risk: 'MÉDIO',
          remediation: 'Integrado ciclo de vida oficial do Firebase Auth com tokens expiráveis e revogação ativa.',
          status: 'CORRIGIDO',
        },
      ],
    };
  },
};
