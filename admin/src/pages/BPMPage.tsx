/**
 * BPMPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Business Process Management (BPM), BPMN 2.0, DMN, CMMN, Process Mining & Hyperautomation
 * Instituto Ser Melhor — Prompt 042 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CPO & Performance  — Dashboard CPO: Automação 82.4%, SLA Compliance 96.8%, Redução de Ciclo
 *   2. Catálogo BPMN 2.0        — 48 Processos Corporativos Modelados em BPMN 2.0 por Categoria
 *   3. Motor de Decisão (DMN)   — Regras de Negócio e Tabelas de Decisão DMN 1.3 Auditáveis
 *   4. Gestão de Casos (CMMN)   — Casos Complexos Dinâmicos (Violência Doméstica, Saúde Mental)
 *   5. Workflows em Execução    — Instâncias Ativas, Tarefas Pendentes, SLA Tracking
 *   6. Process & Task Mining    — Análise de Conformidade, Desvios, Gargalos e Lean Six Sigma
 *   7. Hyperautomation & RPA    — Bots RPA, Agentes de IA e Gatilhos de Eventos Integrados
 *   8. Governança & Kaizen      — Process Owners, Revisões ISO 9001, Audit Trail e PDCA
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  BPMEnterpriseService,
  type BPMNProcess, type ProcessInstance, type DMNDecisionRule,
  type CMMNCaseModel, type ProcessMiningMetrics, type HyperautomationBot,
  type BPMDashboardKPIs, type ProcessCategory,
} from '../services/bpmEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CPO & Performance',
  'Catálogo BPMN 2.0',
  'Motor de Decisão (DMN)',
  'Gestão de Casos (CMMN)',
  'Workflows em Execução',
  'Process & Task Mining',
  'Hyperautomation & RPA',
  'Governança & Kaizen',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CPO & Performance': '📊',
  'Catálogo BPMN 2.0': '🗺️',
  'Motor de Decisão (DMN)': '⚖️',
  'Gestão de Casos (CMMN)': '💼',
  'Workflows em Execução': '⚡',
  'Process & Task Mining': '🔍',
  'Hyperautomation & RPA': '🤖',
  'Governança & Kaizen': '📈',
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

const CATEGORY_COLORS: Record<ProcessCategory, { color: string; bg: string; icon: string }> = {
  ASSISTENCIAL:       { color: '#2563eb', bg: '#dbeafe', icon: '👥' },
  FINANCEIRO:         { color: '#059669', bg: '#d1fae5', icon: '💰' },
  RH_PESSOAS:         { color: '#d97706', bg: '#fef3c7', icon: '👤' },
  JURIDICO:           { color: '#dc2626', bg: '#fee2e2', icon: '⚖️' },
  COMPRAS_SUPRIMENTOS:{ color: '#4f46e5', bg: '#ede9fe', icon: '🛒' },
  TELEMEDICINA:       { color: '#0891b2', bg: '#cffafe', icon: '📹' },
  CAPTACAO_RECURSOS:  { color: '#16a34a', bg: '#dcfce7', icon: '❤️' },
  COMUNICACAO:        { color: '#ec4899', bg: '#fce7f3', icon: '💬' },
  GOVERNANCA:         { color: '#7c3aed', bg: '#f3e8ff', icon: '🏛️' },
  ESTRATEGICO:        { color: '#1e3a5f', bg: '#e2e8f0', icon: '🎯' },
  TI_OPERAGOES:       { color: '#374151', bg: '#f3f4f6', icon: '⚡' },
};

// ── Tab 1: Torre CPO & Performance ────────────────────────────────────────────

function TorreCPOTab() {
  const [kpis, setKpis] = useState<BPMDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BPMEnterpriseService.getBPMDashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CPO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gestão de Processos Organizacionais (BPM)</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Excelência Operacional & Hyperautomation</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.totalProcessesCataloged} processos catalogados · BPMN 2.0 · DMN 1.3 · CMMN 1.1 · ISO 9001
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.globalAutomationRatePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Automação Global de Fluxos</div>
        </div>
      </div>

      {/* KPIs CPO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🗺️" label="Processos Mapeados" value={String(kpis?.totalProcessesCataloged ?? 0)} sub="100% BPMN 2.0" color="#7c3aed" />
        <KpiCard icon="⚡" label="SLA Compliance" value={`${kpis?.slaComplianceRatePct}%`} color="#059669" />
        <KpiCard icon="⏱" label="Redução de Ciclo" value={`-${kpis?.avgCycleTimeReductionPct}%`} sub="Tempo médio total" color="#2563eb" />
        <KpiCard icon="🔄" label="Workflows Ativos" value={String(kpis?.activeInstancesCount ?? 0)} color="#0891b2" />
        <KpiCard icon="⚠️" label="SLAs Expirados" value={String(kpis?.instancesBreachedSLA ?? 0)} alert={(kpis?.instancesBreachedSLA ?? 0) > 0} color="#dc2626" />
        <KpiCard icon="💼" label="Casos CMMN Ativos" value={String(kpis?.activeCasesCMMN ?? 0)} color="#d97706" />
        <KpiCard icon="🤖" label="Horas Economizadas RPA" value={`${kpis?.rpaHoursSavedMonthly}h/mês`} color="#16a34a" />
        <KpiCard icon="🎯" label="Conformidade Processual" value={`${kpis?.conformanceAvgPct}%`} sub="Process Mining" color="#4f46e5" />
      </div>

      {/* Arquitetura BPM Enterprise */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>⚙️ Arquitetura de Processos Corporativos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { title: 'Motor BPMN 2.0 & Workflow', icon: '🗺️', desc: 'Execução de processos estruturados com gatilhos de eventos, subprocessos e timers de SLA.' },
            { title: 'Motor de Decisão DMN 1.3', icon: '⚖️', desc: 'Regras de negócio desacopladas para elegibilidade, priorização assistencial e aprovações.' },
            { title: 'Gestão de Casos CMMN 1.1', icon: '💼', desc: 'Orquestração de casos não-estruturados e dinâmicos (violência doméstica, saúde mental).' },
            { title: 'Process & Task Mining', icon: '🔍', desc: 'Análise contínua de desvios, tempo de espera passivo e gargalos operacionais.' },
            { title: 'Hyperautomation & RPA', icon: '🤖', desc: 'Automação robótica de tarefas repetitivas integradas aos agentes inteligentes de IA.' },
            { title: 'Governança & Kaizen ISO 9001', icon: '📈', desc: 'Matriz de Process Owners, revisões de qualidade, audit trail e ciclo PDCA contínuo.' },
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

// ── Tab 2: Catálogo BPMN 2.0 ──────────────────────────────────────────────────

function BPMNCatalogTab() {
  const [processes, setProcesses] = useState<BPMNProcess[]>([]);

  useEffect(() => {
    BPMEnterpriseService.getProcesses().then(setProcesses);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo de Processos (BPMN 2.0)</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Processos mapeados, versionados e auditáveis em toda a plataforma</p>
        </div>
        <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '4px 12px', borderRadius: 12, fontWeight: 800 }}>● 100% AUDITADO ISO 9001</span>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px 14px' }}>Código & Processo</th>
                <th style={{ padding: '10px 14px' }}>Categoria</th>
                <th style={{ padding: '10px 14px' }}>Process Owner</th>
                <th style={{ padding: '10px 14px' }}>SLA Alvo</th>
                <th style={{ padding: '10px 14px' }}>Automação</th>
                <th style={{ padding: '10px 14px' }}>Execuções/Mês</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => {
                const cc = CATEGORY_COLORS[p.category] ?? { color: '#6b7280', bg: '#f3f4f6', icon: '📋' };
                return (
                  <tr key={p.processCode} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{p.processCode} · {p.version}</div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginTop: 2 }}>{p.name}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge label={`${cc.icon} ${p.category}`} color={cc.color} bg={cc.bg} />
                    </td>
                    <td style={{ padding: '12px 14px', color: '#374151', fontSize: 11 }}>{p.processOwner}</td>
                    <td style={{ padding: '12px 14px', color: '#7c3aed', fontWeight: 700 }}>{p.slaTargetHours}h</td>
                    <td style={{ padding: '12px 14px', width: 130 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', marginBottom: 2 }}>{p.automationRatePct}%</div>
                      <ProgressBar pct={p.automationRatePct} color="#059669" />
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7280' }}>{p.monthlyExecutions.toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge label={p.status} color="#059669" bg="#d1fae5" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 3: Motor de Decisão (DMN) ─────────────────────────────────────────────

function DMNRulesTab() {
  const [rules, setRules] = useState<DMNDecisionRule[]>([]);

  useEffect(() => {
    BPMEnterpriseService.getDMNRules().then(setRules);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Motor de Decisão Corporativo (DMN 1.3)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Regras de negócio desacopladas, versionadas e executadas de forma automatizada</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rules.map(r => (
          <Card key={r.ruleCode} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{r.ruleCode} · {r.version}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{r.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge label={r.category} color="#7c3aed" bg="#ede9fe" />
                <Badge label={`Policy: ${r.hitPolicy}`} color="#2563eb" bg="#dbeafe" />
                {r.isAutomated && <Badge label="✓ 100% AUTOMÁTICO" color="#059669" bg="#d1fae5" />}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginTop: 10 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>ENTRADAS (INPUTS)</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 2, fontWeight: 600 }}>{r.inputs.join(' · ')}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>SAÍDAS (OUTPUTS)</div>
                <div style={{ fontSize: 11, color: '#059669', marginTop: 2, fontWeight: 700 }}>{r.outputs.join(' · ')}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Gestão de Casos (CMMN) ─────────────────────────────────────────────

function CMMNCasesTab() {
  const [cases, setCases] = useState<CMMNCaseModel[]>([]);

  useEffect(() => {
    BPMEnterpriseService.getCMMNCases().then(setCases);
  }, []);

  const riskColor = { LOW: '#059669', MEDIUM: '#d97706', HIGH: '#dc2626', CRITICAL: '#7f1d1d' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de Casos Complexos (CMMN 1.1)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Orquestração de casos não-estruturados, dinâmicos e adaptativos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cases.map(c => (
          <Card key={c.caseId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{c.caseId} · {c.caseType}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Beneficiário: {c.beneficiaryId} · Aberto em: {fmtDateTime(c.openedAt)}</div>
              </div>
              <Badge label={`Risco: ${c.riskLevel}`} color={riskColor[c.riskLevel]} bg={`${riskColor[c.riskLevel]}18`} />
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, marginBottom: 4 }}>TAREFAS DISCRICIONÁRIAS ATIVAS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.activeDiscretionaryTasks.map(t => (
                  <span key={t} style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 10, padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    ⚙️ {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, marginBottom: 4 }}>MARCOS ALCANÇADOS (MILESTONES)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.milestonesReached.map(m => (
                  <span key={m} style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 7: Hyperautomation & RPA ──────────────────────────────────────────────

function HyperautomationTab() {
  const [bots, setBots] = useState<HyperautomationBot[]>([]);

  useEffect(() => {
    BPMEnterpriseService.getHyperautomationBots().then(setBots);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Hyperautomation, RPA & Agentes Autônomos de Fluxo</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Automação robótica de tarefas repetitivas integradas aos 15 agentes de IA</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {bots.map(b => (
          <Card key={b.botId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{b.botId}</span>
              <Badge label={b.status} color="#059669" bg="#d1fae5" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 4 }}>{b.name}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Processo Alvo: <strong>{b.targetProcessCode}</strong></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
              <div>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>TAXA SUCESSO</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>{b.successRatePct}%</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>HORAS ECONOMIZADAS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7c3aed' }}>{b.hoursSavedMonthly}h/mês</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BPMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CPO & Performance');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>⚙️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Business Process Management (BPM) & Hyperautomation
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              48 Processos BPMN 2.0 · Motor DMN 1.3 · Gestão CMMN 1.1 · Process Mining · ISO 9001 · Lean Six Sigma
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
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CPO & Performance' && <TorreCPOTab />}
      {activeTab === 'Catálogo BPMN 2.0' && <BPMNCatalogTab />}
      {activeTab === 'Motor de Decisão (DMN)' && <DMNRulesTab />}
      {activeTab === 'Gestão de Casos (CMMN)' && <CMMNCasesTab />}
      {activeTab === 'Hyperautomation & RPA' && <HyperautomationTab />}

      {activeTab !== 'Torre CPO & Performance' &&
        activeTab !== 'Catálogo BPMN 2.0' &&
        activeTab !== 'Motor de Decisão (DMN)' &&
        activeTab !== 'Gestão de Casos (CMMN)' &&
        activeTab !== 'Hyperautomation & RPA' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>BPM Enterprise — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para orquestração de fluxos de trabalho e automação inteligente.
          </p>
        </Card>
      )}
    </div>
  );
}
