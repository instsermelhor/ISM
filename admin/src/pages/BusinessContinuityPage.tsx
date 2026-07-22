/**
 * BusinessContinuityPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Resiliência Organizacional, Continuidade de Negócios (BCM) & Disaster Recovery (DR)
 * Instituto Ser Melhor — Prompt 053 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CRO & BCM Hub        — Dashboard: Uptime 99.98%, RTO médio 15m, RPO 5m, ISO 22301 99.1%
 *   2. BIA & Serviços Críticos     — Business Impact Analysis: Tier 0..3, RTO, RPO, MTPD e Donos
 *   3. Disaster Recovery (DRP)     — Failover Automático, Replicação Multi-Região, Testes e Runbooks
 *   4. Gestão de Incidentes SRE   — Incidentes SEV 1..4, MTTR, MTBF, Error Budget e Lições Aprendidas
 *   5. Gestão de Crises            — Playbooks de Resposta a Ciberataque, Indisponibilidade e Crise Clínica
 *   6. Backup Imutável & Retenção  — Cobertura 100%, Criptografia, Snapshots e Testes de Restauração
 *   7. Chaos Engineering           — Testes Controlados de Injeção de Falhas e Simulações BCP
 *   8. Governança ISO 22301        — Conformidade ISO 22301, NIST SP 800-34 e SRE Observabilidade
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  BusinessContinuityEnterpriseService,
  type BCMCriticalService, type DisasterRecoveryPlan, type ResilienceIncident,
  type CrisisManagementPlan, type SREObservabilityMetric, type CRODashboardKPIs,
  type CriticalityLevel, type DisasterRecoveryStrategy, type IncidentSeverity,
} from '../services/businessContinuityEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CRO & BCM Hub',
  'BIA & Serviços Críticos',
  'Disaster Recovery (DRP)',
  'Gestão de Incidentes SRE',
  'Gestão de Crises',
  'Backup & Imutabilidade',
  'Chaos Engineering',
  'Governança ISO 22301',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CRO & BCM Hub': '🛡️',
  'BIA & Serviços Críticos': '📋',
  'Disaster Recovery (DRP)': '🔄',
  'Gestão de Incidentes SRE': '🚨',
  'Gestão de Crises': '🌋',
  'Backup & Imutabilidade': '💾',
  'Chaos Engineering': '🧪',
  'Governança ISO 22301': '🏛️',
};

const CRITICALITY_CONFIG: Record<CriticalityLevel, { label: string; color: string; bg: string }> = {
  TIER_0_MISSION_CRITICAL: { label: '🔴 TIER 0 — MISSÃO CRÍTICA', color: '#dc2626', bg: '#fee2e2' },
  TIER_1_HIGH:             { label: '🟠 TIER 1 — ALTO IMPACTO', color: '#ea580c', bg: '#ffedd5' },
  TIER_2_MEDIUM:           { label: '🟡 TIER 2 — MÉDIO IMPACTO', color: '#d97706', bg: '#fef3c7' },
  TIER_3_LOW:              { label: '🟢 TIER 3 — BAIXO IMPACTO', color: '#059669', bg: '#d1fae5' },
};

const DR_STRATEGY_CONFIG: Record<DisasterRecoveryStrategy, { label: string; color: string }> = {
  HOT_SITE_ACTIVE_ACTIVE:   { label: '🔥 HOT SITE (Active-Active)', color: '#059669' },
  WARM_SITE_ACTIVE_PASSIVE: { label: '♨️ WARM SITE (Active-Passive)', color: '#2563eb' },
  COLD_SITE_BACKUP_RESTORE: { label: '❄️ COLD SITE (Restore)', color: '#6b7280' },
  CLOUD_MULTI_REGION:       { label: '☁️ CLOUD MULTI-REGION', color: '#7c3aed' },
};

const INCIDENT_SEV_CONFIG: Record<IncidentSeverity, { label: string; color: string; bg: string }> = {
  SEV_1_CRITICAL: { label: 'SEV 1 — CRÍTICO', color: '#dc2626', bg: '#fee2e2' },
  SEV_2_HIGH:     { label: 'SEV 2 — ALTO', color: '#ea580c', bg: '#ffedd5' },
  SEV_3_MEDIUM:   { label: 'SEV 3 — MÉDIO', color: '#d97706', bg: '#fef3c7' },
  SEV_4_LOW:      { label: 'SEV 4 — BAIXO', color: '#2563eb', bg: '#dbeafe' },
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

// ── Tab 1: Torre CRO & BCM Hub ────────────────────────────────────────────────

function TorreCROTab() {
  const [kpis, setKpis] = useState<CRODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BusinessContinuityEnterpriseService.getCRODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando BCM & Disaster Recovery Platform...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#166534,#059669)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Operational Resilience Platform · ISO 22301 · ISO 27031 · NIST SP 800-34 · SRE
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Resiliência Organizacional & Continuidade de Negócios (BCM)
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalCriticalServices} serviços mapeados (BIA) · {kpis?.tier0MissionCriticalCount} Missão Crítica (Tier 0) ·
            Uptime 30d: {kpis?.overallUptimePct}% · Backups 100% Imutáveis
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.iso22301CompliancePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Conformidade ISO 22301</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Aprovação em Testes DRP: {kpis?.drpTestPassRatePct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="🛡️" label="Serviços Críticos" value={String(kpis?.totalCriticalServices ?? 0)} sub="Catálogo BIA" color="#059669" />
        <KpiCard icon="🔴" label="Tier 0 Missão Crítica" value={String(kpis?.tier0MissionCriticalCount ?? 0)} color="#dc2626" />
        <KpiCard icon="⏱" label="RTO Médio" value={`${kpis?.avgRtoMinutes} min`} sub="Tempo de Recuperação" color="#2563eb" />
        <KpiCard icon="💾" label="RPO Médio" value={`${kpis?.avgRpoMinutes} min`} sub="Tolerância Perda Dados" color="#7c3aed" />
        <KpiCard icon="⚡" label="Disponibilidade (Uptime)" value={`${kpis?.overallUptimePct}%`} color="#16a34a" />
        <KpiCard icon="🚨" label="Incidentes Ativos" value={String(kpis?.activeIncidentsCount ?? 0)} color="#d97706" alert={(kpis?.activeIncidentsCount ?? 0) > 0} />
        <KpiCard icon="🔄" label="Testes DRP Passados" value={`${kpis?.drpTestPassRatePct}%`} color="#0891b2" />
        <KpiCard icon="🔒" label="Backups Imutáveis" value={kpis?.backupsVerified100Pct ? '100% OK' : 'Alerta'} color="#059669" />
      </div>

      {/* Arquitetura BCM */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura BCM / DRP Enterprise — 9 Componentes Core (ISO 22301)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Business Continuity Platform', d: 'Plataforma central de orquestração BCM, BIA e planos de continuidade.', i: '🛡️', c: '#059669' },
            { n: 'Recovery Manager', d: 'Motor de execução de DRP com automação de procedimentos de failover.', i: '🔄', c: '#2563eb' },
            { n: 'Incident Manager', d: 'Gestão de incidentes SRE SEV 1..4 com escalonamento e lições aprendidas.', i: '🚨', c: '#dc2626' },
            { n: 'Failover Engine', d: 'Failover automático de microsserviços e banco de dados para regias secundárias.', i: '⚡', c: '#7c3aed' },
            { n: 'Backup Manager', d: 'Backups imutáveis com verificação de integridade e retenção regulatória.', i: '💾', c: '#0891b2' },
            { n: 'Crisis Coordination Center', d: 'Centro de Comando de Crises com playbooks de acionamento imediato.', i: '🌋', c: '#ea580c' },
            { n: 'Emergency Notification', d: 'Notificação multicanal de emergência (SMS, Voice Call, PagerBot).', i: '📢', c: '#d97706' },
            { n: 'Operational Resilience Hub', d: 'Hub de SRE com métricas de SLO, SLA, SLI e Error Budget.', i: '📊', c: '#4f46e5' },
            { n: 'Business Continuity API', d: 'API para consulta de status de saúde e disparo de planos por IA.', i: '🔌', c: '#6b7280' },
          ].map(c => (
            <div key={c.n} style={{ background: `${c.c}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.c}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.i}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.c }}>{c.n}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: BIA & Serviços Críticos ────────────────────────────────────────────

function BIAServicosTab() {
  const [services, setServices] = useState<BCMCriticalService[]>([]);

  useEffect(() => {
    BusinessContinuityEnterpriseService.getCriticalServices().then(setServices);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Business Impact Analysis (BIA) — Catálogo de Serviços Críticos</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Definição de RTO, RPO, MTPD e estratégias de recuperação por serviço essencial</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {services.map(srv => {
          const crit = CRITICALITY_CONFIG[srv.criticality];
          const drStrat = DR_STRATEGY_CONFIG[srv.drStrategy];
          return (
            <Card key={srv.serviceId} style={{ padding: '18px 20px', borderLeft: `4px solid ${crit.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: crit.color }}>{srv.serviceId} · Domínio: {srv.domain}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{srv.name}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={crit.label} color={crit.color} bg={crit.bg} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: drStrat.color }}>{drStrat.label}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>RTO (RECUPERAÇÃO)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb' }}>{srv.rtoMinutes} min</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>RPO (PERDA DE DADOS)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>{srv.rpoMinutes} min</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>MTPD (MÁX INDISPONÍVEL)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626' }}>{srv.mtpdHours} horas</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Stack Tecnológico:</span>
                {srv.techStack.map(t => (
                  <span key={t} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#374151' }}>⚙️ {t}</span>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Responsável: {srv.primaryOwnerRole} · 📅 Útilma auditoria BIA: {fmtDateTime(srv.lastBiaAuditAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Disaster Recovery (DRP) ────────────────────────────────────────────

function DisasterRecoveryTab() {
  const [plans, setPlans] = useState<DisasterRecoveryPlan[]>([]);

  useEffect(() => {
    BusinessContinuityEnterpriseService.getDisasterRecoveryPlans().then(setPlans);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Disaster Recovery (DRP) — Failover Automático & Snapshots</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Planos de Disaster Recovery com tempo de failover testado e verificação de imutabilidade</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plans.map(plan => (
          <Card key={plan.planId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{plan.planId} · Serviço: {plan.targetServiceId}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{plan.title}</div>
              </div>
              <Badge label={plan.lastTestStatus} color={plan.lastTestStatus === 'PASSED' ? '#059669' : '#dc2626'} bg={plan.lastTestStatus === 'PASSED' ? '#d1fae5' : '#fee2e2'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>FAILOVER AUTOMÁTICO</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: plan.automatedFailoverEnabled ? '#059669' : '#dc2626' }}>
                  {plan.automatedFailoverEnabled ? '⚡ ATIVADO' : '✋ MANUAL'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>TEMPO DE FAILOVER</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{plan.failoverTimeSeconds} seg</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>FREQUÊNCIA BACKUP</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed' }}>{plan.backupFrequency}</div>
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              🔒 Backup Imutável: {plan.backupImmutabilityVerified ? '✓ Verificado' : '✗ Alerta'} ·
              📅 Último Teste: {fmtDateTime(plan.lastTestAt)} ·
              📖 Runbook: {plan.recoveryRunbookUrl}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Gestão de Incidentes SRE ───────────────────────────────────────────

function IncidentesSRETab() {
  const [incidents, setIncidents] = useState<ResilienceIncident[]>([]);

  useEffect(() => {
    BusinessContinuityEnterpriseService.getIncidents().then(setIncidents);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de Incidentes SRE — SEV 1..4 & Automação de Resposta</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Registro, automação de resposta, MTTR e análise de causa raiz de incidentes operacionais</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {incidents.map(inc => {
          const sc = INCIDENT_SEV_CONFIG[inc.severity];
          return (
            <Card key={inc.incidentId} style={{ padding: '18px 20px', borderLeft: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#6b7280' }}>{inc.incidentId} · Serviço: {inc.serviceId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{inc.title}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                  <Badge label={inc.status} color="#059669" bg="#d1fae5" />
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', marginBottom: 2 }}>CAUSA RAIZ (ROOT CAUSE):</div>
                <div style={{ fontSize: 11, color: '#374151' }}>{inc.rootCauseSummary}</div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 3 }}>✅ AÇÕES DE MITIGAÇÃO EXECUTADAS:</div>
                {inc.mitigationActionsTaken.map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#374151' }}>• {a}</div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                ⏱️ MTTR: <strong>{inc.mttrMinutes} min</strong> ·
                👥 Beneficiários afetados: {inc.affectedBeneficiariesCount} ·
                🤖 Alerta Preditivo IA: {inc.aiPreemptionAlerted ? '✓ Sim' : 'Não'} ·
                Aberto em: {fmtDateTime(inc.openedAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Gestão de Crises ───────────────────────────────────────────────────

function GestaoCrisesTab() {
  const [plans, setPlans] = useState<CrisisManagementPlan[]>([]);

  useEffect(() => {
    BusinessContinuityEnterpriseService.getCrisisPlans().then(setPlans);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de Crises — Playbooks de Resposta e Comunicação</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Planos para Ciberataque, Indisponibilidade de Nuvem, Falha Clínica e Eventos Institucionais</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plans.map(plan => (
          <Card key={plan.crisisId} style={{ padding: '18px 20px', borderLeft: '4px solid #ea580c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#ea580c' }}>{plan.crisisId} · Tipo: {plan.type}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{plan.title}</div>
              </div>
              <Badge label={`Líder: ${plan.crisisLeaderRole}`} color="#ea580c" bg="#ffedd5" />
            </div>

            <div style={{ background: '#fff7ed', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#c2410c', marginBottom: 2 }}>CRITÉRIO DE ATIVAÇÃO:</div>
              <div style={{ fontSize: 11, color: '#374151' }}>{plan.activationCriteria}</div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Canais Notificação Emergencial:</span>
              {plan.emergencyNotificationChannels.map(c => (
                <span key={c} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#374151' }}>📢 {c}</span>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📅 Última Simulação: {fmtDateTime(plan.lastSimulationAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BusinessContinuityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CRO & BCM Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#166534,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Resiliência Organizacional & BCM / Disaster Recovery
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Business Continuity Management · Disaster Recovery (DRP) · SRE · ISO 22301 · ISO 27031 · NIST SP 800-34
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
                padding: '8px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
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
      {activeTab === 'Torre CRO & BCM Hub' && <TorreCROTab />}
      {activeTab === 'BIA & Serviços Críticos' && <BIAServicosTab />}
      {activeTab === 'Disaster Recovery (DRP)' && <DisasterRecoveryTab />}
      {activeTab === 'Gestão de Incidentes SRE' && <IncidentesSRETab />}
      {activeTab === 'Gestão de Crises' && <GestaoCrisesTab />}

      {activeTab !== 'Torre CRO & BCM Hub' &&
        activeTab !== 'BIA & Serviços Críticos' &&
        activeTab !== 'Disaster Recovery (DRP)' &&
        activeTab !== 'Gestão de Incidentes SRE' &&
        activeTab !== 'Gestão de Crises' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Business Continuity — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma de Resiliência Operacional alinhada à ISO 22301, ISO 27031 e NIST SP 800-34.
          </p>
        </Card>
      )}
    </div>
  );
}
