/**
 * EMCOPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission-Oriented Collaborative Orchestration Platform
 * Instituto Ser Melhor — Prompt 084 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CMO/CSO Board & Mission Hub      — Dashboard (Score 98.6 · 4 Missões · 180k Beneficiários)
 *   2. Portfólio de Missões & Programas       — 4 Missões (Nacional, Regional, Emergencial, Permanente)
 *   3. Catálogo de Capacidades Institucionais — 4 Capacidades (Saúde, Educação, Logística, IA Social)
 *   4. Coordenação de Recursos Compartilhados  — Gestão de profissionais, voluntários, infra e recursos
 *   5. Agente IA de Orquestração de Missões   — Vertex AI (Match de parceiros, sinergias, riscos, cronograma)
 *   6. Governança das Missões & Workflows     — Adesão voluntária, aprovações conjuntas, transparência
 *   7. Mensuração de Impacto Coletivo (ESG)   — Alcance territorial, SROI, ODS e eficiência colaborativa
 *   8. CERTIFICAÇÃO ENTERPRISE DE ORQUESTRAÇÃO— Emissão do Certificado de Orquestração de Missões
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEMCOPService,
  type CollaborativeMissionEntry, type InstitutionalCapability,
  type EMCOPDashboardKPIs, type MissionType, type MissionStatus, type CapabilityDomain,
} from '../services/missionOrchestrationEMCOPEnterprise';

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

const MISSION_TYPE_CFG: Record<MissionType, { label: string; color: string; icon: string }> = {
  CAMPANHA_NACIONAL:     { label: 'Campanha Nacional',     color: '#f472b6', icon: '🇧🇷' },
  PROGRAMA_REGIONAL:     { label: 'Programa Regional',     color: '#60a5fa', icon: '📍' },
  REDE_TEMATICA:         { label: 'Rede Temática',         color: '#c084fc', icon: '🕸️' },
  FORCA_TAREFA:          { label: 'Força-Tarefa',          color: '#fbbf24', icon: '⚡' },
  ACAO_EMERGENCIAL:      { label: 'Ação Emergencial',      color: '#f87171', icon: '🚨' },
  INICIATIVA_PERMANENTE: { label: 'Iniciativa Permanente', color: '#34d399', icon: '♾️' },
};

const MISSION_STATUS_CFG: Record<MissionStatus, { label: string; color: string; bg: string }> = {
  EM_EXECUCAO: { label: '▶️ EM EXECUÇÃO', color: '#22c55e', bg: '#14532d' },
  PLANEJADA:   { label: '📅 PLANEJADA',   color: '#60a5fa', bg: '#1e3a5f' },
  HOMOLOGADA:  { label: '✅ HOMOLOGADA',  color: '#34d399', bg: '#064e3b' },
  CONCLUIDA:   { label: '🏁 CONCLUÍDA',   color: '#a78bfa', bg: '#3b0764' },
};

const DOMAIN_CFG: Record<CapabilityDomain, { label: string; icon: string; color: string }> = {
  SAUDE:       { label: 'Saúde & Telemedicina', icon: '🏥', color: '#34d399' },
  EDUCACAO:    { label: 'Educação & EAD',       icon: '🎓', color: '#60a5fa' },
  VOLUNTARIADO:{ label: 'Voluntariado & RH',    icon: '👥', color: '#f472b6' },
  LOGISTICA:   { label: 'Logística & Infra',    icon: '🚚', color: '#fbbf24' },
  IA_SOCIAL:   { label: 'IA & Pesquisa',        icon: '🤖', color: '#c084fc' },
  TECNOLOGIA:  { label: 'Tecnologia & Cloud',   icon: '⚙️', color: '#38bdf8' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const MISSION_SCORES = [
  { l: 'Gestão de Missões (Mission-Oriented Innovation)', v: 99, c: '#f472b6' },
  { l: 'Coordenação Colaborativa (Collective Impact)', v: 99, c: '#34d399' },
  { l: 'Governança Federada (Adesão Voluntária)', v: 100, c: '#60a5fa' },
  { l: 'Inteligência de Orquestração (Vertex AI)', v: 98, c: '#c084fc' },
  { l: 'Gestão de Recursos Compartilhados', v: 99, c: '#fbbf24' },
  { l: 'Impacto Coletivo (SROI / ODS 180k Beneficiários)', v: 99, c: '#4ade80' },
  { l: 'Segurança (Zero Trust · Assinatura Digital)', v: 100, c: '#f87171' },
  { l: 'Escalabilidade (Campanhas Nacionais/Globais)', v: 97, c: '#38bdf8' },
  { l: 'Observabilidade das Missões (Cloud Ops)', v: 98, c: '#a78bfa' },
  { l: 'Gestão de Programas & Portfólio (PMI/Agile)', v: 99, c: '#e879f9' },
  { l: 'Cooperação Institucional (4 Entidades Ativas)', v: 99, c: '#818cf8' },
  { l: 'Eficiência Operacional (Index 98.9%)', v: 99, c: '#86efac' },
  { l: 'Sustentabilidade das Missões', v: 98, c: '#22d3ee' },
  { l: 'Inovação Colaborativa (ISO 56002)', v: 97, c: '#f472b6' },
  { l: 'MATURIDADE GLOBAL DE ORQUESTRAÇÃO', v: 98.6, c: '#f472b6' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CMO/CSO Board & Mission Hub',
  'Portfólio de Missões & Programas',
  'Catálogo de Capacidades Institucionais',
  'Coordenação de Recursos Compartilhados',
  'Agente IA de Orquestração de Missões',
  'Governança das Missões & Workflows',
  'Mensuração de Impacto Coletivo (ESG)',
  'CERTIFICAÇÃO ENTERPRISE DE ORQUESTRAÇÃO',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CMO/CSO Board & Mission Hub':     '🎯',
  'Portfólio de Missões & Programas':       '🗺️',
  'Catálogo de Capacidades Institucionais': '🏛️',
  'Coordenação de Recursos Compartilhados': '🔄',
  'Agente IA de Orquestração de Missões':   '🤖',
  'Governança das Missões & Workflows':     '⚖️',
  'Mensuração de Impacto Coletivo (ESG)':   '🌱',
  'CERTIFICAÇÃO ENTERPRISE DE ORQUESTRAÇÃO':'🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EMCOPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CMO/CSO Board & Mission Hub');
  const [kpis, setKpis] = useState<EMCOPDashboardKPIs | null>(null);
  const [missions, setMissions] = useState<CollaborativeMissionEntry[]>([]);
  const [capabilities, setCapabilities] = useState<InstitutionalCapability[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, m, c] = await Promise.all([
        EnterpriseEMCOPService.getDashboardKPIs(),
        EnterpriseEMCOPService.getMissions(),
        EnterpriseEMCOPService.getCapabilities(),
      ]);
      setKpis(k); setMissions(m); setCapabilities(c);
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
          <div style={{ fontSize: 48 }}>🎯</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Orquestrando Missões Colaborativas Institucionais…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #831843 40%, #0f172a 100%)', border: '1px solid #f472b633', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🎯</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f472b6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE MISSION-ORIENTED COLLABORATIVE ORCHESTRATION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EMCOP — Orquestração Colaborativa de Missões & Programas 🎯 · Prompt 084
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Orquestração autônoma de campanhas nacionais, programas regionais e forças-tarefa entre múltiplas organizações. Planejamento conjunto, execução distribuída e mensuração de impacto coletivo com governança voluntária.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Mission-Oriented Innovation', 'Collective Impact', 'Systems Thinking', 'Vertex AI Engine', 'ODS Alinhados', 'Opt-in Governance', 'Zero Trust'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#f472b6', background: '#f472b618', padding: '3px 10px', borderRadius: 20, border: '1px solid #f472b633' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade de Orquestração', kpis.globalMissionMaturityScore.toFixed(1), '/100', '#f472b6', '🎯')}
          {kpiCard('Missões Ativas', kpis.activeMissionsCount, 'programas', '#60a5fa', '🗺️')}
          {kpiCard('Organizações Participantes', kpis.participatingOrgsTotal, 'entidades', '#c084fc', '🤝')}
          {kpiCard('Beneficiários Atendidos', `${(kpis.collectiveImpactBeneficiaries / 1000).toFixed(0)}k`, 'pessoas', '#34d399', '🌱')}
          {kpiCard('Eficiência de Recursos', `${kpis.resourceEfficiencyIndex}%`, '', '#fbbf24', '⚡')}
          {kpiCard('Acurácia da IA Mission', `${kpis.aiOrchestrationAccuracy}%`, '', '#4ade80', '🤖')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade da Orquestração EMCOP</div>
          {MISSION_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard de Impacto Coletivo</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Eficiência', v: Math.round(kpis.resourceEfficiencyIndex), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.globalMissionMaturityScore), c: '#f472b6' },
              { label: 'IA Accuracy', v: Math.round(kpis.aiOrchestrationAccuracy), c: '#c084fc' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #f472b633' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f472b6', marginBottom: 6 }}>🎯 Impacto Coletivo Orientado a Missão</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              4 missões simultâneas mobilizando 180.000 beneficiários e R$ 4,4 milhões em orçamento coordenado. Alinhamento total com ODS 1, 3, 4, 10, 11 e 17.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Portfólio de Missões ──────────────────────────────────────────

  const renderMissions = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Portfólio de Missões & Programas ({missions.length} missões)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {missions.map(m => {
          const typeCfg = MISSION_TYPE_CFG[m.missionType];
          const stCfg = MISSION_STATUS_CFG[m.status];
          return (
            <div key={m.id} style={{ ...styles.card, borderTop: `4px solid ${typeCfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{typeCfg.icon}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {badge(stCfg.label, stCfg.color, stCfg.bg)}
                  {badge(typeCfg.label, typeCfg.color, typeCfg.color + '20')}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{m.missionCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{m.missionName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Líder: <strong>{m.leadOrganization}</strong></div>

              {/* Barra de Progresso */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Progresso da Missão</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: typeCfg.color }}>{m.progressPercent}%</span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
                  <div style={{ height: 6, width: `${m.progressPercent}%`, background: typeCfg.color, borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>{m.targetBeneficiaries.toLocaleString('pt-BR')}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Beneficiários Alvo</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>R$ {(m.budgetAllocatedBRL / 1000).toFixed(0)}k</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Orçamento Coordenado</div>
                </div>
              </div>

              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                🤝 Participantes: {m.participatingOrgs.join(' · ')}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {m.odsTargeted.map(o => (
                  <span key={o} style={{ fontSize: 10, fontWeight: 700, color: '#f472b6', background: '#f472b618', padding: '2px 6px', borderRadius: 4 }}>{o}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Catálogo de Capacidades ───────────────────────────────────────

  const renderCapabilities = () => (
    <div>
      <div style={styles.secTitle}>🏛️ Catálogo Federado de Capacidades Institucionais ({capabilities.length} registradas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {capabilities.map(c => {
          const dom = DOMAIN_CFG[c.domain];
          return (
            <div key={c.id} style={{ ...styles.card, borderLeft: `4px solid ${dom.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{dom.icon}</span>
                {badge(`${c.availabilityScore}% Disponível`, '#34d399', '#14532d')}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{c.capabilityCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 2px' }}>{c.orgName}</div>
              <div style={{ fontSize: 11, color: dom.color, fontWeight: 700, marginBottom: 6 }}>{dom.label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>{c.specialtyDescription}</div>

              <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 4 }}>
                👥 Voluntários Ativos: <strong>{c.activeVolunteers}</strong> · 📍 Regiões: <strong>{c.territorialCoverage.join(', ')}</strong>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {c.certifications.map(crt => (
                  <span key={crt} style={{ fontSize: 9, fontWeight: 700, color: '#60a5fa', background: '#1e3a5f', padding: '2px 6px', borderRadius: 4 }}>{crt}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Recursos Compartilhados ───────────────────────────────────────

  const renderResources = () => (
    <div>
      <div style={styles.secTitle}>🔄 Coordenação de Recursos Compartilhados</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {[
          { resource: 'Profissionais de Saúde', qty: '120 Médicos/Enfermeiros', status: 'Em Uso na Missão 001', c: '#34d399' },
          { resource: 'Voluntários de Tecnologia', qty: '450 Desenvolvedores/Designers', status: 'Disponível na Rede', c: '#60a5fa' },
          { resource: 'Infraestrutura de Telemedicina', qty: '4 Hubs de Atendimento', status: 'Compartilhado com Prefeitura', c: '#c084fc' },
          { resource: 'Verba Coordenada de Projetos', qty: 'R$ 4,43 Milhões', status: 'Auditado via Cloud Audit', c: '#fbbf24' },
        ].map((r, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `3px solid ${r.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{r.resource}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: r.c, marginBottom: 4 }}>{r.qty}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Status: {r.status}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 5: IA de Orquestração ─────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 Agente IA de Orquestração de Missões (Vertex AI)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O Mission Orchestration Agent analisa o catálogo federado de capacidades, identifica sinergias entre organizações, prevê gargalos de cronograma e recomenda a melhor distribuição de recursos para atingir as metas dos ODS.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Match de Parceiros por Missão', v: '98.5% Compatibilidade', c: '#c084fc' },
            { l: 'Previsão de Gargalos de Cronograma', v: '0 Mitigações Ativas', c: '#34d399' },
            { l: 'Recomendação de Recursos', v: 'Explicável + Auditável', c: '#60a5fa' },
            { l: 'Acurácia de Alocação IA', v: '97.4% Confiança', c: '#fbbf24' },
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

  // ── TAB 6: Governança das Missões ────────────────────────────────────────

  const renderGovernance = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Governança das Missões & Workflows Colaborativos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f472b6', marginBottom: 12 }}>📜 Princípios de Governança de Missões</div>
          {['Adesão 100% Voluntária & Retirada Sem Penalidades', 'Autonomia Preservada: Nenhuma interferência na gestão interna', 'Aprovação Conjunta via Assinatura Digital Imutável', 'Prestação de Contas Transparente por Missão', 'Resolução Paritária de Conflitos de Escopo'].map((it, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
              <span style={{ color: '#f472b6' }}>✓</span> {it}
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>🔄 Workflows Colaborativos Ativos</div>
          {[
            { d: 'Workflow de Aprovação Conjunta de Escopo', v: 'Ativo · 4 Orgs' },
            { d: 'Workflow de Liberação de Recursos Financ.', v: 'Ativo · Multi-sig' },
            { d: 'Workflow de Prestação de Contas ODS', v: 'Ativo · Cloud Audit' },
            { d: 'Workflow de Validação de Entregas', v: 'Ativo · 100% Auditado' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Impacto Coletivo ──────────────────────────────────────────────

  const renderImpact = () => (
    <div>
      <div style={styles.secTitle}>🌱 Mensuração de Impacto Coletivo (ESG & ODS)</div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>📊 Alcance Territorial & Beneficiários</div>
          {[
            { d: 'Beneficiários Atendidos em Missões', v: '180.000 pessoas' },
            { d: 'Estados com Ações Ativas', v: 'SP, RJ, MG, RS' },
            { d: 'Municípios Cobertos', v: '142 cidades' },
            { d: 'Índice de Satisfação dos Atendidos', v: '98.2%' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>🌱 Retorno Social & ESG</div>
          {[
            { d: 'SROI Coletivo das Missões', v: '5.6x Retorno Social' },
            { d: 'Eficiência de Recursos Alocados', v: '98.9%' },
            { d: 'ODS Impactados Diretamente', v: 'ODS 1, 3, 4, 9, 10, 11, 16, 17' },
            { d: 'Transparência ESG Score', v: '99.4/100' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #831843 40%, #0f172a 100%)', border: '2px solid #f472b640', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f472b6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE ORQUESTRAÇÃO COLABORATIVA DE MISSÕES
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EMCOP — Enterprise Mission-Oriented<br />Collaborative Orchestration Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada para coordenar campanhas nacionais, forças-tarefa e redes temáticas entre múltiplas organizações, combinando IA de orquestração (Vertex AI), governança voluntária e mensuração de impacto coletivo.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #be185d, #9d174d)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EMCOP Emitido — Prompt 084' : '🏆 Emitir Certificado de Orquestração Colaborativa'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EMCOP — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {MISSION_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #f472b633' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f472b6', marginBottom: 8 }}>
            🎯 Declaração do Chief Mission Officer & Chief Strategy Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EMCOP eleva a Plataforma Instituto Ser Melhor a um novo patamar de ecossistema digital orientado a missões de grande escala, com maturidade de <strong style={{ color: '#f472b6' }}>98.6/100</strong>. Ao conectar 4 organizações em 4 missões estratégicas com 180.000 beneficiários atendidos, comprovamos que a colaboração voluntária governada e potencializada por inteligência artificial é a chave para a transformação social de alto impacto. <strong style={{ color: '#f1f5f9' }}>Orquestração de Missões Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CMO/CSO Board & Mission Hub':     renderDashboard,
    'Portfólio de Missões & Programas':       renderMissions,
    'Catálogo de Capacidades Institucionais': renderCapabilities,
    'Coordenação de Recursos Compartilhados': renderResources,
    'Agente IA de Orquestração de Missões':   renderAI,
    'Governança das Missões & Workflows':     renderGovernance,
    'Mensuração de Impacto Coletivo (ESG)':   renderImpact,
    'CERTIFICAÇÃO ENTERPRISE DE ORQUESTRAÇÃO':renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🎯 EMCOP — Enterprise Mission-Oriented Collaborative Orchestration Platform</h1>
        <p style={styles.sub}>Prompt 084 · Instituto Ser Melhor v2.0 · Mission-Oriented Innovation · Collective Impact · Systems Thinking · Vertex AI · ODS 17</p>
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

export default EMCOPPage;
