/**
 * sroiService.ts — C003: Calculadora SROI Automatizada
 * ──────────────────────────────────────────────────────
 * Gerencia a configuração SROI (Social Return on Investment) do ISM.
 * Coleção Firestore: sroi_config/main
 *
 * Metodologia: SROI = Σ(ValorSocial Pilar) / InvestimentoTotal
 * Exibição: "R$ 1,00 investido = R$ 4,83 em retorno social"
 */

import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SROIPilar {
  id: string;
  name: string;           // ex: "Educação"
  color: string;          // ex: "#1E3A8A"
  investimento: number;   // R$ investidos no pilar
  retornoSocial: number;  // R$ de valor social gerado
  metodologia: string;    // Descrição da metodologia de cálculo
  ods: string[];          // ex: ["ODS 4", "ODS 8"]
}

export interface SROIConfig {
  pilares: SROIPilar[];
  anoReferencia: number;       // ex: 2024
  periodoMeses: number;        // ex: 12
  organizacaoAuditora: string; // ex: "KPMG Brasil"
  publicadoEm?: string;        // ISO date
  notaMetodologica?: string;   // texto livre
  updatedAt?: unknown;
}

export const SROI_SEED: SROIConfig = {
  anoReferencia: 2024,
  periodoMeses: 12,
  organizacaoAuditora: 'Auditoria Independente ISM',
  notaMetodologica: 'Metodologia SROI baseada nos princípios do SROI Network (UK). Cada R$ 1,00 investido gera R$ 4,83 em valor social mensurável para beneficiários diretos e indiretos, calculado via análise de stakeholders e proxies financeiros validados.',
  publicadoEm: '2025-01-31',
  pilares: [
    {
      id: 'educacao',
      name: 'Educação',
      color: '#1E3A8A',
      investimento: 1_200_000,
      retornoSocial: 6_850_000,
      metodologia: 'Aumento de renda futura + redução de evasão escolar + bolsas geradas',
      ods: ['ODS 4', 'ODS 8', 'ODS 10'],
    },
    {
      id: 'social',
      name: 'Social',
      color: '#D97706',
      investimento: 850_000,
      retornoSocial: 3_920_000,
      metodologia: 'Redução de custos de saúde pública + inclusão produtiva + assistência social evitada',
      ods: ['ODS 1', 'ODS 3', 'ODS 10'],
    },
    {
      id: 'meio_ambiente',
      name: 'Meio Ambiente',
      color: '#15803D',
      investimento: 620_000,
      retornoSocial: 2_980_000,
      metodologia: 'Valoração de serviços ecossistêmicos + carbono sequestrado + hectares protegidos',
      ods: ['ODS 13', 'ODS 15', 'ODS 6'],
    },
    {
      id: 'cultura',
      name: 'Cultura',
      color: '#C2410C',
      investimento: 330_000,
      retornoSocial: 1_050_000,
      metodologia: 'Valoração cultural local + fortalecimento identitário comunitário + geração de renda artística',
      ods: ['ODS 11', 'ODS 17'],
    },
  ],
};

/** Retorna investimento total e retorno social total */
export function calcularSROI(config: SROIConfig): { ratio: number; totalInvestimento: number; totalRetorno: number } {
  const totalInvestimento = config.pilares.reduce((acc, p) => acc + p.investimento, 0);
  const totalRetorno = config.pilares.reduce((acc, p) => acc + p.retornoSocial, 0);
  const ratio = totalInvestimento > 0 ? totalRetorno / totalInvestimento : 0;
  return { ratio, totalInvestimento, totalRetorno };
}

export const SROIService = {
  async get(): Promise<SROIConfig | null> {
    const snap = await getDoc(doc(db, 'sroi_config', 'main'));
    return snap.exists() ? (snap.data() as SROIConfig) : null;
  },

  async getOrSeed(): Promise<SROIConfig> {
    const existing = await SROIService.get();
    if (existing) return existing;
    await SROIService.save(SROI_SEED);
    return SROI_SEED;
  },

  async save(config: SROIConfig): Promise<void> {
    await setDoc(doc(db, 'sroi_config', 'main'), {
      ...config,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
};
