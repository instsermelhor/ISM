/**
 * blogService.ts
 * ──────────────
 * CRUD para posts de blog e artigos institucionais.
 * Coleção Firestore: blog_posts (ordenada por publicado em / createdAt)
 *
 * Lido pelo site em: src/services/data.ts
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, writeBatch, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface BlogPostData {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  publishedAt?: string | null;
  scheduledFor?: string | null;
  readTimeMinutes: number;
  featured?: boolean;
  viewsCount?: number;
  updatedAt?: unknown;
  createdAt?: unknown;
}

export const BLOG_SEED: Omit<BlogPostData, 'id'>[] = [
  {
    title: 'Relatório de Impacto Socioambiental 2024: Transformando Desafios em Soluções Regenerativas',
    slug: 'relatorio-de-impacto-socioambiental-2024',
    summary: 'Apresentamos os resultados alcançados pelo Instituto Ser Melhor no último ano, destacando mais de 32 mil vidas impactadas e 120 mil hectares de bioma protegidos.',
    content: 'O ano de 2024 marcou um ponto de virada histórico na trajetória do Instituto Ser Melhor. Expandimos nossa atuação para 78 municípios, fortalecendo a Metodologia M-IS de emancipação humana integral. Por meio de nossos programas em Educação, Assistência Social, Preservação de Biomas e Cultura, alcançamos métricas inéditas de Retorno Social sobre o Investimento (SROI de R$ 4,85 para cada R$ 1,00 investido).',
    coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
    author: { name: 'Rikardo Ribeiro', role: 'Presidente Executivo', avatarUrl: 'https://picsum.photos/200/200?random=1' },
    category: 'Relatório de Impacto',
    tags: ['Transparência', 'ESG', 'SROI', 'Sustentabilidade'],
    status: 'PUBLISHED',
    publishedAt: new Date('2024-12-15').toISOString(),
    readTimeMinutes: 6,
    featured: true,
    viewsCount: 1420,
  },
  {
    title: 'Projeto AURA: Cuidado Mental Preventivo e Suporte Psicossocial nas Comunidades',
    slug: 'projeto-aura-cuidado-mental-preventivo',
    summary: 'Conheça o modelo integrativo de acolhimento psicossocial do Projeto AURA, focado no fortalecimento emocional e quebra de ciclos de vulnerabilidade.',
    content: 'Saúde mental é um direito humano fundamental e pilar indispensável para o desenvolvimento social. O Projeto AURA atua diretamente com populações vulneráveis e agentes públicos, oferecendo suporte emocional humanizado, rodas de conversa, terapia comunitária e práticas integrativas.',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    author: { name: 'Equipe de Saúde AURA', role: 'Núcleo Psicossocial', avatarUrl: '' },
    category: 'Saúde & Bem-Estar',
    tags: ['Saúde Mental', 'AURA', 'Assistência Social'],
    status: 'PUBLISHED',
    publishedAt: new Date('2025-01-20').toISOString(),
    readTimeMinutes: 4,
    featured: false,
    viewsCount: 890,
  },
];

const COL = () => collection(db, 'blog_posts');

export const BlogService = {
  async getAll(): Promise<BlogPostData[]> {
    try {
      const q = query(COL(), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPostData));
    } catch {
      return [];
    }
  },

  async getPublished(): Promise<BlogPostData[]> {
    try {
      const q = query(COL(), where('status', '==', 'PUBLISHED'), orderBy('publishedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPostData));
    } catch {
      return [];
    }
  },

  async getBySlug(slug: string): Promise<BlogPostData | null> {
    try {
      const q = query(COL(), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as BlogPostData;
    } catch {
      return null;
    }
  },

  async getOrSeed(): Promise<BlogPostData[]> {
    const posts = await BlogService.getAll();
    if (posts.length > 0) return posts;
    await BlogService.seedDefaults();
    return BlogService.getAll();
  },

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    BLOG_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  async create(data: Omit<BlogPostData, 'id'>): Promise<string> {
    const ref = await addDoc(COL(), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(id: string, data: Partial<BlogPostData>): Promise<void> {
    await updateDoc(doc(db, 'blog_posts', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'blog_posts', id));
  },
};
