/**
 * heroService.ts
 * ──────────────
 * CRUD para a seção Hero do site institucional.
 * Coleção Firestore: hero_section/main (documento único)
 *
 * Lido pelo site em: src/services/data.ts → InstitutionalService.getHeroData()
 */

import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface CtaButton {
  id: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface ImpactItem {
  id: string;
  text: string;
}

export interface HeroSectionData {
  eyebrowText: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  motto: string;
  mottoExplanation: string;
  stats: StatItem[];
  ctaButtons: CtaButton[];
  donationTitle: string;
  donationSubtitle: string;
  donationBadgeText: string;
  impactItems: ImpactItem[];
  totalRaised: string;
  goalProgress: number;
  goalYear: string;
  pageTitle: string;
  metaDescription: string;
  ogImage: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

export const HERO_SEED: HeroSectionData = {
  eyebrowText: 'Desde 2007 · Transformação Social',
  title: 'Instituto Ser Melhor',
  subtitle: 'Somos uma organização da sociedade civil brasileira que atua como catalisadora de transformações sociais, ambientais, educacionais e culturais, comprometida com a garantia de direitos e o protagonismo das comunidades.',
  heroImageUrl: '',
  motto: 'Sapere Aude',
  mottoExplanation: "Significa 'Ouse Saber'. Reflete nosso compromisso com a educação transformadora e a autonomia intelectual, posicionando o Instituto como promotor do pensamento crítico e da formação cidadã.",
  stats: [
    { id: '1', value: '15+', label: 'Anos de Impacto', icon: '🌿' },
    { id: '2', value: '1M+', label: 'Vidas Impactadas', icon: '👥' },
    { id: '3', value: '50+', label: 'Parceiros Globais', icon: '🌐' },
  ],
  ctaButtons: [
    { id: '1', label: 'Apoie Nossa Missão', href: '#donate', variant: 'primary' },
    { id: '2', label: 'Conheça o Instituto', href: '#mission', variant: 'secondary' },
  ],
  donationTitle: 'Fundo de Sustentabilidade Perpétua',
  donationSubtitle: 'Sua doação não é apenas um ato de caridade; é um investimento direto na transformação sistêmica.',
  donationBadgeText: 'Apoie Agora',
  impactItems: [
    { id: '1', text: 'Financiamento de bolsas para jovens líderes climáticos.' },
    { id: '2', text: 'Proteção de biomas através de tecnologia de monitoramento via satélite.' },
    { id: '3', text: 'Independência total de verbas governamentais.' },
  ],
  totalRaised: 'R$ 12,4M',
  goalProgress: 75,
  goalYear: '2025',
  pageTitle: 'Instituto Ser Melhor — Transformação Social e Sustentabilidade',
  metaDescription: 'O Instituto Ser Melhor é uma ONG brasileira que promove transformações sociais, ambientais, educacionais e culturais. Conheça nossa missão, transparência e como apoiar.',
  ogImage: '',
};

const REF = () => doc(db, 'hero_section', 'main');

export const HeroService = {
  async get(): Promise<HeroSectionData | null> {
    const snap = await getDoc(REF());
    if (!snap.exists()) return null;
    return snap.data() as HeroSectionData;
  },

  async getOrSeed(): Promise<HeroSectionData> {
    const data = await HeroService.get();
    if (data) return data;
    await HeroService.save(HERO_SEED, 'system');
    return HERO_SEED;
  },

  async save(data: Partial<HeroSectionData>, userId = 'admin'): Promise<void> {
    await setDoc(REF(), {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }, { merge: true });
  },
};
