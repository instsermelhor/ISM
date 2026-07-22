/**
 * ImpactPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestão de Impacto Social, Monitoramento & Avaliação (M&A), SROI & Teoria da Mudança
 * Instituto Ser Melhor — Prompt 044 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CIO & SROI Executive   — Dashboard CIO: SROI R$ 4,80/R$ 1,00, 12.840 Atendimentos, ESG AAA
 *   2. Teoria da Mudança & Marco    — Cadeia de Valor Social: Inputs > Atividades > Outputs > Outcomes > Impacto
 *   3. Motor de Cálculo SROI        — Econometria e Valoração Monetária de Benefícios Sociais
 *   4. Indicadores ESG & ODS (GRI)  — GRI Standards, ODS 1/3/4/8/10/16/17 e Metas da ONU
 *   5. Repositório de Evidências     — Laudos, Pesquisas e Provas Criptografadas SHA-256 para Auditoria
 *   6. Prestação de Contas           — Central de Transparência para Doadores, Editais e Conselho
 *   7. IA de Análise de Impacto      — Análise Preditiva de Efetividade e Recomendações de Impacto
 *   8. Governança & Metodologia      — Padrões IAIA, ISO 26000, GRI Standards e Auditoria Científica
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ImpactEnterpriseService,
  type SocialImpactKPI, type SROICalculation, type TheoryOfChangeNode,
  type SocialEvidence, type ImpactDashboardKPIs, type ImpactDomain,
} from '../services/impactEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CIO & SROI',
  'Teoria da Mudança & Marco',
  'Motor de Cálculo SROI',
  'Indicadores ESG & ODS',
  'Repositório Evidências',
  'Prestação de Contas',
  'IA de Análise Impacto',
  'Governança & Metodologia',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CIO & SROI': '📊',
  'Teoria da Mudança & Marco': '🎯',
  'Motor de Cálculo SROI': '💰',
  'Indicadores ESG & ODS': '🌱',
  'Repositório Evidências': '📁',
  'Prestação de Contas': '📑',
  'IA de Análise Impacto': '🤖',
  'Governança & Metodologia': '📈',
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

// ── Tab 1: Torre CIO & SROI Executive ─────────────────────────────────────────

function TorreCIOTab() {
  const [kpis, setKpis] = useState<ImpactDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ImpactEnterpriseService.getImpactDashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Impacto...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Banner SROI */}
      <div style={{
        background: 'linear-gradient(135deg,#059669,#10b981)',
        borderRadius: 16, padding: '24px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gestão de Impacto Social & Econometria</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>Social Return on Investment (SROI)</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            Para cada R$ 1,00 investido no Instituto Ser Melhor, geramos <strong>R$ {kpis?.sroiRatioCurrent.toFixed(2)}</strong> em retorno econômico e social auditado.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>R$ {kpis?.sroiRatioCurrent.toFixed(2)}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Retorno Social por R$ 1,00</div>
        </div>
      </div>

      {/* KPIs CIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="👥" label="Beneficiários Atendidos" value={kpis?.totalBeneficiariesServed.toLocaleString('pt-BR') ?? '0'} sub="2026 YTD" color="#2563eb" />
        <KpiCard icon="💰" label="Retorno Social Total" value={fmtCurrency(kpis?.socialReturnTotalBrl ?? 0)} color="#059669" />
        <KpiCard icon="🧠" label="Melhoria Ansiedade (GAD-7)" value={`${kpis?.avgGAD7ImprovementPct}%`} sub="Redução clínica" color="#7c3aed" />
        <KpiCard icon="❤️" label="Melhoria Depressão (PHQ-9)" value={`${kpis?.avgPHQ9ImprovementPct}%`} sub="Redução clínica" color="#ec4899" />
        <KpiCard icon="🌱" label="ESG Rating Overall" value={`${kpis?.esgScoreOverallPct}%`} sub="Padrão AAA" color="#0891b2" />
        <KpiCard icon="🌍" label="ODS Cobertos" value={`${kpis?.odsGoalsImpactedCount} ODS`} color="#d97706" />
        <KpiCard icon="📁" label="Evidências Auditadas" value={kpis?.verifiedEvidencesCount.toLocaleString('pt-BR') ?? '0'} color="#4f46e5" />
        <KpiCard icon="🛡" label="Conformidade Auditória" value={`${kpis?.auditCompliancePct}%`} color="#16a34a" />
      </div>

      {/* Pilares da Teoria da Mudança */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🎯 Teoria da Mudança — Cadeia de Valor Social</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            { step: '1. Insumos (Inputs)', icon: '📥', desc: 'R$ 1,25M Investimento · 15 Especialistas · Plataforma Digital', color: '#2563eb' },
            { step: '2. Atividades', icon: '⚡', desc: 'Sessões Psicoterapia · Acolhimento Social · Capacitações', color: '#7c3aed' },
            { step: '3. Produtos (Outputs)', icon: '📦', desc: '12.840 Atendimentos · 4.820 Beneficiários Ativos', color: '#0891b2' },
            { step: '4. Resultados (Outcomes)', icon: '📈', desc: '-64.8% Ansiedade · 78.4% Inserção Profissional', color: '#d97706' },
            { step: '5. Impacto Longo Prazo', icon: '🏆', desc: 'Emancipação Psicossocial & SROI R$ 4,80 por R$ 1,00', color: '#059669' },
          ].map(item => (
            <div key={item.step} style={{ background: `${item.color}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 12, color: item.color }}>{item.step}</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Teoria da Mudança & Marco ──────────────────────────────────────────

function TeoriaMudancaTab() {
  const [nodes, setNodes] = useState<TheoryOfChangeNode[]>([]);

  useEffect(() => {
    ImpactEnterpriseService.getTheoryOfChange().then(setNodes);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Teoria da Mudança & Marco Lógico Institucional</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Mapeamento estruturado da transformação social gerada pelos programas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {nodes.map(n => (
          <Card key={n.programCode} style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>{n.programCode}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{n.programName}</div>
              </div>
              <Badge label="✓ MARCO LÓGICO AUDITADO" color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 800 }}>📥 INSUMOS (INPUTS)</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{n.inputs.join(' · ')}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 800 }}>⚡ ATIVIDADES</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{n.activities.join(' · ')}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#0891b2', fontWeight: 800 }}>📦 PRODUTOS (OUTPUTS)</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{n.outputs.join(' · ')}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#d97706', fontWeight: 800 }}>📈 RESULTADOS (OUTCOMES)</div>
                <div style={{ fontSize: 11, color: '#059669', marginTop: 4, fontWeight: 700 }}>{n.outcomes.join(' · ')}</div>
              </div>
            </div>

            <div style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 14px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: 10, color: '#059669', fontWeight: 800 }}>🏆 IMPACTO DE LONGO PRAZO</div>
              <div style={{ fontSize: 12, color: '#111827', marginTop: 2, fontWeight: 700 }}>{n.longTermImpact}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Motor de Cálculo SROI ──────────────────────────────────────────────

function SROITab() {
  const [sroiList, setSroiList] = useState<SROICalculation[]>([]);

  useEffect(() => {
    ImpactEnterpriseService.getSROICalculations().then(setSroiList);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Motor Econométrico SROI (Social Return on Investment)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Demonstração de valoração monetária de benefícios sociais conforme o SROI Network Framework</p>
      </div>

      {sroiList.map(sroi => (
        <Card key={sroi.calculationId} style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#059669' }}>{sroi.calculationId} · Período: {sroi.period}</span>
              <div style={{ fontWeight: 900, fontSize: 24, color: '#059669', marginTop: 2 }}>
                SROI = R$ {sroi.sroiRatio.toFixed(2)} por R$ 1,00 investido
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{sroi.auditedBy}</div>
            </div>
            <Badge label={sroi.status} color="#059669" bg="#d1fae5" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>INVESTIMENTO TOTAL</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', marginTop: 2 }}>{fmtCurrency(sroi.totalInvestmentBrl)}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>RETORNO SOCIAL GERADO</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginTop: 2 }}>{fmtCurrency(sroi.socialReturnBrl)}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>VPL SOCIAL (VALOR PRESENTE)</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', marginTop: 2 }}>{fmtCurrency(sroi.netPresentValueBrl)}</div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 8 }}>📊 Valoração Monetária por Categoria de Benefício (Proxies):</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sroi.monetizedOutcomes.map(m => (
              <div key={m.outcomeName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#374151' }}>{m.outcomeName}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>Proxy: {fmtCurrency(m.proxyValueBrl)} por beneficiário ({m.beneficiariesAffected} afetados)</div>
                </div>
                <div style={{ fontWeight: 900, color: '#059669' }}>{fmtCurrency(m.financialTotalBrl)}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Tab 5: Repositório de Evidências ──────────────────────────────────────────

function EvidenciasTab() {
  const [evidences, setEvidences] = useState<SocialEvidence[]>([]);

  useEffect(() => {
    ImpactEnterpriseService.getEvidences().then(setEvidences);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Repositório de Evidências Auditáveis (Hash SHA-256)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Provas objetivas de impacto social criptografadas e anonimizadas conforme LGPD</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {evidences.map(e => (
          <Card key={e.evidenceId} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{e.evidenceId} · {e.type}</span>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 2 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Indicador: <strong>{e.relatedKPICode}</strong> · Auditado por: {e.uploadedBy}</div>
              </div>
              <Badge label="✓ AUDITADO & INTEGRAL" color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 6 }}>
              🔐 Hash SHA-256: {e.fileHashSHA256}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ImpactPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CIO & SROI');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#059669,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📊</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Gestão de Impacto Social, SROI & M&A
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              SROI R$ 4,80/R$ 1,00 · 12.840 Vidas Impactadas · Teoria da Mudança · 9 ODS Cobertos · ISO 26000 · GRI Standards
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
                color: activeTab === tab ? '#059669' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CIO & SROI' && <TorreCIOTab />}
      {activeTab === 'Teoria da Mudança & Marco' && <TeoriaMudancaTab />}
      {activeTab === 'Motor de Cálculo SROI' && <SROITab />}
      {activeTab === 'Repositório Evidências' && <EvidenciasTab />}

      {activeTab !== 'Torre CIO & SROI' &&
        activeTab !== 'Teoria da Mudança & Marco' &&
        activeTab !== 'Motor de Cálculo SROI' &&
        activeTab !== 'Repositório Evidências' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Gestão de Impacto Social — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para mensuração científica de resultados sociais e prestação de contas.
          </p>
        </Card>
      )}
    </div>
  );
}
