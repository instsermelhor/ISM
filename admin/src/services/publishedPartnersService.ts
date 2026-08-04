/**
 * publishedPartnersService.ts
 * ─────────────────────────────
 * CRUD completo para parceiros/patrocinadores exibidos no site institucional.
 * Coleção Firestore: partners (ordenada por campo "order")
 *
 * Lido pelo site em: src/hooks/useRealtimeContent.ts (useRealtimePublishedPartners)
 *
 * Campos suportados (E043 — Modelo Unificado):
 *   Identificação, Informações Institucionais, Identidade Visual,
 *   Links (site + redes sociais), Informações da Parceria,
 *   Configuração de Exibição, Auditoria
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, where, writeBatch, serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos ──────────────────────────────────────────────────────────────────

export type PartnerCategory =
  | 'GLOBAL'
  | 'ESTRATEGICO'
  | 'INSTITUCIONAL'
  | 'TECNICO'
  | 'UNIVERSIDADES'
  | 'EMPRESAS'
  | 'ORGANISMOS_INTERNACIONAIS'
  | 'FINANCIADORES'
  | 'OSCS'
  | string;

export type PartnerTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type PartnerStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PartnerType =
  | 'CORPORATIVO'
  | 'ACADEMICO'
  | 'GOVERNAMENTAL'
  | 'OSC_ONG'
  | 'ORGANISMO_INTERNACIONAL'
  | 'INDIVIDUAL'
  | string;

/**
 * Modelo unificado de parceiro — utilizado pelo Site Institucional e pelo Painel Administrativo.
 * Todos os campos de exibição, identidade visual, links e auditoria estão aqui.
 */
export interface PublishedPartnerData {
  // ── Identificação ───────────────────────────────────────────────────────
  id?: string;
  /** Nome oficial / razão social */
  name: string;
  /** Nome fantasia (opcional) */
  fantasyName?: string;
  /** Categoria da parceria */
  category: PartnerCategory;
  /** Tipo de parceiro */
  partnerType?: PartnerType;
  /** Área de atuação */
  area?: string;

  // ── Informações Institucionais ──────────────────────────────────────────
  /** Descrição resumida (até 250 caracteres) */
  description?: string;
  /** Descrição completa */
  fullDescription?: string;
  /** Missão da parceria (opcional) */
  missionStatement?: string;
  /** País de origem */
  country?: string;
  /** Estado */
  state?: string;
  /** Cidade */
  city?: string;

  // ── Identidade Visual ───────────────────────────────────────────────────
  /** URL da logomarca (PNG/JPG/WEBP) */
  logoUrl?: string;
  /** Texto alternativo da logomarca (obrigatório para WCAG 2.1 AA) */
  logoAlt?: string;
  /** URL do logotipo vetorial (SVG) */
  logoSvgUrl?: string;
  /** URL da imagem institucional */
  institutionalImageUrl?: string;

  // ── Links ───────────────────────────────────────────────────────────────
  /** Site oficial (validado: deve começar com https://) */
  websiteUrl?: string;
  /** Instagram */
  instagramUrl?: string;
  /** Facebook */
  facebookUrl?: string;
  /** LinkedIn */
  linkedinUrl?: string;
  /** YouTube */
  youtubeUrl?: string;
  /** X (antigo Twitter) */
  twitterUrl?: string;

  // ── Informações da Parceria ─────────────────────────────────────────────
  /** Data de início da parceria (YYYY-MM-DD) */
  partnershipStartDate?: string;
  /** Objetivos da parceria */
  objectives?: string;
  /** Resultados esperados */
  expectedResults?: string;
  /** IDs dos projetos vinculados */
  linkedProjectIds?: string[];

  // ── Configuração de Exibição ────────────────────────────────────────────
  /** Ordem de exibição */
  order: number;
  /** Parceiro em destaque */
  isFeatured?: boolean;
  /** Exibir na Landing Page */
  showOnLandingPage?: boolean;
  /** Exibir na página institucional */
  showInstitutionalPage?: boolean;
  /** Status de publicação */
  status: PartnerStatus;
  /** Flag de publicação (derivado de status — sincronizado automaticamente) */
  isPublished: boolean;
  /** Nível/tier do parceiro */
  tier: PartnerTier;

  // ── Auditoria ───────────────────────────────────────────────────────────
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  updatedBy?: string;
}

// ── Seed Padrão (sem dependências externas) ────────────────────────────────

export const PARTNERS_SEED: Omit<PublishedPartnerData, 'id'>[] = [
  {
    order: 1,
    name: 'Nações Unidas (ONU)',
    fantasyName: 'ONU',
    category: 'ORGANISMOS_INTERNACIONAIS',
    partnerType: 'ORGANISMO_INTERNACIONAL',
    area: 'Desenvolvimento Sustentável',
    country: 'Suíça',
    city: 'Genebra',
    description: 'Parceiro em Objetivos de Desenvolvimento Sustentável.',
    fullDescription: 'A ONU apoia o Instituto Ser Melhor na implementação dos 17 Objetivos de Desenvolvimento Sustentável, com foco em educação, igualdade e ação climática.',
    logoUrl: '',
    logoAlt: 'Logotipo da Organização das Nações Unidas',
    websiteUrl: 'https://un.org',
    status: 'PUBLISHED',
    isPublished: true,
    tier: 'TIER_1',
    isFeatured: true,
    showOnLandingPage: true,
    showInstitutionalPage: true,
  },
  {
    order: 2,
    name: 'Fundação Global Clima',
    category: 'FINANCIADORES',
    partnerType: 'CORPORATIVO',
    area: 'Meio Ambiente e Clima',
    country: 'Alemanha',
    description: 'Financiamento de bolsas ambientais e inovação climática.',
    logoUrl: '',
    logoAlt: 'Logotipo da Fundação Global Clima',
    websiteUrl: 'https://example.org',
    status: 'PUBLISHED',
    isPublished: true,
    tier: 'TIER_1',
    isFeatured: false,
    showOnLandingPage: true,
    showInstitutionalPage: true,
  },
  {
    order: 3,
    name: 'Aliança para Redução da Pobreza',
    category: 'OSCS',
    partnerType: 'OSC_ONG',
    area: 'Social e Comunitário',
    country: 'Brasil',
    description: 'Desenvolvimento social e apoio psicossocial comunitário.',
    logoUrl: '',
    logoAlt: 'Logotipo da Aliança para Redução da Pobreza',
    websiteUrl: 'https://example.org',
    status: 'PUBLISHED',
    isPublished: true,
    tier: 'TIER_2',
    showOnLandingPage: true,
    showInstitutionalPage: true,
  },
  {
    order: 4,
    name: 'Universidade de São Paulo (USP)',
    fantasyName: 'USP',
    category: 'UNIVERSIDADES',
    partnerType: 'ACADEMICO',
    area: 'Educação e Pesquisa',
    country: 'Brasil',
    state: 'SP',
    city: 'São Paulo',
    description: 'Cooperação acadêmica, pesquisa aplicada e extensão universitária.',
    logoUrl: '',
    logoAlt: 'Logotipo da Universidade de São Paulo',
    websiteUrl: 'https://usp.br',
    status: 'PUBLISHED',
    isPublished: true,
    tier: 'TIER_2',
    showOnLandingPage: true,
    showInstitutionalPage: true,
  },
  {
    order: 5,
    name: 'Empresa Sustentável Global',
    category: 'EMPRESAS',
    partnerType: 'CORPORATIVO',
    area: 'ESG Corporativo',
    country: 'Brasil',
    description: 'Investimento privado social e projetos corporativos ESG.',
    logoUrl: '',
    logoAlt: 'Logotipo da Empresa Sustentável Global',
    websiteUrl: 'https://example.com',
    status: 'PUBLISHED',
    isPublished: true,
    tier: 'TIER_3',
    showOnLandingPage: true,
    showInstitutionalPage: true,
  },
];

// ── Validações ─────────────────────────────────────────────────────────────

/**
 * Valida a URL de um parceiro — aceita apenas https:// ou string vazia.
 */
export function validatePartnerUrl(url?: string): boolean {
  if (!url || url.trim() === '' || url === 'https://') return true;
  return url.startsWith('https://');
}

/**
 * Sanitiza a URL: garante https:// ou retorna undefined.
 */
export function sanitizeUrl(url?: string): string | undefined {
  if (!url || url.trim() === '' || url === 'https://') return undefined;
  if (!url.startsWith('https://')) return undefined;
  return url.trim();
}

// ── Auditoria ─────────────────────────────────────────────────────────────

type AuditAction =
  | 'CREATE_PARTNER'
  | 'UPDATE_PARTNER'
  | 'DELETE_PARTNER'
  | 'PUBLISH_PARTNER'
  | 'ARCHIVE_PARTNER'
  | 'DRAFT_PARTNER'
  | 'DUPLICATE_PARTNER'
  | 'UPLOAD_LOGO'
  | 'UPLOAD_SVG'
  | 'UPLOAD_INSTITUTIONAL_IMAGE'
  | 'REORDER_PARTNERS';

async function writeAuditLog(
  action: AuditAction,
  entityId: string,
  description: string,
  userId = 'admin',
): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      userName: userId,
      action,
      entity: 'partners',
      entityId,
      description,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Auditoria é não-bloqueante
    console.warn('[AuditLog] Falha ao registrar log de auditoria:', action, entityId);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const COL = () => collection(db, 'partners');

function prepareData(
  data: Omit<PublishedPartnerData, 'id'>,
  userId?: string,
): Record<string, unknown> {
  const isPublished = data.status === 'PUBLISHED' || data.isPublished === true;
  return {
    ...data,
    isPublished,
    status: data.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
    websiteUrl: sanitizeUrl(data.websiteUrl),
    instagramUrl: sanitizeUrl(data.instagramUrl),
    facebookUrl: sanitizeUrl(data.facebookUrl),
    linkedinUrl: sanitizeUrl(data.linkedinUrl),
    youtubeUrl: sanitizeUrl(data.youtubeUrl),
    twitterUrl: sanitizeUrl(data.twitterUrl),
    updatedAt: serverTimestamp(),
    ...(userId ? { updatedBy: userId } : {}),
  };
}

// ── Service Principal ──────────────────────────────────────────────────────

export const PublishedPartnersService = {

  // ── Consultas ──────────────────────────────────────────────────────────

  /** Lista todos os parceiros ordenados por 'order'. */
  async getAll(): Promise<PublishedPartnerData[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublishedPartnerData));
    } catch {
      return [];
    }
  },

  /** Lista apenas parceiros publicados (isPublished == true e status == PUBLISHED). */
  async getPublished(): Promise<PublishedPartnerData[]> {
    try {
      const q = query(COL(), where('isPublished', '==', true), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublishedPartnerData));
    } catch {
      return [];
    }
  },

  /** Lista parceiros em destaque (isFeatured == true e publicados). */
  async getFeatured(): Promise<PublishedPartnerData[]> {
    try {
      const all = await PublishedPartnersService.getPublished();
      return all.filter(p => p.isFeatured === true);
    } catch {
      return [];
    }
  },

  /** Lista parceiros por categoria. */
  async getByCategory(category: PartnerCategory): Promise<PublishedPartnerData[]> {
    try {
      const all = await PublishedPartnersService.getPublished();
      return all.filter(p => p.category === category);
    } catch {
      return [];
    }
  },

  /** Busca parceiro por ID. */
  async getById(id: string): Promise<PublishedPartnerData | null> {
    try {
      const snap = await getDoc(doc(db, 'partners', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as PublishedPartnerData;
    } catch {
      return null;
    }
  },

  /** Retorna lista existente ou inicializa com seed. */
  async getOrSeed(): Promise<PublishedPartnerData[]> {
    const items = await PublishedPartnersService.getAll();
    if (items.length > 0) return items;
    await PublishedPartnersService.seedDefaults();
    return PublishedPartnersService.getAll();
  },

  // ── Mutações ───────────────────────────────────────────────────────────

  /** Cria novo parceiro. */
  async create(
    data: Omit<PublishedPartnerData, 'id'>,
    userId?: string,
  ): Promise<string> {
    const prepared = prepareData(data, userId);
    if (!prepared.createdAt) prepared.createdAt = serverTimestamp();
    if (userId && !prepared.createdBy) prepared.createdBy = userId;
    const ref = await addDoc(COL(), prepared);
    await writeAuditLog('CREATE_PARTNER', ref.id, `Parceiro "${data.name}" criado.`, userId);
    return ref.id;
  },

  /** Atualiza parceiro existente. */
  async update(
    id: string,
    data: Partial<PublishedPartnerData>,
    userId?: string,
  ): Promise<void> {
    const patch: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    };
    if (data.status !== undefined) {
      patch.isPublished = data.status === 'PUBLISHED';
    }
    if (data.websiteUrl !== undefined) patch.websiteUrl = sanitizeUrl(data.websiteUrl);
    if (data.instagramUrl !== undefined) patch.instagramUrl = sanitizeUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) patch.facebookUrl = sanitizeUrl(data.facebookUrl);
    if (data.linkedinUrl !== undefined) patch.linkedinUrl = sanitizeUrl(data.linkedinUrl);
    if (data.youtubeUrl !== undefined) patch.youtubeUrl = sanitizeUrl(data.youtubeUrl);
    if (data.twitterUrl !== undefined) patch.twitterUrl = sanitizeUrl(data.twitterUrl);
    await updateDoc(doc(db, 'partners', id), patch);
    await writeAuditLog('UPDATE_PARTNER', id, `Parceiro "${data.name || id}" atualizado.`, userId);
  },

  /** Altera apenas o status do parceiro. */
  async setStatus(
    id: string,
    status: PartnerStatus,
    userId?: string,
  ): Promise<void> {
    await updateDoc(doc(db, 'partners', id), {
      status,
      isPublished: status === 'PUBLISHED',
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    });
    const actionMap: Record<PartnerStatus, AuditAction> = {
      PUBLISHED: 'PUBLISH_PARTNER',
      ARCHIVED: 'ARCHIVE_PARTNER',
      DRAFT: 'DRAFT_PARTNER',
    };
    await writeAuditLog(actionMap[status], id, `Status alterado para ${status}.`, userId);
  },

  /** Exclui parceiro. */
  async delete(id: string, name?: string, userId?: string): Promise<void> {
    await deleteDoc(doc(db, 'partners', id));
    await writeAuditLog('DELETE_PARTNER', id, `Parceiro "${name || id}" excluído.`, userId);
  },

  /**
   * Duplica um parceiro existente, criando uma cópia como DRAFT.
   * @returns ID do novo parceiro criado.
   */
  async duplicate(id: string, userId?: string): Promise<string | null> {
    const original = await PublishedPartnersService.getById(id);
    if (!original) return null;
    const { id: _id, ...rest } = original;
    const all = await PublishedPartnersService.getAll();
    const newPartner: Omit<PublishedPartnerData, 'id'> = {
      ...rest,
      name: `${rest.name} (cópia)`,
      status: 'DRAFT',
      isPublished: false,
      order: all.length + 1,
      createdAt: serverTimestamp(),
    };
    const newId = await PublishedPartnersService.create(newPartner, userId);
    await writeAuditLog('DUPLICATE_PARTNER', newId, `Parceiro duplicado de "${original.name}".`, userId);
    return newId;
  },

  /**
   * Reordena todos os parceiros em lote usando os IDs fornecidos (na nova ordem).
   */
  async reorder(orderedIds: string[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      batch.update(doc(db, 'partners', id), {
        order: index + 1,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      });
    });
    await batch.commit();
    await writeAuditLog('REORDER_PARTNERS', 'batch', `${orderedIds.length} parceiros reordenados.`, userId);
  },

  /**
   * Salva uma lista completa de parceiros em batch (UPSERT + reordenação).
   * Usado pelo formulário do admin ao salvar todos os parceiros de uma vez.
   */
  async saveAll(items: PublishedPartnerData[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const order = index + 1;
      const isPublished = item.status === 'PUBLISHED' || item.isPublished === true;
      const prepared = {
        ...item,
        order,
        isPublished,
        status: item.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
        websiteUrl: sanitizeUrl(item.websiteUrl),
        instagramUrl: sanitizeUrl(item.instagramUrl),
        facebookUrl: sanitizeUrl(item.facebookUrl),
        linkedinUrl: sanitizeUrl(item.linkedinUrl),
        youtubeUrl: sanitizeUrl(item.youtubeUrl),
        twitterUrl: sanitizeUrl(item.twitterUrl),
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      };
      if (item.id) {
        const { id, ...rest } = prepared as PublishedPartnerData;
        batch.update(doc(db, 'partners', item.id), rest as Record<string, unknown>);
      } else {
        const ref = doc(COL());
        batch.set(ref, { ...prepared, createdAt: serverTimestamp(), ...(userId ? { createdBy: userId } : {}) });
      }
    });
    await batch.commit();
  },

  /** Inicializa o Firestore com dados padrão (sem imagens externas). */
  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    PARTNERS_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },
};
