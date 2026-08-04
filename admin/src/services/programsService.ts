/**
 * programsService.ts
 * ──────────────────
 * CRUD completo e unificado para a gestão de Programas e Projetos em Campo.
 * Coleção Firestore: programs (ordenada por campo "order")
 *
 * Lido em tempo real pelo site em: src/hooks/useRealtimeContent.ts (useRealtimePrograms)
 *
 * Suporta todos os requisitos E044:
 *   - Conteúdo rico, pilares, linhas de atuação, compromisso, métricas
 *   - Imagem principal, banner, galeria múltipla com ALT e legenda
 *   - Links externos validados (Site oficial, Projeto AURA, Documentos, Relatórios, Formulário)
 *   - Status (PUBLISHED, DRAFT, ARCHIVED), Destaque, Exibição na Landing Page
 *   - Reordenação por batch, duplicação e auditoria granular (audit_logs)
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, where, writeBatch, serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ProgramPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProgramGalleryImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  order: number;
}

export interface ProgramDataAdmin {
  id?: string;
  code?: string;
  order: number;
  title: string;
  subtitle?: string;
  slug: string;
  category?: 'Educacao' | 'MeioAmbiente' | 'Cultura' | 'Emancipacao' | 'DireitosHumanos' | string;
  thematicArea?: string;
  stage?: string;

  // Conteúdo
  description: string;
  longDescription?: string;
  objectives?: string;
  targetAudience?: string;
  methodology?: string;
  pillarsTitle?: string;
  pillars?: string[];
  actionLinesTitle?: string;
  actionLinesSub?: string;
  actionLines?: string[];
  expectedResults?: string;
  commitmentTitle?: string;
  commitment?: string;

  // Indicadores
  impactMetric?: string;
  impactValue?: string;
  tags?: string[];
  iconEmoji?: string;

  // Imagens
  imageUrl?: string;
  imageAlt?: string;
  bannerUrl?: string;
  gallery?: ProgramGalleryImage[];

  // Links (HTTPS)
  websiteUrl?: string;
  institutionalPageUrl?: string;
  auraProjectUrl?: string;
  documentsUrl?: string;
  reportsUrl?: string;
  participationFormUrl?: string;

  // CTAs legados
  ctaLabel?: string;
  ctaUrl?: string;
  linkUrl?: string;
  linkLabel?: string;

  // Status & Exibição
  isFeatured?: boolean;
  showOnLandingPage?: boolean;
  status: ProgramPublicationStatus;
  isPublished: boolean;
  publishedAt?: unknown;
  updatedAt?: unknown;

  // SEO & Auditoria
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ── Validações & Sanitização ──────────────────────────────────────────────

export function validateHttpsUrl(url?: string): boolean {
  if (!url || url.trim() === '' || url === 'https://') return true;
  return url.startsWith('https://');
}

export function sanitizeHttpsUrl(url?: string): string | undefined {
  if (!url || url.trim() === '' || url === 'https://') return undefined;
  if (!url.startsWith('https://')) return undefined;
  return url.trim();
}

// ── Auditoria ─────────────────────────────────────────────────────────────

type AuditAction =
  | 'CREATE_PROGRAM'
  | 'UPDATE_PROGRAM'
  | 'DELETE_PROGRAM'
  | 'PUBLISH_PROGRAM'
  | 'ARCHIVE_PROGRAM'
  | 'DRAFT_PROGRAM'
  | 'DUPLICATE_PROGRAM'
  | 'REORDER_PROGRAMS';

async function writeAuditLog(
  action: AuditAction,
  entityId: string,
  description: string,
  userId = 'admin'
): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      userName: userId,
      action,
      entity: 'programs',
      entityId,
      description,
      createdAt: serverTimestamp(),
    });
  } catch {
    console.warn('[AuditLog] Falha ao gravar log de auditoria em programas:', action, entityId);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const COL = () => collection(db, 'programs');

function prepareData(
  data: Omit<ProgramDataAdmin, 'id'>,
  userId?: string
): Record<string, unknown> {
  const isPublished = data.status === 'PUBLISHED' || data.isPublished === true;
  return {
    ...data,
    isPublished,
    status: data.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
    websiteUrl: sanitizeHttpsUrl(data.websiteUrl),
    auraProjectUrl: sanitizeHttpsUrl(data.auraProjectUrl),
    documentsUrl: sanitizeHttpsUrl(data.documentsUrl),
    reportsUrl: sanitizeHttpsUrl(data.reportsUrl),
    participationFormUrl: sanitizeHttpsUrl(data.participationFormUrl),
    institutionalPageUrl: sanitizeHttpsUrl(data.institutionalPageUrl),
    ctaUrl: sanitizeHttpsUrl(data.ctaUrl),
    linkUrl: sanitizeHttpsUrl(data.linkUrl),
    updatedAt: serverTimestamp(),
    ...(userId ? { updatedBy: userId } : {}),
  };
}

// ── Seed Padrão Inicial ───────────────────────────────────────────────────

export const DEFAULT_PROGRAMS_SEED: Omit<ProgramDataAdmin, 'id'>[] = [
  {
    order: 1,
    title: 'Educação para o Futuro (M-IS)',
    slug: 'educacao-para-o-futuro',
    category: 'Educacao',
    thematicArea: 'Educação Integral & Inovação',
    description: 'Transformando a educação pública através da Metodologia Ser Melhor, promovendo tecnologia, letramento digital e competências socioemocionais.',
    longDescription: 'O programa Educação para o Futuro é a principal iniciativa finalística do Instituto Ser Melhor para fortalecer a educação pública brasileira.\n\nAtuamos diretamente na formação continuada de educadores, estruturação de laboratórios de inovação e desenvolvimento de competências socioemocionais em estudantes da educação básica.',
    iconEmoji: '🎓',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: true,
    showOnLandingPage: true,
    targetAudience: 'Estudantes da rede pública (6 a 18 anos) e educadores.',
    impactMetric: 'Estudantes Impactados',
    impactValue: '12.450',
    auraProjectUrl: 'https://ism.org/aura/educacao',
    pillarsTitle: 'Nossos pilares de atuação',
    pillars: [
      'Formação continuada de professores e gestores escolares',
      'Inclusão digital e laboratórios de tecnologia sustentável',
      'Desenvolvimento socioemocional e projeto de vida'
    ],
    actionLinesTitle: 'Linhas de atuação estratégica',
    actionLinesSub: 'Estruturação pedagógica com métricas de aprendizagem contínua',
    actionLines: [
      'Capacitação presencial e híbrida com certificação acadêmica',
      'Doação de materiais didáticos e kits tecnológicos'
    ],
    commitmentTitle: 'Nosso compromisso',
    commitment: 'Garantir educação inclusiva, equitativa e de qualidade, promovendo oportunidades de aprendizagem ao longo da vida para todos.',
    tags: ['Educação', 'Tecnologia', 'ODS 4', 'Socioemocional'],
  },
  {
    order: 2,
    title: 'Amazônia Viva & Regenerativa',
    slug: 'amazonia-viva-regenerativa',
    category: 'MeioAmbiente',
    thematicArea: 'Justiça Climática & Conservação',
    description: 'Projetos de conservação ambiental, reflorestamento de áreas degradadas e bioeconomia sustentável para comunidades tradicionais.',
    longDescription: 'Iniciativa voltada para a preservação do bioma amazônico e capacitação de comunidades locais em sistemas agroflorestais regenerativos.',
    iconEmoji: '🌱',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: true,
    showOnLandingPage: true,
    targetAudience: 'Comunidades ribeirinhas, indígenas e produtores rurais.',
    impactMetric: 'Hectares Regenerados',
    impactValue: '3.500 ha',
    auraProjectUrl: 'https://ism.org/aura/amazonia',
    pillarsTitle: 'Eixos estratégicos',
    pillars: [
      'Reflorestamento com espécies nativas e agrofloresta',
      'Fortalecimento de cooperativas de bioeconomia',
      'Monitoramento de carbono e biodiversidade'
    ],
    tags: ['Meio Ambiente', 'ODS 13', 'ODS 15', 'ESG'],
  },
  {
    order: 3,
    title: 'Emancipação Social & Renda',
    slug: 'emancipacao-social-renda',
    category: 'Emancipacao',
    thematicArea: 'Desenvolvimento Comunitário',
    description: 'Apoio ao empreendedorismo periférico, capacitação profissional e inclusão produtiva para famílias em situação de vulnerabilidade.',
    longDescription: 'Iniciativa voltada ao empoderamento econômico e social através de microcrédito orientado, cursos profissionalizantes e incubação de negócios sociais.',
    iconEmoji: '💼',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: false,
    showOnLandingPage: true,
    targetAudience: 'Mulheres chefes de família e jovens periféricos.',
    impactMetric: 'Famílias Emancipadas',
    impactValue: '4.800',
    tags: ['Empreendedorismo', 'ODS 1', 'ODS 8', 'Autonomia'],
  },
];

// ── Serviço Principal ──────────────────────────────────────────────────────

export const ProgramsService = {

  /** Lista todos os programas ordenados por 'order'. */
  async getAll(): Promise<ProgramDataAdmin[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramDataAdmin));
    } catch {
      return [];
    }
  },

  /** Lista apenas programas publicados. */
  async getPublished(): Promise<ProgramDataAdmin[]> {
    try {
      const q = query(COL(), where('isPublished', '==', true), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramDataAdmin));
    } catch {
      return [];
    }
  },

  /** Lista apenas programas destacados. */
  async getFeatured(): Promise<ProgramDataAdmin[]> {
    try {
      const published = await ProgramsService.getPublished();
      return published.filter(p => p.isFeatured === true);
    } catch {
      return [];
    }
  },

  /** Busca programa por ID. */
  async getById(id: string): Promise<ProgramDataAdmin | null> {
    try {
      const snap = await getDoc(doc(db, 'programs', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as ProgramDataAdmin;
    } catch {
      return null;
    }
  },

  /** Retorna lista existente ou inicializa com seed se vazia. */
  async getOrSeed(): Promise<ProgramDataAdmin[]> {
    const items = await ProgramsService.getAll();
    if (items.length > 0) return items;
    await ProgramsService.seedDefaults();
    return ProgramsService.getAll();
  },

  /** Cria novo programa. */
  async create(data: Omit<ProgramDataAdmin, 'id'>, userId?: string): Promise<string> {
    const prepared = prepareData(data, userId);
    if (!prepared.createdAt) prepared.publishedAt = serverTimestamp();
    if (userId && !prepared.createdBy) prepared.createdBy = userId;
    const ref = await addDoc(COL(), prepared);
    await writeAuditLog('CREATE_PROGRAM', ref.id, `Programa "${data.title}" criado.`, userId);
    return ref.id;
  },

  /** Atualiza programa existente. */
  async update(id: string, data: Partial<ProgramDataAdmin>, userId?: string): Promise<void> {
    const patch: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    };
    if (data.status !== undefined) {
      patch.isPublished = data.status === 'PUBLISHED';
    }
    if (data.websiteUrl !== undefined) patch.websiteUrl = sanitizeHttpsUrl(data.websiteUrl);
    if (data.auraProjectUrl !== undefined) patch.auraProjectUrl = sanitizeHttpsUrl(data.auraProjectUrl);
    if (data.documentsUrl !== undefined) patch.documentsUrl = sanitizeHttpsUrl(data.documentsUrl);
    if (data.reportsUrl !== undefined) patch.reportsUrl = sanitizeHttpsUrl(data.reportsUrl);
    if (data.participationFormUrl !== undefined) patch.participationFormUrl = sanitizeHttpsUrl(data.participationFormUrl);

    await updateDoc(doc(db, 'programs', id), patch);
    await writeAuditLog('UPDATE_PROGRAM', id, `Programa "${data.title || id}" atualizado.`, userId);
  },

  /** Altera status do programa. */
  async setStatus(id: string, status: ProgramPublicationStatus, userId?: string): Promise<void> {
    await updateDoc(doc(db, 'programs', id), {
      status,
      isPublished: status === 'PUBLISHED',
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    });
    const actionMap: Record<ProgramPublicationStatus, AuditAction> = {
      PUBLISHED: 'PUBLISH_PROGRAM',
      ARCHIVED: 'ARCHIVE_PROGRAM',
      DRAFT: 'DRAFT_PROGRAM',
    };
    await writeAuditLog(actionMap[status], id, `Status alterado para ${status}.`, userId);
  },

  /** Exclui programa. */
  async delete(id: string, title?: string, userId?: string): Promise<void> {
    await deleteDoc(doc(db, 'programs', id));
    await writeAuditLog('DELETE_PROGRAM', id, `Programa "${title || id}" excluído.`, userId);
  },

  /** Duplica um programa existente criando uma cópia em DRAFT. */
  async duplicate(id: string, userId?: string): Promise<string | null> {
    const original = await ProgramsService.getById(id);
    if (!original) return null;
    const { id: _id, ...rest } = original;
    const all = await ProgramsService.getAll();
    const copy: Omit<ProgramDataAdmin, 'id'> = {
      ...rest,
      title: `${rest.title} (cópia)`,
      slug: `${rest.slug}-copia-${Date.now()}`,
      status: 'DRAFT',
      isPublished: false,
      order: all.length + 1,
      publishedAt: serverTimestamp(),
    };
    const newId = await ProgramsService.create(copy, userId);
    await writeAuditLog('DUPLICATE_PROGRAM', newId, `Programa duplicado de "${original.title}".`, userId);
    return newId;
  },

  /** Reordena lista de programas em batch. */
  async reorder(orderedIds: string[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      batch.update(doc(db, 'programs', id), {
        order: index + 1,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      });
    });
    await batch.commit();
    await writeAuditLog('REORDER_PROGRAMS', 'batch', `${orderedIds.length} programas reordenados.`, userId);
  },

  /** Salva uma lista completa de programas em batch (UPSERT). */
  async saveAll(items: ProgramDataAdmin[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const order = index + 1;
      const isPublished = item.status === 'PUBLISHED' || item.isPublished === true;
      const prepared = {
        ...item,
        order,
        isPublished,
        status: item.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
        websiteUrl: sanitizeHttpsUrl(item.websiteUrl),
        auraProjectUrl: sanitizeHttpsUrl(item.auraProjectUrl),
        documentsUrl: sanitizeHttpsUrl(item.documentsUrl),
        reportsUrl: sanitizeHttpsUrl(item.reportsUrl),
        participationFormUrl: sanitizeHttpsUrl(item.participationFormUrl),
        institutionalPageUrl: sanitizeHttpsUrl(item.institutionalPageUrl),
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      };
      if (item.id) {
        const { id, ...rest } = prepared as ProgramDataAdmin;
        batch.update(doc(db, 'programs', item.id), rest as Record<string, unknown>);
      } else {
        const ref = doc(COL());
        batch.set(ref, { ...prepared, publishedAt: serverTimestamp(), ...(userId ? { createdBy: userId } : {}) });
      }
    });
    await batch.commit();
  },

  /** Popula a coleção com dados iniciais padrão se estiver vazia. */
  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    DEFAULT_PROGRAMS_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, {
        ...item,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  /** Busca programa por slug. */
  async getBySlug(slug: string): Promise<ProgramDataAdmin | null> {
    try {
      const q = query(COL(), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as ProgramDataAdmin;
    } catch {
      return null;
    }
  },

  /** Lista programas por categoria. */
  async getByCategory(category: string): Promise<ProgramDataAdmin[]> {
    try {
      const q = query(COL(), where('category', '==', category), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramDataAdmin));
    } catch {
      return [];
    }
  },

  /** Lista programas publicados, em destaque, para exibição na Landing Page. */
  async getFeaturedForLandingPage(): Promise<ProgramDataAdmin[]> {
    try {
      const published = await ProgramsService.getPublished();
      return published.filter(p => p.isFeatured === true && p.showOnLandingPage !== false);
    } catch {
      return [];
    }
  },

  /** Atualiza status de múltiplos programas em batch. */
  async batchStatusUpdate(
    ids: string[],
    status: ProgramPublicationStatus,
    userId?: string
  ): Promise<void> {
    const batch = writeBatch(db);
    const isPublished = status === 'PUBLISHED';
    ids.forEach(id => {
      batch.update(doc(db, 'programs', id), {
        status,
        isPublished,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      });
    });
    await batch.commit();
    await writeAuditLog('REORDER_PROGRAMS', 'batch', `${ids.length} programas → status ${status}.`, userId);
  },
};
