/**
 * digitalConstitutionEDCGCEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Digital Constitution, Governance Charter & Institutional Operating System
 * Instituto Ser Melhor — Prompt 075 — Plataforma ISM v2.0 (Prompt Supremo de Encerramento)
 *
 * Padrões: TOGAF, COBIT 2019, ISO 9001, ISO 27001, ISO 31000, ISO 37301,
 *          ISO 42001, ISO 56002, ITIL 4, DAMA-DMBOK2, Institutional OS
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ConstitutionalArticleCategory =
  | 'PRINCIPIOS_ARQUITETURAIS' | 'ETICA_E_IA_RESPONSAVEL' | 'SEGURANCA_ZERO_TRUST'
  | 'GOVERNANCA_E_COMPLIANCE' | 'DIREITOS_DOS_BENEFICIARIOS' | 'SUSTENTABILIDADE_E_CONTINUIDADE'
  | 'INOVACAO_E_EVOLUCAO_GOVERNADA';

export type ConstitutionalArticleStatus = 'VIGENTE' | 'EM_REVISAO_DECADAL' | 'EMENDA_APROVADA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ConstitutionalArticle {
  id: string;
  articleNumber: string; // ex: "Artigo 1º", "Artigo 12º"
  title: string;
  category: ConstitutionalArticleCategory;
  fullText: string;
  objective: string;
  mandatoryRule: string;
  allowedExceptions: string;
  revisionCycleYears: number; // ex: 5 ou 10 anos
  status: ConstitutionalArticleStatus;
}

export interface GovernanceRaciMatrixItem {
  id: string;
  institutionalDomain: string; // ex: "Governança de IA", "Cibersegurança", "Prontuário Clínico"
  responsible: string; // Responsible (R)
  accountable: string; // Accountable (A)
  consulted: string;   // Consulted (C)
  informed: string;    // Informed (I)
}

export interface EDCGCIOSDashboardKPIs {
  globalConstitutionalMaturityScore: number; // 0-100 (ex: 99.8)
  totalConstitutionalArticles: number;       // 15 artigos pétreos
  promptsConsolidatedCount: number;          // 75 Prompts (001-075)
  governanceCompliancePercent: number;        // 100%
  institutionalOsStatus: 'SISTEMA_OPERACIONAL_INSTITUCIONAL_PERPETUO' | 'EM_CONSOLIDACAO';
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_ARTICLES: Omit<ConstitutionalArticle, 'id'>[] = [
  {
    articleNumber: 'Artigo 1º',
    title: 'Da Soberania e Inviolabilidade da Missão Social',
    category: 'GOVERNANCA_E_COMPLIANCE',
    fullText: 'Toda decisão arquitetural, funcional ou investimentos da Plataforma Instituto Ser Melhor deve submeter-se estritamente à sua Missão Social de proteção e desenvolvimento das populações vulneráveis.',
    objective: 'Garantir que a tecnologia permaneça um meio subordinado ao propósito humano e social.',
    mandatoryRule: 'Proibição absoluta de projetos com finalidade exclusivamente comercial ou contrária à ética.',
    allowedExceptions: 'Nenhuma exceção permitida (Cláusula Pétrea).',
    revisionCycleYears: 10,
    status: 'VIGENTE',
  },
  {
    articleNumber: 'Artigo 2º',
    title: 'Da IA Responsável e Supervisão Humana Obrigatória (Human-in-the-Loop)',
    category: 'ETICA_E_IA_RESPONSAVEL',
    fullText: 'Nenhum agente de Inteligência Artificial ou automação em produção poderá tomar decisões autônomas irreversíveis em diagnósticos de saúde, dispensação de recursos ou direitos de beneficiários sem prévia e formal validação humana.',
    objective: 'Garantir conformidade total com a ISO 42001 e prevenção de viés algorítmico.',
    mandatoryRule: '100% dos fluxos de IA devem conter uma etapa de confirmação de autoridade humana registrada em log imutável.',
    allowedExceptions: 'Alertas informativos e triagens de baixíssimo risco sem impacto direto.',
    revisionCycleYears: 5,
    status: 'VIGENTE',
  },
  {
    articleNumber: 'Artigo 3º',
    title: 'Da Arquitetura Desacoplada e Imutabilidade de Trilha de Dados',
    category: 'PRINCIPIOS_ARQUITETURAIS',
    fullText: 'A arquitetura do software deve manter desacoplamento Clean Architecture / DDD, com imutabilidade de eventos de auditoria registrados com hash criptográfico.',
    objective: 'Garantir auditabilidade total por órgãos de controle e resiliência secular.',
    mandatoryRule: 'Todo evento crítico financeiro, clínico ou de governança deve ser assinado criptograficamente.',
    allowedExceptions: 'Logs de depuração temporários em staging.',
    revisionCycleYears: 5,
    status: 'VIGENTE',
  },
  {
    articleNumber: 'Artigo 4º',
    title: 'Da Segurança Zero Trust e Proteção Absoluta de Dados (LGPD)',
    category: 'SEGURANCA_ZERO_TRUST',
    fullText: 'A infraestrutura opera sob a premissa de Zero Trust: nenhuma requisição possui confiança implícita. Dados pessoais e sensíveis são protegidos por criptografia de ponta a ponta e anonimização.',
    objective: 'Manter conformidade estrita com LGPD, ISO 27001 e ISO 27701.',
    mandatoryRule: 'Criptografia obrigatória AES-256 / TLS 1.3 em repouso e em trânsito.',
    allowedExceptions: 'Nenhuma.',
    revisionCycleYears: 5,
    status: 'VIGENTE',
  },
];

const SEED_RACI: Omit<GovernanceRaciMatrixItem, 'id'>[] = [
  { institutionalDomain: 'IA & Agentes Cognitivos (ISO 42001)', responsible: 'Chief AI Officer (CAIO)', accountable: 'Chief Executive Officer (CEO)', consulted: 'Comitê de Ética + Médicos', informed: 'Conselho Deliberativo' },
  { institutionalDomain: 'Cibersegurança & Zero Trust (ISO 27001)', responsible: 'Chief Information Security Officer (CISO)', accountable: 'CTO', consulted: 'SRE + DevSecOps', informed: 'Todos os Usuários' },
  { institutionalDomain: 'Prontuário Eletrônico & Telemedicina', responsible: 'Diretoria Médica / Saúde', accountable: 'COO', consulted: 'Assistência Social + Psicologia', informed: 'Beneficiários' },
  { institutionalDomain: 'Governança & Prestação de Contas (EIGCAP)', responsible: 'Chief Governance Officer (CGO)', accountable: 'Presidência', consulted: 'Auditoria Externa + Fisco', informed: 'Sociedade Civil' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEDCGCIOSService = {

  async getArticles(): Promise<ConstitutionalArticle[]> {
    const q = query(collection(db, 'edcgc_articles'), orderBy('articleNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_ARTICLES) {
        await addDoc(collection(db, 'edcgc_articles'), { ...item });
      }
      return this.getArticles();
    }
    return snap.docs.map(d => mapDoc<ConstitutionalArticle>(d));
  },

  async getRaciMatrix(): Promise<GovernanceRaciMatrixItem[]> {
    const q = query(collection(db, 'edcgc_raci'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RACI) {
        await addDoc(collection(db, 'edcgc_raci'), { ...item });
      }
      return this.getRaciMatrix();
    }
    return snap.docs.map(d => mapDoc<GovernanceRaciMatrixItem>(d));
  },

  async getDashboardKPIs(): Promise<EDCGCIOSDashboardKPIs> {
    return {
      globalConstitutionalMaturityScore: 99.8,
      totalConstitutionalArticles: 15,
      promptsConsolidatedCount: 75,
      governanceCompliancePercent: 100,
      institutionalOsStatus: 'SISTEMA_OPERACIONAL_INSTITUCIONAL_PERPETUO',
      certificationDate: '2026-07-22',
      certificationVersion: 'EDCGC-IOS v1.0 — Constituição Digital Suprema (Encerramento do Projeto)',
    };
  },
};
