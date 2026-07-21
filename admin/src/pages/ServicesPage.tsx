import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban, Plus, Trash2, CheckCircle2,
  ExternalLink, Search, RefreshCw, BarChart2,
  Layers, Target, Award, DollarSign, Calendar, Users,
  ShieldCheck, FileText, Activity
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { InstitutionalFirestoreService } from '../services/institutional';
import {
  ProgramsEnterpriseService,
  type SocialProgram,
  type SocialProject,
  type ProgramKpi,
  type ProgramLifecycleStage
} from '../services/programsEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'portafolio' | 'pmo' | 'matriz_logica' | 'sroi_kpis' | 'financeiro';

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

export const ServicesPage: React.FC = () => {
  const [programs, setPrograms] = useState<SocialProgram[]>([]);
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [kpis, setKpis] = useState<ProgramKpi[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>('portafolio');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Autosave
  const autosave = useCMSAutosave('programs', programs);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
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
      await CMSVersionService.saveDraft('programs', { programs } as unknown as Record<string, unknown>, 'admin', 'Atualização Portfólio de Programas');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[ServicesPage] Save error:', e);
      alert('Erro ao salvar programas.');
    } finally {
      setSaving(false);
    }
  };

  const selectedProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'portafolio', label: 'Portfólio de Programas', icon: FolderKanban },
    { id: 'pmo', label: 'PMO & Sub-Projetos', icon: Activity },
    { id: 'matriz_logica', label: 'Matriz Lógica (M&A)', icon: Target },
    { id: 'sroi_kpis', label: 'Indicadores SROI & ESG', icon: BarChart2 },
    { id: 'financeiro', label: 'Execução Orçamentária', icon: DollarSign },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando portfólio de programas sociais...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="PMO Social & Gestão de Programas" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderKanban size={26} color="#d97706" /> Módulo de Programas, PMO Social & Impacto (M&A)
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie o ciclo de vida dos programas institucionais, matrizes lógicas e mensuração de SROI
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

      {/* Tabs */}
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

      {/* Tab: Portfólio de Programas */}
      {activeTab === 'portafolio' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {programs.map(prog => (
              <div
                key={prog.id}
                style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{prog.iconEmoji}</span>
                    <span style={{
                      background: `${STAGE_COLORS[prog.stage]}18`, color: STAGE_COLORS[prog.stage],
                      border: `1px solid ${STAGE_COLORS[prog.stage]}40`, borderRadius: 6,
                      padding: '2px 8px', fontSize: 11, fontWeight: 700
                    }}>
                      {STAGE_LABELS[prog.stage]}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>{prog.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: '0 0 16px 0' }}>{prog.summary}</p>

                  {/* ODS Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {prog.ods?.map(o => (
                      <span key={o} style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    SROI: <strong style={{ color: '#16a34a' }}>{prog.sroiRatio ? `${prog.sroiRatio}x` : '4.5x'}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    Orçamento: <strong style={{ color: '#111827' }}>R$ {(prog.totalBudget / 1000).toFixed(0)}k</strong>
                  </div>
                </div>
              </div>
            ))}
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
