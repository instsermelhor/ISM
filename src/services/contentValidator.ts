/**
 * contentValidator.ts
 * ────────────────────
 * Utilitário de auditoria em tempo de execução.
 * Valida se todo o conteúdo renderizado no site possui origem em coleções
 * ativas do Firestore (Single Source of Truth) ou se está dependendo de fallbacks.
 */

import { getDoc, doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FIREBASE_ENABLED = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

export interface ContentAuditReport {
  timestamp: string;
  firebaseEnabled: boolean;
  totalCollectionsChecked: number;
  activeCollections: string[];
  emptyCollections: string[];
  missingDocuments: string[];
  isFullyIntegrated: boolean;
  issues: string[];
}

const REQUIRED_DOCUMENTS = [
  { collection: 'hero_section', id: 'main', label: 'Hero Capa' },
  { collection: 'institutional_page', id: 'main', label: 'Página Institucional' },
  { collection: 'site_navigation', id: 'main', label: 'Menu Header' },
  { collection: 'site_footer', id: 'main', label: 'Rodapé' },
  { collection: 'seo_settings', id: 'main', label: 'SEO Settings' },
  { collection: 'services_page', id: 'main', label: 'Página de Serviços/Transparência' },
  { collection: 'donation_section', id: 'main', label: 'Seção de Doações' },
];

const REQUIRED_COLLECTIONS = [
  { collection: 'impact_metrics', label: 'Métricas de Impacto' },
  { collection: 'pillars', label: 'Pilares' },
  { collection: 'value_blocks', label: 'Blocos de Valores' },
  { collection: 'governance_instances', label: 'Instâncias de Governança' },
  { collection: 'governance_members', label: 'Membros de Governança' },
  { collection: 'timeline_milestones', label: 'Linha do Tempo' },
  { collection: 'programs', label: 'Programas' },
  { collection: 'blog_posts', label: 'Blog Posts' },
  { collection: 'partners', label: 'Parceiros' },
];

export async function runContentAudit(): Promise<ContentAuditReport> {
  const issues: string[] = [];
  const activeCollections: string[] = [];
  const emptyCollections: string[] = [];
  const missingDocuments: string[] = [];

  if (!FIREBASE_ENABLED) {
    issues.push('VITE_FIREBASE_PROJECT_ID não definido. O site está operando em modo Fallback/Dev Mock.');
    return {
      timestamp: new Date().toISOString(),
      firebaseEnabled: false,
      totalCollectionsChecked: REQUIRED_DOCUMENTS.length + REQUIRED_COLLECTIONS.length,
      activeCollections: [],
      emptyCollections: [],
      missingDocuments: REQUIRED_DOCUMENTS.map(d => `${d.collection}/${d.id}`),
      isFullyIntegrated: false,
      issues,
    };
  }

  // Auditar Documentos Únicos
  for (const item of REQUIRED_DOCUMENTS) {
    try {
      const snap = await getDoc(doc(db, item.collection, item.id));
      if (snap.exists()) {
        activeCollections.push(`${item.collection}/${item.id}`);
      } else {
        missingDocuments.push(`${item.collection}/${item.id}`);
        issues.push(`Documento obrigatório [${item.label}] não existe em ${item.collection}/${item.id}. Usa fallback.`);
      }
    } catch (err: any) {
      issues.push(`Erro ao validar ${item.collection}/${item.id}: ${err.message}`);
    }
  }

  // Auditar Coleções
  for (const item of REQUIRED_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, item.collection));
      if (!snap.empty) {
        activeCollections.push(`${item.collection} (${snap.size} registros)`);
      } else {
        emptyCollections.push(item.collection);
        issues.push(`Coleção [${item.label}] (${item.collection}) está vazia. Usa fallback.`);
      }
    } catch (err: any) {
      issues.push(`Erro ao validar coleção ${item.collection}: ${err.message}`);
    }
  }

  const isFullyIntegrated = issues.length === 0;

  const report: ContentAuditReport = {
    timestamp: new Date().toISOString(),
    firebaseEnabled: true,
    totalCollectionsChecked: REQUIRED_DOCUMENTS.length + REQUIRED_COLLECTIONS.length,
    activeCollections,
    emptyCollections,
    missingDocuments,
    isFullyIntegrated,
    issues,
  };

  if (import.meta.env.DEV) {
    console.group('🔍 Auditoria de Conteúdo Realtime ISM');
    console.log(`Status de Integração: ${isFullyIntegrated ? '✅ FULL STACK INTEGRADO' : '⚠️ ATENÇÃO'}`);
    console.log(`Coleções Ativas: ${activeCollections.length}/${report.totalCollectionsChecked}`);
    if (issues.length > 0) {
      console.warn('Inconsistências detectadas:', issues);
    }
    console.groupEnd();
  }

  return report;
}
