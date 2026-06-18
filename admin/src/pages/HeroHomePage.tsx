import React, { useState, useEffect } from 'react';
import { Eye, Save, RotateCcw, Plus, Trash2, MoveUp, MoveDown, CheckCircle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatItem { id: string; value: string; label: string; icon: string; }
interface CtaButton { id: string; label: string; href: string; variant: 'primary' | 'secondary'; }
interface ImpactItem { id: string; text: string; }

interface HeroData {
  // Hero section
  eyebrowText: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  motto: string;
  mottoExplanation: string;
  stats: StatItem[];
  ctaButtons: CtaButton[];
  // Donation section
  donationTitle: string;
  donationSubtitle: string;
  donationBadgeText: string;
  impactItems: ImpactItem[];
  totalRaised: string;
  goalProgress: number;
  goalYear: string;
  // SEO
  pageTitle: string;
  metaDescription: string;
  ogImage: string;
}

// ─── Default data (mirrors site data.ts) ─────────────────────────────────────
const DEFAULT_DATA: HeroData = {
  eyebrowText: 'Desde 2007 · Transformação Social',
  title: 'Instituto Ser Melhor',
  subtitle: 'Somos uma organização não-governamental brasileira que atua como catalisadora de transformações sociais e ambientais. Nossa história é marcada pela busca incessante de redefinir o conceito de impacto sistêmico.',
  heroImageUrl: 'https://picsum.photos/1920/1080?grayscale',
  motto: 'Sapere Aude',
  mottoExplanation: 'Significa \'Ousa Saber\'. Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora, posicionando o Instituto como promotor da autossuficiência intelectual.',
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

const STORAGE_KEY = 'ism_hero_home_draft';

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', ...style }} className={className}>
    {children}
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{description}</div>
    </div>
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e7eb',
  fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.6,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 18px', borderRadius: 10, border: 'none',
  background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(22,163,74,0.35)', transition: 'all 0.15s',
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary, background: 'white', color: '#374151',
  boxShadow: 'none', border: '1px solid #e5e7eb',
};

// ─── Live Preview ─────────────────────────────────────────────────────────────
const LivePreview: React.FC<{ data: HeroData; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ data, viewport }) => {
  const widths = { desktop: '100%', tablet: 768, mobile: 390 };
  const w = widths[viewport];

  return (
    <div style={{
      width: typeof w === 'number' ? w : '100%', maxWidth: '100%', margin: '0 auto',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: '1px solid #e5e7eb',
      transition: 'width 0.3s ease',
    }}>
      {/* Hero Preview */}
      <div style={{
        background: '#0f172a', minHeight: viewport === 'mobile' ? 360 : 480,
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px 24px 24px',
        textAlign: 'center', overflow: 'hidden',
      }}>
        {/* BG Image */}
        {data.heroImageUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={data.heroImageUrl} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.7), rgba(15,23,42,0.95))' }} />
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ color: '#86efac', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{data.eyebrowText}</span>
          </div>
          {/* Title */}
          <div style={{ fontSize: viewport === 'mobile' ? 28 : 42, fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: 16 }}>{data.title}</div>
          {/* Subtitle */}
          <div style={{ fontSize: viewport === 'mobile' ? 13 : 15, color: '#94a3b8', marginBottom: 20, maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.6 }}>{data.subtitle}</div>
          {/* Motto */}
          {data.motto && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 18px', marginBottom: 22 }}>
              <span style={{ color: '#86efac', fontStyle: 'italic', fontSize: 15, fontWeight: 600 }}>"{data.motto}"</span>
              {data.mottoExplanation && <><span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} /><span style={{ fontSize: 11, color: '#64748b', maxWidth: 200 }}>{data.mottoExplanation.slice(0, 60)}…</span></>}
            </div>
          )}
          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {data.ctaButtons.map(btn => (
              <div key={btn.id} style={{
                padding: '10px 22px', borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                background: btn.variant === 'primary' ? '#16a34a' : 'transparent',
                border: btn.variant === 'secondary' ? '1px solid rgba(255,255,255,0.25)' : 'none',
                color: 'white',
              }}>{btn.label}</div>
            ))}
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {data.stats.map(s => (
              <div key={s.id} style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 18px', minWidth: 90, textAlign: 'center' }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div>
                <div style={{ fontWeight: 900, color: 'white', fontSize: 18, lineHeight: 1.1, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Preview */}
      <div style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 99, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            ♥ {data.donationBadgeText}
          </div>
          <div style={{ fontSize: viewport === 'mobile' ? 18 : 24, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>{data.donationTitle}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{data.donationSubtitle}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, maxWidth: 360, margin: '0 auto' }}>
          <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Arrecadado ({data.goalYear})</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#4ade80', margin: '4px 0' }}>{data.totalRaised}</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', width: `${data.goalProgress}%`, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{data.goalProgress}% da meta {data.goalYear}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const HeroHomePage: React.FC = () => {
  const [data, setData] = useState<HeroData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA;
    } catch { return DEFAULT_DATA; }
  });
  const [savedVersion, setSavedVersion] = useState<HeroData>(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'donation' | 'seo'>('hero');
  const isDirty = JSON.stringify(data) !== JSON.stringify(savedVersion);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, 800);
    return () => clearTimeout(timer);
  }, [data]);

  const set = <K extends keyof HeroData>(key: K, value: HeroData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(r => setTimeout(r, 900)); // Simula API call
    setSavedVersion(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleReset = () => {
    if (!confirm('Descartar todas as alterações e restaurar os valores originais?')) return;
    setData(DEFAULT_DATA);
    setSavedVersion(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    setSaveStatus('idle');
  };

  // ── Stat helpers
  const updateStat = (id: string, field: keyof StatItem, value: string) =>
    set('stats', data.stats.map(s => s.id === id ? { ...s, [field]: value } : s));
  const addStat = () => set('stats', [...data.stats, { id: Date.now().toString(), value: '', label: '', icon: '⭐' }]);
  const removeStat = (id: string) => set('stats', data.stats.filter(s => s.id !== id));
  const moveStat = (id: string, dir: -1 | 1) => {
    const arr = [...data.stats];
    const i = arr.findIndex(s => s.id === id);
    const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return;
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    set('stats', arr);
  };

  // ── CTA helpers
  const updateCta = (id: string, field: keyof CtaButton, value: string) =>
    set('ctaButtons', data.ctaButtons.map(c => c.id === id ? { ...c, [field]: value } : c));
  const addCta = () => set('ctaButtons', [...data.ctaButtons, { id: Date.now().toString(), label: 'Novo Botão', href: '#', variant: 'secondary' as const }]);
  const removeCta = (id: string) => set('ctaButtons', data.ctaButtons.filter(c => c.id !== id));

  // ── Impact helpers
  const updateImpact = (id: string, text: string) =>
    set('impactItems', data.impactItems.map(x => x.id === id ? { ...x, text } : x));
  const addImpact = () => set('impactItems', [...data.impactItems, { id: Date.now().toString(), text: '' }]);
  const removeImpact = (id: string) => set('impactItems', data.impactItems.filter(x => x.id !== id));

  const SECTION_TABS = [
    { id: 'hero' as const, label: '🎯 Hero', description: 'Título, imagem, stats, CTAs' },
    { id: 'donation' as const, label: '💚 Doação', description: 'Seção de captação' },
    { id: 'seo' as const, label: '🔍 SEO', description: 'Meta tags e OG' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>🏠 Editor Hero / Home</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Edite todas as seções visíveis na página inicial do site institucional
            {isDirty && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>● Alterações não salvas</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
            style={{ ...btnSecondary, textDecoration: 'none' }}>
            <Eye size={14} /> Ver Site
          </a>
          <button onClick={handleReset} style={btnSecondary}>
            <RotateCcw size={14} /> Restaurar Padrões
          </button>
          <button onClick={() => setShowPreview(!showPreview)} style={{ ...btnSecondary, background: showPreview ? '#eff6ff' : 'white', color: showPreview ? '#3b82f6' : '#374151', borderColor: showPreview ? '#bfdbfe' : '#e5e7eb' }}>
            <Monitor size={14} /> {showPreview ? 'Ocultar' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saveStatus === 'saving' || !isDirty}
            style={{ ...btnPrimary, opacity: (!isDirty && saveStatus === 'idle') ? 0.5 : 1, cursor: !isDirty ? 'not-allowed' : 'pointer' }}>
            {saveStatus === 'saving' ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Salvando...</> :
             saveStatus === 'saved' ? <><CheckCircle size={14} />Salvo!</> :
             <><Save size={14} />Publicar Alterações</>}
          </button>
        </div>
      </div>

      {/* ── Layout: Editor + Preview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: 20 }}>

        {/* ── LEFT: Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'white', padding: 6, borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {SECTION_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
                  background: activeSection === tab.id ? '#16a34a' : 'transparent',
                  color: activeSection === tab.id ? 'white' : '#6b7280',
                  boxShadow: activeSection === tab.id ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ HERO SECTION EDITOR ═══ */}
          {activeSection === 'hero' && <>

            {/* Eyebrow + Title */}
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>🎯</span>} title="Cabeçalho Principal" description="Texto de destaque e título principal da página" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Texto do Badge (Eyebrow)" hint="Exibido acima do título">
                  <input value={data.eyebrowText} onChange={e => set('eyebrowText', e.target.value)}
                    style={inputStyle} placeholder="Ex: Desde 2007 · Transformação Social" />
                </Field>
                <Field label="Título Principal (H1)">
                  <input value={data.title} onChange={e => set('title', e.target.value)}
                    style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} placeholder="Ex: Instituto Ser Melhor" />
                </Field>
                <Field label="Subtítulo / Introdução" hint="Parágrafo abaixo do título">
                  <textarea value={data.subtitle} onChange={e => set('subtitle', e.target.value)}
                    style={{ ...textareaStyle, minHeight: 100 }} placeholder="Descreva a missão e proposta de valor do instituto..." />
                  <span style={{ fontSize: 11, color: data.subtitle.length > 300 ? '#ef4444' : '#9ca3af', textAlign: 'right' }}>{data.subtitle.length}/300 caracteres</span>
                </Field>
              </div>
            </Card>

            {/* Hero Image */}
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>🖼️</span>} title="Imagem de Fundo do Hero" description="URL da imagem principal (recomendado: 1920×1080px)" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="URL da Imagem">
                  <input value={data.heroImageUrl} onChange={e => set('heroImageUrl', e.target.value)}
                    style={inputStyle} placeholder="https://..." />
                </Field>
                {data.heroImageUrl && (
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative' }}>
                    <img src={data.heroImageUrl} alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))', display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>✅ Imagem carregada</span>
                    </div>
                  </div>
                )}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, marginBottom: 4 }}>💡 Dicas para a imagem</div>
                  <ul style={{ fontSize: 11, color: '#166534', paddingLeft: 14, margin: 0, lineHeight: 1.7 }}>
                    <li>Resolução mínima: 1920×1080px</li>
                    <li>A imagem é exibida com opacidade reduzida (30%) sobre fundo escuro</li>
                    <li>Prefira imagens sem texto — o conteúdo será sobreposto</li>
                    <li>Use Unsplash, Pexels ou imagens do próprio instituto</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Motto */}
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>✍️</span>} title="Motto / Lema" description="Frase inspiracional exibida em destaque" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Lema (Motto)">
                  <input value={data.motto} onChange={e => set('motto', e.target.value)}
                    style={{ ...inputStyle, fontStyle: 'italic', fontWeight: 600 }} placeholder="Ex: Sapere Aude" />
                </Field>
                <Field label="Explicação do Lema">
                  <textarea value={data.mottoExplanation} onChange={e => set('mottoExplanation', e.target.value)}
                    style={textareaStyle} placeholder="Explique o significado do lema..." />
                </Field>
              </div>
            </Card>

            {/* Stats */}
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>📊</span>} title="Estatísticas de Impacto" description="Cards de números exibidos abaixo do conteúdo principal" />
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {data.stats.map((stat, idx) => (
                    <div key={stat.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 1fr 90px', gap: 10, alignItems: 'center', background: '#f9fafb', borderRadius: 12, padding: '12px 14px' }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>ÍCONE</label>
                        <input value={stat.icon} onChange={e => updateStat(stat.id, 'icon', e.target.value)}
                          style={{ ...inputStyle, textAlign: 'center', fontSize: 20, padding: '4px 6px' }} maxLength={2} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>VALOR</label>
                        <input value={stat.value} onChange={e => updateStat(stat.id, 'value', e.target.value)}
                          style={{ ...inputStyle, fontWeight: 700 }} placeholder="Ex: 15+" />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>RÓTULO</label>
                        <input value={stat.label} onChange={e => updateStat(stat.id, 'label', e.target.value)}
                          style={inputStyle} placeholder="Ex: Anos de Impacto" />
                      </div>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => moveStat(stat.id, -1)} disabled={idx === 0}
                          style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 7px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}>
                          <MoveUp size={13} color="#374151" />
                        </button>
                        <button onClick={() => moveStat(stat.id, 1)} disabled={idx === data.stats.length - 1}
                          style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 7px', cursor: idx === data.stats.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === data.stats.length - 1 ? 0.4 : 1 }}>
                          <MoveDown size={13} color="#374151" />
                        </button>
                        <button onClick={() => removeStat(stat.id)}
                          style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}>
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addStat} style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} /> Adicionar Estatística
                </button>
              </div>
            </Card>

            {/* CTA Buttons */}
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>🔘</span>} title="Botões de Ação (CTAs)" description="Botões exibidos abaixo do texto principal" />
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {data.ctaButtons.map(btn => (
                    <div key={btn.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 40px', gap: 10, alignItems: 'flex-end', background: '#f9fafb', borderRadius: 12, padding: '12px 14px' }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>TEXTO DO BOTÃO</label>
                        <input value={btn.label} onChange={e => updateCta(btn.id, 'label', e.target.value)}
                          style={inputStyle} placeholder="Ex: Apoie Nossa Missão" />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>LINK</label>
                        <input value={btn.href} onChange={e => updateCta(btn.id, 'href', e.target.value)}
                          style={inputStyle} placeholder="#donate" />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>ESTILO</label>
                        <select value={btn.variant} onChange={e => updateCta(btn.id, 'variant', e.target.value as any)}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option value="primary">🟢 Primário</option>
                          <option value="secondary">⬜ Secundário</option>
                        </select>
                      </div>
                      <button onClick={() => removeCta(btn.id)}
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addCta} style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} /> Adicionar Botão
                </button>
              </div>
            </Card>
          </>}

          {/* ═══ DONATION SECTION EDITOR ═══ */}
          {activeSection === 'donation' && <>
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>💚</span>} title="Seção de Doação" description="Bloco de captação exibido ao final da página" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Badge da Seção">
                  <input value={data.donationBadgeText} onChange={e => set('donationBadgeText', e.target.value)}
                    style={inputStyle} placeholder="Ex: Apoie Agora" />
                </Field>
                <Field label="Título da Seção de Doação">
                  <input value={data.donationTitle} onChange={e => set('donationTitle', e.target.value)}
                    style={inputStyle} placeholder="Ex: Fundo de Sustentabilidade Perpétua" />
                </Field>
                <Field label="Subtítulo / Descrição">
                  <textarea value={data.donationSubtitle} onChange={e => set('donationSubtitle', e.target.value)}
                    style={textareaStyle} placeholder="Descrição sobre o impacto da doação..." />
                </Field>
              </div>
            </Card>

            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>🎯</span>} title="Itens de Impacto" description="Lista de como as doações são utilizadas" />
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {data.impactItems.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: '#16a34a', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
                      <input value={item.text} onChange={e => updateImpact(item.id, e.target.value)}
                        style={{ ...inputStyle, flex: 1 }} placeholder="Ex: Financiamento de bolsas..." />
                      <button onClick={() => removeImpact(item.id)}
                        style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', flexShrink: 0 }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addImpact} style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} /> Adicionar Item de Impacto
                </button>
              </div>
            </Card>

            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>📈</span>} title="Painel de Progresso da Meta" description="Exibido no card de arrecadação" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Total Arrecadado (texto)">
                    <input value={data.totalRaised} onChange={e => set('totalRaised', e.target.value)}
                      style={{ ...inputStyle, fontWeight: 700, color: '#16a34a' }} placeholder="Ex: R$ 12,4M" />
                  </Field>
                  <Field label="Ano de Referência">
                    <input value={data.goalYear} onChange={e => set('goalYear', e.target.value)}
                      style={inputStyle} placeholder="Ex: 2025" />
                  </Field>
                </div>
                <Field label={`Progresso da Meta — ${data.goalProgress}%`} hint="Barra de progresso visual">
                  <input type="range" min={0} max={100} value={data.goalProgress}
                    onChange={e => set('goalProgress', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#16a34a' }} />
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', width: `${data.goalProgress}%`, borderRadius: 99, transition: 'width 0.2s' }} />
                  </div>
                </Field>
              </div>
            </Card>
          </>}

          {/* ═══ SEO EDITOR ═══ */}
          {activeSection === 'seo' && <>
            <Card>
              <SectionHeader icon={<span style={{ fontSize: 18 }}>🔍</span>} title="SEO & Meta Tags" description="Otimização para mecanismos de busca e redes sociais" />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Field label="Title Tag (aba do navegador)" hint="50–60 caracteres ideal">
                  <input value={data.pageTitle} onChange={e => set('pageTitle', e.target.value)}
                    style={inputStyle} placeholder="Instituto Ser Melhor — Transformação Social" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Recomendado: 50–60 caracteres</span>
                    <span style={{ fontSize: 11, color: data.pageTitle.length > 60 ? '#ef4444' : data.pageTitle.length > 50 ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>{data.pageTitle.length} chars</span>
                  </div>
                  {/* SERP Preview */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>📱 Preview Google SERP</div>
                    <div style={{ fontSize: 16, color: '#1a0dab', fontWeight: 400, marginBottom: 2 }}>{data.pageTitle || 'Título da Página'}</div>
                    <div style={{ fontSize: 13, color: '#006621' }}>institutosermelhor.org.br</div>
                    <div style={{ fontSize: 13, color: '#4d5156', marginTop: 2 }}>{data.metaDescription.slice(0, 160) || 'Meta descrição...'}</div>
                  </div>
                </Field>

                <Field label="Meta Description" hint="150–160 caracteres ideal">
                  <textarea value={data.metaDescription} onChange={e => set('metaDescription', e.target.value)}
                    style={textareaStyle} placeholder="Descreva a página para mecanismos de busca..." />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Recomendado: 150–160 caracteres</span>
                    <span style={{ fontSize: 11, color: data.metaDescription.length > 160 ? '#ef4444' : data.metaDescription.length > 150 ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>{data.metaDescription.length} chars</span>
                  </div>
                </Field>

                <Field label="Imagem Open Graph (og:image)" hint="Para compartilhamento em redes sociais">
                  <input value={data.ogImage} onChange={e => set('ogImage', e.target.value)}
                    style={inputStyle} placeholder="https://institutosermelhor.org.br/og-image.jpg" />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Recomendado: 1200×630px • Formato: JPG/PNG</div>
                </Field>

                {/* SEO Score */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#166534', marginBottom: 12 }}>📊 Pontuação SEO</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Título dentro do limite', ok: data.pageTitle.length >= 10 && data.pageTitle.length <= 60 },
                      { label: 'Meta description no comprimento certo', ok: data.metaDescription.length >= 120 && data.metaDescription.length <= 160 },
                      { label: 'Imagem OG configurada', ok: !!data.ogImage },
                      { label: 'Título H1 definido', ok: !!data.title },
                      { label: 'Subtítulo/introdução com conteúdo', ok: data.subtitle.length > 50 },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{item.ok ? '✅' : '⚠️'}</span>
                        <span style={{ fontSize: 12, color: item.ok ? '#166534' : '#92400e', fontWeight: item.ok ? 400 : 600 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </>}
        </div>

        {/* ── RIGHT: Live Preview ── */}
        {showPreview && (
          <div style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {/* Preview Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>🖥️ Preview em Tempo Real</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([
                    { id: 'desktop', icon: <Monitor size={14} /> },
                    { id: 'tablet', icon: <Tablet size={14} /> },
                    { id: 'mobile', icon: <Smartphone size={14} /> },
                  ] as const).map(v => (
                    <button key={v.id} onClick={() => setViewport(v.id)}
                      style={{
                        padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer',
                        background: viewport === v.id ? '#16a34a' : 'white',
                        color: viewport === v.id ? 'white' : '#6b7280',
                      }}>
                      {v.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, background: '#f1f5f9', maxHeight: '75vh', overflowY: 'auto' }}>
                <LivePreview data={data} viewport={viewport} />
              </div>
            </div>
            {/* Save Status Indicator */}
            {saveStatus === 'saved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginTop: 12 }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Alterações publicadas com sucesso!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Barra flutuante de salvamento ── */}
      <SaveBar
        isDirty={isDirty}
        saveStatus={saveStatus === 'error' ? 'idle' : saveStatus}
        onSave={handleSave}
        onDiscard={handleReset}
        message="Hero / Home possui alterações não salvas"
      />
    </div>
  );
};
