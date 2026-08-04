import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FolderKanban, Plus, Trash2, Copy, Search,
  BarChart2, Target, DollarSign, Activity, Handshake,
  ArrowUp, ArrowDown, Globe, Eye, EyeOff,
  Image as ImageIcon, Share2,
  Link2, Star, ChevronDown, ChevronUp, X, GripVertical, FileEdit, Layers,
  Archive, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { ImageUploadInput } from '../components/ui/ImageUploadInput';
import { InstitutionalFirestoreService } from '../services/institutional';
import {
  PublishedPartnersService,
  type PublishedPartnerData,
  type PartnerCategory,
  type PartnerStatus,
  type PartnerTier,
  type PartnerType,
  validatePartnerUrl,
} from '../services/publishedPartnersService';
import {
  ProgramsEnterpriseService,
  type SocialProgram,
  type SocialProject,
  type ProgramKpi,
  type ProgramLifecycleStage
} from '../services/programsEnterprise';
import {
  ProgramsService,
  type ProgramDataAdmin,
  type ProgramPublicationStatus,
  validateHttpsUrl as validateUrl,
} from '../services/programsService';
import { ProgramGalleryEditor, type GalleryImage } from '../components/cms/ProgramGalleryEditor';
import { ProgramLinkFields } from '../components/cms/ProgramLinkFields';
import { ProgramCardPreview } from '../components/cms/ProgramCardPreview';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'portafolio' | 'parcerias' | 'pmo' | 'matriz_logica' | 'sroi_kpis' | 'financeiro';

const STAGE_LABELS: Record<ProgramLifecycleStage, string> = {
  PLANEJAMENTO: 'Planejamento',
  APROVACAO: 'Em Aprovação',
  CAPTACAO: 'Captação de Recursos',
  EXECUCAO: 'Em Execução',
  MONITORAMENTO: 'Monitoramento (M&A)',
  PRESTACAO_CONTAS: 'Prestação de Contas',
  CONCLUIDO: 'Concluído',
  ARQUIVADO: 'Arquivado',
};

const STAGE_COLORS: Record<ProgramLifecycleStage, string> = {
  PLANEJAMENTO: '#6b7280',
  APROVACAO: '#8b5cf6',
  CAPTACAO: '#d97706',
  EXECUCAO: '#16a34a',
  MONITORAMENTO: '#2563eb',
  PRESTACAO_CONTAS: '#dc2626',
  CONCLUIDO: '#059669',
  ARQUIVADO: '#9ca3af',
};

const CATEGORIES: { id: PartnerCategory; label: string }[] = [
  { id: 'GLOBAL', label: 'Global' },
  { id: 'ESTRATEGICO', label: 'Estratégico' },
  { id: 'INSTITUCIONAL', label: 'Institucional' },
  { id: 'TECNICO', label: 'Técnico' },
  { id: 'UNIVERSIDADES', label: 'Universidade / Pesquisa' },
  { id: 'EMPRESAS', label: 'Empresa / ESG' },
  { id: 'ORGANISMOS_INTERNACIONAIS', label: 'Organismo Internacional' },
  { id: 'FINANCIADORES', label: 'Financiador' },
  { id: 'OSCS', label: 'OSC / ONG' },
];

export interface PartnerBenefitCard {
  id: string;
  order: number;
  title: string;
  description: string;
  icon?: string;
}

export const ServicesPage: React.FC = () => {
  const [programs, setPrograms] = useState<SocialProgram[]>([]);
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [kpis, setKpis] = useState<ProgramKpi[]>([]);
  
  // Dados de Parcerias & Seja Parceiro
  const [partnersList, setPartnersList] = useState<PublishedPartnerData[]>([]);
  const [partnerBadge, setPartnerBadge] = useState('Seja Parceiro');
  const [partnerTitle, setPartnerTitle] = useState('Construa o Futuro Conosco');
  const [partnerSubtitle, setPartnerSubtitle] = useState('Buscamos alianças estratégicas com organizações e líderes comprometidos com o desenvolvimento sustentável.');
  const [partnerDescription, setPartnerDescription] = useState('Integração ao nosso Ecossistema Colaborativo Estratégico com impacto mensurável e governança transparente.');
  const [trustBadges, setTrustBadges] = useState<string[]>(['ISO 9001', 'ODS ONU', 'LGPD Compliant']);
  const [partnerBenefits, setPartnerBenefits] = useState<PartnerBenefitCard[]>([
    { id: 'b1', order: 1, title: 'Parcerias Corporativas', description: 'Projetos customizados e voluntáriado executivo com impacto ESG mensurável.', icon: '🏢' },
    { id: 'b2', order: 2, title: 'Cooperação Técnica', description: 'Intercâmbio de expertise com academia e institutos de pesquisa no Brasil e mundo.', icon: '🤝' },
    { id: 'b3', order: 3, title: 'Alcance Global', description: 'Integração ao nosso Ecossistema Colaborativo com parceiros estratégicos.', icon: '🌐' },
    { id: 'b4', order: 4, title: 'Visibilidade ESG', description: 'Reconhecimento público em relatórios de impacto e eventos institucionais.', icon: '📈' },
  ]);

  // Estado de UI da aba Parcerias
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<PartnerStatus | 'ALL'>('ALL');
  const [expandedPartnerIdx, setExpandedPartnerIdx] = useState<number | null>(null);
  const [previewPartner, setPreviewPartner] = useState<PublishedPartnerData | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('portafolio');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newBadgeText, setNewBadgeText] = useState('');

  // Estado dos Programas Públicos (coleção 'programs' — lida pelo site)
  const [publicPrograms, setPublicPrograms] = useState<ProgramDataAdmin[]>([]);
  const [selectedProgId, setSelectedProgId] = useState<string | null>(null);
  const [progEditMode, setProgEditMode] = useState<'list' | 'edit' | 'create'>('list');
  const [progDraft, setProgDraft] = useState<Partial<ProgramDataAdmin>>({});
  const [progSaving, setProgSaving] = useState(false);
  const [progSaved, setProgSaved] = useState(false);
  const [progDragOver, setProgDragOver] = useState<number | null>(null);
  const progDragIdx = useRef<number | null>(null);
  const [progSearch, setProgSearch] = useState('');
  const [progStatusFilter, setProgStatusFilter] = useState<ProgramPublicationStatus | 'ALL'>('ALL');
  const [progCategoryFilter, setProgCategoryFilter] = useState<string>('ALL');
  const [progShowPreview, setProgShowPreview] = useState(false);
  const [progLastSync, setProgLastSync] = useState<Date | null>(null);
  const [progShowVersions, setProgShowVersions] = useState(false);

  // Autosave — monitora publicPrograms (ProgramDataAdmin[]), não programs (SocialProgram[])
  const autosave = useCMSAutosave('programs', publicPrograms as unknown as SocialProgram[]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pubs = await ProgramsService.getOrSeed();
      setPublicPrograms(pubs);
      setProgLastSync(new Date());

      let progs = await ProgramsEnterpriseService.getPrograms();
      if (!progs.length) {
        await ProgramsEnterpriseService.seedDefaults();
        progs = await ProgramsEnterpriseService.getPrograms();
      }
      setPrograms(progs);
      if (progs.length > 0 && !selectedProgramId) {
        setSelectedProgramId(progs[0].id || null);
      }

      const projs = await ProgramsEnterpriseService.getProjects();
      setProjects(projs);

      const kpisData = await ProgramsEnterpriseService.getKpis();
      setKpis(kpisData);

      const published = await PublishedPartnersService.getOrSeed();
      setPartnersList(published);

      const servicesPageData = await InstitutionalFirestoreService.getServicesPage();
      if (servicesPageData) {
        if (servicesPageData.partnerBadge) setPartnerBadge(servicesPageData.partnerBadge);
        if (servicesPageData.partnerTitle) setPartnerTitle(servicesPageData.partnerTitle);
        if (servicesPageData.partnerSubtitle) setPartnerSubtitle(servicesPageData.partnerSubtitle);
        if (servicesPageData.partnerDescription) setPartnerDescription(servicesPageData.partnerDescription);
        if (servicesPageData.trustBadges?.length) setTrustBadges(servicesPageData.trustBadges);
        if (servicesPageData.partnerBenefits?.length) setPartnerBenefits(servicesPageData.partnerBenefits);
      }
    } catch (e) {
      console.error('[ServicesPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const prog of programs) {
        await ProgramsEnterpriseService.saveProgram(prog);
      }

      await InstitutionalFirestoreService.saveServicesPage({
        partnerBadge,
        partnerTitle,
        partnerSubtitle,
        partnerDescription,
        trustBadges,
        partnerBenefits,
      });

      await PublishedPartnersService.saveAll(partnersList);

      await CMSVersionService.saveDraft('programs', {
        programs,
        partnerBadge,
        partnerTitle,
        partnerSubtitle,
        partnerBenefits,
        trustBadges,
        partnersList
      } as unknown as Record<string, unknown>, 'admin', 'Atualização Módulo de Serviços & Parcerias');

      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[ServicesPage] Save error:', e);
      alert('Erro ao salvar serviços e parcerias.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBenefit = () => {
    const newB: PartnerBenefitCard = {
      id: `benefit-${Date.now()}`,
      order: partnerBenefits.length + 1,
      title: 'Novo Benefício da Parceria',
      description: 'Descrição detalhada sobre este benefício ou diferencial de colaborar conosco.',
      icon: '✨'
    };
    setPartnerBenefits([...partnerBenefits, newB]);
  };

  const handleRemoveBenefit = (id: string) => {
    setPartnerBenefits(partnerBenefits.filter(b => b.id !== id));
  };

  const handleMoveBenefit = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partnerBenefits.length) return;
    const updated = [...partnerBenefits];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPartnerBenefits(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const handleAddPartner = () => {
    const newP: PublishedPartnerData = {
      order: partnersList.length + 1,
      name: 'Novo Parceiro Estratégico',
      category: 'ESTRATEGICO',
      country: 'Brasil',
      logoUrl: '',
      websiteUrl: 'https://',
      description: 'Breve apresentação da instituição e área de cooperação.',
      status: 'DRAFT',
      isPublished: false,
      tier: 'TIER_2'
    };
    setPartnersList([...partnersList, newP]);
  };

  const handleUpdatePartner = (index: number, patch: Partial<PublishedPartnerData>) => {
    const updated = [...partnersList];
    const item = updated[index];
    const status = patch.status !== undefined ? patch.status : item.status;
    const isPublished = status === 'PUBLISHED';
    updated[index] = { ...item, ...patch, status, isPublished };
    setPartnersList(updated);
  };

  const handleRemovePartner = (index: number) => {
    setPartnersList(partnersList.filter((_, i) => i !== index));
  };

  const handleDuplicatePartner = async (index: number) => {
    const p = partnersList[index];
    if (!p.id) {
      const copy: PublishedPartnerData = {
        ...p,
        id: undefined,
        name: `${p.name} (cópia)`,
        status: 'DRAFT',
        isPublished: false,
        order: partnersList.length + 1,
      };
      setPartnersList([...partnersList, copy]);
      return;
    }
    try {
      const newId = await PublishedPartnersService.duplicate(p.id, 'admin');
      if (newId) {
        const updated = await PublishedPartnersService.getAll();
        setPartnersList(updated);
      }
    } catch (e) {
      console.error('Erro ao duplicar parceiro:', e);
    }
  };

  const handleDragStart = (index: number) => {
    dragIdx.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = dragIdx.current;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      setDragOverIdx(null);
      dragIdx.current = null;
      return;
    }
    const updated = [...partnersList];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setPartnersList(updated.map((p, idx) => ({ ...p, order: idx + 1 })));
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  const handleProgNew = () => {
    setProgDraft({
      title: 'Novo Programa',
      slug: `novo-programa-${Date.now()}`,
      description: '',
      status: 'DRAFT',
      isPublished: false,
      order: publicPrograms.length + 1,
      isFeatured: false,
      showOnLandingPage: true,
      pillarsTitle: 'Nossos pilares',
      actionLinesTitle: 'Linhas de atuação',
      commitmentTitle: 'Nosso compromisso',
      pillars: [],
      actionLines: [],
      tags: [],
      gallery: [],
    });
    setProgEditMode('create');
    setProgShowVersions(false);
  };

  const handleProgEdit = (prog: ProgramDataAdmin) => {
    setProgDraft({ ...prog });
    setSelectedProgId(prog.id || null);
    setProgEditMode('edit');
    setProgShowVersions(false);
  };

  const handleProgSave = async () => {
    if (!progDraft.title?.trim()) { alert('O título é obrigatório.'); return; }
    if (!progDraft.slug?.trim()) { alert('O slug é obrigatório.'); return; }
    if (progDraft.imageUrl && !progDraft.imageAlt?.trim()) {
      const proceed = window.confirm('A imagem principal não possui texto alternativo (ALT). Recomendamos preencher para acessibilidade WCAG 2.1 AA. Continuar mesmo assim?');
      if (!proceed) return;
    }
    setProgSaving(true);
    try {
      // Garante campos com valores padrão antes de salvar
      const toSave: Partial<ProgramDataAdmin> = {
        ...progDraft,
        pillarsTitle: progDraft.pillarsTitle || 'Nossos pilares',
        actionLinesTitle: progDraft.actionLinesTitle || 'Linhas de atuação',
        commitmentTitle: progDraft.commitmentTitle || 'Nosso compromisso',
      };
      if (progEditMode === 'create') {
        const newId = await ProgramsService.create(toSave as Omit<ProgramDataAdmin, 'id'>, 'admin');
        // Salva versão no histórico CMS
        await CMSVersionService.saveDraft('programs', toSave as Record<string, unknown>, 'admin', `Criação: ${toSave.title}`);
        const updated = await ProgramsService.getAll();
        setPublicPrograms(updated);
        setProgLastSync(new Date());
        setSelectedProgId(newId);
        setProgEditMode('edit');
      } else if (selectedProgId) {
        await ProgramsService.update(selectedProgId, toSave, 'admin');
        // Salva versão no histórico CMS
        await CMSVersionService.saveDraft('programs', toSave as Record<string, unknown>, 'admin', `Edição: ${toSave.title}`);
        const updated = await ProgramsService.getAll();
        setPublicPrograms(updated);
        setProgLastSync(new Date());
      }
      setProgSaved(true);
      setTimeout(() => setProgSaved(false), 3000);
    } catch (e) {
      console.error('[ServicesPage] Erro ao salvar programa:', e);
      alert('Erro ao salvar o programa. Verifique o console.');
    } finally {
      setProgSaving(false);
    }
  };

  const handleProgDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir permanentemente "${title}"? Esta ação não pode ser desfeita.`)) return;
    await ProgramsService.delete(id, title, 'admin');
    const updated = await ProgramsService.getAll();
    setPublicPrograms(updated);
    if (selectedProgId === id) { setSelectedProgId(null); setProgEditMode('list'); }
  };

  const handleProgDuplicate = async (id: string) => {
    await ProgramsService.duplicate(id, 'admin');
    const updated = await ProgramsService.getAll();
    setPublicPrograms(updated);
  };

  const handleProgStatus = async (id: string, status: ProgramPublicationStatus) => {
    await ProgramsService.setStatus(id, status, 'admin');
    setPublicPrograms(prev => prev.map(p => p.id === id ? { ...p, status, isPublished: status === 'PUBLISHED' } : p));
  };

  const handleProgReorder = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const copy = [...publicPrograms];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    const withOrder = copy.map((p, i) => ({ ...p, order: i + 1 }));
    setProgLastSync(new Date());
    setPublicPrograms(withOrder);
    await ProgramsService.reorder(withOrder.map(p => p.id!).filter(Boolean), 'admin');
  };

  const handleProgDragStart = (idx: number) => { progDragIdx.current = idx; };
  const handleProgDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setProgDragOver(idx); };
  const handleProgDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (progDragIdx.current !== null) handleProgReorder(progDragIdx.current, targetIdx);
    progDragIdx.current = null;
    setProgDragOver(null);
  };
  const handleProgDragEnd = () => { progDragIdx.current = null; setProgDragOver(null); };

  const filteredPrograms = publicPrograms.filter(p => {
    const q = progSearch.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.slug.includes(q) || (p.category || '').toLowerCase().includes(q) || (p.thematicArea || '').toLowerCase().includes(q);
    const matchStatus = progStatusFilter === 'ALL' || p.status === progStatusFilter;
    const matchCategory = progCategoryFilter === 'ALL' || p.category === progCategoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // Categorias únicas presentes na lista para o filtro
  const uniqueCategories = Array.from(new Set(publicPrograms.map(p => p.category).filter(Boolean))) as string[];

  const filteredPartnersList = partnersList.filter(p => {
    const matchSearch = !partnerSearch ||
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      (p.fantasyName?.toLowerCase().includes(partnerSearch.toLowerCase())) ||
      (p.country?.toLowerCase().includes(partnerSearch.toLowerCase()));
    const matchStatus = partnerStatusFilter === 'ALL' || p.status === partnerStatusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'portafolio', label: 'Portfólio de Programas', icon: FolderKanban },
    { id: 'parcerias', label: 'Parcerias & Seja Parceiro', icon: Handshake },
    { id: 'pmo', label: 'PMO & Sub-Projetos', icon: Activity },
    { id: 'matriz_logica', label: 'Matriz Lógica (M&A)', icon: Target },
    { id: 'sroi_kpis', label: 'Indicadores SROI & ESG', icon: BarChart2 },
    { id: 'financeiro', label: 'Execução Orçamentária', icon: DollarSign },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando portfólio de serviços e parcerias...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="Editor → Serviços & Programas → Parcerias" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderKanban size={26} color="#d97706" /> Módulo de Serviços, Programas & Parcerias (CMS)
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie todo o conteúdo de programas sociais, seção "Seja Parceiro" e catálogo público de parceiros
          </p>
        </div>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d && (d as any).programs) setPrograms((d as any).programs); }}
          onDiscard={autosave.clearSaved}
        />
      )}

      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none',
              borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#d97706' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'portafolio' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={20} color="#d97706" /> Programas — Site Público
              </h2>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0 0' }}>
                Gerencie os programas exibidos na seção &quot;Projetos em Campo&quot; do site institucional (coleção: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>programs</code>)
              </p>
              {progLastSync && (
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RefreshCw size={9} />
                  Sincronizado com o site: {progLastSync.toLocaleTimeString('pt-BR')}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {progEditMode !== 'list' && (
                <button onClick={() => { setProgEditMode('list'); setProgDraft({}); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  ← Voltar
                </button>
              )}
              {progEditMode === 'list' && (
                <button onClick={handleProgNew}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <Plus size={14} /> Novo Programa
                </button>
              )}
              {progEditMode !== 'list' && (
                <button onClick={handleProgSave} disabled={progSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: progSaved ? '#16a34a' : '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: progSaving ? 'not-allowed' : 'pointer', opacity: progSaving ? 0.7 : 1 }}>
                  {progSaving ? 'Salvando...' : progSaved ? '✓ Salvo' : 'Salvar Programa'}
                </button>
              )}
            </div>
          </div>

          {progEditMode === 'list' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 10 }} />
                  <input type="text" value={progSearch} onChange={e => setProgSearch(e.target.value)}
                    placeholder="Buscar por título, slug, categoria, área temática..."
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <select value={progStatusFilter} onChange={e => setProgStatusFilter(e.target.value as any)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}>
                  <option value="ALL">Todos os status</option>
                  <option value="PUBLISHED">🟢 Publicados</option>
                  <option value="DRAFT">🟡 Rascunhos</option>
                  <option value="ARCHIVED">⚪ Arquivados</option>
                </select>
                <select value={progCategoryFilter} onChange={e => setProgCategoryFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}>
                  <option value="ALL">Todas as categorias</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
                  {filteredPrograms.length} de {publicPrograms.length} programas
                </span>
              </div>

              {filteredPrograms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  Nenhum programa encontrado. <button onClick={handleProgNew} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Criar o primeiro?</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {filteredPrograms.map((prog, idx) => {
                    const realIdx = publicPrograms.indexOf(prog);
                    const isDragOver = progDragOver === realIdx;
                    const statusColor = prog.status === 'PUBLISHED' ? '#16a34a' : prog.status === 'ARCHIVED' ? '#9ca3af' : '#d97706';
                    const statusBg = prog.status === 'PUBLISHED' ? '#f0fdf4' : prog.status === 'ARCHIVED' ? '#f9fafb' : '#fffbeb';
                    return (
                      <div
                        key={prog.id || idx}
                        draggable
                        onDragStart={() => handleProgDragStart(realIdx)}
                        onDragOver={e => handleProgDragOver(e, realIdx)}
                        onDrop={e => handleProgDrop(e, realIdx)}
                        onDragEnd={handleProgDragEnd}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: isDragOver ? '#eff6ff' : statusBg,
                          border: `2px solid ${isDragOver ? '#2563eb' : statusColor}`,
                          borderRadius: 12, padding: '12px 16px', transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ cursor: 'grab', color: '#9ca3af', flexShrink: 0 }}><GripVertical size={16} /></span>
                        {prog.imageUrl ? (
                          <img src={prog.imageUrl} alt={prog.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #e5e7eb', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {prog.iconEmoji || '🎯'}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prog.isFeatured && <Star size={12} color="#d97706" style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />}
                            {prog.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                            #{prog.order} • {prog.slug} {prog.category && `• ${prog.category}`} {prog.isFeatured ? '• ★ Destaque' : ''}
                          </div>
                        </div>
                        <select
                          value={prog.status || 'DRAFT'}
                          onChange={e => prog.id && handleProgStatus(prog.id, e.target.value as ProgramPublicationStatus)}
                          style={{
                            padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer',
                            background: prog.status === 'PUBLISHED' ? '#dcfce7' : prog.status === 'ARCHIVED' ? '#f3f4f6' : '#fef3c7',
                            color: prog.status === 'PUBLISHED' ? '#15803d' : prog.status === 'ARCHIVED' ? '#4b5563' : '#b45309',
                            flexShrink: 0,
                          }}
                        >
                          <option value="PUBLISHED">🟢 PUBLICADO</option>
                          <option value="DRAFT">🟡 RASCUNHO</option>
                          <option value="ARCHIVED">⚪ ARQUIVADO</option>
                        </select>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => handleProgEdit(prog)} title="Editar"
                            style={{ padding: '5px 8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer' }}>
                            <FileEdit size={13} color="#2563eb" />
                          </button>
                          <button onClick={() => prog.id && handleProgDuplicate(prog.id)} title="Duplicar"
                            style={{ padding: '5px 8px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer' }}>
                            <Copy size={13} color="#b45309" />
                          </button>
                          <button onClick={() => prog.id && handleProgDelete(prog.id, prog.title)} title="Excluir"
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

          {(progEditMode === 'edit' || progEditMode === 'create') && (
            <div style={{ display: 'grid', gridTemplateColumns: progShowPreview ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>1. Identificação</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título do Programa *</label>
                      <input type="text" value={progDraft.title || ''}
                        onChange={e => setProgDraft(d => ({ ...d, title: e.target.value }))}
                        placeholder="Nome completo do programa"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 700, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Subtítulo</label>
                      <input type="text" value={progDraft.subtitle || ''}
                        onChange={e => setProgDraft(d => ({ ...d, subtitle: e.target.value }))}
                        placeholder="Subtítulo curto"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Slug (URL) *</label>
                      <input type="text" value={progDraft.slug || ''}
                        onChange={e => setProgDraft(d => ({ ...d, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                        placeholder="slug-do-programa"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Categoria</label>
                      <select value={progDraft.category || ''}
                        onChange={e => setProgDraft(d => ({ ...d, category: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, background: 'white', boxSizing: 'border-box' }}>
                        <option value="">Selecionar...</option>
                        <option value="Educacao">Educação</option>
                        <option value="MeioAmbiente">Meio Ambiente</option>
                        <option value="Cultura">Cultura</option>
                        <option value="Emancipacao">Emancipação</option>
                        <option value="DireitosHumanos">Direitos Humanos</option>
                        <option value="Saude">Saúde</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Área Temática</label>
                      <input type="text" value={progDraft.thematicArea || ''}
                        onChange={e => setProgDraft(d => ({ ...d, thematicArea: e.target.value }))}
                        placeholder="ex: Educação Integral & Inovação"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Emoji / Ícone</label>
                      <input type="text" value={progDraft.iconEmoji || ''}
                        onChange={e => setProgDraft(d => ({ ...d, iconEmoji: e.target.value }))}
                        placeholder="🎯"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 20, textAlign: 'center', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>2. Status & Configuração de Exibição</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status *</label>
                      <select value={progDraft.status || 'DRAFT'}
                        onChange={e => setProgDraft(d => ({ ...d, status: e.target.value as ProgramPublicationStatus, isPublished: e.target.value === 'PUBLISHED' }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, background: 'white', boxSizing: 'border-box', fontWeight: 700 }}>
                        <option value="DRAFT">🟡 Rascunho</option>
                        <option value="PUBLISHED">🟢 Publicado</option>
                        <option value="ARCHIVED">⚪ Arquivado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Ordem de Exibição</label>
                      <input type="number" min={1} value={progDraft.order || 1}
                        onChange={e => setProgDraft(d => ({ ...d, order: Number(e.target.value) }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                      <input type="checkbox" id="prog-featured" checked={Boolean(progDraft.isFeatured)}
                        onChange={e => setProgDraft(d => ({ ...d, isFeatured: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <label htmlFor="prog-featured" style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                        ★ Programa em Destaque
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                      <input type="checkbox" id="prog-landing" checked={progDraft.showOnLandingPage !== false}
                        onChange={e => setProgDraft(d => ({ ...d, showOnLandingPage: e.target.checked }))}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <label htmlFor="prog-landing" style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                        Exibir na Landing Page
                      </label>
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>3. Conteúdo</legend>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Resumo Curto (exibido no card) *</label>
                      <textarea rows={3} value={progDraft.description || ''}
                        onChange={e => setProgDraft(d => ({ ...d, description: e.target.value }))}
                        placeholder="Breve descrição do programa para o card..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Descrição Completa</label>
                      <textarea rows={5} value={progDraft.longDescription || ''}
                        onChange={e => setProgDraft(d => ({ ...d, longDescription: e.target.value }))}
                        placeholder="Descrição detalhada do programa (aparece ao expandir o card)..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Objetivos</label>
                        <textarea rows={3} value={progDraft.objectives || ''}
                          onChange={e => setProgDraft(d => ({ ...d, objectives: e.target.value }))}
                          placeholder="Objetivos do programa..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Metodologia</label>
                        <textarea rows={3} value={progDraft.methodology || ''}
                          onChange={e => setProgDraft(d => ({ ...d, methodology: e.target.value }))}
                          placeholder="Metodologia aplicada..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Público-Alvo</label>
                        <textarea rows={2} value={progDraft.targetAudience || ''}
                          onChange={e => setProgDraft(d => ({ ...d, targetAudience: e.target.value }))}
                          placeholder="A quem o programa atende..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Resultados Esperados</label>
                        <textarea rows={2} value={progDraft.expectedResults || ''}
                          onChange={e => setProgDraft(d => ({ ...d, expectedResults: e.target.value }))}
                          placeholder="Resultados esperados..."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>4. Pilares & Linhas de Atuação</legend>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título dos Pilares</label>
                      <input type="text" value={progDraft.pillarsTitle || 'Nossos pilares'}
                        onChange={e => setProgDraft(d => ({ ...d, pillarsTitle: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Pilares <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(um por linha)</span>
                      </label>
                      <textarea rows={5} value={(progDraft.pillars || []).join('\n')}
                        onChange={e => setProgDraft(d => ({ ...d, pillars: e.target.value.split('\n').filter(Boolean) }))}
                        placeholder="Pilar 1\nPilar 2\nPilar 3"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título das Linhas de Atuação</label>
                      <input type="text" value={progDraft.actionLinesTitle || 'Linhas de atuação'}
                        onChange={e => setProgDraft(d => ({ ...d, actionLinesTitle: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Subtítulo das Linhas</label>
                      <input type="text" value={progDraft.actionLinesSub || ''}
                        onChange={e => setProgDraft(d => ({ ...d, actionLinesSub: e.target.value }))}
                        placeholder="Subtítulo explicativo opcional"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        Linhas de Atuação <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(uma por linha)</span>
                      </label>
                      <textarea rows={5} value={(progDraft.actionLines || []).join('\n')}
                        onChange={e => setProgDraft(d => ({ ...d, actionLines: e.target.value.split('\n').filter(Boolean) }))}
                        placeholder="Linha 1\nLinha 2\nLinha 3"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>5. Nosso Compromisso</legend>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título do Compromisso</label>
                      <input type="text" value={progDraft.commitmentTitle || 'Nosso compromisso'}
                        onChange={e => setProgDraft(d => ({ ...d, commitmentTitle: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Texto do Compromisso</label>
                      <textarea rows={4} value={progDraft.commitment || ''}
                        onChange={e => setProgDraft(d => ({ ...d, commitment: e.target.value }))}
                        placeholder="Compromisso institucional do programa..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>6. Indicadores de Impacto</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Métrica</label>
                      <input type="text" value={progDraft.impactMetric || ''}
                        onChange={e => setProgDraft(d => ({ ...d, impactMetric: e.target.value }))}
                        placeholder="ex: Jovens Capacitados"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Valor do Impacto</label>
                      <input type="text" value={progDraft.impactValue || ''}
                        onChange={e => setProgDraft(d => ({ ...d, impactValue: e.target.value }))}
                        placeholder="ex: 50.000+"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Tags <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(separadas por vírgula)</span></label>
                      <input type="text" value={(progDraft.tags || []).join(', ')}
                        onChange={e => setProgDraft(d => ({ ...d, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                        placeholder="Educação, ODS 4, Jovens"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>7. Imagens</legend>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Imagem Principal</label>
                      <ImageUploadInput
                        value={progDraft.imageUrl || ''}
                        onChange={url => setProgDraft(d => ({ ...d, imageUrl: url }))}
                        label="Imagem Principal"
                        hint="Recomendado: 800x600px, WEBP ou JPG. Máx: 10 MB"
                        folder="programs/main"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Texto Alternativo (ALT) da Imagem Principal</label>
                      <input type="text" value={progDraft.imageAlt || ''}
                        onChange={e => setProgDraft(d => ({ ...d, imageAlt: e.target.value }))}
                        placeholder="Descrição da imagem para acessibilidade"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: `1px solid ${progDraft.imageUrl && !progDraft.imageAlt ? '#fca5a5' : '#e5e7eb'}`, fontSize: 12, boxSizing: 'border-box' }} />
                      {progDraft.imageUrl && !progDraft.imageAlt && (
                        <p style={{ fontSize: 10, color: '#dc2626', margin: '2px 0 0 0' }}>ALT é obrigatório para acessibilidade (WCAG 2.1 AA)</p>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Banner Institucional (opcional)</label>
                      <ImageUploadInput
                        value={progDraft.bannerUrl || ''}
                        onChange={url => setProgDraft(d => ({ ...d, bannerUrl: url }))}
                        label="Banner"
                        hint="Recomendado: 1920x600px. Máx: 10 MB"
                        folder="programs/banners"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Galeria de Imagens</label>
                      <ProgramGalleryEditor
                        images={(progDraft.gallery || []) as GalleryImage[]}
                        onChange={imgs => setProgDraft(d => ({ ...d, gallery: imgs }))}
                        folder="programs/gallery"
                      />
                    </div>
                  </div>
                </fieldset>
                <ProgramLinkFields
                  links={{
                    websiteUrl: progDraft.websiteUrl,
                    institutionalPageUrl: progDraft.institutionalPageUrl,
                    auraProjectUrl: progDraft.auraProjectUrl,
                    documentsUrl: progDraft.documentsUrl,
                    reportsUrl: progDraft.reportsUrl,
                    participationFormUrl: progDraft.participationFormUrl,
                  }}
                  onChange={links => setProgDraft(d => ({ ...d, ...links }))}
                />
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, margin: 0 }}>
                  <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>9. SEO</legend>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título SEO</label>
                      <input type="text" value={progDraft.seoTitle || ''}
                        onChange={e => setProgDraft(d => ({ ...d, seoTitle: e.target.value }))}
                        placeholder="Título para mecanismos de busca (máx 60 caracteres)"
                        maxLength={60}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{(progDraft.seoTitle || '').length}/60</span>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Meta Descrição</label>
                      <textarea rows={2} value={progDraft.metaDescription || ''}
                        onChange={e => setProgDraft(d => ({ ...d, metaDescription: e.target.value.slice(0, 160) }))}
                        maxLength={160}
                        placeholder="Descrição para mecanismos de busca (máx 160 caracteres)"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{(progDraft.metaDescription || '').length}/160</span>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Palavras-chave</label>
                      <input type="text" value={progDraft.keywords || ''}
                        onChange={e => setProgDraft(d => ({ ...d, keywords: e.target.value }))}
                        placeholder="educação, jovens, ODS 4 (separadas por vírgula)"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </fieldset>
                {/* Histórico de Versões — colapsável */}
                {progEditMode === 'edit' && selectedProgId && (
                  <CMSVersionHistory
                    moduleId="programs"
                    onRestore={(content) => {
                      const restored = content as Partial<ProgramDataAdmin>;
                      setProgDraft(prev => ({ ...prev, ...restored }));
                    }}
                  />
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setProgShowPreview(!progShowPreview)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Eye size={14} /> {progShowPreview ? 'Ocultar Preview' : 'Ver Preview do Card'}
                  </button>
                  <button
                    onClick={() => { setProgEditMode('list'); setProgDraft({}); setProgShowVersions(false); }}
                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button
                    onClick={handleProgSave}
                    disabled={progSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: progSaved ? '#16a34a' : '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: progSaving ? 'not-allowed' : 'pointer', opacity: progSaving ? 0.7 : 1 }}>
                    {progSaving ? 'Salvando...' : progSaved ? '✓ Salvo com Sucesso' : 'Salvar Programa'}
                  </button>
                </div>
              </div>
              {progShowPreview && (
                <div style={{ position: 'sticky', top: 20 }}>
                  <ProgramCardPreview data={{
                    title: progDraft.title || 'Título do Programa',
                    description: progDraft.description,
                    imageUrl: progDraft.imageUrl,
                    imageAlt: progDraft.imageAlt,
                    iconEmoji: progDraft.iconEmoji,
                    isFeatured: progDraft.isFeatured,
                    thematicArea: progDraft.thematicArea,
                    category: progDraft.category,
                    auraProjectUrl: progDraft.auraProjectUrl,
                    ctaLabel: progDraft.ctaLabel,
                    ctaUrl: progDraft.ctaUrl,
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'parcerias' && (
        <div style={{ display: 'grid', gap: 24 }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Handshake size={20} color="#d97706" /> Configuração da Seção &quot;Seja Parceiro&quot; (Frontend)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Badge / Tag da Seção</label>
                <input type="text" value={partnerBadge} onChange={e => setPartnerBadge(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                  placeholder="ex: Seja Parceiro" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título da Seção</label>
                <input type="text" value={partnerTitle} onChange={e => setPartnerTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 700 }}
                  placeholder="ex: Construa o Futuro Conosco" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Subtítulo / Texto Introdutório</label>
              <textarea value={partnerSubtitle} onChange={e => setPartnerSubtitle(e.target.value)} rows={2}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical' }}
                placeholder="Descrição introdutória da parceria..." />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Selos de Confiança (Trust Badges)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {trustBadges.map((badge, idx) => (
                  <span key={idx} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {badge}
                    <button onClick={() => setTrustBadges(trustBadges.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}>&times;</button>
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="text" value={newBadgeText} onChange={e => setNewBadgeText(e.target.value)}
                    placeholder="+ Novo selo"
                    onKeyDown={e => { if (e.key === 'Enter' && newBadgeText.trim()) { setTrustBadges([...trustBadges, newBadgeText.trim()]); setNewBadgeText(''); } }}
                    style={{ padding: '4px 10px', borderRadius: 20, border: '1px dashed #d1d5db', fontSize: 12, width: 120 }} />
                  <button onClick={() => { if (newBadgeText.trim()) { setTrustBadges([...trustBadges, newBadgeText.trim()]); setNewBadgeText(''); } }}
                    style={{ background: '#d97706', color: 'white', border: 'none', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Adicionar</button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Cards de Benefícios & Diferenciais</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0 0' }}>Blocos explicativos sobre as vantagens de ser parceiro do Instituto</p>
              </div>
              <button onClick={handleAddBenefit}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#d97706', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} /> Novo Card
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {partnerBenefits.map((b, idx) => (
                <div key={b.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>Card #{b.order}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleMoveBenefit(idx, 'up')} disabled={idx === 0} style={{ padding: 4, background: 'white', border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}><ArrowUp size={12} /></button>
                      <button onClick={() => handleMoveBenefit(idx, 'down')} disabled={idx === partnerBenefits.length - 1} style={{ padding: 4, background: 'white', border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }}><ArrowDown size={12} /></button>
                      <button onClick={() => handleRemoveBenefit(b.id)} style={{ padding: 4, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 4, cursor: 'pointer' }}><Trash2 size={12} color="#ef4444" /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={b.icon || ''}
                      onChange={e => { const u = [...partnerBenefits]; u[idx].icon = e.target.value; setPartnerBenefits(u); }}
                      style={{ width: 44, textAlign: 'center', fontSize: 16, padding: 6, borderRadius: 6, border: '1px solid #e5e7eb' }} placeholder="Emoji" />
                    <input type="text" value={b.title}
                      onChange={e => { const u = [...partnerBenefits]; u[idx].title = e.target.value; setPartnerBenefits(u); }}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 700 }} placeholder="Título do Benefício" />
                  </div>
                  <textarea value={b.description}
                    onChange={e => { const u = [...partnerBenefits]; u[idx].description = e.target.value; setPartnerBenefits(u); }}
                    rows={2} style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12, resize: 'vertical' }}
                    placeholder="Descrição do benefício..." />
                </div>
              ))}
            </div>
          </div>

          {/* Seção 3: Catálogo de Parceiros */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Catálogo de Parceiros (Site Público)</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0 0' }}>Cadastre e controle os parceiros exibidos publicamente. Arraste para reordenar.</p>
              </div>
              <button onClick={handleAddPartner}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} /> Cadastrar Parceiro
              </button>
            </div>

            {/* Busca e Filtro */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 10 }} />
                <input type="text" value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)}
                  placeholder="Buscar por nome, país..."
                  style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <select value={partnerStatusFilter} onChange={e => setPartnerStatusFilter(e.target.value as PartnerStatus | 'ALL')}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
                <option value="ALL">Todos os status</option>
                <option value="PUBLISHED">🟢 Publicados</option>
                <option value="DRAFT">🟡 Rascunhos</option>
                <option value="ARCHIVED">⚪ Arquivados</option>
              </select>
              <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
                {filteredPartnersList.length} de {partnersList.length} parceiros
              </span>
            </div>

            {/* Lista de Parceiros */}
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredPartnersList.map((p, idx) => {
                const realIdx = partnersList.indexOf(p);
                const isExpanded = expandedPartnerIdx === realIdx;
                const isDragOver = dragOverIdx === realIdx;
                return (
                  <div
                    key={p.id || realIdx}
                    draggable
                    onDragStart={() => handleDragStart(realIdx)}
                    onDragOver={e => handleDragOver(e, realIdx)}
                    onDrop={e => handleDrop(e, realIdx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      border: `2px solid ${isDragOver ? '#2563eb' : p.status === 'PUBLISHED' ? '#16a34a' : p.status === 'ARCHIVED' ? '#9ca3af' : '#d97706'}`,
                      borderRadius: 12,
                      background: isDragOver ? '#eff6ff' : p.status === 'PUBLISHED' ? '#f0fdf4' : p.status === 'ARCHIVED' ? '#f9fafb' : '#fffbeb',
                      transition: 'border-color 0.15s, background 0.15s',
                      opacity: isDragOver ? 0.85 : 1,
                    }}
                  >
                    {/* Header do Card de Parceiro */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', flexWrap: 'wrap' }}>
                      {/* Handle de drag */}
                      <span title="Arraste para reordenar" style={{ cursor: 'grab', color: '#9ca3af', flexShrink: 0 }}>
                        <GripVertical size={16} />
                      </span>

                      {/* Logo preview */}
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.logoAlt || p.name}
                          style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', padding: 2 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#9ca3af' }}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Nome e status */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                          {p.fantasyName && <span style={{ fontSize: 11, fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>({p.fantasyName})</span>}
                          {p.isFeatured && <Star size={12} color="#d97706" style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle' }} />}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          #{p.order || realIdx + 1} &bull; {p.category} {p.country && `• ${p.country}`} {p.tier && `• ${p.tier}`}
                        </div>
                      </div>

                      {/* Controles */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        <select value={p.status || 'DRAFT'}
                          onChange={e => handleUpdatePartner(realIdx, { status: e.target.value as PartnerStatus })}
                          style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                            background: p.status === 'PUBLISHED' ? '#dcfce7' : p.status === 'ARCHIVED' ? '#f3f4f6' : '#fef3c7',
                            color: p.status === 'PUBLISHED' ? '#15803d' : p.status === 'ARCHIVED' ? '#4b5563' : '#b45309',
                            border: 'none', cursor: 'pointer' }}>
                          <option value="PUBLISHED">🟢 PUBLICADO</option>
                          <option value="DRAFT">🟡 RASCUNHO</option>
                          <option value="ARCHIVED">⚪ ARQUIVADO</option>
                        </select>
                        <button onClick={() => setPreviewPartner(p)} title="Pré-visualizar"
                          style={{ padding: '4px 8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer' }}>
                          <Eye size={13} color="#2563eb" />
                        </button>
                        <button onClick={() => handleDuplicatePartner(realIdx)} title="Duplicar parceiro"
                          style={{ padding: '4px 8px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer' }}>
                          <Copy size={13} color="#b45309" />
                        </button>
                        <button onClick={() => handleRemovePartner(realIdx)} title="Excluir parceiro"
                          style={{ padding: '4px 8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer' }}>
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                        <button onClick={() => setExpandedPartnerIdx(isExpanded ? null : realIdx)}
                          style={{ padding: '4px 8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Formulário expandido */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #e5e7eb', display: 'grid', gap: 16 }}>

                        {/* Seção: Identificação */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>1. Identificação</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nome / Razão Social *</label>
                              <input type="text" value={p.name}
                                onChange={e => handleUpdatePartner(realIdx, { name: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nome Fantasia</label>
                              <input type="text" value={p.fantasyName || ''}
                                onChange={e => handleUpdatePartner(realIdx, { fantasyName: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} placeholder="Nome fantasia (opcional)" />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Categoria *</label>
                              <select value={p.category}
                                onChange={e => handleUpdatePartner(realIdx, { category: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }}>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Tipo de Parceiro</label>
                              <select value={p.partnerType || ''}
                                onChange={e => handleUpdatePartner(realIdx, { partnerType: e.target.value as PartnerType })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }}>
                                <option value="">Selecionar...</option>
                                <option value="CORPORATIVO">Corporativo</option>
                                <option value="ACADEMICO">Acadêmico / Pesquisa</option>
                                <option value="GOVERNAMENTAL">Governamental</option>
                                <option value="OSC_ONG">OSC / ONG</option>
                                <option value="ORGANISMO_INTERNACIONAL">Organismo Internacional</option>
                                <option value="INDIVIDUAL">Individual</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nível (Tier)</label>
                              <select value={p.tier}
                                onChange={e => handleUpdatePartner(realIdx, { tier: e.target.value as PartnerTier })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }}>
                                <option value="TIER_1">Premier (Destaque Principal)</option>
                                <option value="TIER_2">Gold (Destaque Intermediário)</option>
                                <option value="TIER_3">Parceiro Padrão</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Área de Atuação</label>
                              <input type="text" value={p.area || ''}
                                onChange={e => handleUpdatePartner(realIdx, { area: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} placeholder="ex: Educação, ESG, Saúde" />
                            </div>
                          </div>
                        </fieldset>

                        {/* Seção: Localização */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>2. Localização</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>País</label>
                              <input type="text" value={p.country || ''}
                                onChange={e => handleUpdatePartner(realIdx, { country: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} placeholder="ex: Brasil" />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Estado</label>
                              <input type="text" value={p.state || ''}
                                onChange={e => handleUpdatePartner(realIdx, { state: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} placeholder="ex: SP" />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Cidade</label>
                              <input type="text" value={p.city || ''}
                                onChange={e => handleUpdatePartner(realIdx, { city: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} placeholder="ex: São Paulo" />
                            </div>
                          </div>
                        </fieldset>

                        {/* Seção: Descrição */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>3. Descrição</legend>
                          <div style={{ display: 'grid', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                                Descrição Resumida <span style={{ color: '#9ca3af', fontWeight: 400 }}>(até 250 caracteres)</span>
                              </label>
                              <textarea value={p.description || ''}
                                onChange={e => handleUpdatePartner(realIdx, { description: e.target.value.slice(0, 250) })}
                                rows={2} maxLength={250}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Breve apresentação do parceiro e área de cooperação..." />
                              <span style={{ fontSize: 10, color: '#9ca3af' }}>{(p.description || '').length}/250</span>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Descrição Completa</label>
                              <textarea value={p.fullDescription || ''}
                                onChange={e => handleUpdatePartner(realIdx, { fullDescription: e.target.value })}
                                rows={4}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Descrição completa sobre o parceiro e a relação de parceria..." />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Missão da Parceria <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
                              <textarea value={p.missionStatement || ''}
                                onChange={e => handleUpdatePartner(realIdx, { missionStatement: e.target.value })}
                                rows={2}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Missão compartilhada desta parceria..." />
                            </div>
                          </div>
                        </fieldset>

                        {/* Seção: Identidade Visual */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>4. Identidade Visual</legend>
                          <div style={{ display: 'grid', gap: 16 }}>
                            {/* ALT Text */}
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                                Texto Alternativo (ALT) da Logomarca *
                                <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>Obrigatório para acessibilidade (WCAG 2.1)</span>
                              </label>
                              <input type="text" value={p.logoAlt || ''}
                                onChange={e => handleUpdatePartner(realIdx, { logoAlt: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: `1px solid ${!p.logoAlt && p.logoUrl ? '#dc2626' : '#d1d5db'}`, fontSize: 12, boxSizing: 'border-box' }}
                                placeholder="ex: Logotipo da Organização das Nações Unidas" />
                              {!p.logoAlt && p.logoUrl && (
                                <p style={{ fontSize: 10, color: '#dc2626', marginTop: 2 }}>⚠️ ALT obrigatório quando a logomarca está preenchida.</p>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                              <ImageUploadInput label="Logomarca (PNG / JPG / WEBP)" value={p.logoUrl}
                                onChange={url => handleUpdatePartner(realIdx, { logoUrl: url })}
                                folder="partners/logos" previewHeight={64} />
                              <ImageUploadInput label="Logotipo Vetorial (SVG)" value={p.logoSvgUrl}
                                onChange={url => handleUpdatePartner(realIdx, { logoSvgUrl: url })}
                                folder="partners/svg" previewHeight={64} />
                              <ImageUploadInput label="Imagem Institucional (opcional)" value={p.institutionalImageUrl}
                                onChange={url => handleUpdatePartner(realIdx, { institutionalImageUrl: url })}
                                folder="partners/institutional" previewHeight={64} />
                            </div>
                          </div>
                        </fieldset>

                        {/* Seção: Links */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>5. Links</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                            {[
                              { key: 'websiteUrl' as const, label: 'Site Oficial *', icon: <Globe size={13} />, placeholder: 'https://site.com.br', required: true },
                              { key: 'instagramUrl' as const, label: 'Instagram', icon: <Share2 size={13} />, placeholder: 'https://instagram.com/parceiro' },
                              { key: 'facebookUrl' as const, label: 'Facebook', icon: <Share2 size={13} />, placeholder: 'https://facebook.com/parceiro' },
                              { key: 'linkedinUrl' as const, label: 'LinkedIn', icon: <Link2 size={13} />, placeholder: 'https://linkedin.com/company/parceiro' },
                              { key: 'youtubeUrl' as const, label: 'YouTube', icon: <Share2 size={13} />, placeholder: 'https://youtube.com/@parceiro' },
                              { key: 'twitterUrl' as const, label: 'X (Twitter)', icon: <Share2 size={13} />, placeholder: 'https://x.com/parceiro' },
                            ].map(field => (
                              <div key={field.key}>
                                <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                  {field.icon} {field.label}
                                </label>
                                <input type="url" value={(p[field.key] as string) || ''}
                                  onChange={e => handleUpdatePartner(realIdx, { [field.key]: e.target.value })}
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6,
                                    border: `1px solid ${urlError(p[field.key] as string | undefined) ? '#dc2626' : '#d1d5db'}`,
                                    fontSize: 12, boxSizing: 'border-box' }}
                                  placeholder={field.placeholder} />
                                {urlError(p[field.key] as string | undefined) && (
                                  <p style={{ fontSize: 10, color: '#dc2626', marginTop: 2 }}>⚠️ URL deve começar com https://</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </fieldset>

                        {/* Seção: Informações da Parceria */}
                        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
                          <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>6. Parceria & Exibição</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Data de Início da Parceria</label>
                              <input type="date" value={p.partnershipStartDate || ''}
                                onChange={e => handleUpdatePartner(realIdx, { partnershipStartDate: e.target.value })}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Objetivos da Parceria</label>
                              <textarea value={p.objectives || ''}
                                onChange={e => handleUpdatePartner(realIdx, { objectives: e.target.value })}
                                rows={2} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Objetivos desta parceria..." />
                            </div>
                            <div>
                              <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Resultados Esperados</label>
                              <textarea value={p.expectedResults || ''}
                                onChange={e => handleUpdatePartner(realIdx, { expectedResults: e.target.value })}
                                rows={2} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Resultados esperados desta parceria..." />
                            </div>
                          </div>
                          {/* Controles de exibição */}
                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            {[
                              { key: 'isFeatured' as const, label: '⭐ Parceiro em Destaque' },
                              { key: 'showOnLandingPage' as const, label: '🏠 Exibir na Landing Page' },
                              { key: 'showInstitutionalPage' as const, label: '🏗️ Exibir Página Institucional' },
                            ].map(toggle => (
                              <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#374151' }}>
                                <input type="checkbox" checked={!!(p[toggle.key])}
                                  onChange={e => handleUpdatePartner(realIdx, { [toggle.key]: e.target.checked })}
                                  style={{ width: 16, height: 16, cursor: 'pointer' }} />
                                {toggle.label}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPartnersList.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', border: '1px dashed #d1d5db', borderRadius: 8 }}>
                  {partnerSearch || partnerStatusFilter !== 'ALL'
                    ? 'Nenhum parceiro encontrado com os filtros selecionados.'
                    : 'Nenhum parceiro cadastrado ainda. Clique no botão acima para adicionar.'}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Modal de Pré-visualização */}
      {previewPartner && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setPreviewPartner(null)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 24, maxWidth: 360, width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewPartner(null)}
              style={{ position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}>
              <X size={14} />
            </button>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: 16 }}>Pré-visualização do Card</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20, borderRadius: 16, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
              {previewPartner.logoUrl ? (
                <img src={previewPartner.logoUrl} alt={previewPartner.logoAlt || previewPartner.name}
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', padding: 4 }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 12, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#9ca3af' }}>
                  {previewPartner.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{previewPartner.name}</p>
                {previewPartner.fantasyName && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0 0' }}>{previewPartner.fantasyName}</p>}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20 }}>{previewPartner.category}</span>
                  {previewPartner.country && <span style={{ fontSize: 10, color: '#6b7280' }}>📍 {previewPartner.country}</span>}
                  {previewPartner.tier && <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 20 }}>{previewPartner.tier}</span>}
                </div>
                {previewPartner.description && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>{previewPartner.description}</p>}
              </div>
              {previewPartner.websiteUrl && (
                <a href={previewPartner.websiteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={11} /> Visitar site
                </a>
              )}
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
              Status: <strong>{previewPartner.status}</strong> &bull; Tier: <strong>{previewPartner.tier}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Tab: PMO & Sub-projetos */}
      {activeTab === 'pmo' && selectedProgram && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800 }}>Sub-Projetos de Execução</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>PMO Social — Projetos vinculados a {selectedProgram.title}</p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {projects.map(proj => (
              <div key={proj.id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#111827' }}>{proj.title}</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Responsável: {proj.responsibleName} | Local: {proj.cityState} | Meta: {proj.beneficiaryTarget} beneficiários
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a' }}>{proj.progressPct}% concluído</div>
                    <div style={{ width: 100, height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${proj.progressPct}%`, height: '100%', background: '#16a34a' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum sub-projeto cadastrado.</div>}
          </div>
        </div>
      )}

      {/* Tab: Indicadores SROI & ESG */}
      {activeTab === 'sroi_kpis' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Mensuração de Valor Social & ESG (SROI)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { label: 'Retorno Social Esperado (SROI Média)', value: 'R$ 4,80 por R$ 1,00', color: '#16a34a' },
              { label: 'Impacto Ambiental Carbono Neutro', value: '1.200 ton CO₂e', color: '#2563eb' },
              { label: 'Beneficiários Diretos Formados', value: '4.850 jovens', color: '#d97706' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: kpi.color, marginTop: 6 }}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="programs" onRestore={() => loadData()} />
      </div>
    </div>
  );
};

