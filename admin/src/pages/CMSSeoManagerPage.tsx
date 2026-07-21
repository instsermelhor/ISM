/**
 * CMSSeoManagerPage — SEO Manager Enterprise
 * ─────────────────────────────────────────────
 * Página dedicada ao gerenciamento completo de SEO da plataforma ISM.
 *
 * Recursos:
 *  - Title & Description com contador de caracteres e alertas Lighthouse
 *  - OpenGraph (Facebook, LinkedIn, WhatsApp) com preview visual
 *  - Twitter Cards
 *  - JSON-LD Schema.org (NGO) com pré-visualização gerada automaticamente
 *  - Google Analytics / Tag Manager / Search Console
 *  - Meta Pixel
 *  - Robots directive
 *  - Multi-idioma (hreflang)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, Share2, Code2, BarChart2, Save, RefreshCw, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { CMSSeoService, type SeoSettings } from '../services/cmsSeo';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

const DEFAULT_SEO: SeoSettings = {
  siteTitle: 'Instituto Ser Melhor — Emancipação & Sustentabilidade',
  siteDescription: 'Catalisador de impacto social e regenerativo nas áreas de educação, cultura e meio ambiente desde 2007.',
  canonical: 'https://institutosermelhor.org',
  ogTitle: 'Instituto Ser Melhor',
  ogDescription: 'ONG brasileira que transforma realidades sociais e ambientais.',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterHandle: '@instsermelhor',
  jsonLdEnabled: true,
  organizationName: 'Instituto Ser Melhor',
  organizationUrl: 'https://institutosermelhor.org',
  organizationFoundingYear: '2007',
  organizationEmail: 'contato@institutosermelhor.org',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  googleSearchConsoleToken: '',
  robotsDirective: 'index,follow',
  defaultLanguage: 'pt-BR',
  keywords: 'ong, impacto social, sustentabilidade, educação, meio ambiente',
};

type Tab = 'basico' | 'opengraph' | 'jsonld' | 'analytics' | 'tecnico';

const CharCounter: React.FC<{ value: string; max: number; warn: number }> = ({ value, max, warn }) => {
  const len = value.length;
  const color = len > max ? '#dc2626' : len > warn ? '#f59e0b' : '#16a34a';
  return (
    <span style={{ fontSize: 11, color, fontWeight: 700 }}>
      {len}/{max} {len > max ? '⚠ Muito longo' : len > warn ? '⚠ Próximo do limite' : '✓ OK'}
    </span>
  );
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
    {hint && <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px 0' }}>{hint}</p>}
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{
    width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px',
    fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box',
    ...(props.style || {}),
  }} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} style={{
    width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px',
    fontSize: 14, color: '#111827', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    ...(props.style || {}),
  }} />
);

export const CMSSeoManagerPage: React.FC = () => {
  const [data, setData] = useState<SeoSettings>(DEFAULT_SEO);
  const [activeTab, setActiveTab] = useState<Tab>('basico');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Autosave
  const autosave = useCMSAutosave('seo', data);

  useEffect(() => {
    CMSSeoService.get().then(remote => {
      if (remote) setData(prev => ({ ...prev, ...remote }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = useCallback(<K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    setSaved(false);
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await CMSSeoService.save(data);
      // Salvar versão no histórico
      await CMSVersionService.saveDraft('seo', data as unknown as Record<string, unknown>, 'admin', 'SEO Manager — Publicação');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[CMSSeoManagerPage] save error:', e);
      alert('Erro ao salvar SEO. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (content: Record<string, unknown>) => {
    setData(prev => ({ ...prev, ...(content as Partial<SeoSettings>) }));
    setSaved(false);
  };

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'basico', label: 'Básico', Icon: Search },
    { id: 'opengraph', label: 'OpenGraph', Icon: Share2 },
    { id: 'jsonld', label: 'JSON-LD', Icon: Code2 },
    { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
    { id: 'tecnico', label: 'Técnico', Icon: Globe },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando configurações de SEO...</div>;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="SEO Manager" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={26} style={{ color: '#7c3aed' }} /> SEO Manager Enterprise
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie título, metatags, OpenGraph, JSON-LD e integrações de analytics
          </p>
        </div>
      </div>

      {/* Autosave Banner */}
      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d) setData(prev => ({ ...prev, ...d })); }}
          onDiscard={autosave.clearSaved}
        />
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none', borderRadius: '8px 8px 0 0',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#7c3aed' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280',
            }}>
            <t.Icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Básico */}
      {activeTab === 'basico' && (
        <div>
          <Field label="Título do Site (SEO Title)" hint="Aparece na aba do navegador e nos resultados do Google. Máximo recomendado: 60 caracteres.">
            <Input value={data.siteTitle} onChange={e => set('siteTitle', e.target.value)} maxLength={70} />
            <div style={{ marginTop: 4 }}><CharCounter value={data.siteTitle} max={60} warn={50} /></div>
          </Field>

          <Field label="Descrição (Meta Description)" hint="Resumo exibido nos resultados de busca. Máximo recomendado: 160 caracteres.">
            <Textarea value={data.siteDescription} onChange={e => set('siteDescription', e.target.value)} rows={3} maxLength={180} />
            <div style={{ marginTop: 4 }}><CharCounter value={data.siteDescription} max={160} warn={140} /></div>
          </Field>

          <Field label="URL Canônica" hint="URL principal do site. Evita conteúdo duplicado nos mecanismos de busca.">
            <Input value={data.canonical ?? ''} onChange={e => set('canonical', e.target.value)} type="url" placeholder="https://institutosermelhor.org" />
          </Field>

          <Field label="Palavras-chave" hint="Separadas por vírgula. Usadas em meta keywords (impacto secundário no SEO moderno).">
            <Input value={data.keywords ?? ''} onChange={e => set('keywords', e.target.value)} placeholder="ong, impacto social, sustentabilidade" />
          </Field>

          {/* Google Preview */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 12 }}>Prévia — Resultado Google</div>
            <div style={{ fontSize: 20, color: '#1a0dab', fontWeight: 400, cursor: 'pointer' }}>{data.siteTitle || '(Título não definido)'}</div>
            <div style={{ fontSize: 14, color: '#006621' }}>{data.canonical || 'https://institutosermelhor.org'}</div>
            <div style={{ fontSize: 14, color: '#545454', marginTop: 4 }}>{data.siteDescription || '(Descrição não definida)'}</div>
          </div>
        </div>
      )}

      {/* Tab: OpenGraph */}
      {activeTab === 'opengraph' && (
        <div>
          <Field label="OG Title" hint="Título exibido quando o link é compartilhado no WhatsApp, Facebook e LinkedIn.">
            <Input value={data.ogTitle ?? ''} onChange={e => set('ogTitle', e.target.value)} />
          </Field>
          <Field label="OG Description">
            <Textarea value={data.ogDescription ?? ''} onChange={e => set('ogDescription', e.target.value)} rows={3} />
          </Field>
          <Field label="OG Image URL" hint="Recomendado: 1200×630 pixels. Utilizada ao compartilhar links nas redes sociais.">
            <Input value={data.ogImage ?? ''} onChange={e => set('ogImage', e.target.value)} type="url" />
            {data.ogImage && (
              <img src={data.ogImage} alt="OG Preview" style={{ marginTop: 12, borderRadius: 10, width: '100%', maxHeight: 200, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
            )}
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Twitter Card">
              <select value={data.twitterCard} onChange={e => set('twitterCard', e.target.value as any)}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
                <option value="summary_large_image">Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </Field>
            <Field label="Twitter Handle" hint="ex: @instsermelhor">
              <Input value={data.twitterHandle ?? ''} onChange={e => set('twitterHandle', e.target.value)} placeholder="@instsermelhor" />
            </Field>
          </div>
        </div>
      )}

      {/* Tab: JSON-LD */}
      {activeTab === 'jsonld' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={data.jsonLdEnabled} onChange={e => set('jsonLdEnabled', e.target.checked)} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Ativar JSON-LD Schema.org (NGO)</span>
            </label>
          </div>
          {data.jsonLdEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nome da Organização"><Input value={data.organizationName ?? ''} onChange={e => set('organizationName', e.target.value)} /></Field>
              <Field label="URL do Site"><Input value={data.organizationUrl ?? ''} onChange={e => set('organizationUrl', e.target.value)} type="url" /></Field>
              <Field label="Ano de Fundação"><Input value={data.organizationFoundingYear ?? ''} onChange={e => set('organizationFoundingYear', e.target.value)} placeholder="2007" /></Field>
              <Field label="Email de Contato"><Input value={data.organizationEmail ?? ''} onChange={e => set('organizationEmail', e.target.value)} type="email" /></Field>
              <Field label="Logo URL"><Input value={data.organizationLogo ?? ''} onChange={e => set('organizationLogo', e.target.value)} type="url" /></Field>
              <Field label="Localização"><Input value={data.organizationAddress ?? ''} onChange={e => set('organizationAddress', e.target.value)} placeholder="São Paulo, SP, Brasil" /></Field>
            </div>
          )}
          <button onClick={() => setShowJsonPreview(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#374151', marginTop: 8 }}>
            <Eye size={14} /> {showJsonPreview ? 'Ocultar' : 'Visualizar'} JSON-LD Gerado
          </button>
          {showJsonPreview && (
            <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 10, padding: 20, fontSize: 12, marginTop: 12, overflowX: 'auto' }}>
              {CMSSeoService.generateJsonLd(data)}
            </pre>
          )}
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div>
          <Field label="Google Analytics 4 — Measurement ID" hint="Formato: G-XXXXXXXXXX"><Input value={data.googleAnalyticsId ?? ''} onChange={e => set('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" /></Field>
          <Field label="Google Tag Manager — Container ID" hint="Formato: GTM-XXXXXXX"><Input value={data.googleTagManagerId ?? ''} onChange={e => set('googleTagManagerId', e.target.value)} placeholder="GTM-XXXXXXX" /></Field>
          <Field label="Google Search Console — Token de Verificação" hint="Meta tag de verificação do Google Search Console."><Input value={data.googleSearchConsoleToken ?? ''} onChange={e => set('googleSearchConsoleToken', e.target.value)} placeholder="xxxxxxxxxxxxxxxx" /></Field>
          <Field label="Meta Pixel ID" hint="Para rastreamento de conversões no Facebook/Instagram."><Input value={data.metaPixelId ?? ''} onChange={e => set('metaPixelId', e.target.value)} placeholder="1234567890123456" /></Field>
        </div>
      )}

      {/* Tab: Técnico */}
      {activeTab === 'tecnico' && (
        <div>
          <Field label="Robots Directive" hint="Controla como os mecanismos de busca indexam o site.">
            <select value={data.robotsDirective} onChange={e => set('robotsDirective', e.target.value as any)}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
              <option value="index,follow">index, follow (Padrão — recomendado)</option>
              <option value="index,nofollow">index, nofollow</option>
              <option value="noindex,nofollow">noindex, nofollow (Ocultar do Google)</option>
            </select>
          </Field>
          <Field label="Idioma Padrão do Site">
            <select value={data.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value as any)}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
              <option value="pt-BR">Português — Brasil (pt-BR)</option>
              <option value="en">English (en)</option>
              <option value="es">Español (es)</option>
            </select>
          </Field>
        </div>
      )}

      {/* Version History */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="seo" onRestore={handleRestore} />
      </div>
    </div>
  );
};
