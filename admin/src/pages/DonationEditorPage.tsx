import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Plus, Trash2, Save, RotateCcw, CheckCircle,
  Megaphone, Repeat, CreditCard, Award, BarChart2, DollarSign
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { InstitutionalFirestoreService } from '../services/institutional';
import {
  FundraisingEnterpriseService,
  type FundraisingCampaign,
  type RecurringSubscription
} from '../services/fundraisingEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'campanhas' | 'recorrencia' | 'meios_pagamento' | 'certificados';

export const DonationEditorPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>('campanhas');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Autosave
  const autosave = useCMSAutosave('donations', campaigns);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let campList = await FundraisingEnterpriseService.getCampaigns();
      if (!campList.length) {
        await FundraisingEnterpriseService.seedDefaults();
        campList = await FundraisingEnterpriseService.getCampaigns();
      }
      setCampaigns(campList);

      const subList = await FundraisingEnterpriseService.getSubscriptions();
      setSubscriptions(subList);
    } catch (e) {
      console.error('[DonationEditorPage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const camp of campaigns) {
        await FundraisingEnterpriseService.saveCampaign(camp);
      }
      // Sincroniza também com donation_section/main para consumo direto pelo site principal
      if (campaigns.length > 0) {
        const mainCamp = campaigns[0];
        await InstitutionalFirestoreService.saveDonationSection({
          badge: 'Apoie Agora',
          title: mainCamp.title,
          subtitle: mainCamp.description,
          pixKey: '000.000.000-00 (Chave PIX Oficial)',
          bankName: 'Banco do Brasil',
          benefits: mainCamp.benefits || [
            'Financiamento de bolsas para jovens líderes climáticos.',
            'Proteção de biomas através de tecnologia de monitoramento via satélite.',
            'Independência total de verbas governamentais.'
          ],
        });
      }
      await CMSVersionService.saveDraft('donations', { campaigns } as unknown as Record<string, unknown>, 'admin', 'Atualização Módulo de Captação & Doações');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[DonationEditorPage] Save error:', e);
      alert('Erro ao salvar campanhas de doação.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'campanhas', label: 'Campanhas de Captação', icon: Megaphone },
    { id: 'recorrencia', label: 'Doações Recorrentes & Churn', icon: Repeat },
    { id: 'meios_pagamento', label: 'Meios de Pagamento & PIX', icon: CreditCard },
    { id: 'certificados', label: 'Certificados de Impacto', icon: Award },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando plataforma de captação & doações...</div>;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="Fundraising & Captação Enterprise" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={26} color="#dc2626" /> Gestão de Doações, Campanhas & Fundraising
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Captação de recursos, gestão de doadores recorrentes, matching donations e emissão de certificados
          </p>
        </div>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d && (d as any).campaigns) setCampaigns((d as any).campaigns); }}
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

      {/* Tab: Campanhas de Captação */}
      {activeTab === 'campanhas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {campaigns.map(camp => {
            const pct = Math.min(Math.round((camp.raisedAmount / camp.targetAmount) * 100), 100);
            return (
              <div
                key={camp.id}
                style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 4 }}>
                      {camp.status}
                    </span>
                    {camp.matchingDonationEnabled && (
                      <span style={{ fontSize: 10, fontWeight: 800, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: 4 }}>
                        ⚡ Matching: {camp.matchingPartnerName}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>{camp.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: '0 0 16px 0' }}>{camp.subtitle}</p>

                  {/* Progresso Meta */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginBottom: 4 }}>
                      <span style={{ color: '#16a34a' }}>R$ {(camp.raisedAmount / 1000).toFixed(0)}k arrecadados</span>
                      <span style={{ color: '#6b7280' }}>Meta: R$ {(camp.targetAmount / 1000).toFixed(0)}k ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    Doadores: <strong style={{ color: '#111827' }}>{camp.donorCount}</strong>
                  </div>
                  <button
                    style={{
                      background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                      borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Editar Campanha
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Meios de Pagamento */}
      {activeTab === 'meios_pagamento' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800 }}>Gateway Multimeios de Doações</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { name: 'PIX Institucional', status: 'Ativo (Chave E-mail)', badge: '⚡ Instantâneo' },
              { name: 'Cartão de Crédito / Débito', status: 'Ativo (Stripe / Pagar.me)', badge: '💳 Recorrente' },
              { name: 'Boleto Bancário', status: 'Ativo (Cora)', badge: '📄 Sem taxa' },
              { name: 'Open Finance (Pix Agendado)', status: 'Ativo (Banco Central)', badge: '🏦 Automático' },
            ].map(m => (
              <div key={m.name} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4 }}>{m.badge}</span>
                <strong style={{ fontSize: 14, color: '#111827', display: 'block', marginTop: 8 }}>{m.name}</strong>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4, fontWeight: 700 }}>{m.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="donations" onRestore={() => loadData()} />
      </div>
    </div>
  );
};
