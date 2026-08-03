/**
 * navigationService.ts
 * ─────────────────────
 * CRUD para menus de navegação e dados do rodapé do site.
 *
 * Coleções Firestore:
 *   site_navigation/main — menu do Header
 *   site_footer/main     — dados do Footer (links, contato, redes sociais)
 *
 * Lido pelo site em: src/services/data.ts
 */

import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos de Navegação ────────────────────────────────────────────────────────

export interface NavSubItem {
  id: string;
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  subItems?: NavSubItem[];
}

export interface SiteNavigationData {
  items: NavItem[];
  updatedAt?: unknown;
  updatedBy?: string;
}

// ── Tipos do Footer ───────────────────────────────────────────────────────────

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok';
  url: string;
  label: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
}

export interface SiteFooterData {
  organizationName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  copyrightText: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

// ── Seeds ─────────────────────────────────────────────────────────────────────

export const NAV_SEED: SiteNavigationData = {
  items: [
    {
      id: '1',
      label: 'Quem Somos',
      subItems: [
        { id: '1a', label: 'Nossa Missão', href: '#mission' },
        { id: '1b', label: 'História', href: '#history' },
        { id: '1c', label: 'Símbolos e Rede', href: '#identity' },
        { id: '1d', label: 'Governança & Equipe', href: '#governance' },
      ],
    },
    {
      id: '2',
      label: 'O Que Fazemos',
      subItems: [
        { id: '2a', label: 'Nossos Princípios', href: '#values' },
        { id: '2b', label: 'Projetos em Campo', href: '#programs' },
        { id: '2c', label: 'Notícias', href: '#blog' },
      ],
    },
    {
      id: '3',
      label: 'Transparência',
      href: '#transparency',
    },
  ],
};

export const FOOTER_SEED: SiteFooterData = {
  organizationName: 'Instituto Ser Melhor',
  tagline: 'Trabalhando desde 2007 para conectar pessoas, natureza e sustentabilidade em prol de um futuro regenerativo.',
  email: 'contato@institutosermelhor.org',
  phone: '',
  address: '',
  cnpj: '',
  socialLinks: [
    { id: '1', platform: 'instagram', url: 'https://instagram.com/institutosermelhor', label: 'Instagram' },
    { id: '2', platform: 'facebook', url: 'https://facebook.com/institutosermelhor', label: 'Facebook' },
    { id: '3', platform: 'linkedin', url: 'https://linkedin.com/company/institutosermelhor', label: 'LinkedIn' },
    { id: '4', platform: 'twitter', url: 'https://twitter.com/instsermelhor', label: 'Twitter / X' },
  ],
  columns: [
    {
      id: 'institucional',
      title: 'Institucional',
      links: [
        { id: 'i1', label: 'Nossa Missão', href: '#mission' },
        { id: 'i2', label: 'Nossa História', href: '#history' },
        { id: 'i3', label: 'Equipe & Governança', href: '#governance' },
        { id: 'i4', label: 'Transparência', href: '#transparency' },
      ],
    },
    {
      id: 'programas',
      title: 'Programas',
      links: [
        { id: 'p1', label: 'Educação', href: '#programs' },
        { id: 'p2', label: 'Meio Ambiente', href: '#programs' },
        { id: 'p3', label: 'Social', href: '#programs' },
        { id: 'p4', label: 'Projeto AURA', href: '#programs' },
      ],
    },
    {
      id: 'participe',
      title: 'Participe',
      links: [
        { id: 'pa1', label: 'Doe Agora', href: '#donate' },
        { id: 'pa2', label: 'Seja Parceiro', href: '#partner' },
        { id: 'pa3', label: 'Voluntariado', href: '#' },
        { id: 'pa4', label: 'Contato', href: '#contact' },
      ],
    },
  ],
  copyrightText: 'Instituto Ser Melhor. CNPJ: —. Todos os direitos reservados.',
};

// ── Service ───────────────────────────────────────────────────────────────────

export const NavigationService = {
  // ── Header Navigation ──

  async getNavigation(): Promise<SiteNavigationData | null> {
    const snap = await getDoc(doc(db, 'site_navigation', 'main'));
    if (!snap.exists()) return null;
    return snap.data() as SiteNavigationData;
  },

  async getOrSeedNavigation(): Promise<SiteNavigationData> {
    const data = await NavigationService.getNavigation();
    if (data) return data;
    await NavigationService.saveNavigation(NAV_SEED, 'system');
    return NAV_SEED;
  },

  async saveNavigation(data: SiteNavigationData, userId = 'admin'): Promise<void> {
    await setDoc(doc(db, 'site_navigation', 'main'), {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }, { merge: true });
  },

  // ── Footer ──

  async getFooter(): Promise<SiteFooterData | null> {
    const snap = await getDoc(doc(db, 'site_footer', 'main'));
    if (!snap.exists()) return null;
    return snap.data() as SiteFooterData;
  },

  async getOrSeedFooter(): Promise<SiteFooterData> {
    const data = await NavigationService.getFooter();
    if (data) return data;
    await NavigationService.saveFooter(FOOTER_SEED, 'system');
    return FOOTER_SEED;
  },

  async saveFooter(data: SiteFooterData, userId = 'admin'): Promise<void> {
    await setDoc(doc(db, 'site_footer', 'main'), {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }, { merge: true });
  },
};
