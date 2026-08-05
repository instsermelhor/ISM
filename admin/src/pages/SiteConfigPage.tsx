/**
 * SiteConfigPage.tsx — Centro de Configurações Gerais do Site (PROMPT E047)
 * ──────────────────────────────────────────────────────────────────────────────
 * Módulo unificado para gerenciamento de todas as configurações globais do
 * Site Institucional, unificando Identidade, Hero, Redes Sociais, Contatos, SEO
 * e Configurações Gerais.
 *
 * Coleções Firestore integradas:
 *   - social_networks/*  (Gerenciador dinâmico de redes ilimitadas)
 *   - hero_section/main  (Editor Hero / Home)
 *   - site_footer/main   (Contatos & Rodapé)
 *   - seo_settings/main  (SEO & Analytics)
 *   - settings/*         (Configurações gerais)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings, Globe, Share2, Phone, Search, Sliders, Save, Plus,
  Trash2, MoveUp, MoveDown, CheckCircle, RefreshCw, Eye, ExternalLink,
  Shield, Image as ImageIcon, MapPin, Mail, MessageSquare, AlertCircle
} from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SaveBar } from '../components/ui/SaveBar';
import { ImageUploadInput } from '../components/ui/ImageUploadInput';
import { SocialNetworksService, type SocialNetwork } from '../services/socialNetworksService';
import { HeroService, type HeroSectionData } from '../services/heroService';
import { InstitutionalFirestoreService } from '../services/institutional';

type ConfigTab = 'identity' | 'hero' | 'social' | 'contacts' | 'seo' | 'general';

interface TabDef {
  id: ConfigTab;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const TABS: TabDef[] = [
  { id: 'identity', label: 'Identidade', icon: Settings, color: '#3b82f6', description: 'Nome, logotipo, favicons e lema' },
  { id: 'hero',     label: 'Hero / Home', icon: Globe, color: '#16a34a', description: 'Título principal, imagem, estatísticas e CTAs' },
  { id: 'social',   label: 'Redes Sociais', icon: Share2, color: '#f59e0b', description: 'Redes dinâmicas ilimitadas (Header, Footer, Landing)' },
  { id: 'contacts', label: 'Contatos', icon: Phone, color: '#ec4899', description: 'Telefone, WhatsApp, e-mail e localização' },
  { id: 'seo',      label: 'SEO & Meta', icon: Search, color: '#8b5cf6', description: 'Meta tags, OpenGraph e Google Analytics' },
  { id: 'general',  label: 'Gerais & LGPD', icon: Sliders, color: '#6366f1', description: 'Scripts, cookies e conformidade' },
];

export const SiteConfigPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ConfigTab) || 'identity';
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);

  // Estados de dados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 1. Identidade & Contatos
  const [identity, setIdentity] = useState({
    organizationName: 'Instituto Ser Melhor',
    slogan: 'Conectando pessoas, natureza e sustentabilidade desde 2007.',
    motto: 'Sapere Aude — Ouse Saber',
    logoUrl: '/logo-ism.png',
    faviconUrl: '/favicon.ico',
    cnpj: '00.000.000/0001-00',
  });

  // 2. Hero Section
  const [heroData, setHeroData] = useState<HeroSectionData>({
    eyebrowText: 'Desde 2007 · Transformação Social',
    title: 'Instituto Ser Melhor',
    subtitle: 'Somos uma organização não governamental brasileira dedicada a impulsionar transformações educacionais, sociais e ambientais.',
    heroImageUrl: '',
    motto: 'Sapere Aude',
    mottoExplanation: 'Sapere Aude — Ouse Saber. Reflete nosso compromisso com a educação transformadora.',
    stats: [
      { id: '1', value: '15+', label: 'Anos de Impacto', icon: '🌿' },
      { id: '2', value: '1M+', label: 'Vidas Impactadas', icon: '👥' },
      { id: '3', value: '50+', label: 'Parceiros Globais', icon: '🌐' },
    ],
    ctaButtons: [
      { id: '1', label: 'Apoie Nossa Missão', href: '#donate', variant: 'primary' },
      { id: '2', label: 'Conheça o Instituto', href: '#mission', variant: 'secondary' },
    ],
  });

  // 3. Redes Sociais
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);

  // 4. Contatos
  const [contacts, setContacts] = useState({
    email: 'contato@institutosermelhor.org',
    phone: '+55 (11) 96276-5715',
    whatsapp: '+5511962765715',
    address: 'Av. Henry Ford, S/N — Presidente Altino, Osasco — SP, 06210-900',
    googleMapsUrl: 'https://maps.google.com/?q=Instituto+Ser+Melhor+Osasco',
  });

  // 5. SEO
  const [seo, setSeo] = useState({
    siteTitle: 'Instituto Ser Melhor — Emancipação & Sustentabilidade',
    siteDescription: 'Catalisador de impacto social e regenerativo nas áreas de educação, cultura e meio ambiente desde 2007.',
    keywords: 'ong, impacto social, sustentabilidade, educação, meio ambiente',
    ogImage: '',
    googleAnalyticsId: '',
  });

  // Carregar todos os dados do Firestore
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [heroDoc, nets, seoDoc, footerDoc] = await Promise.all([
        HeroService.getOrSeed(),
        SocialNetworksService.getOrSeed(),
        InstitutionalFirestoreService.getSeoSettings(),
        InstitutionalFirestoreService.getFooterData().catch(() => null),
      ]);

      if (heroDoc) setHeroData(prev => ({ ...prev, ...heroDoc }));
      if (nets) setSocialNetworks(nets);
      if (seoDoc) setSeo(prev => ({ ...prev, ...seoDoc }));
      if (footerDoc) {
        setContacts(prev => ({
          ...prev,
          email: footerDoc.email || prev.email,
          phone: footerDoc.phone || prev.phone,
          address: footerDoc.address || prev.address,
          whatsapp: footerDoc.whatsapp || prev.whatsapp,
          googleMapsUrl: footerDoc.googleMapsUrl || prev.googleMapsUrl,
        }));
        if (footerDoc.organizationName) {
          setIdentity(prev => ({
            ...prev,
            organizationName: footerDoc.organizationName,
            slogan: footerDoc.tagline || prev.slogan,
          }));
        }
      }
      // Carregar identidade estendida (logo, favicon, cnpj, motto)
      try {
        const identitySnap = await getDoc(doc(db, 'site_identity', 'main'));
        if (identitySnap.exists()) {
          const iData = identitySnap.data();
          setIdentity(prev => ({
            ...prev,
            logoUrl: iData.logoUrl || prev.logoUrl,
            faviconUrl: iData.faviconUrl || prev.faviconUrl,
            cnpj: iData.cnpj || prev.cnpj,
            motto: iData.motto || prev.motto,
            slogan: iData.slogan || prev.slogan,
            organizationName: iData.organizationName || prev.organizationName,
          }));
        }
      } catch { /* site_identity ainda não existe — usa defaults */ }
    } catch (err) {
      console.error('[SiteConfigPage] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleTabChange = (tabId: ConfigTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Salvar alterações no Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        // Hero Section
        HeroService.save(heroData),
        // Redes Sociais (dinâmicas)
        SocialNetworksService.saveAll(socialNetworks),
        // SEO & Meta
        InstitutionalFirestoreService.saveSeoSettings(seo),
        // Contatos & Rodapé (inclui whatsapp e googleMapsUrl)
        InstitutionalFirestoreService.saveFooterData({
          organizationName: identity.organizationName,
          tagline: identity.slogan,
          email: contacts.email,
          phone: contacts.phone,
          address: contacts.address,
          whatsapp: contacts.whatsapp,
          googleMapsUrl: contacts.googleMapsUrl,
        }),
        // Identidade estendida — site_identity/main (logo, favicon, cnpj, motto)
        setDoc(doc(db, 'site_identity', 'main'), {
          organizationName: identity.organizationName,
          slogan: identity.slogan,
          motto: identity.motto,
          logoUrl: identity.logoUrl,
          faviconUrl: identity.faviconUrl,
          cnpj: identity.cnpj,
          updatedAt: serverTimestamp(),
        }, { merge: true }),
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[SiteConfigPage] Erro ao salvar:', err);
      alert('Erro ao salvar as configurações no Firestore: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Funções de manipulador de Redes Sociais
  const addSocialNetwork = () => {
    const newNet: SocialNetwork = {
      id: `social_${Date.now()}`,
      platform: 'instagram',
      name: 'Nova Rede Social',
      url: 'https://',
      order: socialNetworks.length + 1,
      isActive: true,
      openInNewTab: true,
      showInHeader: false,
      showInFooter: true,
      showInLanding: true,
    };
    setSocialNetworks([...socialNetworks, newNet]);
  };

  const updateSocialNetwork = (id: string, field: keyof SocialNetwork, value: any) => {
    setSocialNetworks(socialNetworks.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const removeSocialNetwork = (id: string) => {
    if (!confirm('Deseja realmente excluir esta rede social?')) return;
    setSocialNetworks(socialNetworks.filter(n => n.id !== id));
  };

  const moveSocialNetwork = (id: string, dir: -1 | 1) => {
    const copy = [...socialNetworks];
    const idx = copy.findIndex(n => n.id === id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= copy.length) return;
    [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
    // Atualiza campo `order`
    copy.forEach((n, i) => { n.order = i + 1; });
    setSocialNetworks(copy);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#6b7280' }}>
        <RefreshCw size={24} className="animate-spin" style={{ marginRight: 10 }} /> Carregando Configurações do Site...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0 40px 0' }}>
      
      {/* Save Bar flutuante */}
      <SaveBar
        isDirty={true}
        saveStatus={saving ? 'saving' : saved ? 'saved' : 'idle'}
        onSave={handleSave}
        onDiscard={loadAll}
        message="Alterações nas configurações globais pendentes"
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={28} color="#16a34a" />
            Configurações Gerais do Site
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Centro único de administração institucional, branding, redes sociais, SEO e contatos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="https://institutosermelhor.org" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#374151', textDecoration: 'none' }}>
            <ExternalLink size={14} /> Ver Site Público
          </a>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
            {saved ? <><CheckCircle size={15} /> Salvo!</> : <><Save size={15} /> {saving ? 'Salvando...' : 'Salvar Tudo'}</>}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 12, overflowX: 'auto' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12, border: 'none',
                background: isActive ? `${tab.color}15` : 'transparent',
                color: isActive ? tab.color : '#6b7280',
                fontWeight: isActive ? 800 : 600,
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* ── ABA 1: Identidade Institucional ────────────────────────────────── */}
        {activeTab === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Identidade & Branding</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Nome da Organização</label>
                <input type="text" value={identity.organizationName} onChange={e => setIdentity({ ...identity, organizationName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>CNPJ</label>
                <input type="text" value={identity.cnpj} onChange={e => setIdentity({ ...identity, cnpj: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Slogan / Tagline Institucional</label>
              <textarea value={identity.slogan} onChange={e => setIdentity({ ...identity, slogan: e.target.value })} rows={2}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.5 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Lema Institucional (Motto)</label>
              <input type="text" value={identity.motto} onChange={e => setIdentity({ ...identity, motto: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontStyle: 'italic' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
              <ImageUploadInput
                value={identity.logoUrl}
                onChange={v => setIdentity({ ...identity, logoUrl: v })}
                label="Logotipo Oficial (PNG/SVG transparente)"
                hint="Recomendado: 512×512px em fundo transparente"
                folder="branding"
                previewHeight={60}
              />
              <ImageUploadInput
                value={identity.faviconUrl}
                onChange={v => setIdentity({ ...identity, faviconUrl: v })}
                label="Favicon (.ico ou PNG)"
                hint="Ícone exibido na aba do navegador — 32×32px"
                folder="branding"
                previewHeight={40}
              />
            </div>
          </div>
        )}

        {/* ── ABA 2: Hero / Home ────────────────────────────────────────────── */}
        {activeTab === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Hero Section (Página Inicial)</h2>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Texto do Badge (Eyebrow)</label>
              <input type="text" value={heroData.eyebrowText} onChange={e => setHeroData({ ...heroData, eyebrowText: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Título Principal (H1)</label>
              <input type="text" value={heroData.title} onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 16, fontWeight: 800 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Subtítulo / Apresentação</label>
              <textarea value={heroData.subtitle} onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })} rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.6 }} />
            </div>

            <ImageUploadInput
              value={heroData.heroImageUrl}
              onChange={v => setHeroData({ ...heroData, heroImageUrl: v })}
              label="Imagem de Fundo do Hero"
              hint="Recomendado: 1920×1080px (fundo escuro transparente)"
              folder="hero"
              previewHeight={120}
            />

            {/* Estatísticas Rápidas */}
            <div style={{ paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', marginBottom: 12 }}>Indicadores de Destaque (Stats)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {heroData.stats.map(st => (
                  <div key={st.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#f9fafb' }}>
                    <input type="text" value={st.value} onChange={e => {
                      const updated = heroData.stats.map(s => s.id === st.id ? { ...s, value: e.target.value } : s);
                      setHeroData({ ...heroData, stats: updated });
                    }} placeholder="Ex: 15+" style={{ width: '100%', fontWeight: 800, fontSize: 15, border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', marginBottom: 6 }} />
                    <input type="text" value={st.label} onChange={e => {
                      const updated = heroData.stats.map(s => s.id === st.id ? { ...s, label: e.target.value } : s);
                      setHeroData({ ...heroData, stats: updated });
                    }} placeholder="Ex: Anos de Impacto" style={{ width: '100%', fontSize: 11, color: '#6b7280', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 3: Redes Sociais Dinâmicas ────────────────────────────────── */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Gerenciador de Redes Sociais</h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
                  Cadastre quantidade ilimitada de redes sociais sem precisar alterar código.
                </p>
              </div>
              <button onClick={addSocialNetwork}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>
                <Plus size={15} /> Adicionar Rede Social
              </button>
            </div>

            {/* Tabela de Redes */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', width: 60 }}>Ordem</th>
                    <th style={{ padding: '12px 16px' }}>Plataforma</th>
                    <th style={{ padding: '12px 16px' }}>Nome / Label</th>
                    <th style={{ padding: '12px 16px' }}>URL Completa</th>
                    <th style={{ padding: '12px 16px', textTransform: 'none' }}>Exibir em</th>
                    <th style={{ padding: '12px 16px', width: 80 }}>Status</th>
                    <th style={{ padding: '12px 16px', width: 100 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {socialNetworks.map((net, idx) => (
                    <tr key={net.id} style={{ borderBottom: '1px solid #f3f4f6', background: net.isActive ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button onClick={() => moveSocialNetwork(net.id, -1)} disabled={idx === 0}
                            style={{ border: 'none', background: 'transparent', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: '#9ca3af' }}>
                            <MoveUp size={14} />
                          </button>
                          <button onClick={() => moveSocialNetwork(net.id, 1)} disabled={idx === socialNetworks.length - 1}
                            style={{ border: 'none', background: 'transparent', cursor: idx === socialNetworks.length - 1 ? 'not-allowed' : 'pointer', color: '#9ca3af' }}>
                            <MoveDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="text" value={net.platform} onChange={e => updateSocialNetwork(net.id, 'platform', e.target.value)}
                          placeholder="instagram, x, bluesky..." style={{ width: 110, padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, fontWeight: 700 }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="text" value={net.name} onChange={e => updateSocialNetwork(net.id, 'name', e.target.value)}
                          style={{ width: 130, padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="url" value={net.url} onChange={e => updateSocialNetwork(net.id, 'url', e.target.value)}
                          placeholder="https://..." style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, fontFamily: 'monospace' }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="checkbox" checked={net.showInFooter} onChange={e => updateSocialNetwork(net.id, 'showInFooter', e.target.checked)} /> Footer
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            <input type="checkbox" checked={net.showInHeader} onChange={e => updateSocialNetwork(net.id, 'showInHeader', e.target.checked)} /> Header
                          </label>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => updateSocialNetwork(net.id, 'isActive', !net.isActive)}
                          style={{
                            padding: '3px 8px', borderRadius: 99, border: 'none', fontSize: 10, fontWeight: 800, cursor: 'pointer',
                            background: net.isActive ? '#dcfce7' : '#f3f4f6',
                            color: net.isActive ? '#15803d' : '#6b7280',
                          }}>
                          {net.isActive ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => removeSocialNetwork(net.id)}
                          style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ABA 4: Contatos & Localização ──────────────────────────────────── */}
        {activeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Canais de Contato Institucionais</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>E-mail Institucional</label>
                <input type="email" value={contacts.email} onChange={e => setContacts({ ...contacts, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Telefone Fixo</label>
                <input type="text" value={contacts.phone} onChange={e => setContacts({ ...contacts, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>WhatsApp Institucional (com DDD)</label>
              <input type="text" value={contacts.whatsapp} onChange={e => setContacts({ ...contacts, whatsapp: e.target.value })}
                placeholder="+5511962765715" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Endereço Completo</label>
              <textarea value={contacts.address} onChange={e => setContacts({ ...contacts, address: e.target.value })} rows={2}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.5 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>URL do Google Maps (Link de Compartilhamento)</label>
              <input type="url" value={contacts.googleMapsUrl} onChange={e => setContacts({ ...contacts, googleMapsUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace' }} />
            </div>
          </div>
        )}

        {/* ── ABA 5: SEO & Meta ──────────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>SEO & Otimização de Busca</h2>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Título Padrão do Site (Title Tag)</label>
              <input type="text" value={seo.siteTitle} onChange={e => setSeo({ ...seo, siteTitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 15, fontWeight: 700 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Descrição Global (Meta Description)</label>
              <textarea value={seo.siteDescription} onChange={e => setSeo({ ...seo, siteDescription: e.target.value })} rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.5 }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>Palavras-chave (separadas por vírgula)</label>
              <input type="text" value={seo.keywords} onChange={e => setSeo({ ...seo, keywords: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>ID do Google Analytics (ex: G-XXXXXXXXXX)</label>
                <input type="text" value={seo.googleAnalyticsId} onChange={e => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'monospace' }} />
              </div>
              <ImageUploadInput
                value={seo.ogImage}
                onChange={v => setSeo({ ...seo, ogImage: v })}
                label="Imagem Open Graph Padrão"
                hint="1200×630px para compartilhamento em redes sociais"
                folder="seo"
                previewHeight={60}
              />
            </div>
          </div>
        )}

        {/* ── ABA 6: Gerais & LGPD ───────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Configurações Gerais & LGPD</h2>

            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Shield size={20} color="#6366f1" />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>Conformidade LGPD & Privacidade</h3>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>
                O Instituto Ser Melhor garante a proteção dos dados pessoais de doadores, parceiros e beneficiários em conformidade com a Lei nº 13.709/2018.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Exibir aviso de Cookies no primeiro acesso (Cookie Banner)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Requerer opt-in explícito nos formulários de contato e doação
                </label>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
