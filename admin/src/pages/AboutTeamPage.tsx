import {
  Save, RotateCcw, Plus, Trash2, MoveUp, MoveDown,
  CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp, UserCircle2,
  Award, FileText, BarChart2, MapPin, ShieldCheck, Heart, Users, Layers,
  GripVertical, Copy, Search, ExternalLink, RefreshCw, Star, Globe, Mail, Phone,
  BookOpen, AlertCircle, Share2
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { ImageUploadInput } from '../components/ui/ImageUploadInput';
import { InstitutionalFirestoreService } from '../services/institutional';
import {
  InstitutionalEnterpriseService,
  type ImpactIndicator,
  type TransparencyDocument,
  type OrgCertification
} from '../services/institutionalEnterprise';
import {
  GovernanceMembersService,
  type GovernanceMemberAdmin,
  type MemberCategory,
  type MemberPublicationStatus,
  validateHttpsUrl
} from '../services/governanceMembersService';
import { MemberCardPreview } from '../components/cms/MemberCardPreview';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ValueBlock { id: string; name: string; iconIdentifier: string; description: string; }
interface TimelineMilestone { id: string; year: number; title: string; impactDescription: string; }
interface GovernanceInstance {
  id: string; order: number; title: string; summary: string;
  keyAttributes: { id: string; attributeText: string }[];
}
interface NetworkCard { id: string; icon: string; title: string; description: string; }

interface AboutData {
  aboutBadgeText: string;
  aboutImage: string;
  missionStatement: string;
  visionStatement: string;
  valueBlocks: ValueBlock[];
  timelineMilestones: TimelineMilestone[];
  networkIntro: string;
  networkCards: NetworkCard[];
  logoImage: string;
  logoExplanation: string;
  governanceIntro: string;
  governanceInstances: GovernanceInstance[];
}

const DEFAULT: AboutData = {
  aboutBadgeText: 'Sobre Nós',
  aboutImage: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80',
  missionStatement: 'Promover a emancipação humana e o desenvolvimento sustentável, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais, com base em direitos, evidências e impacto mensurável.',
  visionStatement: 'Ser uma organização de referência na construção de um mundo equitativo, próspero e regenerativo, onde o fortalecimento de capacidades e a garantia de direitos reduzam estruturalmente as situações de vulnerabilidade social.',
  valueBlocks: [
    { id: '1', name: 'Excelência com Integridade', iconIdentifier: 'star', description: 'Buscamos a melhoria contínua com rigor técnico, responsabilidade institucional e compromisso permanente com a qualidade de nossas ações e a dignidade das pessoas que atendemos.' },
    { id: '2', name: 'Transparência e Prestação de Contas', iconIdentifier: 'shield', description: 'Operamos com abertura e clareza em todos os processos, tornando públicas nossas decisões, contas e resultados de forma acessível, compreensível e auditável.' },
    { id: '3', name: 'Protagonismo Comunitário', iconIdentifier: 'zap', description: 'Reconhecemos as comunidades como protagonistas de seu próprio desenvolvimento, apoiando processos de fortalecimento de capacidades, autonomia e participação ativa na construção de soluções.' },
    { id: '4', name: 'Compromisso de Longo Prazo', iconIdentifier: 'infinity', description: 'Nossa atuação é orientada para impactos duradouros e estruturais, construindo legados que fortalecem gerações presentes e futuras com base em desenvolvimento sustentável e justiça social.' },
  ],
  timelineMilestones: [
    { id: '1', year: 2007, title: 'Fundação Conceitual', impactDescription: 'Estabelecimento do Instituto a partir da fusão de três fundações líderes e criação da Metodologia M-IS.' },
    { id: '2', year: 2012, title: 'Fundo Perpétuo', impactDescription: 'Alcance da independência operacional com o Fundo F-P, assegurando 100% das doações para programas finalísticos.' },
    { id: '3', year: 2015, title: 'Prêmio Global GEA', impactDescription: 'Recebimento do Global Excellence Award da ONU. A Metodologia M-IS torna-se benchmark global.' },
    { id: '4', year: 2025, title: 'Marco do Milhão', impactDescription: 'Aproximação da meta de impactar um milhão de vidas e lançamento da Agenda 2035.' },
  ],
  networkIntro: 'O Instituto Ser Melhor reconhece que o impacto sustentável se constrói em parceria. Nosso Ecossistema Colaborativo Estratégico reúne organizações nacionais e internacionais comprometidas com o desenvolvimento sustentável e a inovação social.',
  networkCards: [
    { id: '1', icon: '🌐', title: 'Parcerias Acadêmicas e Multilaterais', description: 'Colaboramos com universidades de pesquisa, centros de excelência e agências multilaterais para desenvolver e validar metodologias de impacto social baseadas em evidências.' },
    { id: '2', icon: '🏢', title: 'Parcerias Corporativas com Alinhamento ESG', description: 'Priorizamos parceiros corporativos que demonstrem compromisso com práticas ESG, inclusão social e responsabilidade socioambiental em suas operações.' },
    { id: '3', icon: '🔄', title: 'Intercâmbio com Organizações de Referência', description: 'Programas de cooperação com organizações da sociedade civil nacionais e internacionais para compartilhar conhecimento, boas práticas e metodologias de inovação social.' },
  ],
  logoImage: '/logo-ism.png',
  logoExplanation: 'O emblema circular com três figuras humanas estilizadas representa o nosso compromisso com o Desenvolvimento Sustentável Integral. O arco exterior amarelo simboliza o ciclo da prosperidade e a natureza regenerativa de nosso trabalho.',
  governanceIntro: 'A Governança do Instituto Ser Melhor é uma arquitetura de controle, deliberação e prestação de contas, estruturada para garantir a perpetuidade da missão institucional, a transparência, a integridade, a conformidade e a máxima eficiência na gestão e na alocação dos recursos.',
  governanceInstances: [
    { id: '1', order: 1, title: 'Assembleia Geral de Associados', summary: 'Órgão máximo de deliberação institucional, responsável pelas decisões estratégicas e pela eleição dos demais órgãos de governança, nos termos do Estatuto Social e do Código Civil Brasileiro.', keyAttributes: [{ id: '1a', attributeText: 'Aprova as demonstrações financeiras anuais auditadas por auditoria independente.' }, { id: '1b', attributeText: 'Elege e destitui membros dos Conselhos Deliberativo e Fiscal.' }, { id: '1c', attributeText: 'Delibera alterações estatutárias por quórum qualificado (2/3 dos associados).' }] },
    { id: '2', order: 2, title: 'Conselho Deliberativo', summary: 'Órgão de supervisão e controle estratégico, responsável pela fiscalização da gestão executiva e pela aprovação de políticas institucionais de risco, compliance e integridade.', keyAttributes: [{ id: '2a', attributeText: 'Independência funcional: membros sem vínculos com a gestão executiva.' }, { id: '2b', attributeText: 'Aprova políticas de gestão de riscos e compliance.' }] },
  ],
};

type ActiveTab = 'identidade' | 'valores' | 'governanca' | 'transparencia' | 'indicadores' | 'certificacoes';

const CATEGORY_OPTIONS: { id: MemberCategory; label: string }[] = [
  { id: 'DIRETORIA_EXECUTIVA', label: 'Diretoria Executiva' },
  { id: 'CONSELHO_DELIBERATIVO', label: 'Conselho Deliberativo' },
  { id: 'CONSELHO_FISCAL', label: 'Conselho Fiscal' },
  { id: 'CONSELHO_CONSULTIVO', label: 'Conselho Consultivo' },
  { id: 'COORDENACAO', label: 'Coordenação' },
  { id: 'EQUIPE_TECNICA', label: 'Equipe Técnica' },
  { id: 'CONSULTOR', label: 'Consultor' },
  { id: 'VOLUNTARIO', label: 'Voluntário' },
  { id: 'OUTRO', label: 'Outro' },
];

export const AboutTeamPage: React.FC = () => {
  const [data, setData] = useState<AboutData>(DEFAULT);
  const [indicators, setIndicators] = useState<ImpactIndicator[]>([]);
  const [transparencyDocs, setTransparencyDocs] = useState<TransparencyDocument[]>([]);
  const [certifications, setCertifications] = useState<OrgCertification[]>([]);

  // ── Gestão de Integrantes da Liderança & Equipe (E045) ──────────────────────
  const [members, setMembers] = useState<GovernanceMemberAdmin[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberEditMode, setMemberEditMode] = useState<'list' | 'edit' | 'create'>('list');
  const [memberDraft, setMemberDraft] = useState<Partial<GovernanceMemberAdmin>>({});
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<MemberPublicationStatus | 'ALL'>('ALL');
  const [memberCategoryFilter, setMemberCategoryFilter] = useState<string>('ALL');
  const [memberShowPreview, setMemberShowPreview] = useState(false);
  const [memberDragOver, setMemberDragOver] = useState<number | null>(null);
  const memberDragIdx = useRef<number | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberSaved, setMemberSaved] = useState(false);
  const [memberLastSync, setMemberLastSync] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('identidade');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Autosave
  const autosave = useCMSAutosave('about', data);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [page, vals, gov, time, memsList, inds, docs, certs] = await Promise.all([
        InstitutionalFirestoreService.getPage(),
        InstitutionalFirestoreService.getValueBlocks(),
        InstitutionalFirestoreService.getGovernanceInstances(),
        InstitutionalFirestoreService.getTimelineMilestones(),
        GovernanceMembersService.getOrSeed(),
        InstitutionalEnterpriseService.getIndicators(),
        InstitutionalEnterpriseService.getTransparencyDocs(),
        InstitutionalEnterpriseService.getCertifications(),
      ]);

      setMembers(memsList);
      setMemberLastSync(new Date());

      if (page) {
        setData({
          aboutBadgeText: page.title || DEFAULT.aboutBadgeText,
          aboutImage: page.heroImage || DEFAULT.aboutImage,
          missionStatement: page.missionStatement || DEFAULT.missionStatement,
          visionStatement: page.visionStatement || DEFAULT.visionStatement,
          valueBlocks: vals.length ? vals.map(v => ({ id: v.id!, name: v.name, iconIdentifier: v.iconIdentifier, description: v.description })) : DEFAULT.valueBlocks,
          timelineMilestones: time.length ? time.map(t => ({ id: t.id!, year: t.year, title: t.title, impactDescription: t.impactDescription })) : DEFAULT.timelineMilestones,
          networkIntro: page.networkIntro || DEFAULT.networkIntro,
          networkCards: (page.networkCards as any) || DEFAULT.networkCards,
          logoImage: page.logoImage || DEFAULT.logoImage,
          logoExplanation: page.logoExplanation || DEFAULT.logoExplanation,
          governanceIntro: page.governanceIntro || DEFAULT.governanceIntro,
          governanceInstances: gov.length ? gov.map(g => ({ id: g.id!, order: g.order, title: g.title, summary: g.summary, keyAttributes: g.keyAttributes.map((a, i) => ({ id: String(i), attributeText: a.attributeText })) })) : DEFAULT.governanceInstances,
        });
      }

      setIndicators(inds);
      setTransparencyDocs(docs);
      setCertifications(certs);
    } catch (e) {
      console.error('[AboutTeamPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const handleSavePage = async () => {
    setSaving(true);
    try {
      await InstitutionalFirestoreService.savePage({
        title: data.aboutBadgeText,
        heroImage: data.aboutImage,
        missionStatement: data.missionStatement,
        visionStatement: data.visionStatement,
        networkIntro: data.networkIntro,
        logoImage: data.logoImage,
        logoExplanation: data.logoExplanation,
        governanceIntro: data.governanceIntro,
      });

      await CMSVersionService.saveDraft('about', data as unknown as Record<string, unknown>, 'admin', 'Atualização Módulo Institucional');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[AboutTeamPage] Save error:', e);
      alert('Erro ao salvar módulo institucional.');
    } finally {
      setSaving(false);
    }
  };

  // ── Handler Handlers para Integrantes (E045) ──────────────────────────────────
  const handleMemberNew = () => {
    setMemberDraft({
      name: 'Novo Integrante',
      role: 'Cargo Institucional',
      category: 'DIRETORIA_EXECUTIVA',
      type: 'executive',
      bio: '',
      imageUrl: '',
      imageAlt: '',
      status: 'DRAFT',
      isPublished: false,
      order: members.length + 1,
      isFeatured: false,
      showPublicContact: false,
      expertise: [],
    });
    setMemberEditMode('create');
  };

  const handleMemberEdit = (m: GovernanceMemberAdmin) => {
    setMemberDraft({ ...m });
    setSelectedMemberId(m.id || null);
    setMemberEditMode('edit');
  };

  const handleMemberSave = async () => {
    if (!memberDraft.name?.trim()) { alert('O nome é obrigatório.'); return; }
    if (!memberDraft.role?.trim()) { alert('O cargo é obrigatório.'); return; }
    if (memberDraft.imageUrl && !memberDraft.imageAlt?.trim()) {
      const proceed = window.confirm('A foto do integrante não possui texto alternativo (ALT). Recomendamos preencher para acessibilidade WCAG 2.1 AA. Continuar mesmo assim?');
      if (!proceed) return;
    }

    setMemberSaving(true);
    try {
      const toSave: Partial<GovernanceMemberAdmin> = {
        ...memberDraft,
        category: memberDraft.category || 'DIRETORIA_EXECUTIVA',
        type: memberDraft.type || 'executive',
        status: memberDraft.status || 'DRAFT',
        isPublished: memberDraft.status === 'PUBLISHED',
      };

      if (memberEditMode === 'create') {
        const newId = await GovernanceMembersService.create(toSave as Omit<GovernanceMemberAdmin, 'id'>, 'admin');
        await CMSVersionService.saveDraft('about', { members: [...members, toSave] } as unknown as Record<string, unknown>, 'admin', `Criação Integrante: ${toSave.name}`);
        const updated = await GovernanceMembersService.getAll();
        setMembers(updated);
        setMemberLastSync(new Date());
        setSelectedMemberId(newId);
        setMemberEditMode('edit');
      } else if (selectedMemberId) {
        await GovernanceMembersService.update(selectedMemberId, toSave, 'admin');
        await CMSVersionService.saveDraft('about', { members: members.map(m => m.id === selectedMemberId ? { ...m, ...toSave } : m) } as unknown as Record<string, unknown>, 'admin', `Edição Integrante: ${toSave.name}`);
        const updated = await GovernanceMembersService.getAll();
        setMembers(updated);
        setMemberLastSync(new Date());
      }

      setMemberSaved(true);
      setTimeout(() => setMemberSaved(false), 3000);
    } catch (e) {
      console.error('[AboutTeamPage] Erro ao salvar integrante:', e);
      alert('Erro ao salvar o integrante. Verifique o console.');
    } finally {
      setMemberSaving(false);
    }
  };

  const handleMemberDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir permanentemente o integrante "${name}"? Esta ação não pode ser desfeita.`)) return;
    await GovernanceMembersService.delete(id, name, 'admin');
    const updated = await GovernanceMembersService.getAll();
    setMembers(updated);
    if (selectedMemberId === id) { setSelectedMemberId(null); setMemberEditMode('list'); }
  };

  const handleMemberDuplicate = async (id: string) => {
    await GovernanceMembersService.duplicate(id, 'admin');
    const updated = await GovernanceMembersService.getAll();
    setMembers(updated);
  };

  const handleMemberStatus = async (id: string, status: MemberPublicationStatus) => {
    await GovernanceMembersService.setStatus(id, status, 'admin');
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status, isPublished: status === 'PUBLISHED' } : m));
  };

  const handleMemberReorder = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const copy = [...members];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    const withOrder = copy.map((m, i) => ({ ...m, order: i + 1 }));
    setMembers(withOrder);
    setMemberLastSync(new Date());
    await GovernanceMembersService.reorder(withOrder.map(m => m.id!).filter(Boolean), 'admin');
  };

  const handleMemberDragStart = (idx: number) => { memberDragIdx.current = idx; };
  const handleMemberDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setMemberDragOver(idx); };
  const handleMemberDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (memberDragIdx.current !== null) handleMemberReorder(memberDragIdx.current, targetIdx);
    memberDragIdx.current = null;
    setMemberDragOver(null);
  };
  const handleMemberDragEnd = () => { memberDragIdx.current = null; setMemberDragOver(null); };

  const filteredMembers = members.filter(m => {
    const q = memberSearch.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q) || (m.area || '').toLowerCase().includes(q);
    const matchStatus = memberStatusFilter === 'ALL' || m.status === memberStatusFilter;
    const matchCategory = memberCategoryFilter === 'ALL' || m.category === memberCategoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const tabs = [
    { id: 'identidade' as ActiveTab, label: 'Identidade & Missão', icon: Heart },
    { id: 'valores' as ActiveTab, label: 'Valores & História', icon: Layers },
    { id: 'governanca' as ActiveTab, label: 'Governança & Equipe', icon: Users },
    { id: 'transparencia' as ActiveTab, label: 'Portal da Transparência', icon: FileText },
    { id: 'indicadores' as ActiveTab, label: 'Indicadores (ODS)', icon: BarChart2 },
    { id: 'certificacoes' as ActiveTab, label: 'Certificações', icon: Award },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando dados institucionais...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSavePage} title="Gestão Institucional Enterprise" />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={26} color="#16a34a" /> Módulo Institucional, Governança & Transparência
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Gerencie o propósito, órgãos de governança, liderança/equipe e portal da transparência
        </p>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d) setData(prev => ({ ...prev, ...d })); }}
          onDiscard={autosave.clearSaved}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none',
              borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#16a34a' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Identidade */}
      {activeTab === 'identidade' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Declaração de Missão e Visão</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Declaração de Missão</label>
              <textarea
                value={data.missionStatement}
                onChange={e => setData(prev => ({ ...prev, missionStatement: e.target.value }))}
                rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Declaração de Visão</label>
              <textarea
                value={data.visionStatement}
                onChange={e => setData(prev => ({ ...prev, visionStatement: e.target.value }))}
                rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, fontSize: 14 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Governança & Equipe (E045 completo) */}
      {activeTab === 'governanca' && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Cabeçalho da Seção de Equipe */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={20} color="#16a34a" /> Integrantes da Liderança & Equipe (CMS)
              </h2>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0 0' }}>
                Gerencie os integrantes exibidos na seção &quot;Nossa Liderança&quot; do site (coleção: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>governance_members</code>)
              </p>
              {memberLastSync && (
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RefreshCw size={9} />
                  Sincronizado com o site: {memberLastSync.toLocaleTimeString('pt-BR')}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {memberEditMode !== 'list' && (
                <button
                  onClick={() => { setMemberEditMode('list'); setMemberDraft({}); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Voltar à Lista
                </button>
              )}
              {memberEditMode === 'list' && (
                <button
                  onClick={handleMemberNew}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Novo Integrante
                </button>
              )}
              {memberEditMode !== 'list' && (
                <button
                  onClick={handleMemberSave}
                  disabled={memberSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: memberSaved ? '#16a34a' : '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: memberSaving ? 'not-allowed' : 'pointer', opacity: memberSaving ? 0.7 : 1 }}
                >
                  {memberSaving ? 'Salvando...' : memberSaved ? '✓ Salvo' : 'Salvar Integrante'}
                </button>
              )}
            </div>
          </div>

          {/* MODO LISTA DE INTEGRANTES */}
          {memberEditMode === 'list' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Filtros e Busca */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 10 }} />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Buscar por nome, cargo, área..."
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <select
                  value={memberStatusFilter}
                  onChange={e => setMemberStatusFilter(e.target.value as any)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}
                >
                  <option value="ALL">Todos os status</option>
                  <option value="PUBLISHED">🟢 Publicados</option>
                  <option value="DRAFT">🟡 Rascunhos</option>
                  <option value="ARCHIVED">⚪ Arquivados</option>
                </select>
                <select
                  value={memberCategoryFilter}
                  onChange={e => setMemberCategoryFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}
                >
                  <option value="ALL">Todas as categorias</option>
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
                  {filteredMembers.length} de {members.length} integrantes
                </span>
              </div>

              {filteredMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', background: 'white', border: '1px border-dashed #e5e7eb', borderRadius: 12 }}>
                  Nenhum integrante encontrado. <button onClick={handleMemberNew} style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Cadastrar novo integrante?</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {filteredMembers.map((m, idx) => {
                    const realIdx = members.indexOf(m);
                    const isDragOver = memberDragOver === realIdx;
                    const statusColor = m.status === 'PUBLISHED' ? '#16a34a' : m.status === 'ARCHIVED' ? '#9ca3af' : '#d97706';
                    const statusBg = m.status === 'PUBLISHED' ? '#f0fdf4' : m.status === 'ARCHIVED' ? '#f9fafb' : '#fffbeb';
                    return (
                      <div
                        key={m.id || idx}
                        draggable
                        onDragStart={() => handleMemberDragStart(realIdx)}
                        onDragOver={e => handleMemberDragOver(e, realIdx)}
                        onDrop={e => handleMemberDrop(e, realIdx)}
                        onDragEnd={handleMemberDragEnd}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: isDragOver ? '#eff6ff' : statusBg,
                          border: `2px solid ${isDragOver ? '#2563eb' : statusColor}`,
                          borderRadius: 12, padding: '12px 16px', transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ cursor: 'grab', color: '#9ca3af', flexShrink: 0 }} title="Arraste para reordenar">
                          <GripVertical size={16} />
                        </span>

                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.imageAlt || m.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 12, border: '1px solid #e5e7eb', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid #e5e7eb', background: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                            {m.name[0]}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.isFeatured && <Star size={12} color="#d97706" style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />}
                            {m.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                            #{m.order} • {m.role} {m.category && `• ${m.category.replace(/_/g, ' ')}`}
                          </div>
                        </div>

                        <select
                          value={m.status || 'DRAFT'}
                          onChange={e => m.id && handleMemberStatus(m.id, e.target.value as MemberPublicationStatus)}
                          style={{
                            padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer',
                            background: m.status === 'PUBLISHED' ? '#dcfce7' : m.status === 'ARCHIVED' ? '#f3f4f6' : '#fef3c7',
                            color: m.status === 'PUBLISHED' ? '#15803d' : m.status === 'ARCHIVED' ? '#4b5563' : '#b45309',
                            flexShrink: 0,
                          }}
                        >
                          <option value="PUBLISHED">🟢 PUBLICADO</option>
                          <option value="DRAFT">🟡 RASCUNHO</option>
                          <option value="ARCHIVED">⚪ ARQUIVADO</option>
                        </select>

                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => handleMemberEdit(m)} title="Editar Integrante"
                            style={{ padding: '5px 8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer' }}>
                            <FileText size={13} color="#2563eb" />
                          </button>
                          <button onClick={() => m.id && handleMemberDuplicate(m.id)} title="Duplicar Cadastro"
                            style={{ padding: '5px 8px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer' }}>
                            <Copy size={13} color="#b45309" />
                          </button>
                          <button onClick={() => m.id && handleMemberDelete(m.id, m.name)} title="Excluir"
                            style={{ padding: '5px 8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer' }}>
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MODO EDIÇÃO / CRIAÇÃO DE INTEGRANTE */}
          {(memberEditMode === 'edit' || memberEditMode === 'create') && (
            <div style={{ display: 'grid', gridTemplateColumns: memberShowPreview ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                {/* 1. Identificação */}
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0, background: 'white' }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>1. Identificação & Cargo</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nome Completo *</label>
                      <input type="text" value={memberDraft.name || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, name: e.target.value }))}
                        placeholder="ex: Dr. Rikardo Ribeiro"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nome Social (opcional)</label>
                      <input type="text" value={memberDraft.socialName || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, socialName: e.target.value }))}
                        placeholder="ex: Rikardo"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Cargo Oficial *</label>
                      <input type="text" value={memberDraft.role || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, role: e.target.value }))}
                        placeholder="ex: Presidente do Conselho Deliberativo"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Cargo Resumido (para o Card)</label>
                      <input type="text" value={memberDraft.shortRole || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, shortRole: e.target.value }))}
                        placeholder="ex: Presidente CD"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Categoria *</label>
                      <select value={memberDraft.category || 'DIRETORIA_EXECUTIVA'}
                        onChange={e => setMemberDraft(m => ({ ...m, category: e.target.value as MemberCategory }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, background: 'white', boxSizing: 'border-box', fontWeight: 700 }}>
                        {CATEGORY_OPTIONS.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Área de Atuação</label>
                      <input type="text" value={memberDraft.area || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, area: e.target.value }))}
                        placeholder="ex: Governança Estratégica & Compliance"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>

                {/* 2. Perfil Institucional */}
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0, background: 'white' }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>2. Perfil Institucional & Formação</legend>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Biografia Resumida (Card do Site) *</label>
                      <textarea rows={3} value={memberDraft.bio || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, bio: e.target.value }))}
                        placeholder="Resumo biográfico para exibição inicial no card..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Biografia Completa (Modal / Expansão)</label>
                      <textarea rows={5} value={memberDraft.fullBio || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, fullBio: e.target.value }))}
                        placeholder="Biografia completa em detalhes (aparece ao clicar em Saiba Mais)..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Formação Acadêmica</label>
                        <textarea rows={2} value={memberDraft.academicFormation || ''}
                          onChange={e => setMemberDraft(m => ({ ...m, academicFormation: e.target.value }))}
                          placeholder="Graus acadêmicos, universidades..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Especializações</label>
                        <textarea rows={2} value={memberDraft.specializations || ''}
                          onChange={e => setMemberDraft(m => ({ ...m, specializations: e.target.value }))}
                          placeholder="Pós-graduações, MBA, MBAs..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Certificações</label>
                        <textarea rows={2} value={memberDraft.certifications || ''}
                          onChange={e => setMemberDraft(m => ({ ...m, certifications: e.target.value }))}
                          placeholder="IBGC, ISO, PMP..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Trajetória & Experiência</label>
                        <textarea rows={2} value={memberDraft.experience || ''}
                          onChange={e => setMemberDraft(m => ({ ...m, experience: e.target.value }))}
                          placeholder="Histórico profissional..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Áreas de Expertise <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(separadas por vírgula)</span></label>
                      <input type="text" value={(memberDraft.expertise || []).join(', ')}
                        onChange={e => setMemberDraft(m => ({ ...m, expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                        placeholder="ESG, Compliance, Governança, Direitos Humanos"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>

                {/* 3. Fotografia */}
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0, background: 'white' }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>3. Fotografia & Acessibilidade</legend>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Fotografia Oficial *</label>
                      <ImageUploadInput
                        value={memberDraft.imageUrl || ''}
                        onChange={url => setMemberDraft(m => ({ ...m, imageUrl: url }))}
                        label="Foto do Integrante"
                        hint="Recomendado: 400x400px (quadrada), WEBP ou JPG. Máx: 10 MB"
                        folder="team/photos"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Texto Alternativo (ALT) *</label>
                      <input type="text" value={memberDraft.imageAlt || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, imageAlt: e.target.value }))}
                        placeholder="ex: Fotografia oficial de Dr. Rikardo Ribeiro, Presidente do Conselho Deliberativo"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${memberDraft.imageUrl && !memberDraft.imageAlt ? '#fca5a5' : '#e5e7eb'}`, fontSize: 12, boxSizing: 'border-box' }} />
                      {memberDraft.imageUrl && !memberDraft.imageAlt && (
                        <p style={{ fontSize: 10, color: '#dc2626', margin: '2px 0 0 0' }}>ALT é obrigatório para acessibilidade (WCAG 2.1 AA)</p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* 4. Redes Sociais & Links (HTTPS) */}
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0, background: 'white' }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>4. Redes Sociais & Links Validados (HTTPS)</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {[
                      { field: 'linkedinUrl' as const, label: 'LinkedIn', icon: Share2, placeholder: 'https://linkedin.com/in/perfil' },
                      { field: 'instagramUrl' as const, label: 'Instagram', icon: Share2, placeholder: 'https://instagram.com/perfil' },
                      { field: 'facebookUrl' as const, label: 'Facebook', icon: Share2, placeholder: 'https://facebook.com/perfil' },
                      { field: 'twitterUrl' as const, label: 'X / Twitter', icon: Share2, placeholder: 'https://x.com/perfil' },
                      { field: 'youtubeUrl' as const, label: 'YouTube', icon: Share2, placeholder: 'https://youtube.com/@canal' },
                      { field: 'lattesUrl' as const, label: 'Currículo Lattes', icon: BookOpen, placeholder: 'https://lattes.cnpq.br/...' },
                      { field: 'orcidUrl' as const, label: 'ORCID', icon: Award, placeholder: 'https://orcid.org/...' },
                      { field: 'researchGateUrl' as const, label: 'ResearchGate', icon: FileText, placeholder: 'https://researchgate.net/profile/...' },
                      { field: 'websiteUrl' as const, label: 'Website Pessoal', icon: Globe, placeholder: 'https://sitepessoal.com' },
                      { field: 'resumeUrl' as const, label: 'Currículo Institucional (PDF)', icon: ExternalLink, placeholder: 'https://link.para.pdf' },
                    ].map(item => {
                      const val = memberDraft[item.field] || '';
                      const isValid = validateHttpsUrl(val);
                      return (
                        <div key={item.field}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                            <item.icon size={11} color="#6b7280" />
                            {item.label}
                          </label>
                          <input
                            type="url"
                            value={val}
                            onChange={e => setMemberDraft(m => ({ ...m, [item.field]: e.target.value || undefined }))}
                            placeholder={item.placeholder}
                            style={{
                              width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, boxSizing: 'border-box',
                              border: `1px solid ${val && !isValid ? '#fca5a5' : '#e5e7eb'}`,
                              background: val && !isValid ? '#fff1f2' : 'white',
                            }}
                          />
                          {val && !isValid && (
                            <p style={{ fontSize: 10, color: '#dc2626', margin: '2px 0 0 0' }}>URL deve iniciar com https://</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </fieldset>

                {/* 5. Exibição & LGPD */}
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0, background: 'white' }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>5. Configuração de Exibição & LGPD</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status *</label>
                      <select
                        value={memberDraft.status || 'DRAFT'}
                        onChange={e => setMemberDraft(m => ({ ...m, status: e.target.value as MemberPublicationStatus, isPublished: e.target.value === 'PUBLISHED' }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, background: 'white', boxSizing: 'border-box', fontWeight: 700 }}
                      >
                        <option value="DRAFT">🟡 Rascunho</option>
                        <option value="PUBLISHED">🟢 Publicado</option>
                        <option value="ARCHIVED">⚪ Arquivado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Ordem de Exibição</label>
                      <input type="number" min={1} value={memberDraft.order || 1}
                        onChange={e => setMemberDraft(m => ({ ...m, order: Number(e.target.value) }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                      <input type="checkbox" id="mem-featured" checked={Boolean(memberDraft.isFeatured)}
                        onChange={e => setMemberDraft(m => ({ ...m, isFeatured: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <label htmlFor="mem-featured" style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                        ★ Integrante em Destaque
                      </label>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>E-mail Institucional</label>
                      <input type="email" value={memberDraft.email || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, email: e.target.value }))}
                        placeholder="contato@institutosermelhor.org"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Telefone Institucional</label>
                      <input type="text" value={memberDraft.phone || ''}
                        onChange={e => setMemberDraft(m => ({ ...m, phone: e.target.value }))}
                        placeholder="+55 11 99999-9999"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <input type="checkbox" id="mem-lgpd" checked={Boolean(memberDraft.showPublicContact)}
                        onChange={e => setMemberDraft(m => ({ ...m, showPublicContact: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <label htmlFor="mem-lgpd" style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                        Exibir contatos (E-mail / Telefone) publicamente no site (Autorização LGPD)
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setMemberShowPreview(!memberShowPreview)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Eye size={14} /> {memberShowPreview ? 'Ocultar Preview' : 'Ver Preview do Card'}
                  </button>
                  <button
                    onClick={() => { setMemberEditMode('list'); setMemberDraft({}); }}
                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleMemberSave}
                    disabled={memberSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: memberSaved ? '#16a34a' : '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: memberSaving ? 'not-allowed' : 'pointer', opacity: memberSaving ? 0.7 : 1 }}
                  >
                    {memberSaving ? 'Salvando...' : memberSaved ? '✓ Salvo com Sucesso' : 'Salvar Integrante'}
                  </button>
                </div>
              </div>

              {/* Side Preview */}
              {memberShowPreview && (
                <div style={{ position: 'sticky', top: 20 }}>
                  <MemberCardPreview member={memberDraft} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Transparência */}
      {activeTab === 'transparencia' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Documentos do Portal da Transparência</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>Relatórios anuais, pareceres de auditoria e estatutos vigentes</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {transparencyDocs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #f3f4f6', borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#111827' }}>{doc.title}</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Categoria: {doc.category} | Ano: {doc.year} | Publicado em: {new Date(doc.publishedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {doc.fileType || 'PDF'}
                </span>
              </div>
            ))}
            {transparencyDocs.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum documento cadastrado no Portal de Transparência.</div>}
          </div>
        </div>
      )}

      {/* Tab Content: Indicadores */}
      {activeTab === 'indicadores' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Indicadores de Impacto & ODS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {indicators.map(ind => (
              <div key={ind.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{ind.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>{ind.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginTop: 2 }}>{ind.label}</div>
                {ind.ods && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {ind.ods.map(o => (
                      <span key={o} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>{o}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="about" onRestore={() => loadAllData()} />
      </div>
    </div>
  );
};
