/**
 * CrmLeadsEnterpriseService
 * ─────────────────────────
 * Serviço de dados Enterprise para CRM de Leads, Lead Scoring, Nutrição e Inteligência Comercial.
 *
 * Coleções gerenciadas:
 *   • enterprise_leads      — Leads completos com score, categoria, canal e opt-in LGPD
 *   • lead_activities       — Registro de interações, e-mails, reuniões e automações
 *   • lead_scoring_rules    — Regras configuráveis de pontuação de leads
 *   • crm_automations       — Fluxos de nutrição automatizados
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type LeadCategory =
  | 'PessoaFisica'
  | 'Empresa'
  | 'Patrocinador'
  | 'Parceiro'
  | 'Voluntario'
  | 'Beneficiario'
  | 'InvestidorSocial'
  | 'Imprensa';

export type LeadStage =
  | 'NOVO'
  | 'QUALIFICADO'
  | 'EM_NUTRICAO'
  | 'APRESENTACAO'
  | 'PROPOSTA'
  | 'CONVERTIDO'
  | 'ARQUIVADO';

export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export interface EnterpriseLead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role?: string;
  category: LeadCategory;
  sourceChannel: 'Site' | 'LandingPage' | 'WhatsApp' | 'Instagram' | 'Evento' | 'Indicação';
  interestArea?: string;      // ex: 'Educação', 'Meio Ambiente'
  odsInterest?: string[];     // ex: ['ODS 4', 'ODS 13']
  stage: LeadStage;
  leadScore: number;          // 0 a 100
  temperature: LeadTemperature;
  lgpdConsent: boolean;
  lgpdConsentDate?: string;   // ISO-8601
  aiSummary?: string;          // Resumo gerado por IA
  nextBestAction?: string;    // Sugestão de próxima melhor ação
  assignedTo?: string;        // E-mail ou Nome do responsável
  notes?: string;
  lastInteractionAt?: string;
  updatedAt?: unknown;
}

export interface LeadActivity {
  id?: string;
  leadId: string;
  type: 'email_enviado' | 'whatsapp' | 'ligacao' | 'reuniao' | 'nota_interna' | 'automacao_disparada';
  title: string;
  description: string;
  performedBy: string;
  createdAt: string;          // ISO-8601
}

export interface CrmAutomationFlow {
  id?: string;
  name: string;
  triggerEvent: string;       // ex: 'lead_created', 'score_above_80'
  actions: string[];
  active: boolean;
  updatedAt?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

export function calculateTemperature(score: number): LeadTemperature {
  if (score >= 80) return 'HOT';
  if (score >= 50) return 'WARM';
  return 'COLD';
}

// ── Service ────────────────────────────────────────────────────────────────

export const CrmLeadsEnterpriseService = {

  // ── Leads ────────────────────────────────────────────────────────────────

  async getLeads(): Promise<EnterpriseLead[]> {
    const q = query(collection(db, 'enterprise_leads'), orderBy('leadScore', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<EnterpriseLead>(snap);
  },

  async saveLead(data: EnterpriseLead): Promise<string> {
    const score = data.leadScore ?? 50;
    const temp = calculateTemperature(score);
    const payload = {
      ...data,
      leadScore: score,
      temperature: temp,
      updatedAt: serverTimestamp(),
    };

    if (data.id) {
      const { id, ...rest } = payload;
      await setDoc(doc(db, 'enterprise_leads', id), rest, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'enterprise_leads'), payload);
    return ref.id;
  },

  async deleteLead(id: string): Promise<void> {
    await deleteDoc(doc(db, 'enterprise_leads', id));
  },

  async updateStage(leadId: string, stage: LeadStage): Promise<void> {
    const ref = doc(db, 'enterprise_leads', leadId);
    await setDoc(ref, { stage, updatedAt: serverTimestamp() }, { merge: true });
  },

  // ── Activities ───────────────────────────────────────────────────────────

  async getActivities(leadId: string): Promise<LeadActivity[]> {
    const q = query(collection(db, 'lead_activities'), where('leadId', '==', leadId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<LeadActivity>(snap);
  },

  async logActivity(data: LeadActivity): Promise<string> {
    const ref = await addDoc(collection(db, 'lead_activities'), data);
    // Atualiza data da última interação no lead
    const leadRef = doc(db, 'enterprise_leads', data.leadId);
    await setDoc(leadRef, { lastInteractionAt: new Date().toISOString(), updatedAt: serverTimestamp() }, { merge: true });
    return ref.id;
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultLeads: Omit<EnterpriseLead, 'id'>[] = [
      {
        name: 'Camila Alcantara',
        email: 'camila@empresa.com.br',
        phone: '(11) 98765-4321',
        companyName: 'Tech For Good Brasil',
        role: 'Diretora de ESG',
        category: 'Patrocinador',
        sourceChannel: 'Site',
        interestArea: 'Educação Regenerativa',
        odsInterest: ['ODS 4', 'ODS 8'],
        stage: 'QUALIFICADO',
        leadScore: 85,
        temperature: 'HOT',
        lgpdConsent: true,
        lgpdConsentDate: '2024-03-10T10:00:00Z',
        aiSummary: 'Empresa de médio porte buscando investimento social focado em capacitação jovem.',
        nextBestAction: 'Agendar videoconferência com o coordenador do Programa Educação Regenerativa.',
        assignedTo: 'instsermelhor.adm@gmail.com',
      },
      {
        name: 'Rodrigo Mendes',
        email: 'rodrigo.mendes@gmail.com',
        phone: '(19) 99123-4567',
        category: 'Voluntario',
        sourceChannel: 'WhatsApp',
        interestArea: 'Reflorestamento',
        odsInterest: ['ODS 13', 'ODS 15'],
        stage: 'EM_NUTRICAO',
        leadScore: 60,
        temperature: 'WARM',
        lgpdConsent: true,
        lgpdConsentDate: '2024-04-01T14:30:00Z',
        aiSummary: 'Profissional autônomo interessado em voluntariado corporativo aos finais de semana.',
        nextBestAction: 'Enviar boletim de voluntariado e formulário de disponibilidade.',
        assignedTo: 'equipe@institutosermelhor.org',
      },
    ];

    for (const lead of defaultLeads) {
      const ref = doc(collection(db, 'enterprise_leads'));
      batch.set(ref, { ...lead, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
