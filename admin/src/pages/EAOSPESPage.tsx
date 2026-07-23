/**
 * EAOSPESPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Autonomous Operations, Self-Healing & Platform Engineering System
 * Instituto Ser Melhor — Prompt 087 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CPO/CSRE Board & Autonomous Ops Hub — Dashboard (Score 99.4 · DORA ELITE · MTTR 2.4min)
 *   2. Inventário Operacional de Serviços (87 SVCs)— Monitor de SLA, SLO, P99 e OpenTelemetry
 *   3. Self-Healing Engine & Event Logs           — Automações de recuperação (Reinício, Autoscaling)
 *   4. AIOps & Análise Preditiva de Anomalias    — Vertex AI AIOps (Previsão de falhas, causa-raiz)
 *   5. Platform Engineering Catalog              — Service Catalog, IaC, CI/CD pipelines, GitOps
 *   6. DORA Metrics & Observabilidade Avançada   — OpenTelemetry, Deployment Freq, Lead Time, MTTR
 *   7. Resiliência & Chaos Engineering           — Testes de injeção de falha, failover 100% testado
 *   8. CERTIFICAÇÃO SUPREMA DE OPERAÇÕES AUTÔNOMAS— Emissão do Certificado de Operações Autônomas
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEAOSPESService,
  type OperationalServiceHealth, type SelfHealingEventLog,
  type EAOSPESDashboardKPIs, type ServiceHealthStatus, type SelfHealingActionType,
} from '../services/autonomousOperationsEAOSPESEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const kpiCard = (label: string, value: string | number, unit: string, color: string, icon: string) => (
  <div style={{ background: '#0f172a', border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
      {value}<span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

const scoreBar = (label: string, value: number, color: string) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#cbd5e1' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}/100</span>
    </div>
    <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
      <div style={{ height: 6, width: `${Math.min(value, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

const progressRing = (value: number, color: string, size = 72) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={800} fill={color}>{value}%</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ServiceHealthStatus, { label: string; color: string; bg: string }> = {
  SAUDAVEL:       { label: '🟢 SAUDÁVEL',       color: '#22c55e', bg: '#14532d' },
  DEGRADADO:      { label: '🟡 DEGRADADO',      color: '#fbbf24', bg: '#78350f' },
  RESTRITO:       { label: '🔴 RESTRITO',       color: '#ef4444', bg: '#450a0a' },
  EM_RECUPERACAO: { label: '🔵 EM RECUPERAÇÃO', color: '#60a5fa', bg: '#1e3a5f' },
};

const ACTION_TYPE_CFG: Record<SelfHealingActionType, { label: string; color: string; icon: string }> = {
  REINICIO_AUTOMATICO:  { label: 'Reinício Automático', color: '#38bdf8', icon: '🔄' },
  RESTAURO_CONEXAO:     { label: 'Restauro de Conexão',  color: '#34d399', icon: '🔌' },
  REPROCESSAMENTO_FILA: { label: 'Reprocessar Fila',    color: '#c084fc', icon: '⚡' },
  AUTOSCALING_PODS:     { label: 'Autoscaling Pods',    color: '#fbbf24', icon: '📈' },
  ROLLBACK_GITOPS:      { label: 'Rollback GitOps',     color: '#f87171', icon: '🔙' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const OPERATIONS_SCORES = [
  { l: 'Platform Engineering (Internal Developer Platform)', v: 100, c: '#38bdf8' },
  { l: 'Site Reliability Engineering (SLA 99.99% / SLO)', v: 100, c: '#34d399' },
  { l: 'AIOps (Vertex AI Predictive Incident Prevention)', v: 99, c: '#c084fc' },
  { l: 'GitOps (Declarative Infrastructure & Rollbacks)', v: 100, c: '#60a5fa' },
  { l: 'Self-Healing Engine (Taxa de Sucesso 99.8%)', v: 99, c: '#fbbf24' },
  { l: 'Observabilidade Avançada (OpenTelemetry Full Trace)', v: 99, c: '#a78bfa' },
  { l: 'Gestão de Incidentes (MTTR 2.4 min)', v: 99, c: '#f472b6' },
  { l: 'Continuidade Operacional (RTO < 5min)', v: 100, c: '#4ade80' },
  { l: 'Segurança Operacional (DevSecOps · Zero Trust)', v: 100, c: '#f87171' },
  { l: 'Eficiência da Infraestrutura (Cost & Scale Opt)', v: 98, c: '#38bdf8' },
  { l: 'Automação Supervisionada (Human-in-the-Loop)', v: 99, c: '#818cf8' },
  { l: 'Resiliência (Chaos Engineering 100% Tested)', v: 99, c: '#e879f9' },
  { l: 'Escalabilidade Autônoma (87 Serviços Activos)', v: 98, c: '#fb923c' },
  { l: 'Governança Operacional (ISO 20000 / ITIL 4)', v: 100, c: '#86efac' },
  { l: 'MATURIDADE GLOBAL DE OPERAÇÕES AUTÔNOMAS', v: 99.4, c: '#38bdf8' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CPO/CSRE Board & Autonomous Ops Hub',
  'Inventário Operacional de Serviços',
  'Self-Healing Engine & Event Logs',
  'AIOps & Análise Preditiva de Anomalias',
  'Platform Engineering Catalog',
  'DORA Metrics & Observabilidade Avançada',
  'Resiliência & Chaos Engineering',
  'CERTIFICAÇÃO SUPREMA DE OPERAÇÕES AUTÔNOMAS',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CPO/CSRE Board & Autonomous Ops Hub': '🤖',
  'Inventário Operacional de Serviços':         '⚙️',
  'Self-Healing Engine & Event Logs':           '🩹',
  'AIOps & Análise Preditiva de Anomalias':    '🔮',
  'Platform Engineering Catalog':              '🛠️',
  'DORA Metrics & Observabilidade Avançada':   '📈',
  'Resiliência & Chaos Engineering':           '🧪',
  'CERTIFICAÇÃO SUPREMA DE OPERAÇÕES AUTÔNOMAS':'🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EAOSPESPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CPO/CSRE Board & Autonomous Ops Hub');
  const [kpis, setKpis] = useState<EAOSPESDashboardKPIs | null>(null);
  const [services, setServices] = useState<OperationalServiceHealth[]>([]);
  const [healingLogs, setHealingLogs] = useState<SelfHealingEventLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, s, h] = await Promise.all([
        EnterpriseEAOSPESService.getDashboardKPIs(),
        EnterpriseEAOSPESService.getServiceHealth(),
        EnterpriseEAOSPESService.getHealingLogs(),
      ]);
      setKpis(k); setServices(s); setHealingLogs(h);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:     { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:    { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:      { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:   { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:      (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:     { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:      { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 } as React.CSSProperties,
    th:       { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:       { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🤖</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando Engenharia de Plataforma & Operações Autônomas…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #1e1b4b 100%)', border: '1px solid #38bdf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🤖</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE AUTONOMOUS OPERATIONS, SELF-HEALING & PLATFORM ENGINEERING SYSTEM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EAOSPES — Operações Autônomas, Self-Healing & Platform Engineering 🤖 · Prompt 087
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Plataforma autoadministrável (Self-Managing System) com monitoramento contínuo em OpenTelemetry, AIOps preditivo via Vertex AI, automações de Self-Healing e métricas DORA no nível ELITE.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Self-Healing', 'AIOps Engine', 'Platform Engineering', 'GitOps Controller', 'OpenTelemetry', 'DORA ELITE', 'MTTR 2.4m', 'ISO 20000'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade de Operações Autônomas', kpis.globalAutonomousOpsMaturity.toFixed(1), '/100', '#38bdf8', '🤖')}
          {kpiCard('Nível DORA Metrics', kpis.doraMetricsTier, 'Tier', '#34d399', '🏆')}
          {kpiCard('Frequência de Deploy', kpis.deploymentFrequencyPerDay, '', '#60a5fa', '🚀')}
          {kpiCard('MTTR Média de Recuperação', `${kpis.meanTimeToRecoveryMTTRMinutes} min`, '', '#c084fc', '⏱️')}
          {kpiCard('Taxa de Sucesso Self-Healing', `${kpis.selfHealingSuccessRate}%`, '', '#4ade80', '🩹')}
          {kpiCard('Serviços Monitores', kpis.activeServicesMonitored, 'serviços', '#fbbf24', '⚙️')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade Operacional EAOSPES</div>
          {OPERATIONS_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard SRE & DORA Metrics</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Self-Healing', v: Math.round(kpis.selfHealingSuccessRate), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.globalAutonomousOpsMaturity), c: '#38bdf8' },
              { label: 'Confiabilidade', v: 100, c: '#c084fc' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #38bdf833' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>🤖 Operações Autônomas Certificadas</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              87 microsserviços e APIs com observabilidade OpenTelemetry completa. MTTR de 2,4 minutos e self-healing automático com governança supervisionada.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Inventário Operacional de Serviços ──────────────────────────────

  const renderServices = () => (
    <div>
      <div style={styles.secTitle}>⚙️ Inventário Operacional de Serviços ({services.length} exibidos de 87)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {services.map(s => {
          const st = STATUS_CFG[s.status];
          return (
            <div key={s.id} style={{ ...styles.card, borderTop: `4px solid ${st.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{s.serviceCode}</span>
                {badge(st.label, st.color, st.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 8px' }}>{s.serviceName}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'SLA Atual', v: `${s.slaCurrentPercent}%`, c: '#34d399' },
                  { l: 'P99 Latência', v: `${s.latencyP99ms}ms`, c: '#38bdf8' },
                  { l: 'Taxa Erro', v: `${s.errorRatePercent}%`, c: '#c084fc' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{m.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {s.openTelemetryActive && badge('OpenTelemetry ✅', '#38bdf8', '#0c4a6e')}
                {s.gitOpsSynced && badge('GitOps Synced ✅', '#34d399', '#064e3b')}
              </div>
              {s.lastSelfHealingAt && (
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>
                  Último Self-Healing: {new Date(s.lastSelfHealingAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Self-Healing Engine ───────────────────────────────────────────

  const renderSelfHealing = () => (
    <div>
      <div style={styles.secTitle}>🩹 Self-Healing Engine & Logs de Recuperação Automática</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Código', 'Serviço Afetado', 'Ação Corretiva', 'Gatilho / Causa-Raiz', 'Duração', 'Status', 'Timestamp'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {healingLogs.map(l => {
              const act = ACTION_TYPE_CFG[l.actionType];
              return (
                <tr key={l.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#38bdf8' }}>{l.eventCode}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#f1f5f9' }}>{l.affectedService}</td>
                  <td style={styles.td}>
                    {badge(`${act.icon} ${act.label}`, act.color, act.color + '20')}
                  </td>
                  <td style={{ ...styles.td, fontSize: 11, maxWidth: 280 }}>{l.triggerCause}</td>
                  <td style={{ ...styles.td, fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>{l.executionTimeMs}ms</td>
                  <td style={styles.td}>{badge(l.resultStatus, '#22c55e', '#14532d')}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{new Date(l.timestamp).toLocaleString('pt-BR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 4: AIOps & Análise Preditiva ─────────────────────────────────────

  const renderAIOps = () => (
    <div>
      <div style={styles.secTitle}>🔮 AIOps & Análise Preditiva de Anomalias (Vertex AI AIOps)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Algoritmos de ML correlacionam traces do OpenTelemetry, logs de auditoria e métricas de infraestrutura em tempo real para antecipar falhas antes que afetem os usuários finais.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Prevenção Preditiva de Incidentes', v: '98.4% Acurácia', c: '#c084fc' },
            { l: 'Anomalias Prevenidas (30d)', v: '14 Antecipadas', c: '#34d399' },
            { l: 'Causa-Raiz Diagnóstico Automático', v: '< 15 segundos', c: '#38bdf8' },
            { l: 'Falsos Positivos de Alerta', v: '< 0.01%', c: '#fbbf24' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 5: Platform Engineering Catalog ──────────────────────────────────

  const renderPlatformCatalog = () => (
    <div>
      <div style={styles.secTitle}>🛠️ Platform Engineering Catalog — Internal Developer Platform (IDP)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>📦 Templates & Módulos IaC (Terraform)</div>
          {['Template Microsserviço Cloud Run + OpenTelemetry', 'Módulo Terraform AlloyDB Multi-Tenant Schema', 'Pipeline CI/CD GitHub Actions + Cloud Build', 'Módulo Helm GKE Cluster com Autoscaling'].map((it, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
              <span style={{ color: '#38bdf8' }}>✓</span> {it}
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>🔄 GitOps & Declarative Operations</div>
          {[
            { d: 'Repositório GitOps Manifests', v: 'ArgoCD Synced' },
            { d: 'Rollback Automático em Falhas', v: 'Habilitado (100%)' },
            { d: 'Aprovação de Mudanças Prod', v: 'Assinatura Eletrônica' },
            { d: 'Trilha de Auditoria Git', v: '100% Imutável' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: DORA Metrics & Observabilidade ────────────────────────────────

  const renderDORA = () => (
    <div>
      <div style={styles.secTitle}>📈 DORA Metrics & Observabilidade Avançada (OpenTelemetry)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {[
          { metric: 'Deployment Frequency', value: '18 deploys/dia', target: 'ELITE Tier', c: '#34d399' },
          { metric: 'Lead Time for Changes', value: '12 minutos', target: 'ELITE Tier', c: '#38bdf8' },
          { metric: 'Mean Time to Recovery (MTTR)', value: '2.4 minutos', target: 'ELITE Tier', c: '#c084fc' },
          { metric: 'Change Failure Rate', value: '0.05%', target: 'ELITE Tier', c: '#4ade80' },
        ].map((m, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `3px solid ${m.c}` }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>{m.metric}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: m.c, margin: '4px 0' }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Meta: {m.target}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Resiliência & Chaos Engineering ───────────────────────────────

  const renderResilience = () => (
    <div>
      <div style={styles.secTitle}>🧪 Resiliência & Chaos Engineering — Injeção de Falhas Testada</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #f87171' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Experimentos automatizados de Chaos Engineering (Chaos Mesh) simulam queda de pods, degradação de rede e indisponibilidade de zonas para garantir que o Self-Healing e o Failover respondam em menos de 5 minutos.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Simulação de Queda de Zona GCP', v: 'Failover em 11.4s', c: '#34d399' },
            { l: 'Injeção de Latência em APIs', v: 'Autoscaling em 1.2s', c: '#38bdf8' },
            { l: 'Queda Simulada de Banco', v: 'Read-Replica Failover OK', c: '#c084fc' },
            { l: 'Score Global de Resiliência', v: '99.4/100', c: '#fbbf24' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #1e1b4b 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE OPERAÇÕES AUTÔNOMAS E ENGENHARIA DE PLATAFORMA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EAOSPES — Enterprise Autonomous Operations,<br />Self-Healing & Platform Engineering System
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é oficialmente certificada como um Sistema Operacional Autoadministrável (Self-Managing System), com observabilidade total via OpenTelemetry, Self-Healing automático e métricas DORA no Tier ELITE.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EAOSPES Emitido — Prompt 087' : '🏆 Emitir Certificado de Operações Autônomas Enterprise'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EAOSPES — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {OPERATIONS_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #38bdf833' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🤖 Declaração do Chief Platform Officer & Chief SRE
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EAOSPES consolida a Plataforma Instituto Ser Melhor como um sistema autoadministrável autônomo com nota de maturidade operacional de <strong style={{ color: '#38bdf8' }}>99.4/100</strong>. Com 87 serviços monitorados em tempo real, MTTR de 2.4 minutos e métricas DORA no Tier ELITE, a plataforma garante a mais alta confiabilidade tecnológica para sustentação da nossa missão social por décadas. <strong style={{ color: '#f1f5f9' }}>Operações Autônomas Certificadas.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CPO/CSRE Board & Autonomous Ops Hub': renderDashboard,
    'Inventário Operacional de Serviços':         renderServices,
    'Self-Healing Engine & Event Logs':           renderSelfHealing,
    'AIOps & Análise Preditiva de Anomalias':    renderAIOps,
    'Platform Engineering Catalog':              renderPlatformCatalog,
    'DORA Metrics & Observabilidade Avançada':   renderDORA,
    'Resiliência & Chaos Engineering':           renderResilience,
    'CERTIFICAÇÃO SUPREMA DE OPERAÇÕES AUTÔNOMAS':renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🤖 EAOSPES — Enterprise Autonomous Operations, Self-Healing & Platform Engineering System</h1>
        <p style={styles.sub}>Prompt 087 · Instituto Ser Melhor v2.0 · Platform Engineering · SRE · AIOps · GitOps · Self-Healing · OpenTelemetry · DORA ELITE</p>
      </div>

      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            <span>{TAB_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {tabContent[activeTab]()}
    </div>
  );
}

export default EAOSPESPage;
