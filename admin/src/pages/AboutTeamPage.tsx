import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, RotateCcw, Plus, Trash2, MoveUp, MoveDown,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp, UserCircle2
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ValueBlock { id: string; name: string; iconIdentifier: string; description: string; }
interface TimelineMilestone { id: string; year: number; title: string; impactDescription: string; }
interface GovernanceInstance {
  id: string; order: number; title: string; summary: string;
  keyAttributes: { id: string; attributeText: string }[];
}
interface TeamMember {
  id: string; name: string; role: string; type: 'board' | 'executive' | 'advisor';
  bio: string; imageUrl: string;
}
interface NetworkCard { id: string; icon: string; title: string; description: string; }

interface AboutData {
  // Sobre nós / Identidade
  aboutBadgeText: string;
  aboutImage: string;
  missionStatement: string;
  visionStatement: string;
  // Valores
  valueBlocks: ValueBlock[];
  // Timeline
  timelineMilestones: TimelineMilestone[];
  // Rede
  networkIntro: string;
  networkCards: NetworkCard[];
  // Símbolo / Identidade Visual
  logoImage: string;
  logoExplanation: string;
  // Governança
  governanceIntro: string;
  governanceInstances: GovernanceInstance[];
  // Equipe
  teamMembers: TeamMember[];
}

// ─── Default data (mirrors data.ts) ──────────────────────────────────────────
const DEFAULT: AboutData = {
  aboutBadgeText: 'Sobre Nós',
  aboutImage: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80',
  missionStatement: 'Promover a completa emancipação humana e o desenvolvimento sustentável integral, atuando como catalisador inigualável de transformações sociais, ambientais, educacionais e culturais.',
  visionStatement: 'Ser o fator decisivo na construção de um mundo equitativo, próspero e regenerativo, onde a necessidade da assistência social como a conhecemos tenha sido mitigada pela eficácia de nossas soluções.',
  valueBlocks: [
    { id: '1', name: 'Excelência Inflexível', iconIdentifier: 'star', description: 'Não buscamos apenas a melhoria; exigimos a perfeição. Nosso padrão de qualidade é o mais alto do mundo, sem margem para mediocridade.' },
    { id: '2', name: 'Transparência Quântica', iconIdentifier: 'shield', description: 'Operamos com um nível de clareza que excede normas globais. Nossa integridade é a essência visível de todas as decisões.' },
    { id: '3', name: 'Protagonismo Regenerativo', iconIdentifier: 'zap', description: 'Buscamos um impacto que não apenas restaure, mas aprimore e gere vitalidade nos sistemas sociais e ambientais.' },
    { id: '4', name: 'Compromisso Perpétuo', iconIdentifier: 'infinity', description: 'Nossa dedicação é incondicional e atemporal. Nosso trabalho é um legado que transcende gerações.' },
  ],
  timelineMilestones: [
    { id: '1', year: 2007, title: 'Fundação Conceitual', impactDescription: 'Estabelecimento do Instituto a partir da fusão de três fundações líderes e criação da Metodologia M-IS.' },
    { id: '2', year: 2012, title: 'Fundo Perpétuo', impactDescription: 'Alcance da independência operacional com o Fundo F-P, assegurando 100% das doações para programas finalísticos.' },
    { id: '3', year: 2015, title: 'Prêmio Global GEA', impactDescription: 'Recebimento do Global Excellence Award da ONU. A Metodologia M-IS torna-se benchmark global.' },
    { id: '4', year: 2025, title: 'Marco do Milhão', impactDescription: 'Aproximação da meta de impactar um milhão de vidas e lançamento da Agenda 2035.' },
  ],
  networkIntro: 'O Instituto Ser Melhor reconhece que a excelência não é alcançada no isolamento. Nossa Rede de Colaboração de Elite (R-CE) é um ecossistema seletivo de stakeholders globais.',
  networkCards: [
    { id: '1', icon: '🌐', title: 'Parcerias Nível Tier 1', description: 'Trabalhamos com universidades de pesquisa de ponta, think tanks globais e agências multilaterais para co-desenvolver e validar a Metodologia M-IS.' },
    { id: '2', icon: '🏢', title: 'Apoio Corporativo Estratégico', description: 'Alianças baseadas na excelência ESG. Exigimos que nossos parceiros demonstrem liderança na neutralidade de carbono e na inclusão social.' },
    { id: '3', icon: '🔄', title: 'Intercâmbio de Conhecimento', description: 'Programas de intercâmbio com as melhores ONGs do mundo, garantindo práticas na fronteira do conhecimento e eficácia operacional.' },
  ],
  logoImage: '/logo-ism.png',
  logoExplanation: 'O emblema circular com três figuras humanas estilizadas representa o nosso foco no Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o Ciclo da Prosperidade e a natureza regenerativa de nosso trabalho.',
  governanceIntro: 'A Governança do Instituto Ser Melhor é uma arquitetura de controle e deliberação desenhada para garantir a perpetuidade da Missão, a transparência quântica e a máxima eficiência na alocação de recursos.',
  governanceInstances: [
    { id: '1', order: 1, title: 'Assembleia Geral de Associados Estratégicos', summary: 'Órgão Máximo e Soberano composto exclusivamente por membros com histórico comprovado de liderança.', keyAttributes: [{ id: '1a', attributeText: 'Aprovar ou rejeita demonstrações financeiras anuais auditadas.' }, { id: '1b', attributeText: 'Elege e destitui membros dos Conselhos.' }, { id: '1c', attributeText: 'Exige Quórum Qualificado (2/3) para deliberações patrimoniais.' }] },
    { id: '2', order: 2, title: 'Conselho Deliberativo de Excelência (CDE)', summary: 'Guardião da Integridade e Estratégia, responsável por supervisionar a Diretoria-Executiva.', keyAttributes: [{ id: '2a', attributeText: 'Independência Radical: Sem vínculos com a gestão executiva.' }, { id: '2b', attributeText: 'Aprova Políticas de Risco e Compliance.' }] },
    { id: '3', order: 3, title: 'Conselho Fiscal e de Auditoria Quântica (CFA)', summary: 'Assegura a Transparência Quântica e a aderência aos padrões IFRS.', keyAttributes: [{ id: '3a', attributeText: 'Emite Parecer Sem Ressalvas sobre Demonstrações Financeiras.' }, { id: '3b', attributeText: 'Reporte direto à Assembleia Geral.' }] },
    { id: '4', order: 4, title: 'Diretoria-Executiva de Gestão (D-E)', summary: 'Responsável pela gestão estratégica e operacional do dia a dia e entrega de resultados.', keyAttributes: [{ id: '4a', attributeText: 'Liderada por CEO de visão global.' }, { id: '4b', attributeText: 'Administração do patrimônio e execução orçamentária.' }] },
  ],
  teamMembers: [
    { id: '1', name: 'Rikardo Ribeiro', role: 'Presidente do CDE', type: 'board', bio: 'Referência global em conservação e desenvolvimento sustentável.', imageUrl: 'https://picsum.photos/200/200?random=1' },
    { id: '2', name: 'Ana Lima', role: 'CEO', type: 'executive', bio: 'Executiva premiada por inovação em impacto social.', imageUrl: 'https://picsum.photos/200/200?random=3' },
    { id: '3', name: 'Carlos Mendes', role: 'Diretor de Programas', type: 'executive', bio: 'Especialista em gestão de projetos de impacto ambiental.', imageUrl: 'https://picsum.photos/200/200?random=5' },
    { id: '4', name: 'Dra. Sofia Costa', role: 'Conselheira Científica', type: 'advisor', bio: 'Pesquisadora do MIT com foco em biomas brasileiros.', imageUrl: 'https://picsum.photos/200/200?random=7' },
  ],
};

const STORAGE_KEY = 'ism_about_team_draft';
const ICON_OPTIONS = ['⭐', '🛡️', '⚡', '♾️', '🌿', '🤝', '🎯', '💡', '🔬', '📊', '🌍', '❤️'];
const MEMBER_TYPE_LABELS: Record<TeamMember['type'], string> = { board: 'Conselho', executive: 'Executivo', advisor: 'Consultor' };
const MEMBER_TYPE_COLORS: Record<TeamMember['type'], { bg: string; text: string }> = {
  board: { bg: '#eff6ff', text: '#3b82f6' },
  executive: { bg: '#f0fdf4', text: '#16a34a' },
  advisor: { bg: '#fdf4ff', text: '#a855f7' },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 76, lineHeight: 1.6 };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.15s' };
const btnSecondary: React.CSSProperties = { ...btnPrimary, background: 'white', color: '#374151', boxShadow: 'none', border: '1px solid #e5e7eb' };
const btnDanger: React.CSSProperties = { ...btnPrimary, background: '#fff1f2', color: '#ef4444', boxShadow: 'none', border: '1px solid #fecdd3' };

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', ...style }}>
    {children}
  </div>
);

const SectionHeader: React.FC<{ icon: string; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{description}</div>
      </div>
    </div>
    {action}
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{hint && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}
    </label>
    {children}
  </div>
);

// Collapsible accordion row
const Accordion: React.FC<{ title: string; badge?: string; badgeColor?: string; children: React.ReactNode; defaultOpen?: boolean; onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void; disableUp?: boolean; disableDown?: boolean }> = ({
  title, badge, badgeColor = '#3b82f6', children, defaultOpen = false, onDelete, onMoveUp, onMoveDown, disableUp, disableDown
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: open ? '#f0fdf4' : '#f9fafb', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {badge && <span style={{ background: badgeColor + '18', color: badgeColor, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{badge}</span>}
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sem título</span>}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onMoveUp && <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={disableUp} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 7px', cursor: disableUp ? 'not-allowed' : 'pointer', opacity: disableUp ? 0.35 : 1 }}><MoveUp size={12} /></button>}
          {onMoveDown && <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={disableDown} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 7px', cursor: disableDown ? 'not-allowed' : 'pointer', opacity: disableDown ? 0.35 : 1 }}><MoveDown size={12} /></button>}
          {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 7, padding: '4px 7px', cursor: 'pointer' }}><Trash2 size={12} color="#ef4444" /></button>}
          {open ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
        </div>
      </div>
      {open && <div style={{ padding: 16, background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
    </div>
  );
};

// ─── Preview panel ────────────────────────────────────────────────────────────
const AboutPreview: React.FC<{ data: AboutData }> = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>

    {/* Missão / Visão */}
    <div style={{ background: 'white', padding: '28px 24px' }}>
      <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{data.aboutBadgeText}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 16, lineHeight: 1.1 }}>Quem <span style={{ color: '#16a34a' }}>Somos</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Nossa Missão', text: data.missionStatement, color: '#16a34a' },
          { label: 'Nossa Visão', text: data.visionStatement, color: '#1e293b' },
        ].map(c => (
          <div key={c.label} style={{ borderLeft: `4px solid ${c.color}`, paddingLeft: 14, paddingTop: 10, paddingBottom: 10, background: '#f9fafb', borderRadius: '0 10px 10px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>"{c.text.slice(0, 120)}{c.text.length > 120 ? '…' : ''}"</div>
          </div>
        ))}
      </div>
      {data.aboutImage && <img src={data.aboutImage} alt="Sobre" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginTop: 14 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
    </div>

    {/* Valores */}
    <div style={{ background: '#f9fafb', padding: '20px 24px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 12 }}>🌟 Valores Institucionais ({data.valueBlocks.length})</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {data.valueBlocks.map(v => (
          <div key={v.id} style={{ background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{ICON_OPTIONS.find(() => true) || '⭐'}</span>
              <span style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>{v.name}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{v.description.slice(0, 70)}…</div>
          </div>
        ))}
      </div>
    </div>

    {/* Timeline */}
    <div style={{ background: 'white', padding: '20px 24px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 12 }}>📅 Linha do Tempo ({data.timelineMilestones.length} marcos)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.timelineMilestones.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ background: '#16a34a', color: 'white', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{m.year}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>{m.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{m.impactDescription.slice(0, 80)}…</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Equipe */}
    <div style={{ background: '#0f172a', padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 12 }}>👥 Equipe ({data.teamMembers.length} membros)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
        {data.teamMembers.map(m => (
          <div key={m.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img src={m.imageUrl} alt={m.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', margin: '0 auto 8px' }} onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=16a34a&color=fff`; }} />
            <div style={{ fontWeight: 700, fontSize: 11, color: 'white', lineHeight: 1.2 }}>{m.name}</div>
            <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>{m.role}</div>
            <span style={{ ...MEMBER_TYPE_COLORS[m.type], padding: '1px 6px', borderRadius: 99, fontSize: 9, fontWeight: 700, display: 'inline-block', marginTop: 4, background: MEMBER_TYPE_COLORS[m.type].bg }}>{MEMBER_TYPE_LABELS[m.type]}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const AboutTeamPage: React.FC = () => {
  const [data, setData] = useState<AboutData>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT; }
    catch { return DEFAULT; }
  });
  const [savedVersion, setSavedVersion] = useState<AboutData>(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'values' | 'timeline' | 'network' | 'governance' | 'team'>('identity');
  const isDirty = JSON.stringify(data) !== JSON.stringify(savedVersion);

  useEffect(() => { const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), 700); return () => clearTimeout(t); }, [data]);

  const set = <K extends keyof AboutData>(key: K, val: AboutData[K]) => setData(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(r => setTimeout(r, 900));
    setSavedVersion(data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleReset = () => {
    if (!confirm('Restaurar todos os valores originais?')) return;
    setData(DEFAULT); setSavedVersion(DEFAULT);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── ValueBlocks helpers
  const addValue = () => set('valueBlocks', [...data.valueBlocks, { id: Date.now().toString(), name: '', iconIdentifier: 'star', description: '' }]);
  const updateValue = (id: string, f: keyof ValueBlock, v: string) => set('valueBlocks', data.valueBlocks.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removeValue = (id: string) => set('valueBlocks', data.valueBlocks.filter(x => x.id !== id));
  const moveValue = (id: string, dir: -1 | 1) => {
    const arr = [...data.valueBlocks]; const i = arr.findIndex(x => x.id === id); const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return; [arr[i], arr[ni]] = [arr[ni], arr[i]]; set('valueBlocks', arr);
  };

  // ── Timeline helpers
  const addMilestone = () => set('timelineMilestones', [...data.timelineMilestones, { id: Date.now().toString(), year: new Date().getFullYear(), title: '', impactDescription: '' }]);
  const updateMilestone = (id: string, f: keyof TimelineMilestone, v: string | number) => set('timelineMilestones', data.timelineMilestones.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removeMilestone = (id: string) => set('timelineMilestones', data.timelineMilestones.filter(x => x.id !== id));
  const moveMilestone = (id: string, dir: -1 | 1) => {
    const arr = [...data.timelineMilestones]; const i = arr.findIndex(x => x.id === id); const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return; [arr[i], arr[ni]] = [arr[ni], arr[i]]; set('timelineMilestones', arr);
  };

  // ── Network helpers
  const addNetworkCard = () => set('networkCards', [...data.networkCards, { id: Date.now().toString(), icon: '🌍', title: '', description: '' }]);
  const updateNetworkCard = (id: string, f: keyof NetworkCard, v: string) => set('networkCards', data.networkCards.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removeNetworkCard = (id: string) => set('networkCards', data.networkCards.filter(x => x.id !== id));

  // ── Governance helpers
  const addInstance = () => set('governanceInstances', [...data.governanceInstances, { id: Date.now().toString(), order: data.governanceInstances.length + 1, title: '', summary: '', keyAttributes: [] }]);
  const updateInstance = (id: string, f: string, v: any) => set('governanceInstances', data.governanceInstances.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removeInstance = (id: string) => set('governanceInstances', data.governanceInstances.filter(x => x.id !== id));
  const moveInstance = (id: string, dir: -1 | 1) => {
    const arr = [...data.governanceInstances]; const i = arr.findIndex(x => x.id === id); const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return; [arr[i], arr[ni]] = [arr[ni], arr[i]]; set('governanceInstances', arr);
  };
  const addAttribute = (instId: string) => {
    const inst = data.governanceInstances.find(x => x.id === instId);
    if (!inst) return;
    updateInstance(instId, 'keyAttributes', [...inst.keyAttributes, { id: Date.now().toString(), attributeText: '' }]);
  };
  const updateAttribute = (instId: string, attrId: string, text: string) => {
    const inst = data.governanceInstances.find(x => x.id === instId);
    if (!inst) return;
    updateInstance(instId, 'keyAttributes', inst.keyAttributes.map(a => a.id === attrId ? { ...a, attributeText: text } : a));
  };
  const removeAttribute = (instId: string, attrId: string) => {
    const inst = data.governanceInstances.find(x => x.id === instId);
    if (!inst) return;
    updateInstance(instId, 'keyAttributes', inst.keyAttributes.filter(a => a.id !== attrId));
  };

  // ── Team helpers
  const addMember = () => set('teamMembers', [...data.teamMembers, { id: Date.now().toString(), name: '', role: '', type: 'executive', bio: '', imageUrl: '' }]);
  const updateMember = (id: string, f: keyof TeamMember, v: string) => set('teamMembers', data.teamMembers.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removeMember = (id: string) => set('teamMembers', data.teamMembers.filter(x => x.id !== id));
  const moveMember = (id: string, dir: -1 | 1) => {
    const arr = [...data.teamMembers]; const i = arr.findIndex(x => x.id === id); const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return; [arr[i], arr[ni]] = [arr[ni], arr[i]]; set('teamMembers', arr);
  };

  const TABS = [
    { id: 'identity' as const, label: '🏛️ Identidade', count: null },
    { id: 'values' as const, label: '🌟 Valores', count: data.valueBlocks.length },
    { id: 'timeline' as const, label: '📅 Timeline', count: data.timelineMilestones.length },
    { id: 'network' as const, label: '🌐 Rede', count: data.networkCards.length },
    { id: 'governance' as const, label: '⚖️ Governança', count: data.governanceInstances.length },
    { id: 'team' as const, label: '👥 Equipe', count: data.teamMembers.length },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>🏛️ Editor — Sobre &amp; Equipe</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie missão, visão, valores, timeline, rede de parceiros, governança e equipe
            {isDirty && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>● Não salvo</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, textDecoration: 'none' }}>
            <Eye size={14} /> Ver Site
          </a>
          <button onClick={handleReset} style={btnSecondary}><RotateCcw size={14} /> Restaurar</button>
          <button onClick={() => setShowPreview(p => !p)} style={{ ...btnSecondary, background: showPreview ? '#eff6ff' : 'white', color: showPreview ? '#3b82f6' : '#374151', borderColor: showPreview ? '#bfdbfe' : '#e5e7eb' }}>
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} Preview
          </button>
          <button onClick={handleSave} disabled={saveStatus === 'saving' || !isDirty}
            style={{ ...btnPrimary, opacity: !isDirty ? 0.5 : 1, cursor: !isDirty ? 'not-allowed' : 'pointer' }}>
            {saveStatus === 'saving' ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Salvando…</> :
              saveStatus === 'saved' ? <><CheckCircle size={14} />Publicado!</> :
              <><Save size={14} />Publicar Alterações</>}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left: Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 5, background: 'white', padding: 5, borderRadius: 14, border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', transition: 'all 0.18s', background: activeTab === t.id ? '#16a34a' : 'transparent', color: activeTab === t.id ? 'white' : '#6b7280', boxShadow: activeTab === t.id ? '0 2px 8px rgba(22,163,74,0.28)' : 'none' }}>
                {t.label}
                {t.count !== null && <span style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: activeTab === t.id ? 'white' : '#374151', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ══ IDENTITY ══ */}
          {activeTab === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionHeader icon="🎯" title="Missão & Visão" description="Textos centrais exibidos na seção 'Sobre Nós'" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Field label="Badge 'Sobre Nós'">
                    <input value={data.aboutBadgeText} onChange={e => set('aboutBadgeText', e.target.value)} style={inputStyle} placeholder="Sobre Nós" />
                  </Field>
                  <Field label="Declaração de Missão">
                    <textarea value={data.missionStatement} onChange={e => set('missionStatement', e.target.value)} style={{ ...textareaStyle, minHeight: 100 }} />
                    <span style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{data.missionStatement.length} chars</span>
                  </Field>
                  <Field label="Declaração de Visão">
                    <textarea value={data.visionStatement} onChange={e => set('visionStatement', e.target.value)} style={{ ...textareaStyle, minHeight: 100 }} />
                    <span style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{data.visionStatement.length} chars</span>
                  </Field>
                </div>
              </Card>

              <Card>
                <SectionHeader icon="🖼️" title="Imagem da Seção Sobre" description="Foto exibida ao lado dos textos de missão e visão" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="URL da Imagem" hint="Recomendado: 800×600px">
                    <input value={data.aboutImage} onChange={e => set('aboutImage', e.target.value)} style={inputStyle} placeholder="https://..." />
                  </Field>
                  {data.aboutImage && (
                    <img src={data.aboutImage} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid #e5e7eb' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              </Card>

              <Card>
                <SectionHeader icon="🔵" title="Identidade Visual / Logotipo" description="Imagem do logotipo e explicação do símbolo institucional" />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Field label="URL do Logotipo">
                    <input value={data.logoImage} onChange={e => set('logoImage', e.target.value)} style={inputStyle} placeholder="/logo-ism.png" />
                  </Field>
                  <Field label="Explicação do Símbolo / Logotipo" hint="Texto explicativo exibido na seção de identidade visual">
                    <textarea value={data.logoExplanation} onChange={e => set('logoExplanation', e.target.value)} style={{ ...textareaStyle, minHeight: 100 }} />
                  </Field>
                </div>
              </Card>
            </div>
          )}

          {/* ══ VALUES ══ */}
          {activeTab === 'values' && (
            <Card>
              <SectionHeader icon="🌟" title="Valores Institucionais" description="Cards exibidos na seção de valores do site"
                action={<button onClick={addValue} style={btnPrimary}><Plus size={13} /> Adicionar Valor</button>}
              />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.valueBlocks.map((v, idx) => (
                  <Accordion key={v.id} title={v.name || 'Novo Valor'}
                    defaultOpen={idx === 0}
                    onDelete={() => removeValue(v.id)}
                    onMoveUp={() => moveValue(v.id, -1)} disableUp={idx === 0}
                    onMoveDown={() => moveValue(v.id, 1)} disableDown={idx === data.valueBlocks.length - 1}
                  >
                    <Field label="Ícone" hint="Escolha um emoji">
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ICON_OPTIONS.map(ico => (
                          <button key={ico} onClick={() => updateValue(v.id, 'iconIdentifier', ico)}
                            style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid', borderColor: v.iconIdentifier === ico ? '#16a34a' : '#e5e7eb', background: v.iconIdentifier === ico ? '#f0fdf4' : 'white', fontSize: 18, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {ico}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Nome do Valor">
                      <input value={v.name} onChange={e => updateValue(v.id, 'name', e.target.value)} style={inputStyle} placeholder="Ex: Excelência Inflexível" />
                    </Field>
                    <Field label="Descrição">
                      <textarea value={v.description} onChange={e => updateValue(v.id, 'description', e.target.value)} style={textareaStyle} placeholder="Descreva o valor institucional..." />
                    </Field>
                  </Accordion>
                ))}
                {data.valueBlocks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum valor cadastrado. Clique em "+ Adicionar Valor".</div>
                )}
              </div>
            </Card>
          )}

          {/* ══ TIMELINE ══ */}
          {activeTab === 'timeline' && (
            <Card>
              <SectionHeader icon="📅" title="Linha do Tempo" description="Marcos históricos exibidos na seção de trajetória"
                action={<button onClick={addMilestone} style={btnPrimary}><Plus size={13} /> Adicionar Marco</button>}
              />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.timelineMilestones.map((m, idx) => (
                  <Accordion key={m.id} title={m.title || `Marco ${idx + 1}`} badge={String(m.year)} badgeColor="#16a34a"
                    defaultOpen={idx === 0}
                    onDelete={() => removeMilestone(m.id)}
                    onMoveUp={() => moveMilestone(m.id, -1)} disableUp={idx === 0}
                    onMoveDown={() => moveMilestone(m.id, 1)} disableDown={idx === data.timelineMilestones.length - 1}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
                      <Field label="Ano">
                        <input type="number" value={m.year} onChange={e => updateMilestone(m.id, 'year', Number(e.target.value))}
                          style={{ ...inputStyle, fontWeight: 800, textAlign: 'center' }} min={1900} max={2100} />
                      </Field>
                      <Field label="Título do Marco">
                        <input value={m.title} onChange={e => updateMilestone(m.id, 'title', e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} placeholder="Ex: Fundação Conceitual" />
                      </Field>
                    </div>
                    <Field label="Descrição do Impacto">
                      <textarea value={m.impactDescription} onChange={e => updateMilestone(m.id, 'impactDescription', e.target.value)} style={textareaStyle} placeholder="Descreva o impacto deste marco..." />
                    </Field>
                  </Accordion>
                ))}
                {data.timelineMilestones.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum marco cadastrado.</div>
                )}
              </div>
            </Card>
          )}

          {/* ══ NETWORK ══ */}
          {activeTab === 'network' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionHeader icon="🌐" title="Rede de Colaboração" description="Seção de parcerias estratégicas" />
                <div style={{ padding: 24 }}>
                  <Field label="Texto Introdutório da Seção">
                    <textarea value={data.networkIntro} onChange={e => set('networkIntro', e.target.value)} style={{ ...textareaStyle, minHeight: 90 }} placeholder="Descreva a rede de colaboração..." />
                  </Field>
                </div>
              </Card>
              <Card>
                <SectionHeader icon="🤝" title="Cards de Parceria" description="Cartões de cada tipo de parceria estratégica"
                  action={<button onClick={addNetworkCard} style={btnPrimary}><Plus size={13} /> Adicionar Card</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.networkCards.map((c, idx) => (
                    <Accordion key={c.id} title={c.title || `Card ${idx + 1}`} badge={c.icon}
                      onDelete={() => removeNetworkCard(c.id)}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
                        <Field label="Ícone (emoji)">
                          <input value={c.icon} onChange={e => updateNetworkCard(c.id, 'icon', e.target.value)} style={{ ...inputStyle, fontSize: 22, textAlign: 'center' }} maxLength={2} />
                        </Field>
                        <Field label="Título">
                          <input value={c.title} onChange={e => updateNetworkCard(c.id, 'title', e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} placeholder="Ex: Parcerias Nível Tier 1" />
                        </Field>
                      </div>
                      <Field label="Descrição">
                        <textarea value={c.description} onChange={e => updateNetworkCard(c.id, 'description', e.target.value)} style={textareaStyle} />
                      </Field>
                    </Accordion>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ GOVERNANCE ══ */}
          {activeTab === 'governance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionHeader icon="⚖️" title="Texto de Governança" description="Introdução exibida no topo da seção" />
                <div style={{ padding: 24 }}>
                  <Field label="Introdução da Governança">
                    <textarea value={data.governanceIntro} onChange={e => set('governanceIntro', e.target.value)} style={{ ...textareaStyle, minHeight: 90 }} />
                  </Field>
                </div>
              </Card>
              <Card>
                <SectionHeader icon="🏛️" title="Instâncias de Governança" description="Órgãos e conselhos do instituto"
                  action={<button onClick={addInstance} style={btnPrimary}><Plus size={13} /> Nova Instância</button>}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.governanceInstances.map((inst, idx) => (
                    <Accordion key={inst.id} title={inst.title || 'Nova Instância'} badge={`#${idx + 1}`} badgeColor="#6366f1"
                      defaultOpen={idx === 0}
                      onDelete={() => removeInstance(inst.id)}
                      onMoveUp={() => moveInstance(inst.id, -1)} disableUp={idx === 0}
                      onMoveDown={() => moveInstance(inst.id, 1)} disableDown={idx === data.governanceInstances.length - 1}
                    >
                      <Field label="Nome da Instância">
                        <input value={inst.title} onChange={e => updateInstance(inst.id, 'title', e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} placeholder="Ex: Conselho Deliberativo de Excelência" />
                      </Field>
                      <Field label="Resumo / Papel">
                        <textarea value={inst.summary} onChange={e => updateInstance(inst.id, 'summary', e.target.value)} style={textareaStyle} placeholder="Descreva o papel desta instância..." />
                      </Field>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Atribuições Principais</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {inst.keyAttributes.map((attr, ai) => (
                            <div key={attr.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#6366f1', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ai + 1}</div>
                              <input value={attr.attributeText} onChange={e => updateAttribute(inst.id, attr.id, e.target.value)}
                                style={{ ...inputStyle, flex: 1 }} placeholder="Ex: Aprova demonstrações financeiras..." />
                              <button onClick={() => removeAttribute(inst.id, attr.id)}
                                style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', flexShrink: 0 }}>
                                <Trash2 size={12} color="#ef4444" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addAttribute(inst.id)} style={{ ...btnSecondary, justifyContent: 'center', padding: '7px', marginTop: 2 }}>
                            <Plus size={12} /> Adicionar Atribuição
                          </button>
                        </div>
                      </div>
                    </Accordion>
                  ))}
                  {data.governanceInstances.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>Nenhuma instância cadastrada.</div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ══ TEAM ══ */}
          {activeTab === 'team' && (
            <Card>
              <SectionHeader icon="👥" title="Membros da Equipe" description="Pessoas exibidas na seção de governança e liderança"
                action={<button onClick={addMember} style={btnPrimary}><Plus size={13} /> Adicionar Membro</button>}
              />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.teamMembers.map((m, idx) => (
                  <Accordion key={m.id}
                    title={m.name || 'Novo Membro'}
                    badge={MEMBER_TYPE_LABELS[m.type]}
                    badgeColor={MEMBER_TYPE_COLORS[m.type].text}
                    defaultOpen={idx === 0}
                    onDelete={() => removeMember(m.id)}
                    onMoveUp={() => moveMember(m.id, -1)} disableUp={idx === 0}
                    onMoveDown={() => moveMember(m.id, 1)} disableDown={idx === data.teamMembers.length - 1}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 16, alignItems: 'start' }}>
                      {/* Avatar Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name}
                            style={{ width: 76, height: 76, borderRadius: 14, objectFit: 'cover', border: '2px solid #e5e7eb' }}
                            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'N')}&background=16a34a&color=fff&size=80`; }}
                          />
                        ) : (
                          <div style={{ width: 76, height: 76, borderRadius: 14, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db' }}>
                            <UserCircle2 size={32} color="#d1d5db" />
                          </div>
                        )}
                        <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Pré-visualização</span>
                      </div>
                      {/* Fields */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Field label="Nome Completo">
                          <input value={m.name} onChange={e => updateMember(m.id, 'name', e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} placeholder="Nome do membro" />
                        </Field>
                        <Field label="Cargo / Função">
                          <input value={m.role} onChange={e => updateMember(m.id, 'role', e.target.value)} style={inputStyle} placeholder="Ex: CEO, Presidente do CDE" />
                        </Field>
                        <Field label="Tipo">
                          <select value={m.type} onChange={e => updateMember(m.id, 'type', e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="executive">Executivo</option>
                            <option value="board">Conselho</option>
                            <option value="advisor">Consultor</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                    <Field label="URL da Foto">
                      <input value={m.imageUrl} onChange={e => updateMember(m.id, 'imageUrl', e.target.value)} style={inputStyle} placeholder="https://..." />
                    </Field>
                    <Field label="Bio / Apresentação">
                      <textarea value={m.bio} onChange={e => updateMember(m.id, 'bio', e.target.value)} style={textareaStyle} placeholder="Breve apresentação do membro..." />
                    </Field>
                  </Accordion>
                ))}
                {data.teamMembers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>Nenhum membro cadastrado.</div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Preview ── */}
        {showPreview && (
          <div style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>🖥️ Preview</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Atualiza em tempo real</span>
              </div>
              <div style={{ padding: 12, background: '#f1f5f9', maxHeight: '78vh', overflowY: 'auto' }}>
                <AboutPreview data={data} />
              </div>
            </div>
            {saveStatus === 'saved' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginTop: 12 }}>
                <CheckCircle size={15} color="#16a34a" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Alterações publicadas com sucesso!</span>
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
        onDiscard={handleReset}
        message="Sobre & Equipe possui alterações não salvas"
      />
    </div>
  );
};
