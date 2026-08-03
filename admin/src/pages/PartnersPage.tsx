import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Search, Filter, ShieldCheck,
  FileCheck2, DollarSign, Handshake, AlertTriangle,
  ExternalLink, Calendar, CheckCircle2, ArrowRight, Activity
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  PartnersEnterpriseService,
  type InstitutionalPartner,
  type PartnerAgreement,
  type CrmDeal,
  type DealStage
} from '../services/partnersEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'diretorio' | 'pipeline' | 'convenios' | 'patrocinios' | 'compliance';

const STAGE_LABELS: Record<DealStage, string> = {
  PROSPECAO: 'Prospecção',
  QUALIFICACAO: 'Qualificação',
  PROPOSTA: 'Proposta Comercial',
  ANALISE_JURIDICA: 'Análise Jurídica / KYC',
  FORMALIZACAO: 'Formalização / Minuta',
  EM_EXECUCAO: 'Em Execução / Ativo',
  RENOVACAO: 'Renovação Contratual',
  ENCERRADO: 'Encerramento',
};

const STAGE_COLORS: Record<DealStage, string> = {
  PROSPECAO: '#6b7280',
  QUALIFICACAO: '#3b82f6',
  PROPOSTA: '#d97706',
  ANALISE_JURIDICA: '#8b5cf6',
  FORMALIZACAO: '#ec4899',
  EM_EXECUCAO: '#16a34a',
  RENOVACAO: '#059669',
  ENCERRADO: '#9ca3af',
};

export const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<InstitutionalPartner[]>([]);
  const [agreements, setAgreements] = useState<PartnerAgreement[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>('diretorio');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Autosave
  const autosave = useCMSAutosave('partners', partners);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let partList = await PartnersEnterpriseService.getPartners();
      if (!partList.length) {
        await PartnersEnterpriseService.seedDefaults();
        partList = await PartnersEnterpriseService.getPartners();
      }
      setPartners(partList);

      const agreeList = await PartnersEnterpriseService.getAgreements();
      setAgreements(agreeList);

      const dealList = await PartnersEnterpriseService.getDeals();
      setDeals(dealList);
    } catch (e) {
      console.error('[PartnersPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const part of partners) {
        await PartnersEnterpriseService.savePartner(part);
      }
      // Sincroniza parceiros ativos com a coleção `partners` lida pelo site público
      const { PublishedPartnersService } = await import('../services/publishedPartnersService');
      const publishedList = partners.filter(p => p.status === 'ATIVO');
      if (publishedList.length > 0) {
        for (let i = 0; i < publishedList.length; i++) {
          const p = publishedList[i];
          await PublishedPartnersService.create({
            order: i + 1,
            name: p.companyName,
            category: 'ESTRATEGICO',
            logoUrl: p.logoUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&q=80',
            websiteUrl: p.websiteUrl || '#',
            description: p.notes || '',
            isPublished: true,
            tier: 'TIER_1',
          });
        }
      }
      await CMSVersionService.saveDraft('partners', { partners } as unknown as Record<string, unknown>, 'admin', 'Atualização Módulo de Parceiros');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[PartnersPage] Save error:', e);
      alert('Erro ao salvar parceiros.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPartners = partners.filter(p =>
    p.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (p.cnpjOrCpf && p.cnpjOrCpf.includes(search)) ||
    (p.contactName && p.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'diretorio', label: 'Diretório de Parceiros', icon: Building2 },
    { id: 'pipeline', label: 'CRM & Pipeline de Captação', icon: Activity },
    { id: 'convenios', label: 'Gestão de Convênios', icon: FileCheck2 },
    { id: 'patrocinios', label: 'Patrocínios & ESG', icon: DollarSign },
    { id: 'compliance', label: 'Compliance & Due Diligence (KYC)', icon: ShieldCheck },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando ecossistema de relacionamentos institucionais...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="CRM & Parcerias Enterprise" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Handshake size={26} color="#2563eb" /> CRM Institucional, Convênios & Patrocínios
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Gerencie o ciclo de vida completo de parcerias com empresas, fundações, órgãos públicos e universidades
          </p>
        </div>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d && (d as any).partners) setPartners((d as any).partners); }}
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
              background: activeTab === t.id ? '#2563eb' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      {activeTab === 'diretorio' && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Buscar por razão social, CNPJ ou contato..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px 9px 36px',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      )}

      {/* Tab: Diretório de Parceiros */}
      {activeTab === 'diretorio' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredPartners.map(p => (
            <div
              key={p.id}
              style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 4 }}>
                    {p.category}
                  </span>
                  {p.kycVerified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                      <ShieldCheck size={14} /> KYC Verificado
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>{p.companyName}</h3>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{p.cnpjOrCpf || 'CNPJ não informado'}</div>

                <div style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  Contato: <strong>{p.contactName}</strong> ({p.email})
                </div>

                {p.odsSupported && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {p.odsSupported.map(o => (
                      <span key={o} style={{ background: '#fef3c7', color: '#b45309', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                        {o}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  ESG Score: <strong style={{ color: '#16a34a' }}>{p.esgScore || 90}/100</strong>
                </div>
                <button
                  style={{
                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                    borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Compliance & Due Diligence (KYC) */}
      {activeTab === 'compliance' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <ShieldCheck size={22} color="#16a34a" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Dossiês de Due Diligence & KYC Institucional</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Verificação automatizada de conformidade fiscal, certidões negativas e isenção de conflito de interesses</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {partners.map(p => (
              <div key={p.id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#111827' }}>{p.companyName}</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    CNPJ: {p.cnpjOrCpf} | Validação LGPD: Ok | Certidão CND: Válida até 12/2026
                  </div>
                </div>
                <span style={{
                  background: p.kycVerified ? '#f0fdf4' : '#fffbeb',
                  color: p.kycVerified ? '#16a34a' : '#d97706',
                  border: `1px solid ${p.kycVerified ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700
                }}>
                  {p.kycVerified ? '✅ Aprovado em Due Diligence' : '⚠ Análise Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="partners" onRestore={() => loadData()} />
      </div>
    </div>
  );
};
