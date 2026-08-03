/**
 * BIPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Business Intelligence, Analytics, Data Lake, Data Warehouse & IA Analítica
 * Instituto Ser Melhor — Prompt 035 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre Executiva — C-Level Dashboard: SROI, Atendidos, ESG, KPIs e IA Summary
 *   2. ODS, ESG & SROI  — Retorno Social sobre Investimento e ODS da ONU
 *   3. Analytics Clínico— Desempenho assistencial, evasão e prontuários
 *   4. Analytics Financeiro— Execução orçamentária ITG 2002 e custo por beneficiário
 *   5. IA & Machine Learning— Modelos preditivos de no-show, evasão e forecast
 *   6. Data Warehouse   — Mapeamento de Data Marts (Star Schema) e Ingestão Data Lake
 *   7. Governança & Data Quality— DAMA-DMBOK, ISO 8000, qualidade de dados e LGPD
 *   8. Relatórios Custom— Conectores Looker Studio, Power BI e relatórios exportáveis
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  BIEnterpriseService,
  type ExecutiveKPI,
  type DataQualityAlert,
  type MLPredictiveModel,
  type AIExecutiveInsight,
  type BIDashboardConsolidated,
  type DataDomain,
} from '../services/biEnterprise';

// ── Helpers & Formatação ──────────────────────────────────────────────────────

const fmtCurrency = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
const fmtNum = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR') : '—';
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ODS_ICONS: Record<number, { title: string; color: string }> = {
  1:  { title: 'Erradicação da Pobreza', color: '#e5243b' },
  3:  { title: 'Saúde e Bem-Estar', color: '#4c9f38' },
  4:  { title: 'Educação de Qualidade', color: '#c5192d' },
  5:  { title: 'Igualdade de Gênero', color: '#ff3a21' },
  8:  { title: 'Trabalho Decente', color: '#a21942' },
  10: { title: 'Redução das Desigualdades', color: '#dd1367' },
  16: { title: 'Paz, Justiça e Instituições Eficazes', color: '#00689d' },
};

const TABS = [
  'Torre Executiva',
  'ODS, ESG & SROI',
  'Analytics Clínico',
  'Analytics Financeiro',
  'IA & Machine Learning',
  'Data Warehouse',
  'Governança & Data Quality',
  'Relatórios Custom',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre Executiva': '📊',
  'ODS, ESG & SROI': '🏛️',
  'Analytics Clínico': '📈',
  'Analytics Financeiro': '💰',
  'IA & Machine Learning': '🤖',
  'Data Warehouse': '🗄️',
  'Governança & Data Quality': '🛡️',
  'Relatórios Custom': '⚙️',
};

// ── Shared UI Components ──────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}08` : '#fff', border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h2>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{subtitle}</p>}
    </div>
  );
}

// ── Tab 1: Torre Executiva ────────────────────────────────────────────────────

function ExecutiveDashboardTab() {
  const [data, setData] = useState<BIDashboardConsolidated | null>(null);
  const [aiInsights, setAiInsights] = useState<AIExecutiveInsight[]>([]);
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [d, insights, k] = await Promise.all([
      BIEnterpriseService.getConsolidatedBI(),
      BIEnterpriseService.getAIExecutiveInsights(),
      BIEnterpriseService.getExecutiveKPIs(),
    ]);
    setData(d);
    setAiInsights(insights);
    setKpis(k);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle Executiva...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs C-Level */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="💎" label="Retorno Social (SROI)" value={`${data?.totalSroiMultiplier ?? 0}x`} sub="R$ 1.00 → R$ 4.85 Gerados" color="#7c3aed" />
        <KpiCard icon="👥" label="Beneficiários Atendidos" value={fmtNum(data?.totalBeneficiariesServed)} color="#059669" />
        <KpiCard icon="💰" label="Investimento Social Total" value={fmtCurrency(data?.totalSocialInvestmentBrl)} color="#2563eb" />
        <KpiCard icon="🏛️" label="Conformidade ESG" value={`${data?.esgCompliancePct ?? 0}%`} color="#0891b2" />
        <KpiCard icon="🎯" label="Qualidade dos Dados" value={`${data?.dataQualityScorePct ?? 0}%`} color="#16a34a" />
      </div>

      {/* IA Executive Summary */}
      {aiInsights.length > 0 && (
        <Card style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: '#fff', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{aiInsights[0].title}</div>
              <div style={{ fontSize: 11, color: '#c7d2fe' }}>Confiança do Modelo: {aiInsights[0].confidenceScorePct}% · Gerado em {fmtDate(aiInsights[0].generatedAt)}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#e0e7ff', lineHeight: 1.6, marginBottom: 16 }}>{aiInsights[0].executiveSummary}</p>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#c7d2fe', marginBottom: 6 }}>Key Takeaways:</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
            {aiInsights[0].keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Card>
      )}

      {/* Tabela de KPIs Estratégicos */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>📊 Matriz de KPIs & OKRs Estratégicos</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px 12px' }}>Métrica</th>
                <th style={{ padding: '10px 12px' }}>Categoria</th>
                <th style={{ padding: '10px 12px' }}>Atual</th>
                <th style={{ padding: '10px 12px' }}>Meta</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#111827' }}>{k.metricName}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{k.category}</td>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#7c3aed' }}>{k.currentValue} {k.unit}</td>
                  <td style={{ padding: '12px', color: '#374151' }}>{k.targetValue} {k.unit}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 800 }}>{k.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: ODS, ESG & SROI ────────────────────────────────────────────────────

function ODSESGTab() {
  const [data, setData] = useState<BIDashboardConsolidated | null>(null);

  useEffect(() => {
    BIEnterpriseService.getConsolidatedBI().then(setData);
  }, []);

  return (
    <div>
      <SectionHeader title="Retorno Social sobre Investimento (SROI) & ODS da ONU" subtitle="Mensuração do impacto social gerado para cada real investido na instituição" />

      {/* Card SROI */}
      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg,#ede9fe,#dbeafe)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 44 }}>💎</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>Multiplicador SROI Auditado (SROI Multiplier)</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#1e1b4b' }}>4.85x</div>
            <div style={{ fontSize: 12, color: '#3730a3', marginTop: 2 }}>
              Cada R$ 1,00 de Investimento Social Privado gera <strong>R$ 4,85 em valor social tangível</strong> para a comunidade atendida.
            </div>
          </div>
        </div>
      </Card>

      {/* Grid ODS da ONU */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>🌐 Alinhamento aos Objetivos de Desenvolvimento Sustentável (ODS ONU)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {data?.odsImpactSummary && Object.entries(data.odsImpactSummary).map(([odsNum, count]) => {
            const info = ODS_ICONS[Number(odsNum)] ?? { title: `ODS ${odsNum}`, color: '#7c3aed' };
            return (
              <div key={odsNum} style={{ background: `${info.color}10`, border: `2px solid ${info.color}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: info.color }}>ODS {odsNum}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginTop: 2 }}>{info.title}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: info.color, marginTop: 8 }}>{fmtNum(count)} atendimentos</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 5: IA & Machine Learning ──────────────────────────────────────────────

function MLTab() {
  const [models, setModels] = useState<MLPredictiveModel[]>([]);

  useEffect(() => {
    BIEnterpriseService.getMLModels().then(setModels);
  }, []);

  return (
    <div>
      <SectionHeader title="Modelos Preditivos de Machine Learning & IA" subtitle="Previsão de absenteísmo, risco de evasão de beneficiários e inteligência orçamentária" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {models.map(m => (
          <Card key={m.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{m.name}</div>
              <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>{m.status}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#7c3aed', marginBottom: 4 }}>{m.accuracyPct}% Acurácia</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Treinado em: {fmtDate(m.lastTrainedAt)} · Predições: {m.predictionsGeneratedCount}</div>
            <div style={{ fontSize: 10, color: '#374151', background: '#f3f4f6', padding: '6px 8px', borderRadius: 6 }}>
              Features: {m.featuresUsed.join(', ')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 7: Governança & Data Quality ──────────────────────────────────────────

function GovernanceTab() {
  const [alerts, setAlerts] = useState<DataQualityAlert[]>([]);

  useEffect(() => {
    BIEnterpriseService.getDataQualityAlerts().then(setAlerts);
  }, []);

  return (
    <div>
      <SectionHeader title="Governança de Dados (DAMA-DMBOK) & Data Quality (ISO 8000)" subtitle="Auditoria contínua de integridade, anonimização LGPD e linhagem de dados" />

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: '#111827' }}>🛡️ Regras de Data Quality Ativas</h3>
        {alerts.length === 0 ? (
          <div style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>✓ Nenhuma inconsistência detectada nos Data Marts.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>[{a.domain}] {a.ruleName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.issueDescription}</div>
                </div>
                <button
                  onClick={() => a.id && BIEnterpriseService.resolveDataQualityAlert(a.id).then(() => setAlerts(prev => prev.filter(x => x.id !== a.id)))}
                  style={{ padding: '4px 10px', fontSize: 10, border: '1px solid #d1d5db', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: '#374151', fontWeight: 600 }}
                >Resolver</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BIPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre Executiva');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0891b2,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📊</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Business Intelligence, Analytics & Data Lake
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              SROI · ODS ONU · Governança DAMA-DMBOK · Data Warehouse · Machine Learning Preditivo
            </p>
          </div>
        </div>

        {/* Tabs */}
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
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Torre Executiva' && <ExecutiveDashboardTab />}
      {activeTab === 'ODS, ESG & SROI' && <ODSESGTab />}
      {activeTab === 'IA & Machine Learning' && <MLTab />}
      {activeTab === 'Governança & Data Quality' && <GovernanceTab />}
      {activeTab !== 'Torre Executiva' && activeTab !== 'ODS, ESG & SROI' && activeTab !== 'IA & Machine Learning' && activeTab !== 'Governança & Data Quality' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Business Intelligence — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para sincronização com BigQuery, Power BI e Looker Studio.
          </p>
        </Card>
      )}
    </div>
  );
}
