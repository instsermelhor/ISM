/**
 * FinancialEnterpriseService
 * ──────────────────────────
 * Serviço de dados Enterprise para Controladoria, Contabilidade ITG 2002, Contas a Pagar/Receber,
 * Orçamento por Projeto, Conciliação Bancária e Prestação de Contas.
 *
 * Coleções gerenciadas:
 *   • chart_of_accounts     — Plano de Contas ITG 2002 / NBC TSP
 *   • enterprise_payable    — Contas a Pagar (NF, Fornecedor, Aprovações)
 *   • enterprise_receivable — Contas a Receber (Doações, Convênios, Patrocínios)
 *   • project_budgets       — Orçamento e Execução por Projeto
 *   • accountability_dossiers — Dossiês de Prestação de Contas
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChartOfAccountItem {
  id?: string;
  code: string;               // ex: '1.1.1.01'
  name: string;               // ex: 'Bancos Conta Movimento'
  type: 'SINTETICA' | 'ANALITICA';
  nature: 'DEVEDORA' | 'CREDORA';
  category: 'ATIVO' | 'PASSIVO' | 'PATRIMONIO_SOCIAL' | 'RECEITA' | 'DESPESA';
  itg2002Code?: string;
  order: number;
}

export interface PayableEntry {
  id?: string;
  invoiceNumber: string;       // NF ou recibo
  supplierName: string;
  supplierDocument: string;    // CNPJ / CPF
  costCenterId: string;        // ID do projeto/programa
  costCenterName: string;
  chartAccountCode: string;    // Código da conta contábil
  description: string;
  amount: number;
  dueDate: string;             // YYYY-MM-DD
  paymentDate?: string;
  status: 'PENDENTE' | 'APROVADO' | 'PAGO' | 'CANCELADO';
  approvalRoleRequired?: string; // ex: 'DIRECTOR_FINANCIAL'
  approvedBy?: string;
  documentUrl?: string;
  updatedAt?: unknown;
}

export interface ReceivableEntry {
  id?: string;
  sourceType: 'DOACAO_PF' | 'PATROCINIO_PJ' | 'CONVENIO_GOV' | 'RECEITA_FINANCEIRA';
  payerName: string;
  payerDocument?: string;
  chartAccountCode: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate?: string;
  status: 'CONFIRMADO' | 'PENDENTE' | 'ATRASADO';
  paymentMethod: 'PIX' | 'BOLETO' | 'TRANSFERENCIA' | 'CARTAO';
  reconciled: boolean;
  bankTransactionId?: string;
  updatedAt?: unknown;
}

export interface ProjectBudget {
  id?: string;
  projectId: string;
  projectName: string;
  plannedAmount: number;
  executedAmount: number;
  committedAmount: number;     // Empenhado
  balance: number;
  year: number;
  updatedAt?: unknown;
}

export interface AccountabilityDossier {
  id?: string;
  agreementId: string;
  title: string;
  period: string;              // ex: '2024-Q1'
  totalRevenue: number;
  totalExpense: number;
  documentsCount: number;
  status: 'EM_ELABORACAO' | 'ENVIADO_AUDITORIA' | 'APROVADO' | 'REJEITADO';
  auditorOpinion?: string;
  generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const FinancialEnterpriseService = {

  // ── Chart of Accounts ─────────────────────────────────────────────────────

  async getChartOfAccounts(): Promise<ChartOfAccountItem[]> {
    const q = query(collection(db, 'chart_of_accounts'), orderBy('code'));
    const snap = await getDocs(q);
    return mapDocs<ChartOfAccountItem>(snap);
  },

  async saveAccountItem(data: ChartOfAccountItem): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'chart_of_accounts', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'chart_of_accounts'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Payable ───────────────────────────────────────────────────────────────

  async getPayables(): Promise<PayableEntry[]> {
    const q = query(collection(db, 'enterprise_payable'), orderBy('dueDate'));
    const snap = await getDocs(q);
    return mapDocs<PayableEntry>(snap);
  },

  async savePayable(data: PayableEntry): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'enterprise_payable', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'enterprise_payable'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Receivable ────────────────────────────────────────────────────────────

  async getReceivables(): Promise<ReceivableEntry[]> {
    const q = query(collection(db, 'enterprise_receivable'), orderBy('dueDate'));
    const snap = await getDocs(q);
    return mapDocs<ReceivableEntry>(snap);
  },

  async saveReceivable(data: ReceivableEntry): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'enterprise_receivable', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'enterprise_receivable'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Seed Defaults (ITG 2002) ──────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultAccounts: Omit<ChartOfAccountItem, 'id'>[] = [
      { code: '1', name: 'ATIVO', type: 'SINTETICA', nature: 'DEVEDORA', category: 'ATIVO', order: 1 },
      { code: '1.1', name: 'Ativo Circulante', type: 'SINTETICA', nature: 'DEVEDORA', category: 'ATIVO', order: 2 },
      { code: '1.1.1', name: 'Caixa e Bancos', type: 'ANALITICA', nature: 'DEVEDORA', category: 'ATIVO', itg2002Code: '1.1.1.01', order: 3 },
      { code: '2', name: 'PASSIVO E PATRIMÔNIO SOCIAL', type: 'SINTETICA', nature: 'CREDORA', category: 'PASSIVO', order: 4 },
      { code: '3', name: 'RECEITAS INSTITUCIONAIS', type: 'SINTETICA', nature: 'CREDORA', category: 'RECEITA', order: 5 },
      { code: '3.1', name: 'Doações Sem Restrição', type: 'ANALITICA', nature: 'CREDORA', category: 'RECEITA', itg2002Code: '3.1.1.01', order: 6 },
      { code: '4', name: 'DESPESAS COM PROGRAMAS SOCIAIS', type: 'SINTETICA', nature: 'DEVEDORA', category: 'DESPESA', order: 7 },
      { code: '4.1', name: 'Custos Direitos de Projetos', type: 'ANALITICA', nature: 'DEVEDORA', category: 'DESPESA', itg2002Code: '4.1.1.01', order: 8 },
    ];

    for (const acc of defaultAccounts) {
      const ref = doc(collection(db, 'chart_of_accounts'));
      batch.set(ref, { ...acc, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
