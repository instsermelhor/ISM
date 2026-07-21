/**
 * CommunicationEnterpriseService
 * ─────────────────────────────────
 * Serviço Enterprise para Gestão de Comunicação, Marketing Digital,
 * Conteúdo Institucional, Campanhas de Engajamento e Analytics de Alcance.
 *
 * Coleções Firestore gerenciadas:
 *   • comm_campaigns       — Campanhas de comunicação multicanal
 *   • comm_content         — Biblioteca de conteúdo (posts, releases, newsletters)
 *   • comm_newsletters     — Disparos de newsletter e métricas de e-mail
 *   • comm_social_posts    — Agenda e publicações de redes sociais
 *   • comm_analytics       — KPIs consolidados de alcance e engajamento
 *   • comm_media_contacts  — Cadastro de contatos de imprensa e influenciadores
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch, limit,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos & Interfaces ────────────────────────────────────────────────────────

export type CampaignChannel =
  | 'Email' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'LinkedIn'
  | 'Twitter' | 'YouTube' | 'TikTok' | 'Site' | 'Imprensa' | 'SMS';

export type CampaignStatus =
  | 'RASCUNHO' | 'AGENDADA' | 'EM_EXECUCAO' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA';

export type ContentType =
  | 'Post' | 'Release' | 'Newsletter' | 'Video' | 'Podcast' | 'Infografico'
  | 'Relatorio' | 'Depoimento' | 'Galeria' | 'Stories' | 'Reels';

export type ContentStatus = 'RASCUNHO' | 'REVISAO' | 'APROVADO' | 'PUBLICADO' | 'ARQUIVADO';

export interface CommunicationCampaign {
  id?: string;
  title: string;
  objective: string;              // ex: 'Captação de Doadores', 'Divulgação de Programa'
  channels: CampaignChannel[];
  status: CampaignStatus;
  targetAudience: string;
  startDate: string;              // YYYY-MM-DD
  endDate: string;
  budget?: number;
  programId?: string;             // Programa vinculado (opcional)
  donationCampaignId?: string;    // Campanha de doação vinculada (opcional)

  // Metas e resultados
  goalReach: number;              // meta de alcance
  goalEngagement: number;         // meta de engajamento
  actualReach?: number;
  actualEngagement?: number;
  actualConversions?: number;
  roi?: number;                   // Return on Investment da campanha

  // Conteúdo
  contentIds: string[];           // Ids de conteúdo vinculados
  hashtags: string[];
  ctaUrl?: string;

  responsibleId: string;
  responsibleName: string;
  lgpdCompliant: boolean;
  notes?: string;
  updatedAt?: unknown;
}

export interface CommContent {
  id?: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  campaignId?: string;
  programId?: string;
  body: string;                   // Texto completo do conteúdo
  excerpt?: string;               // Resumo para preview
  imageUrl?: string;
  videoUrl?: string;
  scheduledAt?: string;           // YYYY-MM-DDTHH:mm
  publishedAt?: string;
  channels: CampaignChannel[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  authorId: string;
  authorName: string;
  reviewerId?: string;
  reviewerName?: string;
  // Métricas pós-publicação
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  commentCount?: number;
  clickCount?: number;
  updatedAt?: unknown;
}

export interface NewsletterDispatch {
  id?: string;
  subject: string;
  previewText?: string;
  contentId?: string;
  campaignId?: string;
  recipientSegment: string;       // ex: 'Todos os doadores', 'Voluntários ativos'
  recipientCount: number;
  scheduledAt: string;            // YYYY-MM-DDTHH:mm
  sentAt?: string;
  // Métricas
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  bouncedCount?: number;
  unsubscribedCount?: number;
  openRate?: number;
  clickRate?: number;
  status: 'AGENDADO' | 'ENVIANDO' | 'ENVIADO' | 'FALHOU';
  authorName: string;
  lgpdCompliant: boolean;
  updatedAt?: unknown;
}

export interface SocialPost {
  id?: string;
  contentId?: string;
  campaignId?: string;
  channel: CampaignChannel;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  hashtags: string[];
  scheduledAt: string;            // YYYY-MM-DDTHH:mm
  publishedAt?: string;
  status: 'RASCUNHO' | 'AGENDADO' | 'PUBLICADO' | 'FALHOU';
  externalPostUrl?: string;
  // Métricas
  reach?: number;
  impressions?: number;
  engagements?: number;
  clicks?: number;
  shares?: number;
  saves?: number;
  authorName: string;
  updatedAt?: unknown;
}

export interface MediaContact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  outlet: string;                 // Veículo / Portal / Canal
  type: 'Jornalista' | 'Influenciador' | 'Blogger' | 'Podcast' | 'TV' | 'Radio' | 'Agencia';
  niche: string[];                // ex: ['Terceiro Setor', 'Educação', 'Saúde']
  reach?: number;                 // Seguidores/audiência estimada
  active: boolean;
  lgpdConsent: boolean;
  lastContactAt?: string;
  notes?: string;
  updatedAt?: unknown;
}

export interface CommAnalyticsSnapshot {
  id?: string;
  period: string;                 // ex: '2025-07'
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  totalClicks: number;
  totalConversions: number;
  totalLeadsGenerated: number;
  emailOpenRate: number;
  emailClickRate: number;
  instagramFollowers: number;
  facebookFollowers: number;
  linkedinFollowers: number;
  youtubeSubscribers: number;
  websiteVisitors: number;
  websiteSessions: number;
  websiteBounceRate: number;
  pressMentions: number;
  updatedAt?: unknown;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ───────────────────────────────────────────────────────────────────

export const CommunicationEnterpriseService = {

  // ── Campaigns ────────────────────────────────────────────────────────────

  async getCampaigns(): Promise<CommunicationCampaign[]> {
    const snap = await getDocs(query(collection(db, 'comm_campaigns'), orderBy('startDate', 'desc')));
    return mapDocs<CommunicationCampaign>(snap);
  },

  async getCampaignsByStatus(status: CampaignStatus): Promise<CommunicationCampaign[]> {
    const snap = await getDocs(query(
      collection(db, 'comm_campaigns'),
      where('status', '==', status),
      orderBy('startDate', 'desc'),
    ));
    return mapDocs<CommunicationCampaign>(snap);
  },

  async saveCampaign(data: CommunicationCampaign): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_campaigns', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_campaigns'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteCampaign(id: string): Promise<void> {
    await deleteDoc(doc(db, 'comm_campaigns', id));
  },

  // ── Content Library ───────────────────────────────────────────────────────

  async getContents(campaignId?: string): Promise<CommContent[]> {
    const q = campaignId
      ? query(collection(db, 'comm_content'), where('campaignId', '==', campaignId), orderBy('updatedAt', 'desc'))
      : query(collection(db, 'comm_content'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<CommContent>(snap);
  },

  async saveContent(data: CommContent): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_content', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_content'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteContent(id: string): Promise<void> {
    await deleteDoc(doc(db, 'comm_content', id));
  },

  // ── Newsletters ───────────────────────────────────────────────────────────

  async getNewsletters(): Promise<NewsletterDispatch[]> {
    const snap = await getDocs(query(collection(db, 'comm_newsletters'), orderBy('scheduledAt', 'desc')));
    return mapDocs<NewsletterDispatch>(snap);
  },

  async saveNewsletter(data: NewsletterDispatch): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_newsletters', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_newsletters'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Social Posts ──────────────────────────────────────────────────────────

  async getSocialPosts(channel?: CampaignChannel): Promise<SocialPost[]> {
    const q = channel
      ? query(collection(db, 'comm_social_posts'), where('channel', '==', channel), orderBy('scheduledAt', 'desc'))
      : query(collection(db, 'comm_social_posts'), orderBy('scheduledAt', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<SocialPost>(snap);
  },

  async saveSocialPost(data: SocialPost): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_social_posts', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_social_posts'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteSocialPost(id: string): Promise<void> {
    await deleteDoc(doc(db, 'comm_social_posts', id));
  },

  // ── Media Contacts ────────────────────────────────────────────────────────

  async getMediaContacts(): Promise<MediaContact[]> {
    const snap = await getDocs(query(collection(db, 'comm_media_contacts'), orderBy('name')));
    return mapDocs<MediaContact>(snap);
  },

  async saveMediaContact(data: MediaContact): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_media_contacts', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_media_contacts'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteMediaContact(id: string): Promise<void> {
    await deleteDoc(doc(db, 'comm_media_contacts', id));
  },

  // ── Analytics Snapshots ───────────────────────────────────────────────────

  async getAnalyticsHistory(periods?: number): Promise<CommAnalyticsSnapshot[]> {
    const q = periods
      ? query(collection(db, 'comm_analytics'), orderBy('period', 'desc'), limit(periods))
      : query(collection(db, 'comm_analytics'), orderBy('period', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<CommAnalyticsSnapshot>(snap);
  },

  async saveAnalyticsSnapshot(data: CommAnalyticsSnapshot): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'comm_analytics', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'comm_analytics'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Dashboard KPIs ────────────────────────────────────────────────────────

  async getDashboardKPIs(): Promise<{
    activeCampaigns: number;
    scheduledPosts: number;
    contentPending: number;
    latestAnalytics: CommAnalyticsSnapshot | null;
    recentContent: CommContent[];
  }> {
    const [campaigns, posts, contents, analytics] = await Promise.all([
      getDocs(query(collection(db, 'comm_campaigns'), where('status', 'in', ['AGENDADA', 'EM_EXECUCAO']))),
      getDocs(query(collection(db, 'comm_social_posts'), where('status', '==', 'AGENDADO'))),
      getDocs(query(collection(db, 'comm_content'), where('status', 'in', ['RASCUNHO', 'REVISAO']))),
      getDocs(query(collection(db, 'comm_analytics'), orderBy('period', 'desc'), limit(1))),
    ]);

    const recentContents = await getDocs(
      query(collection(db, 'comm_content'), where('status', '==', 'PUBLICADO'), orderBy('publishedAt', 'desc'), limit(5))
    );

    return {
      activeCampaigns: campaigns.size,
      scheduledPosts: posts.size,
      contentPending: contents.size,
      latestAnalytics: analytics.empty ? null : { id: analytics.docs[0].id, ...analytics.docs[0].data() } as CommAnalyticsSnapshot,
      recentContent: mapDocs<CommContent>(recentContents),
    };
  },

  // ── Seed Defaults ─────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultCampaigns: Omit<CommunicationCampaign, 'id'>[] = [
      {
        title: 'Campanha Dia das Crianças 2025 — Impacto em Movimento',
        objective: 'Captação de Doadores e Divulgação de Impacto',
        channels: ['Instagram', 'Facebook', 'WhatsApp', 'Email'],
        status: 'CONCLUIDA',
        targetAudience: 'Doadores Pessoa Física, 25–55 anos, SP e região',
        startDate: '2025-09-15',
        endDate: '2025-10-12',
        budget: 3500,
        goalReach: 50000,
        goalEngagement: 5000,
        actualReach: 68200,
        actualEngagement: 7430,
        actualConversions: 312,
        roi: 4.2,
        contentIds: [],
        hashtags: ['#InstitutoSerMelhor', '#DiadasCriancas', '#ImpactoSocial'],
        ctaUrl: 'https://institutosermelhor.org/doe',
        responsibleId: 'comm-01',
        responsibleName: 'Equipe de Comunicação ISM',
        lgpdCompliant: true,
        notes: 'Superou meta de alcance em 36%. Melhor campanha do semestre.',
      },
      {
        title: 'Relatório de Impacto 2025 — Divulgação Anual',
        objective: 'Transparência Institucional e Prestação de Contas Pública',
        channels: ['LinkedIn', 'Site', 'Email', 'Imprensa'],
        status: 'EM_EXECUCAO',
        targetAudience: 'Parceiros, Financiadores, Setor Público, Sociedade Civil',
        startDate: '2025-11-01',
        endDate: '2025-12-31',
        budget: 1800,
        goalReach: 20000,
        goalEngagement: 2000,
        contentIds: [],
        hashtags: ['#RelatorioImpacto2025', '#TransparenciaISM', '#ImpactoSocial'],
        ctaUrl: 'https://institutosermelhor.org/transparencia',
        responsibleId: 'comm-01',
        responsibleName: 'Equipe de Comunicação ISM',
        lgpdCompliant: true,
      },
    ];

    const defaultAnalytics: Omit<CommAnalyticsSnapshot, 'id'> = {
      period: '2025-10',
      totalReach: 89400,
      totalImpressions: 212000,
      totalEngagements: 11350,
      totalClicks: 4820,
      totalConversions: 428,
      totalLeadsGenerated: 157,
      emailOpenRate: 38.4,
      emailClickRate: 12.7,
      instagramFollowers: 14200,
      facebookFollowers: 8760,
      linkedinFollowers: 3120,
      youtubeSubscribers: 1240,
      websiteVisitors: 18500,
      websiteSessions: 23700,
      websiteBounceRate: 42.1,
      pressMentions: 7,
    };

    for (const camp of defaultCampaigns) {
      const ref = doc(collection(db, 'comm_campaigns'));
      batch.set(ref, { ...camp, updatedAt: serverTimestamp() });
    }

    const analyticsRef = doc(collection(db, 'comm_analytics'));
    batch.set(analyticsRef, { ...defaultAnalytics, updatedAt: serverTimestamp() });

    await batch.commit();
  },
};
