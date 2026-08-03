/**
 * pillarsService.ts
 * ─────────────────
 * CRUD para os pilares institucionais do site.
 * Coleção Firestore: pillars (ordenada por campo "order")
 *
 * Lido pelo site em: src/services/data.ts → InstitutionalService.getPillars()
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PillarKpiData {
  value: string;
  label: string;
}

export interface PillarData {
  id?: string;
  order: number;
  /** ex: "education" | "social" | "environment" | "culture" */
  key: string;
  label: string;
  headline: string;
  description: string;
  longDescription: string;
  /** Identificador de ícone: "book-open" | "users" | "leaf" | "palette" */
  iconKey: string;
  /** Hex color principal */
  color: string;
  /** Hex color light/tint */
  colorLight: string;
  kpis: PillarKpiData[];
  programs: string[];
  ctaHref: string;
  updatedAt?: unknown;
}

export const PILLARS_SEED: Omit<PillarData, 'id'>[] = [
  {
    order: 1,
    key: 'education',
    label: 'Educação',
    headline: 'Formando líderes que transformam o amanhã',
    description: 'Acreditamos que a educação de qualidade é a alavanca mais poderosa para romper ciclos de vulnerabilidade.',
    longDescription: 'Nossos programas de educação cobrem desde a literacia digital para jovens em situação de risco até bolsas de formação continuada para educadores de base. Utilizamos metodologias ativas, tecnologia e mentoria para garantir que cada aluno desenvolva pensamento crítico, competências digitais e protagonismo social.',
    iconKey: 'book-open',
    color: '#1E3A8A',
    colorLight: '#dbeafe',
    kpis: [
      { value: '18.400+', label: 'Estudantes atendidos' },
      { value: '142', label: 'Escolas parceiras' },
      { value: '94%', label: 'Aprovação ensino médio' },
    ],
    programs: ['Bolsas Universitárias', 'Letramento Digital', 'Mentoria de Carreira', 'Formação de Professores'],
    ctaHref: '#programs',
  },
  {
    order: 2,
    key: 'social',
    label: 'Social',
    headline: 'Redes de proteção que ninguém deixa para trás',
    description: 'Construímos pontes entre vulnerabilidade e autonomia, oferecendo suporte integral para famílias em situação de risco.',
    longDescription: 'Desenvolvemos programas de assistência social integrada que combinam suporte psicossocial, geração de renda, capacitação e fortalecimento de vínculos familiares e comunitários. Nossa abordagem reconhece que a superação da vulnerabilidade exige ações múltiplas e coordenadas.',
    iconKey: 'users',
    color: '#C2410C',
    colorLight: '#ffedd5',
    kpis: [
      { value: '12.800+', label: 'Famílias atendidas' },
      { value: '97%', label: 'Índice de satisfação' },
      { value: '3,2x', label: 'Retorno social (SROI)' },
    ],
    programs: ['Assistência Emergencial', 'Capacitação Profissional', 'Renda Solidária', 'Apoio Psicossocial'],
    ctaHref: '#programs',
  },
  {
    order: 3,
    key: 'environment',
    label: 'Meio Ambiente',
    headline: 'Protegendo biomas para as próximas gerações',
    description: 'Nossas ações ambientais integram conservação, restauração ecológica e educação ambiental transformadora.',
    longDescription: 'Desenvolvemos projetos de proteção e restauração de biomas brasileiros, combinando ciência de ponta, tecnologia de monitoramento e participação comunitária. Cada hectare recuperado representa um compromisso com a biodiversidade e com o futuro sustentável do planeta.',
    iconKey: 'leaf',
    color: '#15803D',
    colorLight: '#dcfce7',
    kpis: [
      { value: '120k', label: 'Hectares recuperados' },
      { value: '850k', label: 'Árvores plantadas' },
      { value: '5', label: 'Biomas protegidos' },
    ],
    programs: ['Reflorestamento', 'Educação Ambiental', 'Monitoramento por Satélite', 'Comunidades Sustentáveis'],
    ctaHref: '#programs',
  },
  {
    order: 4,
    key: 'culture',
    label: 'Cultura & Arte',
    headline: 'Arte como ferramenta de transformação social',
    description: 'Acreditamos no poder da cultura e da arte para restaurar identidades, fortalecer comunidades e criar pontes de diálogo.',
    longDescription: 'Nossos programas culturais oferecem acesso democrático à arte, à música, ao teatro e à literatura para comunidades que historicamente foram privadas desse direito. A cultura é para nós um instrumento de emancipação, resistência e construção de identidade.',
    iconKey: 'palette',
    color: '#7C3AED',
    colorLight: '#ede9fe',
    kpis: [
      { value: '200+', label: 'Projetos culturais' },
      { value: '45k+', label: 'Participantes' },
      { value: '18', label: 'Estados alcançados' },
    ],
    programs: ['Arte-Educação', 'Música nas Escolas', 'Teatro Comunitário', 'Biblioteca Viva'],
    ctaHref: '#programs',
  },
];

const COL = () => collection(db, 'pillars');

export const PillarsService = {
  async getAll(): Promise<PillarData[]> {
    const q = query(COL(), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PillarData));
  },

  async getOrSeed(): Promise<PillarData[]> {
    const data = await PillarsService.getAll();
    if (data.length > 0) return data;
    await PillarsService.seedDefaults();
    return PillarsService.getAll();
  },

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    PILLARS_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, { ...item, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  async create(data: Omit<PillarData, 'id'>): Promise<string> {
    const ref = await addDoc(COL(), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async update(id: string, data: Partial<PillarData>): Promise<void> {
    await updateDoc(doc(db, 'pillars', id), { ...data, updatedAt: serverTimestamp() });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'pillars', id));
  },

  async saveAll(pillars: PillarData[]): Promise<void> {
    const batch = writeBatch(db);
    pillars.forEach((p) => {
      if (p.id) {
        const { id, ...rest } = p;
        batch.update(doc(db, 'pillars', id), { ...rest, updatedAt: serverTimestamp() });
      }
    });
    await batch.commit();
  },
};
