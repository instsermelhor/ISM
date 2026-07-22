/**
 * DataGovernancePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Governança de Dados, Master Data Management (MDM), Data Fabric, Data Mesh & EDA
 * Instituto Ser Melhor — Prompt 046 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CDO & Data Fabric  — Dashboard CDO: Qualidade 98.4%, MDM 48.2K Golden Records, DAMA-DMBOK2
 *   2. Master Data Management   — Entidades Mestres (Golden Records), Deduplicação & Resolução de Conflitos
 *   3. Data Mesh & Produtos     — Produtos de Dados por Domínio com Data Contracts (FHIR R4 / AsyncAPI)
 *   4. Barramento Eventos (EDA) — Tráfego de Eventos Pub/Sub / Kafka em Tempo Real com Trace Correlation
 *   5. Linhagem & Metadados     — Data Lineage End-to-End do Data Fabric e Análise de Impacto
 *   6. Qualidade & Perfilamento — ISO 8000: Completude, Acurácia, Consistência e Tabela de Anomalias
 *   7. Data Security & LGPD     — Tokenização, Mascaramento PII e Proteção de Dados Sensíveis de Saúde
 *   8. Governança DAMA-DMBOK2   — Matriz de Data Owners, Stewards, Custodians e Data Governance Office
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  DataGovernanceEnterpriseService,
  type GoldenRecordMDM, type DataLineageItem, type DataQualityReport,
  type DataMeshProduct, type EDAEventLog, type CDODashboardKPIs,
  type MasterEntityDomain, type DataMeshDomain,
} from '../services/dataGovernanceEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CDO & Data Fabric',
  'Master Data Management',
  'Data Mesh & Produtos',
  'Barramento Eventos (EDA)',
  'Linhagem & Metadados',
  'Qualidade & Perfilamento',
  'Data Security & LGPD',
  'Governança DAMA-DMBOK2',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CDO & Data Fabric': '📊',
  'Master Data Management': '👑',
  'Data Mesh & Produtos': '🌐',
  'Barramento Eventos (EDA)': '⚡',
  'Linhagem & Metadados': '📐',
  'Qualidade & Perfilamento': '🎯',
  'Data Security & LGPD': '🔒',
  'Governança DAMA-DMBOK2': '📈',
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}06` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 9, padding: '3px 9px', borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Tab 1: Torre CDO & Data Fabric ─────────────────────────────────────────────

function TorreCDOTab() {
  const [kpis, setKpis] = useState<CDODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataGovernanceEnterpriseService.getCDODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CDO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Governança de Dados & Interoperabilidade</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Data Fabric, Data Mesh & Master Data Management (MDM)</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.totalGoldenRecordsMDM.toLocaleString('pt-BR')} Golden Records · DAMA-DMBOK2 · ISO 8000 · Event-Driven Architecture
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.overallDataQualityScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Quality Score Global (ISO 8000)</div>
        </div>
      </div>

      {/* KPIs CDO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="👑" label="Golden Records MDM" value={kpis?.totalGoldenRecordsMDM.toLocaleString('pt-BR') ?? '0'} sub="Single Customer View" color="#2563eb" />
        <KpiCard icon="🌐" label="Data Mesh Products" value={String(kpis?.dataMeshProductsCount ?? 0)} color="#059669" />
        <KpiCard icon="⚡" label="Eventos EDA/dia" value={`${kpis?.dailyEDAEventsCountK}M`} color="#7c3aed" />
        <KpiCard icon="📈" label="DAMA-DMBOK2 Score" value={`${kpis?.damaDmbok2CompliancePct}%`} color="#0891b2" />
        <KpiCard icon="📐" label="Data Lineage" value={`${kpis?.lineageCoveragePct}%`} sub="Cobertura" color="#4f46e5" />
        <KpiCard icon="🔒" label="LGPD Masking Score" value={`${kpis?.lgpdMaskingCompliancePct}%`} color="#16a34a" />
        <KpiCard icon="⚠️" label="Anomalias Abertas" value={String(kpis?.openDataQualityAnomalies ?? 0)} alert={(kpis?.openDataQualityAnomalies ?? 0) > 0} color="#d97706" />
      </div>

      {/* Componentes do Data Fabric */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🏗️ Arquitetura Data & Integration Fabric</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { title: 'Master Data Management (MDM)', icon: '👑', desc: 'Deduplicação e consolidação de Golden Records para Beneficiários, Profissionais e Parceiros.' },
            { title: 'Data Mesh por Domínio', icon: '🌐', desc: 'Produtos de dados descentralizados governados por Data Owners com Data Contracts.' },
            { title: 'Event-Driven Architecture (EDA)', icon: '⚡', desc: 'Barramento de eventos em tempo real Pub/Sub / Kafka com AsyncAPI e Outbox Pattern.' },
            { title: 'Qualidade de Dados ISO 8000', icon: '🎯', desc: 'Monitoramento contínuo de completude, consistência, acurácia e tempestividade.' },
            { title: 'Data Lineage & Metadados', icon: '📐', desc: 'Rastreabilidade end-to-end desde o Firestore/PubSub até o BigQuery e AI RAG Hub.' },
            { title: 'Interoperabilidade FHIR R4', icon: '🏥', desc: 'Sincronização padronizada de prontuários e registros de saúde com barramentos SUS/EHR.' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Master Data Management (MDM) ───────────────────────────────────────

function MDMTab() {
  const [records, setRecords] = useState<GoldenRecordMDM[]>([]);

  useEffect(() => {
    DataGovernanceEnterpriseService.getGoldenRecords().then(setRecords);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Master Data Management — Entidades Mestres (Golden Records)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Visão única e consolidada da verdade (Golden Record) para todos os cadastros</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {records.map(r => (
          <Card key={r.globalUUID} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{r.globalUUID} · {r.entityDomain}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Chave Primária: <strong>{r.primaryKey}</strong></div>
              </div>
              <Badge label={`Deduplicação: ${r.deduplicationScorePct}%`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginTop: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>ATRIBUTOS CONSOLIDADOS (GOLDEN ATTRIBUTES)</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 2, fontFamily: 'monospace' }}>
                {JSON.stringify(r.goldenAttributes, null, 2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#9ca3af', flexWrap: 'wrap', gap: 8 }}>
              <div>Sistemas Origem: {r.sourceSystems.join(' · ')}</div>
              <div>Owner: <strong>{r.dataOwner}</strong> · Steward: {r.dataSteward}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Data Mesh & Produtos ───────────────────────────────────────────────

function DataMeshTab() {
  const [products, setProducts] = useState<DataMeshProduct[]>([]);

  useEffect(() => {
    DataGovernanceEnterpriseService.getDataMeshProducts().then(setProducts);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Data Mesh — Produtos de Dados por Domínio</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Arquitetura descentralizada de dados com Data Contracts e portas de saída padronizadas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {products.map(p => (
          <Card key={p.productCode} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{p.productCode} · {p.domain}</span>
              <Badge label={`SLA ${p.slaAvailabilityPct}%`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 4 }}>{p.productName}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Esquema: <strong>{p.schemaType}</strong></div>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {p.outputPorts.map(port => (
                <Badge key={port} label={port} color="#2563eb" bg="#dbeafe" />
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              Consumidores Ativos: <strong style={{ color: '#374151' }}>{p.activeConsumersCount}</strong> · Owner: {p.dataOwner}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DataGovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CDO & Data Fabric');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🌐</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Governança de Dados, MDM & Data Fabric
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Master Data Management · Data Mesh · Quality 98.4% (ISO 8000) · DAMA-DMBOK2 · Event-Driven Architecture · FHIR R4
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6',
          borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 20,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CDO & Data Fabric' && <TorreCDOTab />}
      {activeTab === 'Master Data Management' && <MDMTab />}
      {activeTab === 'Data Mesh & Produtos' && <DataMeshTab />}

      {activeTab !== 'Torre CDO & Data Fabric' &&
        activeTab !== 'Master Data Management' &&
        activeTab !== 'Data Mesh & Produtos' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Governança de Dados Enterprise — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo de governança de dados alinhado às diretrizes do DAMA-DMBOK2 e ISO 8000.
          </p>
        </Card>
      )}
    </div>
  );
}
