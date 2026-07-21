/**
 * PartnersEnterpriseService
 * ──────────────────────────
 * Serviço de dados Enterprise para CRM Institucional, Gestão de Parceiros, Convênios, Patrocínios e Compliance (KYC).
 *
 * Coleções gerenciadas:
 *   • institutional_partners — Cadastro completo de Parceiros, Empresas, Fundações e Org. Públicos
 *   • partner_agreements     — Convênios, Contratos e Termos de Parceria (com controle de vigência)
 *   • partner_sponsorships  — Patrocínios, Aportes Financeiros e Leis de Incentivo
 *   • crm_deals              — Oportunidades do Pipeline de Captação
 *   • partner_interactions   — Registro de reuniões, e-mails e termos
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type PartnerCategory =
  | 'Empresa'
  | 'Instituto'
  | 'Fundacao'
  | 'OrgaoPublico'
  | 'Universidade'
  | 'OSC'
  | 'DoadorIndividual';

export type DealStage =
  | 'PROSPECAO'
  | 'QUALIFICACAO'
  | 'PROPOSTA'
  | 'ANALISE_JURIDICA'
  | 'FORMALIZACAO'
  | 'EM_EXECUCAO'
  | 'RENOVACAO'
  | 'ENCERRADO';

export interface InstitutionalPartner {
  id?: string;
  cnpjOrCpf?: string;
  companyName: string;         // Razão Social ou Nome
  fantasyName?: string;
  category: PartnerCategory;
  segment?: string;            // ex: 'Bancário', 'Energia', 'Educação'
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  odsSupported?: string[];     // ex: ['ODS 4', 'ODS 13']
  esgScore?: number;           // 0 a 100
  partnerScore?: number;       // Score preditivo de engajamento (0 a 100)
  kycVerified: boolean;        // Due Diligence aprovada
  kycNotes?: string;
  status: 'Ativo' | 'Em Negociação' | 'Inativo' | 'Suspenso';
  logoUrl?: string;
  address?: string;
  updatedAt?: unknown;
}

export interface PartnerAgreement {
  id?: string;
  partnerId: string;
  partnerName: string;
  title: string;               // ex: 'Termo de Fomento 04/2024'
  type: 'Convenio' | 'TermoDeParceria' | 'ContratoDeAporte' | 'AcordoDeCooperacao';
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  totalValue: number;          // Valor do repasse/aporte
  programIds?: string[];
  status: 'Vigente' | 'A_Vencer' | 'Vencido' | 'Em_Renovacao';
  documentUrl?: string;
  responsibles: string[];
  updatedAt?: unknown;
}

export interface PartnerSponsorship {
  id?: string;
  partnerId: string;
  partnerName: string;
  title: string;
  amount: number;
  incentiveLaw?: 'Rouanet' | 'FIA' | 'Idoso' | 'Esporte' | 'Direto';
  deliverables?: string[];     // Contrapartidas de marca
  year: number;
  status: 'Confirmado' | 'Pendente' | 'Recebido';
  updatedAt?: unknown;
}

export interface CrmDeal {
  id?: string;
  partnerId?: string;
  partnerName: string;
  title: string;
  stage: DealStage;
  expectedValue: number;
  probabilityPct: number;     // 0 a 100
  responsibleOwner: string;
  expectedCloseDate: string;  // YYYY-MM-DD
  notes?: string;
  updatedAt?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const PartnersEnterpriseService = {

  // ── Partners ─────────────────────────────────────────────────────────────

  async getPartners(): Promise<InstitutionalPartner[]> {
    const q = query(collection(db, 'institutional_partners'), orderBy('companyName'));
    const snap = await getDocs(q);
    return mapDocs<InstitutionalPartner>(snap);
  },

  async savePartner(data: InstitutionalPartner): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'institutional_partners', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'institutional_partners'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deletePartner(id: string): Promise<void> {
    await deleteDoc(doc(db, 'institutional_partners', id));
  },

  // ── Agreements ───────────────────────────────────────────────────────────

  async getAgreements(partnerId?: string): Promise<PartnerAgreement[]> {
    let q = partnerId
      ? query(collection(db, 'partner_agreements'), where('partnerId', '==', partnerId), orderBy('endDate'))
      : query(collection(db, 'partner_agreements'), orderBy('endDate'));
    const snap = await getDocs(q);
    return mapDocs<PartnerAgreement>(snap);
  },

  async saveAgreement(data: PartnerAgreement): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'partner_agreements', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'partner_agreements'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── CRM Deals ────────────────────────────────────────────────────────────

  async getDeals(): Promise<CrmDeal[]> {
    const q = query(collection(db, 'crm_deals'), orderBy('expectedCloseDate'));
    const snap = await getDocs(q);
    return mapDocs<CrmDeal>(snap);
  },

  async saveDeal(data: CrmDeal): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'crm_deals', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'crm_deals'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async moveDealStage(dealId: string, newStage: DealStage): Promise<void> {
    const ref = doc(db, 'crm_deals', dealId);
    await setDoc(ref, { stage: newStage, updatedAt: serverTimestamp() }, { merge: true });
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultPartners: Omit<InstitutionalPartner, 'id'>[] = [
      {
        cnpjOrCpf: '12.345.678/0001-90',
        companyName: 'Fundação Itaú Social',
        fantasyName: 'Itaú Social',
        category: 'Fundacao',
        segment: 'Investimento Social Privado',
        contactName: 'Beatriz Lima',
        email: 'parcerias@itausocial.org.br',
        website: 'https://itausocial.org.br',
        odsSupported: ['ODS 4', 'ODS 10'],
        esgScore: 92,
        partnerScore: 95,
        kycVerified: true,
        status: 'Ativo',
      },
      {
        cnpjOrCpf: '98.765.432/0001-10',
        companyName: 'Natura Cosméticos S/A',
        fantasyName: 'Natura',
        category: 'Empresa',
        segment: 'Bens de Consumo / ESG',
        contactName: 'Carlos Eduardo Santos',
        email: 'esg@natura.net',
        website: 'https://natura.com.br',
        odsSupported: ['ODS 13', 'ODS 15'],
        esgScore: 98,
        partnerScore: 90,
        kycVerified: true,
        status: 'Ativo',
      },
    ];

    for (const partner of defaultPartners) {
      const ref = doc(collection(db, 'institutional_partners'));
      batch.set(ref, { ...partner, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
