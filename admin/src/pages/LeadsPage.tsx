import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Flame, Zap, Sparkles,
  Bot, ShieldCheck, Mail, Phone, ArrowRight,
  Plus, CheckCircle2, AlertTriangle, Calendar, MessageSquare
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  CrmLeadsEnterpriseService,
  type EnterpriseLead,
  type LeadStage,
  type LeadTemperature
} from '../services/crmLeadsEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'funil' | 'leads' | 'ai_qualifier' | 'automacoes' | 'lgpd';

const STAGE_LABELS: Record<LeadStage, string> = {
  NOVO: 'Novo Lead',
  QUALIFICADO: 'Qualificado (Hot)',
  EM_NUTRICAO: 'Em Nutrição',
  APRESENTACAO: 'Apresentação Agendada',
  PROPOSTA: 'Proposta Enviada',
  CONVERTIDO: 'Convertido / Doador',
  ARQUIVADO: 'Arquivado',
};

const STAGE_COLORS: Record<LeadStage, string> = {
  NOVO: '#3b82f6',
  QUALIFICADO: '#dc2626',
  EM_NUTRICAO: '#d97706',
  APRESENTACAO: '#8b5cf6',
  PROPOSTA: '#ec4899',
  CONVERTIDO: '#16a34a',
  ARQUIVADO: '#9ca3af',
};

const TEMP_BADGES: Record<LeadTemperature, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  HOT: { label: 'HOT (Score >= 80)', icon: Flame, color: '#dc2626', bg: '#fef2f2' },
  WARM: { label: 'WARM (50-79)', icon: Zap, color: '#d97706', bg: '#fffbeb' },
  COLD: { label: 'COLD (< 50)', icon: Sparkles, color: '#6b7280', bg: '#f9fafb' },
};

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<EnterpriseLead[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('funil');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<EnterpriseLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Autosave
  const autosave = useCMSAutosave('leads', leads);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let list = await CrmLeadsEnterpriseService.getLeads();
      if (!list.length) {
        await CrmLeadsEnterpriseService.seedDefaults();
        list = await CrmLeadsEnterpriseService.getLeads();
      }
      setLeads(list);
      if (list.length && !selectedLead) setSelectedLead(list[0]);
    } catch (e) {
      console.error('[LeadsPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedLead]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const lead of leads) {
        await CrmLeadsEnterpriseService.saveLead(lead);
      }
      await CMSVersionService.saveDraft('leads', { leads } as unknown as Record<string, unknown>, 'admin', 'Atualização CRM de Leads');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[LeadsPage] Save error:', e);
      alert('Erro ao salvar leads.');
    } finally {
      setSaving(false);
    }
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.companyName && l.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'funil', label: 'Funil de Conversão (CRM)', icon: Users },
    { id: 'leads', label: 'Diretório de Leads & Score', icon: Flame },
    { id: 'ai_qualifier', label: 'Qualificação por IA & Next Best Action', icon: Bot },
    { id: 'automacoes', label: 'Réguas de Nutrição', icon: Zap },
    { id: 'lgpd', label: 'Governança LGPD', icon: ShieldCheck },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando CRM de Leads & Inteligência Comercial...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="CRM de Leads Enterprise" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} color="#dc2626" /> CRM de Leads, Captação & Inteligência Comercial
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Aquisição, Lead Scoring, qualificação por IA e automação de nutrição para doadores e patrocinadores
          </p>
        </div>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d && (d as any).leads) setLeads((d as any).leads); }}
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
              background: activeTab === t.id ? '#dc2626' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Funil de Conversão (CRM) */}
      {activeTab === 'funil' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {(['NOVO', 'QUALIFICADO', 'EM_NUTRICAO', 'APRESENTACAO', 'PROPOSTA', 'CONVERTIDO'] as LeadStage[]).map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            return (
              <div key={stage} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: STAGE_COLORS[stage] }}>{STAGE_LABELS[stage]}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: 'white', padding: '2px 8px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    {stageLeads.length}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {stageLeads.map(l => {
                    const temp = TEMP_BADGES[l.temperature];
                    return (
                      <div key={l.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: 13, color: '#111827' }}>{l.name}</strong>
                          <span style={{ fontSize: 10, fontWeight: 800, color: temp.color, background: temp.bg, padding: '1px 6px', borderRadius: 4 }}>
                            {l.leadScore} pts
                          </span>
                        </div>
                        {l.companyName && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{l.companyName}</div>}
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{l.category}</span>
                          <span>{l.sourceChannel}</span>
                        </div>
                      </div>
                    );
                  })}
                  {stageLeads.length === 0 && <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: 12 }}>Nenhum lead nesta etapa</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Qualificação por IA */}
      {activeTab === 'ai_qualifier' && selectedLead && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bot size={24} color="#8b5cf6" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Assistente IA — Qualificação & Next Best Action</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Sumarização automática de perfil e recomendação inteligente para o time de Captação</p>
            </div>
          </div>

          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#6b21a8', marginBottom: 4 }}>
              Lead Selecionado: {selectedLead.name} ({selectedLead.email})
            </div>
            <p style={{ fontSize: 13, color: '#4c1d95', margin: 0 }}>
              {selectedLead.aiSummary || 'Sumarização em processamento...'}
            </p>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>
              <ArrowRight size={16} /> Próxima Melhor Ação Recomendada (Next Best Action)
            </div>
            <div style={{ fontSize: 14, color: '#166534', fontWeight: 700 }}>
              {selectedLead.nextBestAction || 'Realizar contato telefônico para agendamento de apresentação.'}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Governança LGPD */}
      {activeTab === 'lgpd' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <ShieldCheck size={22} color="#16a34a" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Registro Auditável de Consentimentos LGPD</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Rastreabilidade de Opt-In, timestamps e finalidades autorizadas</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {leads.map(l => (
              <div key={l.id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 13, color: '#111827' }}>{l.name} ({l.email})</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Consentimento registrado em: {l.lgpdConsentDate ? new Date(l.lgpdConsentDate).toLocaleString('pt-BR') : 'Sem data'}
                  </div>
                </div>
                <span style={{
                  background: l.lgpdConsent ? '#f0fdf4' : '#fef2f2',
                  color: l.lgpdConsent ? '#16a34a' : '#dc2626',
                  border: `1px solid ${l.lgpdConsent ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700
                }}>
                  {l.lgpdConsent ? '✅ Consentimento Ativo' : '❌ Opt-Out / Revogado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="leads" onRestore={() => loadData()} />
      </div>
    </div>
  );
};
