/**
 * governanceMembersService.ts
 * ────────────────────────────
 * CRUD completo e unificado para a gestão de Liderança, Governança e Equipe.
 * Coleção Firestore: governance_members (ordenada por campo "order")
 *
 * Lido em tempo real pelo site em: src/hooks/useRealtimeContent.ts (useRealtimeGovernanceMembers)
 *
 * Suporta todos os requisitos E045:
 *   - Identificação completa, perfil institucional, formação, expertise
 *   - Fotos oficial, alta res, thumbnail com ALT obrigatório (WCAG 2.1 AA)
 *   - Links sociais validados (HTTPS apenas)
 *   - Status (PUBLISHED, DRAFT, ARCHIVED), Destaque, Controle LGPD para contatos
 *   - Reordenação em batch, duplicação e auditoria granular (audit_logs)
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, where, writeBatch, serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type MemberCategory =
  | 'DIRETORIA_EXECUTIVA'
  | 'CONSELHO_DELIBERATIVO'
  | 'CONSELHO_FISCAL'
  | 'CONSELHO_CONSULTIVO'
  | 'COORDENACAO'
  | 'EQUIPE_TECNICA'
  | 'CONSULTOR'
  | 'VOLUNTARIO'
  | 'OUTRO'
  | string;

export type MemberPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface GovernanceMemberAdmin {
  id?: string;
  // Identificação
  name: string;
  socialName?: string;
  role: string;
  shortRole?: string;
  area?: string;
  category?: MemberCategory;
  type?: 'board' | 'executive' | 'advisory' | 'fiscal' | 'coordination' | 'technical' | 'consultant' | 'volunteer' | 'other' | string;

  // Perfil Institucional
  bio: string; // biografia resumida
  shortBio?: string;
  fullBio?: string; // biografia completa para o modal
  academicFormation?: string;
  specializations?: string;
  certifications?: string;
  experience?: string;
  expertise?: string[]; // tags

  // Fotografia & Imagens
  imageUrl: string;
  imageAlt?: string; // Texto alternativo para leitores de tela
  highResImageUrl?: string;
  thumbnailUrl?: string;

  // Informações Institucionais & Exibição
  startDate?: string;
  status: MemberPublicationStatus;
  isPublished: boolean;
  isFeatured?: boolean;
  order: number;
  email?: string;
  phone?: string;
  showPublicContact?: boolean; // Controle LGPD

  // Redes Sociais & Links (HTTPS apenas)
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  lattesUrl?: string;
  orcidUrl?: string;
  researchGateUrl?: string;
  websiteUrl?: string;
  resumeUrl?: string;

  // Auditoria
  createdAt?: unknown;
  updatedAt?: unknown;
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
  | 'CREATE_MEMBER'
  | 'UPDATE_MEMBER'
  | 'DELETE_MEMBER'
  | 'PUBLISH_MEMBER'
  | 'ARCHIVE_MEMBER'
  | 'DRAFT_MEMBER'
  | 'DUPLICATE_MEMBER'
  | 'REORDER_MEMBERS';

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
      entity: 'governance_members',
      entityId,
      description,
      createdAt: serverTimestamp(),
    });
  } catch {
    console.warn('[AuditLog] Falha ao gravar log de auditoria em integrantes:', action, entityId);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const COL = () => collection(db, 'governance_members');

function prepareData(
  data: Omit<GovernanceMemberAdmin, 'id'>,
  userId?: string
): Record<string, unknown> {
  const isPublished = data.status === 'PUBLISHED' || data.isPublished === true;
  return {
    ...data,
    isPublished,
    status: data.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
    linkedinUrl: sanitizeHttpsUrl(data.linkedinUrl),
    instagramUrl: sanitizeHttpsUrl(data.instagramUrl),
    facebookUrl: sanitizeHttpsUrl(data.facebookUrl),
    twitterUrl: sanitizeHttpsUrl(data.twitterUrl),
    youtubeUrl: sanitizeHttpsUrl(data.youtubeUrl),
    lattesUrl: sanitizeHttpsUrl(data.lattesUrl),
    orcidUrl: sanitizeHttpsUrl(data.orcidUrl),
    researchGateUrl: sanitizeHttpsUrl(data.researchGateUrl),
    websiteUrl: sanitizeHttpsUrl(data.websiteUrl),
    resumeUrl: sanitizeHttpsUrl(data.resumeUrl),
    updatedAt: serverTimestamp(),
    ...(userId ? { updatedBy: userId } : {}),
  };
}

// ── Seed Padrão Inicial ───────────────────────────────────────────────────

export const DEFAULT_MEMBERS_SEED: Omit<GovernanceMemberAdmin, 'id'>[] = [
  {
    order: 1,
    name: 'Rikardo Ribeiro',
    role: 'Presidente do Conselho Deliberativo',
    shortRole: 'Presidente CD',
    area: 'Governança Estratégica & Compliance',
    category: 'CONSELHO_DELIBERATIVO',
    type: 'board',
    bio: 'Especialista em Governança Corporativa, ESG e Compliance. Atua na liderança do Conselho Deliberativo, orientando a supervisão estratégica, a gestão de riscos e a garantia da integridade ética da Entidade.',
    fullBio: 'Rikardo Ribeiro possui extensa trajetória em governança corporativa no terceiro setor e no mercado financeiro sustentável. Como Presidente do Conselho Deliberativo do Instituto Ser Melhor, lidera a formulação de diretrizes estratégicas de longo prazo, conformidade com os ODS da ONU e o fortalecimento de programas de integridade e transparência radical.',
    academicFormation: 'Mestre em Governança Corporativa (USP) / Especialização em Sustentabilidade (Cambridge)',
    specializations: 'ESG, Compliance, Gestão de Riscos Sistêmicos, Direitos Humanos',
    certifications: 'IBGC Certified Board Member, ISO 37001 Lead Implementer',
    experience: 'Mais de 18 anos de liderança executiva e em conselhos de administração no Brasil e no exterior.',
    expertise: ['Governança Corporativa', 'Compliance', 'ESG', 'Estratégia'],
    imageUrl: 'https://picsum.photos/400/400?random=1',
    imageAlt: 'Fotografia oficial de Rikardo Ribeiro, Presidente do Conselho Deliberativo',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: true,
    email: 'rikardo.ribeiro@institutosermelhor.org',
    showPublicContact: true,
    linkedinUrl: 'https://linkedin.com/in/rikardoribeiro',
    websiteUrl: 'https://institutosermelhor.org',
  },
  {
    order: 2,
    name: 'Dra. Helena Souza',
    role: 'Diretora Executiva & CEO',
    shortRole: 'CEO',
    area: 'Gestão Operacional & Inovação Social',
    category: 'DIRETORIA_EXECUTIVA',
    type: 'executive',
    bio: 'Bióloga e Doutora em Saúde Pública, com 20 anos de experiência em gestão de programas socioambientais e cooperação internacional.',
    fullBio: 'Dra. Helena Souza conduz a gestão diária e a expansão nacional dos projetos do Instituto Ser Melhor. Ex-consultora de agências da ONU, é pioneira na aplicação de metodologias de avaliação de impacto social SROI e conservação comunitária.',
    academicFormation: 'Doutorado em Saúde Pública (FIOCRUZ) / Pós-Doutorado em Bioeconomia (UFPA)',
    specializations: 'Bioeconomia Amazônica, Métricas SROI, Saúde Comunitária',
    certifications: 'PMI-PMP, PMMI Social Auditor',
    experience: '20+ anos liderando equipes multidisciplinares e projetos socioambientais de grande escala.',
    expertise: ['Inovação Social', 'Bioeconomia', 'SROI', 'Saúde Pública'],
    imageUrl: 'https://picsum.photos/400/400?random=2',
    imageAlt: 'Fotografia oficial de Dra. Helena Souza, Diretora Executiva',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: true,
    email: 'helena.souza@institutosermelhor.org',
    showPublicContact: true,
    linkedinUrl: 'https://linkedin.com/in/helenasouza',
    lattesUrl: 'https://lattes.cnpq.br/1234567890',
  },
  {
    order: 3,
    name: 'Carlos Mendes',
    role: 'Presidente do Conselho Fiscal',
    shortRole: 'Presidente CF',
    area: 'Auditoria & Finanças Sustentáveis',
    category: 'CONSELHO_FISCAL',
    type: 'fiscal',
    bio: 'Economista e auditor independente, especialista em controle interno e prestação de contas no Terceiro Setor.',
    fullBio: 'Carlos Mendes coordena os pareceres financeiros e a supervisão de auditoria independente do Instituto Ser Melhor, assegurando adesão total às normas contábeis internacionais (IFRS) e compliance fiscal.',
    academicFormation: 'Bacharel em Ciências Contábeis (PUC-SP) / MBA em Gestão Financeira (FGV)',
    specializations: 'Auditoria de Terceiro Setor, IFRS, Gestão Tributária',
    certifications: 'CFC Registered Auditor, CVM Accredited Agent',
    experience: '15 anos de atuação em Big 4 de auditoria e conselhos fiscais de fundações sem fins lucrativos.',
    expertise: ['Auditoria', 'Finanças', 'IFRS', 'Controle Interno'],
    imageUrl: 'https://picsum.photos/400/400?random=3',
    imageAlt: 'Fotografia oficial de Carlos Mendes, Presidente do Conselho Fiscal',
    status: 'PUBLISHED',
    isPublished: true,
    isFeatured: false,
    showPublicContact: false,
    linkedinUrl: 'https://linkedin.com/in/carlosmendes',
  },
];

// ── Serviço Principal ──────────────────────────────────────────────────────

export const GovernanceMembersService = {

  /** Lista todos os integrantes ordenados por 'order'. */
  async getAll(): Promise<GovernanceMemberAdmin[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GovernanceMemberAdmin));
    } catch {
      return [];
    }
  },

  /** Lista apenas integrantes publicados no site. */
  async getPublished(): Promise<GovernanceMemberAdmin[]> {
    try {
      const q = query(COL(), where('isPublished', '==', true), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GovernanceMemberAdmin));
    } catch {
      return [];
    }
  },

  /** Lista apenas integrantes destacados. */
  async getFeatured(): Promise<GovernanceMemberAdmin[]> {
    try {
      const published = await GovernanceMembersService.getPublished();
      return published.filter(m => m.isFeatured === true);
    } catch {
      return [];
    }
  },

  /** Lista integrantes por categoria. */
  async getByCategory(category: string): Promise<GovernanceMemberAdmin[]> {
    try {
      const q = query(COL(), where('category', '==', category), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as GovernanceMemberAdmin));
    } catch {
      return [];
    }
  },

  /** Busca integrante por ID. */
  async getById(id: string): Promise<GovernanceMemberAdmin | null> {
    try {
      const snap = await getDoc(doc(db, 'governance_members', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as GovernanceMemberAdmin;
    } catch {
      return null;
    }
  },

  /** Retorna lista existente ou inicializa com seed se vazia. */
  async getOrSeed(): Promise<GovernanceMemberAdmin[]> {
    const items = await GovernanceMembersService.getAll();
    if (items.length > 0) return items;
    await GovernanceMembersService.seedDefaults();
    return GovernanceMembersService.getAll();
  },

  /** Cria novo integrante. */
  async create(data: Omit<GovernanceMemberAdmin, 'id'>, userId?: string): Promise<string> {
    const prepared = prepareData(data, userId);
    if (!prepared.createdAt) prepared.createdAt = serverTimestamp();
    if (userId && !prepared.createdBy) prepared.createdBy = userId;
    const ref = await addDoc(COL(), prepared);
    await writeAuditLog('CREATE_MEMBER', ref.id, `Integrante "${data.name}" criado.`, userId);
    return ref.id;
  },

  /** Atualiza integrante existente. */
  async update(id: string, data: Partial<GovernanceMemberAdmin>, userId?: string): Promise<void> {
    const patch: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    };
    if (data.status !== undefined) {
      patch.isPublished = data.status === 'PUBLISHED';
    }
    if (data.linkedinUrl !== undefined) patch.linkedinUrl = sanitizeHttpsUrl(data.linkedinUrl);
    if (data.instagramUrl !== undefined) patch.instagramUrl = sanitizeHttpsUrl(data.instagramUrl);
    if (data.facebookUrl !== undefined) patch.facebookUrl = sanitizeHttpsUrl(data.facebookUrl);
    if (data.twitterUrl !== undefined) patch.twitterUrl = sanitizeHttpsUrl(data.twitterUrl);
    if (data.youtubeUrl !== undefined) patch.youtubeUrl = sanitizeHttpsUrl(data.youtubeUrl);
    if (data.lattesUrl !== undefined) patch.lattesUrl = sanitizeHttpsUrl(data.lattesUrl);
    if (data.orcidUrl !== undefined) patch.orcidUrl = sanitizeHttpsUrl(data.orcidUrl);
    if (data.researchGateUrl !== undefined) patch.researchGateUrl = sanitizeHttpsUrl(data.researchGateUrl);
    if (data.websiteUrl !== undefined) patch.websiteUrl = sanitizeHttpsUrl(data.websiteUrl);
    if (data.resumeUrl !== undefined) patch.resumeUrl = sanitizeHttpsUrl(data.resumeUrl);

    await updateDoc(doc(db, 'governance_members', id), patch);
    await writeAuditLog('UPDATE_MEMBER', id, `Integrante "${data.name || id}" atualizado.`, userId);
  },

  /** Altera status do integrante. */
  async setStatus(id: string, status: MemberPublicationStatus, userId?: string): Promise<void> {
    await updateDoc(doc(db, 'governance_members', id), {
      status,
      isPublished: status === 'PUBLISHED',
      updatedAt: serverTimestamp(),
      ...(userId ? { updatedBy: userId } : {}),
    });
    const actionMap: Record<MemberPublicationStatus, AuditAction> = {
      PUBLISHED: 'PUBLISH_MEMBER',
      ARCHIVED: 'ARCHIVE_MEMBER',
      DRAFT: 'DRAFT_MEMBER',
    };
    await writeAuditLog(actionMap[status], id, `Status alterado para ${status}.`, userId);
  },

  /** Exclui integrante. */
  async delete(id: string, name?: string, userId?: string): Promise<void> {
    await deleteDoc(doc(db, 'governance_members', id));
    await writeAuditLog('DELETE_MEMBER', id, `Integrante "${name || id}" excluído.`, userId);
  },

  /** Duplica um integrante criando uma cópia em DRAFT. */
  async duplicate(id: string, userId?: string): Promise<string | null> {
    const original = await GovernanceMembersService.getById(id);
    if (!original) return null;
    const { id: _id, ...rest } = original;
    const all = await GovernanceMembersService.getAll();
    const copy: Omit<GovernanceMemberAdmin, 'id'> = {
      ...rest,
      name: `${rest.name} (cópia)`,
      status: 'DRAFT',
      isPublished: false,
      order: all.length + 1,
    };
    const newId = await GovernanceMembersService.create(copy, userId);
    await writeAuditLog('DUPLICATE_MEMBER', newId, `Integrante duplicado de "${original.name}".`, userId);
    return newId;
  },

  /** Reordena lista de integrantes em batch. */
  async reorder(orderedIds: string[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      batch.update(doc(db, 'governance_members', id), {
        order: index + 1,
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      });
    });
    await batch.commit();
    await writeAuditLog('REORDER_MEMBERS', 'batch', `${orderedIds.length} integrantes reordenados.`, userId);
  },

  /** Salva uma lista completa em batch (UPSERT). */
  async saveAll(items: GovernanceMemberAdmin[], userId?: string): Promise<void> {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const order = index + 1;
      const isPublished = item.status === 'PUBLISHED' || item.isPublished === true;
      const prepared = {
        ...item,
        order,
        isPublished,
        status: item.status || (isPublished ? 'PUBLISHED' : 'DRAFT'),
        linkedinUrl: sanitizeHttpsUrl(item.linkedinUrl),
        instagramUrl: sanitizeHttpsUrl(item.instagramUrl),
        facebookUrl: sanitizeHttpsUrl(item.facebookUrl),
        twitterUrl: sanitizeHttpsUrl(item.twitterUrl),
        youtubeUrl: sanitizeHttpsUrl(item.youtubeUrl),
        lattesUrl: sanitizeHttpsUrl(item.lattesUrl),
        orcidUrl: sanitizeHttpsUrl(item.orcidUrl),
        researchGateUrl: sanitizeHttpsUrl(item.researchGateUrl),
        websiteUrl: sanitizeHttpsUrl(item.websiteUrl),
        resumeUrl: sanitizeHttpsUrl(item.resumeUrl),
        updatedAt: serverTimestamp(),
        ...(userId ? { updatedBy: userId } : {}),
      };
      if (item.id) {
        const { id, ...rest } = prepared as GovernanceMemberAdmin;
        batch.update(doc(db, 'governance_members', item.id), rest as Record<string, unknown>);
      } else {
        const ref = doc(COL());
        batch.set(ref, { ...prepared, createdAt: serverTimestamp(), ...(userId ? { createdBy: userId } : {}) });
      }
    });
    await batch.commit();
  },

  /** Popula a coleção com dados iniciais se estiver vazia. */
  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    DEFAULT_MEMBERS_SEED.forEach((item) => {
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
