import React, { useState, useEffect } from 'react';
import {
  Save, RotateCcw, Plus, Trash2, MoveUp, MoveDown,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp,
  FileText, ExternalLink, BarChart3, Handshake, Search, Filter
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Program {
  id: string; order: number; title: string; slug: string;
  description: string; longDescription: string; iconEmoji: string;
  imageUrl: string; isPublished: boolean; targetAudience: string;
  tags: string[]; ctaLabel: string; ctaUrl: string;
  impactMetric: string; impactValue: string;
}

interface TransparencyDoc {
  id: string; documentName: string; documentType: string;
  documentFile: string; publicationDate: string; fileSize: string;
}

interface FinancialSlice { id: string; name: string; value: number; color: string; }

interface PartnerBenefit {
  id: string; icon: string; title: string; description: string;
}

interface PartnerRecord {
  id: string; companyName: string; contactName: string; email: string;
  type: string; status: string; areaOfInterest: string; submissionDate: string;
}

interface IntegrityPillar {
  id: string; icon: string; title: string; body: string; ctaLabel: string; ctaHref: string;
}

interface ServicesData {
  // Programas
  sectionBadge: string; sectionTitle: string; sectionSubtitle: string;
  programs: Program[];
  // Transparência
  transparencyIntro: string; transparencyDocuments: TransparencyDoc[];
  financialSlices: FinancialSlice[]; efficiencyPct: number;
  integrityPillars: IntegrityPillar[];
  // Parcerias
  partnerBadge: string; partnerTitle: string; partnerSubtitle: string;
  partnerBenefits: PartnerBenefit[]; trustBadges: string[];
  partnerRecords: PartnerRecord[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT: ServicesData = {
  sectionBadge: 'Nossos Programas',
  sectionTitle: 'Serviços & Programas',
  sectionSubtitle: 'Iniciativas integradas que promovem transformações duradouras em comunidades e ecossistemas.',
  programs: [
    {
      id: '1', order: 1, title: 'Educação Transformadora', slug: 'educacao-transformadora',
      description: 'Programa de desenvolvimento de líderes comunitários com metodologia baseada em evidências.',
      longDescription: 'Capacitamos jovens e adultos em situação de vulnerabilidade com ferramentas para liderança, empreendedorismo social e letramento digital. Parceria com universidades de ponta.',
      iconEmoji: '📚', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
      isPublished: true, targetAudience: 'Jovens de 16 a 29 anos em situação de vulnerabilidade social',
      tags: ['Educação', 'Liderança', 'Jovens'], ctaLabel: 'Saiba Mais', ctaUrl: '#',
      impactMetric: 'Jovens Capacitados', impactValue: '50.000+',
    },
    {
      id: '2', order: 2, title: 'Proteção de Biomas', slug: 'protecao-biomas',
      description: 'Monitoramento e recuperação de biomas ameaçados com tecnologia de satélite.',
      longDescription: 'Utilizamos tecnologia de ponta — drones, sensores IoT e inteligência artificial — para monitorar e recuperar áreas de Mata Atlântica e Cerrado degradadas.',
      iconEmoji: '🌿', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      isPublished: true, targetAudience: 'Comunidades ribeirinhas e agricultores familiares',
      tags: ['Meio Ambiente', 'Tecnologia', 'Biomas'], ctaLabel: 'Ver Relatório', ctaUrl: '#',
      impactMetric: 'Hectares Recuperados', impactValue: '120.000',
    },
    {
      id: '3', order: 3, title: 'Saúde & Bem-Estar Comunitário', slug: 'saude-comunidade',
      description: 'Clínicas móveis e campanhas de prevenção em regiões sem cobertura de saúde pública.',
      longDescription: 'Levamos atenção primária à saúde a municípios com IDH baixo, com foco em saúde materno-infantil, saúde mental e prevenção de doenças crônicas.',
      iconEmoji: '❤️', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
      isPublished: true, targetAudience: 'Famílias em regiões de baixo IDH',
      tags: ['Saúde', 'Comunidade', 'Prevenção'], ctaLabel: 'Conhecer Programa', ctaUrl: '#',
      impactMetric: 'Atendimentos/ano', impactValue: '200.000',
    },
  ],
  transparencyIntro: 'O Princípio da Transparência Quântica garante acesso irrestrito e auditado à nossa saúde financeira. Operamos com padrões que excedem as exigências legais.',
  transparencyDocuments: [
    { id: '1', documentName: 'Demonstrações Financeiras 2024 (Auditado - Big 4)', documentType: 'Financeiro', documentFile: '#', publicationDate: '2024-03-30', fileSize: '4.2 MB' },
    { id: '2', documentName: 'Relatório Anual de Impacto e Atividades', documentType: 'Impacto', documentFile: '#', publicationDate: '2024-03-15', fileSize: '15.4 MB' },
    { id: '3', documentName: 'Código de Conduta Ética', documentType: 'Código de Conduta', documentFile: '#', publicationDate: '2023-01-10', fileSize: '1.5 MB' },
  ],
  financialSlices: [
    { id: '1', name: 'Programas', value: 75, color: '#16a34a' },
    { id: '2', name: 'Administrativo', value: 15, color: '#1e293b' },
    { id: '3', name: 'Captação', value: 10, color: '#94a3b8' },
  ],
  efficiencyPct: 90,
  integrityPillars: [
    { id: '1', icon: '👤', title: 'Estrutura Remuneratória', body: 'Membros da Assembleia e dos Conselhos atuam em caráter estritamente voluntário. A remuneração da Diretoria-Executiva segue critérios de mercado e metas de impacto.', ctaLabel: '', ctaHref: '' },
    { id: '2', icon: '📢', title: 'Canal de Integridade', body: 'Canal de Denúncias operado por empresa terceirizada independente. Garantia absoluta de anonimato e imparcialidade na apuração de desvios do Código de Conduta.', ctaLabel: 'Acessar Ouvidoria', ctaHref: '#' },
    { id: '3', icon: '🔒', title: 'Privacidade Global', body: 'Conformidade rigorosa com a LGPD (Brasil) e GDPR (Europa). Tratamos dados de doadores e beneficiários com criptografia e protocolos de segurança cibernética.', ctaLabel: '', ctaHref: '' },
  ],
  partnerBadge: 'Seja Parceiro',
  partnerTitle: 'Construa o Futuro Conosco',
  partnerSubtitle: 'Buscamos alianças estratégicas com organizações e líderes que compartilham nossa visão de excelência.',
  partnerBenefits: [
    { id: '1', icon: '🏢', title: 'Parcerias Corporativas', description: 'Desenvolvimento de projetos customizados e voluntariado executivo com impacto ESG mensurável.' },
    { id: '2', icon: '🤝', title: 'Cooperação Técnica', description: 'Intercâmbio de expertise com academia e institutos de pesquisa líderes no Brasil e no mundo.' },
    { id: '3', icon: '🌍', title: 'Alcance Global', description: 'Integração à nossa Rede de Colaboração de Elite com parceiros em mais de 20 países.' },
    { id: '4', icon: '📈', title: 'Visibilidade ESG', description: 'Reconhecimento público em relatórios de impacto e eventos institucionais de alto nível.' },
  ],
  trustBadges: ['ISO 9001', 'ODS ONU', 'LGPD Compliant'],
  partnerRecords: [
    { id: '1', companyName: 'TechForGood S.A.', contactName: 'Mariana Costa', email: 'mariana@techforgood.com', type: 'Corporativo', status: 'Parceria Formalizada', areaOfInterest: 'Tecnologia educacional', submissionDate: '2024-01-15' },
    { id: '2', companyName: 'Fundação Verde Vivo', contactName: 'Carlos Melo', email: 'carlos@verdevivo.org', type: 'Institucional/ONG', status: 'Em Análise', areaOfInterest: 'Proteção ambiental', submissionDate: '2024-04-02' },
    { id: '3', companyName: 'Universidade Federal do Sul', contactName: 'Dra. Sofia Ramos', email: 'sofia@ufs.edu.br', type: 'Pesquisa/Academia', status: 'Contato Inicial', areaOfInterest: 'Pesquisa em impacto social', submissionDate: '2024-05-20' },
  ],
};

const STORAGE_KEY = 'ism_services_draft';
const DOC_TYPES = ['Financeiro', 'Impacto', 'Legal', 'Código de Conduta', 'Relatório', 'Outro'];
const PARTNER_STATUSES = ['Novo', 'Em Análise', 'Contato Inicial', 'Rejeitado', 'Parceria Formalizada'];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Novo': { bg: '#eff6ff', text: '#3b82f6' }, 'Em Análise': { bg: '#fef3c7', text: '#d97706' },
  'Contato Inicial': { bg: '#f0fdf4', text: '#16a34a' }, 'Rejeitado': { bg: '#fff1f2', text: '#ef4444' },
  'Parceria Formalizada': { bg: '#f5f3ff', text: '#7c3aed' },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const iS: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const tS: React.CSSProperties = { ...iS, resize: 'vertical', minHeight: 76, lineHeight: 1.6 };
const bPri: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.15s' };
const bSec: React.CSSProperties = { ...bPri, background: 'white', color: '#374151', boxShadow: 'none', border: '1px solid #e5e7eb' };

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', ...style }}>{children}</div>
);

const SH: React.FC<{ icon: string; title: string; desc: string; action?: React.ReactNode }> = ({ icon, title, desc, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div><div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{title}</div><div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{desc}</div></div>
    </div>
    {action}
  </div>
);

const F: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{hint && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}
    </label>
    {children}
  </div>
);

const Acc: React.FC<{ title: string; badge?: string; badgeColor?: string; status?: string; children: React.ReactNode; defaultOpen?: boolean; onDelete?: () => void; onUp?: () => void; onDown?: () => void; disUp?: boolean; disDown?: boolean }> = ({
  title, badge, badgeColor = '#16a34a', status, children, defaultOpen = false, onDelete, onUp, onDown, disUp, disDown
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: open ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', userSelect: 'none' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {badge && <span style={{ background: badgeColor + '18', color: badgeColor, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{badge}</span>}
          {status && (() => { const c = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151' }; return <span style={{ ...c, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{status}</span>; })()}
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sem título</span>}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {onUp && <button onClick={e => { e.stopPropagation(); onUp(); }} disabled={disUp} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 6px', cursor: disUp ? 'not-allowed' : 'pointer', opacity: disUp ? 0.35 : 1 }}><MoveUp size={11} /></button>}
          {onDown && <button onClick={e => { e.stopPropagation(); onDown(); }} disabled={disDown} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 6px', cursor: disDown ? 'not-allowed' : 'pointer', opacity: disDown ? 0.35 : 1 }}><MoveDown size={11} /></button>}
          {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 7, padding: '4px 6px', cursor: 'pointer' }}><Trash2 size={11} color="#ef4444" /></button>}
          {open ? <ChevronUp size={13} color="#6b7280" /> : <ChevronDown size={13} color="#6b7280" />}
        </div>
      </div>
      {open && <div style={{ padding: 16, background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
    </div>
  );
};

// ─── Preview ──────────────────────────────────────────────────────────────────
const ServicesPreview: React.FC<{ data: ServicesData }> = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
    {/* Programs */}
    <div style={{ padding: '20px 20px 16px', background: 'white' }}>
      <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 99, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{data.sectionBadge}</div>
      <div style={{ fontWeight: 900, fontSize: 18, color: '#111827', marginBottom: 4 }}>{data.sectionTitle}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>{data.sectionSubtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.programs.filter(p => p.isPublished).slice(0, 3).map(p => (
          <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f9fafb', borderRadius: 10, padding: '10px 12px', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{p.iconEmoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>{p.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{p.description.slice(0, 70)}…</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                {p.tags.map(t => <span key={t} style={{ background: '#f0fdf4', color: '#16a34a', padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 600 }}>{t}</span>)}
                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>📊 {p.impactValue} {p.impactMetric}</span>
              </div>
            </div>
          </div>
        ))}
        {data.programs.filter(p => !p.isPublished).length > 0 && (
          <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: '4px 0' }}>{data.programs.filter(p => !p.isPublished).length} programa(s) não publicado(s)</div>
        )}
      </div>
    </div>
    {/* Transparency */}
    <div style={{ background: '#0f172a', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginBottom: 10 }}>🛡️ Transparência Quântica</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {data.financialSlices.map(s => (
          <div key={s.id} style={{ flex: s.value, background: s.color, height: 6, borderRadius: 3 }} title={`${s.name}: ${s.value}%`} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {data.financialSlices.map(s => (
          <span key={s.id} style={{ fontSize: 9, color: '#94a3b8' }}><span style={{ color: s.color }}>●</span> {s.name} {s.value}%</span>
        ))}
      </div>
      {data.transparencyDocuments.slice(0, 2).map(d => (
        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '7px 10px', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>📄 {d.documentName.slice(0, 40)}…</span>
          <span style={{ fontSize: 9, color: '#64748b' }}>{d.fileSize}</span>
        </div>
      ))}
    </div>
    {/* Partners */}
    <div style={{ background: 'white', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 8 }}>🤝 Parcerias Estratégicas</div>
      <div style={{ fontWeight: 900, fontSize: 15, color: '#111827', marginBottom: 4 }}>{data.partnerTitle}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {data.partnerBenefits.slice(0, 4).map(b => (
          <div key={b.id} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{b.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>{b.title}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 5 }}>
        {data.trustBadges.map(b => <span key={b} style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 700 }}>{b}</span>)}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const ServicesPage: React.FC = () => {
  const [data, setData] = useState<ServicesData>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT; }
    catch { return DEFAULT; }
  });
  const [savedVersion, setSavedVersion] = useState<ServicesData>(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'programs' | 'transparency' | 'partners' | 'records'>('programs');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('');
  const isDirty = JSON.stringify(data) !== JSON.stringify(savedVersion);

  useEffect(() => { const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), 700); return () => clearTimeout(t); }, [data]);

  const set = <K extends keyof ServicesData>(k: K, v: ServicesData[K]) => setData(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(r => setTimeout(r, 900));
    setSavedVersion(data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // ── Programs
  const addProgram = () => set('programs', [...data.programs, {
    id: Date.now().toString(), order: data.programs.length + 1, title: '', slug: '',
    description: '', longDescription: '', iconEmoji: '🎯', imageUrl: '',
    isPublished: false, targetAudience: '', tags: [], ctaLabel: 'Saiba Mais', ctaUrl: '#',
    impactMetric: '', impactValue: '',
  }]);
  const updateProgram = (id: string, f: string, v: any) => set('programs', data.programs.map(p => p.id === id ? { ...p, [f]: v } : p));
  const removeProgram = (id: string) => { if (!confirm('Excluir este programa?')) return; set('programs', data.programs.filter(p => p.id !== id)); };
  const moveProgram = (id: string, dir: -1 | 1) => {
    const arr = [...data.programs]; const i = arr.findIndex(p => p.id === id); const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return; [arr[i], arr[ni]] = [arr[ni], arr[i]]; set('programs', arr);
  };
  const updateTag = (id: string, raw: string) => updateProgram(id, 'tags', raw.split(',').map(t => t.trim()).filter(Boolean));

  // ── Documents
  const addDoc = () => set('transparencyDocuments', [...data.transparencyDocuments, { id: Date.now().toString(), documentName: '', documentType: 'Financeiro', documentFile: '#', publicationDate: new Date().toISOString().split('T')[0], fileSize: '' }]);
  const updateDoc = (id: string, f: string, v: string) => set('transparencyDocuments', data.transparencyDocuments.map(d => d.id === id ? { ...d, [f]: v } : d));
  const removeDoc = (id: string) => set('transparencyDocuments', data.transparencyDocuments.filter(d => d.id !== id));

  // ── Financial slices
  const addSlice = () => set('financialSlices', [...data.financialSlices, { id: Date.now().toString(), name: '', value: 0, color: '#64748b' }]);
  const updateSlice = (id: string, f: string, v: any) => set('financialSlices', data.financialSlices.map(s => s.id === id ? { ...s, [f]: v } : s));
  const removeSlice = (id: string) => set('financialSlices', data.financialSlices.filter(s => s.id !== id));
  const totalPct = data.financialSlices.reduce((a, s) => a + Number(s.value), 0);

  // ── Integrity pillars
  const updatePillar = (id: string, f: string, v: string) => set('integrityPillars', data.integrityPillars.map(p => p.id === id ? { ...p, [f]: v } : p));
  const addPillar = () => set('integrityPillars', [...data.integrityPillars, { id: Date.now().toString(), icon: '🔒', title: '', body: '', ctaLabel: '', ctaHref: '' }]);
  const removePillar = (id: string) => set('integrityPillars', data.integrityPillars.filter(p => p.id !== id));

  // ── Benefits
  const addBenefit = () => set('partnerBenefits', [...data.partnerBenefits, { id: Date.now().toString(), icon: '🌍', title: '', description: '' }]);
  const updateBenefit = (id: string, f: string, v: string) => set('partnerBenefits', data.partnerBenefits.map(b => b.id === id ? { ...b, [f]: v } : b));
  const removeBenefit = (id: string) => set('partnerBenefits', data.partnerBenefits.filter(b => b.id !== id));

  // ── Partner records
  const updateRecord = (id: string, f: string, v: string) => set('partnerRecords', data.partnerRecords.map(r => r.id === id ? { ...r, [f]: v } : r));
  const removeRecord = (id: string) => { if (!confirm('Remover este registro?')) return; set('partnerRecords', data.partnerRecords.filter(r => r.id !== id)); };
  const filteredRecords = data.partnerRecords.filter(r =>
    (r.companyName + r.contactName + r.email).toLowerCase().includes(partnerSearch.toLowerCase()) &&
    (!partnerStatusFilter || r.status === partnerStatusFilter)
  );

  const TABS = [
    { id: 'programs' as const, label: '📋 Programas', count: data.programs.length },
    { id: 'transparency' as const, label: '🛡️ Transparência', count: data.transparencyDocuments.length },
    { id: 'partners' as const, label: '🤝 Parcerias', count: null },
    { id: 'records' as const, label: '📁 Solicitações', count: data.partnerRecords.length },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>📋 Editor — Serviços & Programas</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie programas, documentos de transparência, parcerias e solicitações de parceiros
            {isDirty && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>● Não salvo</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" style={{ ...bSec, textDecoration: 'none' }}><Eye size={14} /> Ver Site</a>
          <button onClick={() => { if (!confirm('Restaurar todos os padrões?')) return; setData(DEFAULT); setSavedVersion(DEFAULT); localStorage.removeItem(STORAGE_KEY); }} style={bSec}><RotateCcw size={14} /> Restaurar</button>
          <button onClick={() => setShowPreview(p => !p)} style={{ ...bSec, background: showPreview ? '#eff6ff' : 'white', color: showPreview ? '#3b82f6' : '#374151', borderColor: showPreview ? '#bfdbfe' : '#e5e7eb' }}>
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} Preview
          </button>
          <button onClick={handleSave} disabled={saveStatus === 'saving' || !isDirty}
            style={{ ...bPri, opacity: !isDirty ? 0.5 : 1, cursor: !isDirty ? 'not-allowed' : 'pointer' }}>
            {saveStatus === 'saving' ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Salvando…</> :
              saveStatus === 'saved' ? <><CheckCircle size={14} />Publicado!</> : <><Save size={14} />Publicar</>}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 5, background: 'white', padding: 5, borderRadius: 14, border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.18s', background: activeTab === t.id ? '#16a34a' : 'transparent', color: activeTab === t.id ? 'white' : '#6b7280', boxShadow: activeTab === t.id ? '0 2px 8px rgba(22,163,74,0.28)' : 'none' }}>
                {t.label}
                {t.count !== null && <span style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: activeTab === t.id ? 'white' : '#374151', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ══ PROGRAMS ══ */}
          {activeTab === 'programs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Section meta */}
              <Card>
                <SH icon="📋" title="Cabeçalho da Seção" desc="Textos exibidos no topo da seção de serviços" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                    <F label="Badge"><input value={data.sectionBadge} onChange={e => set('sectionBadge', e.target.value)} style={iS} /></F>
                    <F label="Título da Seção"><input value={data.sectionTitle} onChange={e => set('sectionTitle', e.target.value)} style={{ ...iS, fontWeight: 700 }} /></F>
                  </div>
                  <F label="Subtítulo"><textarea value={data.sectionSubtitle} onChange={e => set('sectionSubtitle', e.target.value)} style={tS} /></F>
                </div>
              </Card>

              {/* Programs list */}
              <Card>
                <SH icon="🎯" title="Programas & Serviços" desc={`${data.programs.length} programas cadastrados · ${data.programs.filter(p => p.isPublished).length} publicados`}
                  action={<button onClick={addProgram} style={bPri}><Plus size={13} /> Novo Programa</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.programs.map((p, idx) => (
                    <Acc key={p.id} title={p.title || 'Novo Programa'} badge={p.iconEmoji}
                      status={p.isPublished ? undefined : 'Rascunho'}
                      defaultOpen={idx === 0}
                      onDelete={() => removeProgram(p.id)}
                      onUp={() => moveProgram(p.id, -1)} disUp={idx === 0}
                      onDown={() => moveProgram(p.id, 1)} disDown={idx === data.programs.length - 1}
                    >
                      {/* Row 1 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 10, alignItems: 'end' }}>
                        <F label="Ícone"><input value={p.iconEmoji} onChange={e => updateProgram(p.id, 'iconEmoji', e.target.value)} style={{ ...iS, textAlign: 'center', fontSize: 22 }} maxLength={2} /></F>
                        <F label="Título do Programa"><input value={p.title} onChange={e => updateProgram(p.id, 'title', e.target.value)} style={{ ...iS, fontWeight: 700 }} placeholder="Ex: Educação Transformadora" /></F>
                        <F label="Slug (URL)"><input value={p.slug} onChange={e => updateProgram(p.id, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} style={iS} placeholder="educacao-transformadora" /></F>
                      </div>
                      {/* Row 2 */}
                      <F label="Descrição Curta" hint="Exibida nos cards"><textarea value={p.description} onChange={e => updateProgram(p.id, 'description', e.target.value)} style={tS} /></F>
                      <F label="Descrição Completa" hint="Exibida na página do programa"><textarea value={p.longDescription} onChange={e => updateProgram(p.id, 'longDescription', e.target.value)} style={{ ...tS, minHeight: 100 }} /></F>
                      {/* Row 3 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <F label="Público-Alvo"><input value={p.targetAudience} onChange={e => updateProgram(p.id, 'targetAudience', e.target.value)} style={iS} placeholder="Ex: Jovens de 16 a 29 anos" /></F>
                        <F label="Tags" hint="Separadas por vírgula"><input value={p.tags.join(', ')} onChange={e => updateTag(p.id, e.target.value)} style={iS} placeholder="Educação, Jovens, Liderança" /></F>
                      </div>
                      {/* Row 4: Impacto */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📊 Métrica de Impacto</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <F label="Valor do Impacto"><input value={p.impactValue} onChange={e => updateProgram(p.id, 'impactValue', e.target.value)} style={{ ...iS, fontWeight: 800, color: '#16a34a' }} placeholder="50.000+" /></F>
                          <F label="Descritor / Métrica"><input value={p.impactMetric} onChange={e => updateProgram(p.id, 'impactMetric', e.target.value)} style={iS} placeholder="Jovens Capacitados" /></F>
                        </div>
                      </div>
                      {/* Row 5: CTA + Imagem */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <F label="Label do Botão CTA"><input value={p.ctaLabel} onChange={e => updateProgram(p.id, 'ctaLabel', e.target.value)} style={iS} placeholder="Saiba Mais" /></F>
                        <F label="URL do CTA"><input value={p.ctaUrl} onChange={e => updateProgram(p.id, 'ctaUrl', e.target.value)} style={iS} placeholder="#" /></F>
                      </div>
                      <F label="URL da Imagem do Programa"><input value={p.imageUrl} onChange={e => updateProgram(p.id, 'imageUrl', e.target.value)} style={iS} placeholder="https://..." /></F>
                      {p.imageUrl && <img src={p.imageUrl} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e7eb' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      {/* Publicado toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: p.isPublished ? '#f0fdf4' : '#fef9c3', border: `1px solid ${p.isPublished ? '#bbf7d0' : '#fde68a'}`, borderRadius: 10 }}>
                        <button
                          onClick={() => updateProgram(p.id, 'isPublished', !p.isPublished)}
                          style={{ width: 40, height: 22, borderRadius: 99, border: 'none', background: p.isPublished ? '#16a34a' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: p.isPublished ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.isPublished ? '#166534' : '#92400e' }}>
                          {p.isPublished ? '✅ Publicado no site' : '⏸️ Rascunho (não visível)'}
                        </span>
                      </div>
                    </Acc>
                  ))}
                  {data.programs.length === 0 && <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum programa. Clique em "+ Novo Programa".</div>}
                </div>
              </Card>
            </div>
          )}

          {/* ══ TRANSPARENCY ══ */}
          {activeTab === 'transparency' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Intro */}
              <Card>
                <SH icon="🛡️" title="Texto de Transparência" desc="Introdução da seção de prestação de contas" />
                <div style={{ padding: 24 }}>
                  <F label="Texto Introdutório"><textarea value={data.transparencyIntro} onChange={e => set('transparencyIntro', e.target.value)} style={{ ...tS, minHeight: 90 }} /></F>
                </div>
              </Card>

              {/* Financial allocation */}
              <Card>
                <SH icon="📊" title="Alocação de Recursos (Gráfico)" desc={`Total: ${totalPct}% ${totalPct !== 100 ? '— ⚠️ deve somar 100%' : '— ✅'}`}
                  action={<button onClick={addSlice} style={bSec}><Plus size={13} /> Fatia</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Visual bar */}
                  <div style={{ height: 16, borderRadius: 99, overflow: 'hidden', display: 'flex', gap: 2, background: '#f3f4f6' }}>
                    {data.financialSlices.map(s => (
                      <div key={s.id} title={`${s.name}: ${s.value}%`}
                        style={{ flex: s.value || 0, background: s.color, transition: 'flex 0.3s', minWidth: s.value > 0 ? 4 : 0 }} />
                    ))}
                  </div>
                  {data.financialSlices.map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 44px', gap: 10, alignItems: 'center', background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      <input type="color" value={s.color} onChange={e => updateSlice(s.id, 'color', e.target.value)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2, background: 'transparent' }} />
                      <input value={s.name} onChange={e => updateSlice(s.id, 'name', e.target.value)} style={iS} placeholder="Ex: Programas" />
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={s.value} onChange={e => updateSlice(s.id, 'value', Number(e.target.value))}
                          style={{ ...iS, paddingRight: 22, fontWeight: 700 }} min={0} max={100} />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>%</span>
                      </div>
                      <button onClick={() => removeSlice(s.id)} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <F label="% Eficiência Operacional (texto de destaque)" hint="Número exibido acima do gráfico">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="range" min={0} max={100} value={data.efficiencyPct} onChange={e => set('efficiencyPct', Number(e.target.value))} style={{ flex: 1, accentColor: '#16a34a' }} />
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 18, minWidth: 44 }}>{data.efficiencyPct}%</span>
                      </div>
                    </F>
                  </div>
                </div>
              </Card>

              {/* Documents */}
              <Card>
                <SH icon="📄" title="Documentos de Governança" desc="Repositório público de transparência"
                  action={<button onClick={addDoc} style={bPri}><Plus size={13} /> Adicionar</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.transparencyDocuments.map((d, idx) => (
                    <Acc key={d.id} title={d.documentName || 'Novo Documento'} badge={d.documentType} badgeColor="#6366f1"
                      defaultOpen={idx === 0} onDelete={() => removeDoc(d.id)}
                    >
                      <F label="Nome do Documento"><input value={d.documentName} onChange={e => updateDoc(d.id, 'documentName', e.target.value)} style={{ ...iS, fontWeight: 600 }} placeholder="Ex: Demonstrações Financeiras 2024" /></F>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <F label="Tipo">
                          <select value={d.documentType} onChange={e => updateDoc(d.id, 'documentType', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </F>
                        <F label="Data de Publicação"><input type="date" value={d.publicationDate} onChange={e => updateDoc(d.id, 'publicationDate', e.target.value)} style={iS} /></F>
                        <F label="Tamanho do Arquivo"><input value={d.fileSize} onChange={e => updateDoc(d.id, 'fileSize', e.target.value)} style={iS} placeholder="4.2 MB" /></F>
                      </div>
                      <F label="URL do Arquivo">
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={d.documentFile} onChange={e => updateDoc(d.id, 'documentFile', e.target.value)} style={{ ...iS, flex: 1 }} placeholder="https://... ou #" />
                          {d.documentFile && d.documentFile !== '#' && <a href={d.documentFile} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer', textDecoration: 'none' }}><ExternalLink size={14} /></a>}
                        </div>
                      </F>
                    </Acc>
                  ))}
                  {data.transparencyDocuments.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum documento cadastrado.</div>}
                </div>
              </Card>

              {/* Integrity Pillars */}
              <Card>
                <SH icon="🏛️" title="Pilares de Integridade" desc="Cards de governança exibidos abaixo dos documentos"
                  action={<button onClick={addPillar} style={bSec}><Plus size={13} /> Pilar</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.integrityPillars.map((p, idx) => (
                    <Acc key={p.id} title={p.title || 'Novo Pilar'} badge={p.icon}
                      defaultOpen={idx === 0} onDelete={() => removePillar(p.id)}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10 }}>
                        <F label="Ícone"><input value={p.icon} onChange={e => updatePillar(p.id, 'icon', e.target.value)} style={{ ...iS, fontSize: 22, textAlign: 'center' }} maxLength={2} /></F>
                        <F label="Título"><input value={p.title} onChange={e => updatePillar(p.id, 'title', e.target.value)} style={{ ...iS, fontWeight: 700 }} /></F>
                      </div>
                      <F label="Corpo do Texto"><textarea value={p.body} onChange={e => updatePillar(p.id, 'body', e.target.value)} style={tS} /></F>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <F label="Label do CTA" hint="Deixe vazio para não exibir"><input value={p.ctaLabel} onChange={e => updatePillar(p.id, 'ctaLabel', e.target.value)} style={iS} placeholder="Ex: Acessar Ouvidoria" /></F>
                        <F label="URL do CTA"><input value={p.ctaHref} onChange={e => updatePillar(p.id, 'ctaHref', e.target.value)} style={iS} placeholder="#" /></F>
                      </div>
                    </Acc>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ PARTNERS SECTION ══ */}
          {activeTab === 'partners' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SH icon="🤝" title="Cabeçalho da Seção de Parcerias" desc="Textos da seção 'Seja Parceiro'" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                    <F label="Badge"><input value={data.partnerBadge} onChange={e => set('partnerBadge', e.target.value)} style={iS} /></F>
                    <F label="Título"><input value={data.partnerTitle} onChange={e => set('partnerTitle', e.target.value)} style={{ ...iS, fontWeight: 700 }} /></F>
                  </div>
                  <F label="Subtítulo"><textarea value={data.partnerSubtitle} onChange={e => set('partnerSubtitle', e.target.value)} style={tS} /></F>
                </div>
              </Card>

              <Card>
                <SH icon="✨" title="Benefícios de Parceria" desc="Cards exibidos na seção 'Seja Parceiro'"
                  action={<button onClick={addBenefit} style={bSec}><Plus size={13} /> Benefício</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.partnerBenefits.map((b, idx) => (
                    <Acc key={b.id} title={b.title || 'Novo Benefício'} badge={b.icon} defaultOpen={idx === 0} onDelete={() => removeBenefit(b.id)}>
                      <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10 }}>
                        <F label="Ícone"><input value={b.icon} onChange={e => updateBenefit(b.id, 'icon', e.target.value)} style={{ ...iS, fontSize: 22, textAlign: 'center' }} maxLength={2} /></F>
                        <F label="Título"><input value={b.title} onChange={e => updateBenefit(b.id, 'title', e.target.value)} style={{ ...iS, fontWeight: 700 }} /></F>
                      </div>
                      <F label="Descrição"><textarea value={b.description} onChange={e => updateBenefit(b.id, 'description', e.target.value)} style={tS} /></F>
                    </Acc>
                  ))}
                </div>
              </Card>

              <Card>
                <SH icon="🏅" title="Selos de Confiança" desc="Badges exibidos abaixo dos benefícios" />
                <div style={{ padding: 24 }}>
                  <F label="Selos" hint="Um por linha">
                    <textarea
                      value={data.trustBadges.join('\n')}
                      onChange={e => set('trustBadges', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                      style={{ ...tS, minHeight: 80, fontFamily: 'monospace' }}
                      placeholder="ISO 9001&#10;ODS ONU&#10;LGPD Compliant"
                    />
                  </F>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {data.trustBadges.map(b => <span key={b} style={{ background: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, border: '1px solid #e5e7eb' }}>{b}</span>)}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ══ PARTNER RECORDS ══ */}
          {activeTab === 'records' && (
            <Card>
              <SH icon="📁" title="Solicitações de Parceria" desc={`${filteredRecords.length} de ${data.partnerRecords.length} registros`} />
              <div style={{ padding: 24 }}>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)}
                      placeholder="Buscar por empresa, contato ou e-mail…"
                      style={{ ...iS, paddingLeft: 32 }} />
                  </div>
                  <select value={partnerStatusFilter} onChange={e => setPartnerStatusFilter(e.target.value)} style={{ ...iS, width: 180, cursor: 'pointer' }}>
                    <option value="">Todos os status</option>
                    {PARTNER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Empresa / Contato', 'Tipo', 'Área de Interesse', 'Data', 'Status', 'Ações'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{r.companyName}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{r.contactName} · {r.email}</div>
                          </td>
                          <td style={{ padding: '12px', color: '#6b7280' }}>{r.type}</td>
                          <td style={{ padding: '12px', color: '#374151', maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.areaOfInterest}</div></td>
                          <td style={{ padding: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{new Date(r.submissionDate).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '12px' }}>
                            <select value={r.status} onChange={e => updateRecord(r.id, 'status', e.target.value)}
                              style={{ ...iS, width: 'auto', padding: '4px 8px', fontWeight: 700, background: (STATUS_COLORS[r.status]?.bg ?? '#f3f4f6'), color: (STATUS_COLORS[r.status]?.text ?? '#374151'), borderColor: 'transparent', cursor: 'pointer', fontSize: 11, borderRadius: 20 }}>
                              {PARTNER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => removeRecord(r.id)} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRecords.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum resultado encontrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginTop: 20 }}>
                  {PARTNER_STATUSES.map(s => {
                    const count = data.partnerRecords.filter(r => r.status === s).length;
                    const c = STATUS_COLORS[s] || { bg: '#f3f4f6', text: '#374151' };
                    return (
                      <div key={s} style={{ background: c.bg, border: `1px solid ${c.text}28`, borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 900, fontSize: 20, color: c.text }}>{count}</div>
                        <div style={{ fontSize: 10, color: c.text, fontWeight: 600, marginTop: 2 }}>{s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Preview */}
        {showPreview && (
          <div style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>🖥️ Preview</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Tempo real</span>
              </div>
              <div style={{ padding: 12, background: '#f1f5f9', maxHeight: '78vh', overflowY: 'auto' }}>
                <ServicesPreview data={data} />
              </div>
            </div>
            {saveStatus === 'saved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginTop: 12 }}>
                <CheckCircle size={15} color="#16a34a" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Publicado com sucesso!</span>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Barra flutuante de salvamento ── */}
      <SaveBar
        isDirty={isDirty}
        saveStatus={saveStatus}
        onSave={handleSave}
        onDiscard={() => { if (!confirm('Restaurar todos os padrões?')) return; setData(DEFAULT); setSavedVersion(DEFAULT); localStorage.removeItem(STORAGE_KEY); }}
        message="Serviços & Programas possui alterações não salvas"
      />
    </div>
  );
};
