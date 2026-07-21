/**
 * InstitutionalEnterpriseService
 * ────────────────────────────────
 * Serviço de dados Enterprise para o módulo institucional.
 * Gerencia coleções extras além do institutionalFirestoreService original:
 *
 * Novas coleções:
 *   • impact_indicators   — Indicadores de impacto configuráveis
 *   • transparency_docs   — Portal de Transparência (documentos versionados)
 *   • institutional_areas — Áreas de atuação geográfica
 *   • org_policies        — Políticas institucionais (Código de Ética, Regimentos)
 *   • org_certifications  — Certificações e selos
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch, limit,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ImpactIndicator {
  id?: string;
  label: string;         // ex: 'Beneficiários Atendidos'
  value: string;         // ex: '1.2M+'
  icon: string;          // emoji ou lucide icon name
  category: 'social' | 'ambiental' | 'educacional' | 'financeiro' | 'alcance';
  ods?: string[];        // ex: ['ODS 1', 'ODS 4']
  description?: string;
  order: number;
  visible: boolean;
  updatedAt?: unknown;
}

export interface TransparencyDocument {
  id?: string;
  title: string;
  category: 'financeiro' | 'relatorio' | 'ata' | 'politica' | 'certificacao' | 'estatuto' | 'convenio' | 'outros';
  year: number;
  fileUrl: string;
  fileSize?: string;
  fileType?: 'PDF' | 'XLSX' | 'DOCX' | 'ZIP';
  description?: string;
  publishedAt: string;   // ISO-8601
  version?: string;      // ex: 'v2.1'
  author?: string;
  tags?: string[];
  downloads?: number;
  digitalSignature?: string;
  visible: boolean;
  updatedAt?: unknown;
}

export interface ActuationArea {
  id?: string;
  state: string;         // ex: 'SP'
  stateName: string;     // ex: 'São Paulo'
  cities: string[];      // ex: ['São Paulo', 'Campinas']
  projectCount: number;
  beneficiaryCount: number;
  programIds?: string[];
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  active: boolean;
  updatedAt?: unknown;
}

export interface OrgPolicy {
  id?: string;
  title: string;
  type: 'codigo_etica' | 'regimento' | 'politica_privacidade' | 'politica_dados' | 'compliance' | 'outros';
  content?: string;      // Texto rico (HTML sanitizado)
  fileUrl?: string;
  version: string;
  effectiveDate: string; // ISO-8601
  approvedBy?: string;
  visible: boolean;
  updatedAt?: unknown;
}

export interface OrgCertification {
  id?: string;
  name: string;          // ex: 'OSCIP', 'Utilidade Pública Federal'
  issuingBody: string;   // ex: 'Ministério da Justiça'
  issuedAt: string;      // ISO-8601
  expiresAt?: string;    // ISO-8601 (null = sem prazo)
  documentUrl?: string;
  badgeImageUrl?: string;
  order: number;
  visible: boolean;
  updatedAt?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const InstitutionalEnterpriseService = {

  // ── Impact Indicators ─────────────────────────────────────────────────

  async getIndicators(): Promise<ImpactIndicator[]> {
    const q = query(collection(db, 'impact_indicators'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<ImpactIndicator>(snap);
  },

  async saveIndicator(data: ImpactIndicator): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'impact_indicators', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'impact_indicators'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteIndicator(id: string): Promise<void> {
    await deleteDoc(doc(db, 'impact_indicators', id));
  },

  async reorderIndicators(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach((id, idx) => {
      batch.update(doc(db, 'impact_indicators', id), { order: idx + 1, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  // ── Transparency Documents ─────────────────────────────────────────────

  async getTransparencyDocs(category?: TransparencyDocument['category']): Promise<TransparencyDocument[]> {
    let q = category
      ? query(collection(db, 'transparency_docs'), where('category', '==', category), orderBy('publishedAt', 'desc'))
      : query(collection(db, 'transparency_docs'), orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<TransparencyDocument>(snap);
  },

  async saveTransparencyDoc(data: TransparencyDocument): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'transparency_docs', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'transparency_docs'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteTransparencyDoc(id: string): Promise<void> {
    await deleteDoc(doc(db, 'transparency_docs', id));
  },

  async incrementDownloads(id: string): Promise<void> {
    const ref = doc(db, 'transparency_docs', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const current = (snap.data().downloads as number) || 0;
      await setDoc(ref, { downloads: current + 1, updatedAt: serverTimestamp() }, { merge: true });
    }
  },

  // ── Actuation Areas ────────────────────────────────────────────────────

  async getActuationAreas(): Promise<ActuationArea[]> {
    const q = query(collection(db, 'institutional_areas'), orderBy('stateName'));
    const snap = await getDocs(q);
    return mapDocs<ActuationArea>(snap);
  },

  async saveActuationArea(data: ActuationArea): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'institutional_areas', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'institutional_areas'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteActuationArea(id: string): Promise<void> {
    await deleteDoc(doc(db, 'institutional_areas', id));
  },

  // ── Org Policies ───────────────────────────────────────────────────────

  async getPolicies(): Promise<OrgPolicy[]> {
    const q = query(collection(db, 'org_policies'), orderBy('effectiveDate', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<OrgPolicy>(snap);
  },

  async savePolicy(data: OrgPolicy): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'org_policies', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'org_policies'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deletePolicy(id: string): Promise<void> {
    await deleteDoc(doc(db, 'org_policies', id));
  },

  // ── Certifications ─────────────────────────────────────────────────────

  async getCertifications(): Promise<OrgCertification[]> {
    const q = query(collection(db, 'org_certifications'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<OrgCertification>(snap);
  },

  async saveCertification(data: OrgCertification): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'org_certifications', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'org_certifications'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteCertification(id: string): Promise<void> {
    await deleteDoc(doc(db, 'org_certifications', id));
  },

  // ── Seed Defaults ──────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    // Default indicators
    const defaultIndicators: Omit<ImpactIndicator, 'id'>[] = [
      { label: 'Beneficiários Atendidos', value: '1.2M+', icon: '👥', category: 'social', ods: ['ODS 1', 'ODS 3'], order: 1, visible: true },
      { label: 'Projetos Ativos', value: '48', icon: '🚀', category: 'social', order: 2, visible: true },
      { label: 'Municípios Atendidos', value: '127', icon: '🏙️', category: 'alcance', order: 3, visible: true },
      { label: 'Parceiros Globais', value: '50+', icon: '🌐', category: 'alcance', order: 4, visible: true },
      { label: 'Voluntários Ativos', value: '2.400', icon: '🙌', category: 'social', order: 5, visible: true },
      { label: 'Investimento Social', value: 'R$ 12.4M', icon: '💰', category: 'financeiro', order: 6, visible: true },
    ];

    for (const ind of defaultIndicators) {
      const ref = doc(collection(db, 'impact_indicators'));
      batch.set(ref, { ...ind, updatedAt: serverTimestamp() });
    }

    // Default certifications
    const defaultCerts: Omit<OrgCertification, 'id'>[] = [
      { name: 'OSCIP', issuingBody: 'Ministério da Justiça', issuedAt: '2010-01-01', order: 1, visible: true },
      { name: 'Utilidade Pública Federal', issuingBody: 'Presidência da República', issuedAt: '2011-06-15', order: 2, visible: true },
      { name: 'Certificação de Entidade Beneficente (CEBAS)', issuingBody: 'MEC / MS / MDS', issuedAt: '2013-03-20', order: 3, visible: true },
    ];

    for (const cert of defaultCerts) {
      const ref = doc(collection(db, 'org_certifications'));
      batch.set(ref, { ...cert, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
