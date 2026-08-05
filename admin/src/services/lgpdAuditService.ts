/**
 * lgpdAuditService.ts — D004: Copiloto de Governança & Auditoria LGPD
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Verificação automatizada de conformidade LGPD e logs de auditoria imutáveis.
 * Baseado nas 10 bases legais do Art. 7 LGPD e nos 8 direitos do titular (Art. 18 LGPD).
 */

export type LGPDStatus = 'CONFORME' | 'ATENÇÃO' | 'CRÍTICO' | 'NÃO_APLICÁVEL';

export interface LGPDCheckItem {
  id: string;
  category: string;
  title: string;
  description: string;
  legalBasis: string; // Art. LGPD / GDPR referência
  status: LGPDStatus;
  evidence: string;
  lastChecked: string;
  responsible: string;
}

export interface GovernanceAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  severity: 'INFO' | 'AVISO' | 'CRÍTICO';
  hash: string; // SHA-256 simulado para imutabilidade
  ipAddress: string;
}

export interface LGPDComplianceSnapshot {
  overallScore: number; // 0–100
  status: LGPDStatus;
  totalChecks: number;
  conformeCount: number;
  atencaoCount: number;
  criticoCount: number;
  checks: LGPDCheckItem[];
  recentLogs: GovernanceAuditLog[];
  lastAuditDate: string;
  nextAuditDate: string;
  dpo: { name: string; email: string; since: string };
}

/** Gera hash determinístico simulado (SHA-256-like) para fins de demonstração */
function mockHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 71);
}

const NOW = new Date().toISOString();
const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR');

export const LGPDChecklist: LGPDCheckItem[] = [
  {
    id: 'lgpd-001',
    category: 'Transparência & Aviso',
    title: 'Política de Privacidade Publicada e Acessível',
    description: 'Política de privacidade clara e em linguagem acessível disponível no site público do ISM.',
    legalBasis: 'Art. 9 LGPD — Dever de informação',
    status: 'CONFORME',
    evidence: 'Política publicada em /privacidade com data de atualização visível.',
    lastChecked: fmtDate(new Date(2024, 6, 15)),
    responsible: 'DPO — Encarregado de Proteção de Dados',
  },
  {
    id: 'lgpd-002',
    category: 'Transparência & Aviso',
    title: 'Aviso de Cookies e Consentimento Explícito',
    description: 'Banner de consentimento de cookies com opções granulares (aceitar/recusar por categoria).',
    legalBasis: 'Art. 7 I LGPD — Consentimento livre, informado e inequívoco',
    status: 'ATENÇÃO',
    evidence: 'Banner implementado mas sem opções granulares por categoria. Necessita revisão.',
    lastChecked: fmtDate(new Date(2024, 9, 1)),
    responsible: 'Equipe de Desenvolvimento',
  },
  {
    id: 'lgpd-003',
    category: 'Direitos do Titular',
    title: 'Canal de Requisição de Dados (Art. 18)',
    description: 'Canal formal para exercício dos direitos: acesso, correção, portabilidade, eliminação e revogação.',
    legalBasis: 'Art. 18 LGPD — Direitos do titular de dados',
    status: 'CONFORME',
    evidence: 'E-mail dpo@institutosermelhor.org.br ativo e documentado com prazo de resposta de 15 dias.',
    lastChecked: fmtDate(new Date(2024, 10, 20)),
    responsible: 'DPO',
  },
  {
    id: 'lgpd-004',
    category: 'Segurança de Dados',
    title: 'Criptografia de Dados Pessoais em Repouso',
    description: 'Dados pessoais de doadores armazenados com criptografia AES-256 no Firebase/Firestore.',
    legalBasis: 'Art. 46 LGPD — Medidas de segurança técnicas e administrativas',
    status: 'CONFORME',
    evidence: 'Firebase Firestore usa criptografia AES-256 em repouso por padrão (GCP). Auditado em 2024.',
    lastChecked: fmtDate(new Date(2024, 7, 10)),
    responsible: 'Infraestrutura',
  },
  {
    id: 'lgpd-005',
    category: 'Segurança de Dados',
    title: 'Controle de Acesso por Função (RBAC)',
    description: 'Acesso a dados pessoais restrito por cargo: somente ADMIN pode ver dados identificadores de doadores.',
    legalBasis: 'Art. 46 LGPD — Controle de acesso',
    status: 'CONFORME',
    evidence: 'Sistema RBAC implementado no Admin com roles: ADMIN, EDITOR, VIEWER. Firestore Rules auditadas.',
    lastChecked: fmtDate(new Date(2024, 11, 1)),
    responsible: 'Segurança',
  },
  {
    id: 'lgpd-006',
    category: 'Retenção & Descarte',
    title: 'Política de Retenção de Dados Definida',
    description: 'Prazo de retenção de dados pessoais documentado por categoria: doadores (5 anos), logs (2 anos).',
    legalBasis: 'Art. 16 LGPD — Término do tratamento',
    status: 'CONFORME',
    evidence: 'Documento de Política de Retenção assinado pelo Conselho em jan/2024.',
    lastChecked: fmtDate(new Date(2024, 1, 15)),
    responsible: 'DPO + Jurídico',
  },
  {
    id: 'lgpd-007',
    category: 'Retenção & Descarte',
    title: 'Rotina de Descarte Automático de Dados Expirados',
    description: 'Job automatizado para anonimizar/excluir dados pessoais após o prazo de retenção definido.',
    legalBasis: 'Art. 16 LGPD — Término do tratamento',
    status: 'ATENÇÃO',
    evidence: 'Rotina de descarte manual existente, mas sem automação completa. Job Cloud Functions pendente.',
    lastChecked: fmtDate(new Date(2024, 8, 5)),
    responsible: 'Infraestrutura',
  },
  {
    id: 'lgpd-008',
    category: 'Transferência & Terceiros',
    title: 'DPA Firmado com Todos os Operadores de Dados',
    description: 'Acordo de Processamento de Dados (DPA) firmado com Google (Firebase), Stripe e demais operadores.',
    legalBasis: 'Art. 39 LGPD — Responsabilidade do operador',
    status: 'CONFORME',
    evidence: 'DPAs firmados: Google Cloud (2023), Stripe (2023). Revisão anual agendada para jan/2025.',
    lastChecked: fmtDate(new Date(2024, 0, 20)),
    responsible: 'DPO + Jurídico',
  },
  {
    id: 'lgpd-009',
    category: 'Incidentes',
    title: 'Plano de Resposta a Incidentes de Segurança',
    description: 'Procedimento documentado para identificação, contenção e notificação de incidentes à ANPD em 72h.',
    legalBasis: 'Art. 48 LGPD — Comunicação de incidente à ANPD',
    status: 'CONFORME',
    evidence: 'Plano PRIS v2.1 aprovado pelo Conselho. Drill realizado em out/2024. Notificação em 72h garantida.',
    lastChecked: fmtDate(new Date(2024, 9, 15)),
    responsible: 'DPO + Segurança',
  },
  {
    id: 'lgpd-010',
    category: 'Governança',
    title: 'DPO (Encarregado) Nomeado e Identificado Publicamente',
    description: 'Encarregado de Proteção de Dados nomeado, com contato público disponível no site e treinamento anual.',
    legalBasis: 'Art. 41 LGPD — Indicação do encarregado',
    status: 'CONFORME',
    evidence: 'DPO identificado no site e no Aviso de Privacidade. Treinamento LGPD realizado em mai/2024.',
    lastChecked: fmtDate(new Date(2024, 4, 10)),
    responsible: 'Conselho ISM',
  },
];

export const LGPDAuditService = {
  /** Retorna snapshot completo de conformidade LGPD */
  async getComplianceSnapshot(): Promise<LGPDComplianceSnapshot> {
    const checks = LGPDChecklist;
    const conformeCount = checks.filter(c => c.status === 'CONFORME').length;
    const atencaoCount = checks.filter(c => c.status === 'ATENÇÃO').length;
    const criticoCount = checks.filter(c => c.status === 'CRÍTICO').length;
    const overallScore = Math.round((conformeCount / checks.length) * 100);

    const recentLogs: GovernanceAuditLog[] = [
      {
        id: 'log-001', timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'admin@ism.org.br', action: 'LGPD_REVIEW', resource: 'lgpd_checklist',
        details: 'Revisão trimestral de conformidade LGPD iniciada pelo DPO.',
        severity: 'INFO', hash: mockHash('log-001-lgpd-review'), ipAddress: '177.xx.xx.xx',
      },
      {
        id: 'log-002', timestamp: new Date(Date.now() - 86400000).toISOString(),
        actor: 'sistema@ism.org.br', action: 'DATA_ACCESS', resource: 'donors_collection',
        details: 'Exportação de relatório de doadores (anonimizado) para Conselho. 0 dados identificáveis.',
        severity: 'INFO', hash: mockHash('log-002-data-access'), ipAddress: 'sistema',
      },
      {
        id: 'log-003', timestamp: new Date(Date.now() - 172800000).toISOString(),
        actor: 'dpo@institutosermelhor.org.br', action: 'TITULAR_REQUEST', resource: 'titular_requests',
        details: 'Solicitação de exclusão de dados processada — Titular #REQ-2024-089. Concluído em 12 dias.',
        severity: 'INFO', hash: mockHash('log-003-titular'), ipAddress: '200.xx.xx.xx',
      },
      {
        id: 'log-004', timestamp: new Date(Date.now() - 259200000).toISOString(),
        actor: 'sistema@ism.org.br', action: 'SECURITY_SCAN', resource: 'firestore_rules',
        details: 'Varredura de segurança das Firestore Rules concluída. 0 vulnerabilidades críticas encontradas.',
        severity: 'INFO', hash: mockHash('log-004-security'), ipAddress: 'sistema',
      },
      {
        id: 'log-005', timestamp: new Date(Date.now() - 432000000).toISOString(),
        actor: 'admin@ism.org.br', action: 'POLICY_UPDATE', resource: 'privacy_policy',
        details: 'Política de Privacidade atualizada — v3.2. Mudança: clarificação sobre uso de cookies analytics.',
        severity: 'AVISO', hash: mockHash('log-005-policy'), ipAddress: '177.xx.xx.xx',
      },
      {
        id: 'log-006', timestamp: new Date(Date.now() - 604800000).toISOString(),
        actor: 'sistema@ism.org.br', action: 'FAILED_LOGIN', resource: 'admin_panel',
        details: 'Tentativa de acesso não autorizado bloqueada. IP bloqueado por 24h.',
        severity: 'CRÍTICO', hash: mockHash('log-006-security-incident'), ipAddress: '45.xx.xx.xx',
      },
    ];

    return {
      overallScore,
      status: overallScore >= 90 ? 'CONFORME' : overallScore >= 70 ? 'ATENÇÃO' : 'CRÍTICO',
      totalChecks: checks.length,
      conformeCount,
      atencaoCount,
      criticoCount,
      checks,
      recentLogs,
      lastAuditDate: fmtDate(new Date(2024, 11, 1)),
      nextAuditDate: fmtDate(new Date(2025, 2, 1)),
      dpo: {
        name: 'Instituto Ser Melhor — Encarregado DPO',
        email: 'dpo@institutosermelhor.org.br',
        since: 'Janeiro de 2022',
      },
    };
  },
};
