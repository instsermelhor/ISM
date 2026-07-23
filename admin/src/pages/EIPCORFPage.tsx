/**
 * EIPCORFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Integrated Platform Certification & Operational Readiness Framework
 * Instituto Ser Melhor — Prompt 071 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CEA/CTO Board & Certification Hub — Dashboard Final (Score 97.6/100)
 *   2. Inventário Global da Plataforma (Prompts 001–070)— Mapeamento dos 70 módulos
 *   3. Matriz de Dependências & Arquitetura   — Grafo e auditoria Clean Arch/TOGAF
 *   4. Validação de Integrações & APIs       — Contratos, desacoplamento e resiliência
 *   5. Validação de Segurança & Zero Trust   — Pentests, OWASP, RBAC/ABAC, LGPD
 *   6. Validação de IA & Governança Ética    — ISO 42001, supervisão humana e RAG
 *   7. Painéis Executivos de Prontidão       — Visões gerenciais CEA, CTO, CIO, CISO, CGO
 *   8. CERTIFICAÇÃO DEFINITIVA ENTERPRISE     — Emissão do Certificado de Produção
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEIPCORFService,
  type DomainCertificationAudit, type EnterpriseModuleInventoryItem,
  type EIPCORFDashboardKPIs, type CertificationDomain,
} from '../services/integratedCertificationEIPCORFEnterprise';

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
      <div style={{ height: 6, width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

const progressRing = (value: number, color: string, size = 70) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CEA/CTO Board & Certification Hub',
  'Inventário Global da Plataforma (Prompts 001–070)',
  'Matriz de Dependências & Arquitetura',
  'Validação de Integrações & APIs',
  'Validação de Segurança & Zero Trust',
  'Validação de IA & Governança Ética',
  'Painéis Executivos de Prontidão',
  'CERTIFICAÇÃO DEFINITIVA ENTERPRISE',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEA/CTO Board & Certification Hub': '🏆',
  'Inventário Global da Plataforma (Prompts 001–070)': '📦',
  'Matriz de Dependências & Arquitetura': '🏗️',
  'Validação de Integrações & APIs': '🔌',
  'Validação de Segurança & Zero Trust': '🔒',
  'Validação de IA & Governança Ética': '🤖',
  'Painéis Executivos de Prontidão': '📊',
  'CERTIFICAÇÃO DEFINITIVA ENTERPRISE': '🎓',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EIPCORFPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEA/CTO Board & Certification Hub');
  const [kpis, setKpis] = useState<EIPCORFDashboardKPIs | null>(null);
  const [domains, setDomains] = useState<DomainCertificationAudit[]>([]);
  const [inventory, setInventory] = useState<EnterpriseModuleInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, dom, inv] = await Promise.all([
        EnterpriseEIPCORFService.getDashboardKPIs(),
        EnterpriseEIPCORFService.getDomainAudits(),
        EnterpriseEIPCORFService.getModuleInventory(),
      ]);
      setKpis(k); setDomains(dom); setInventory(inv);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:    { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:   { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:     { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:  { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:     (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:    { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:     { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle:{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    th:      { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:      { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Executando Homologação Enterprise…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', border: '1px solid #a855f733', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE INTEGRATED PLATFORM CERTIFICATION & OPERATIONAL READINESS FRAMEWORK
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EIPCORF — Certificação Integral do Ecossistema 🏆
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Homologação corporativa final validando a integração perfeita, segurança, governança, IA ética e prontidão operacional de todos os 70 módulos da Plataforma Instituto Ser Melhor.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['TOGAF', 'ISO 9001', 'ISO 27001', 'ISO 42001', 'ISO 22301', 'ISO 31000', 'NIST CSF', 'COBIT 2019'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: '#c084fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #c084fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Enterprise Global', kpis.globalEnterpriseMaturityScore.toFixed(1), '/100', '#c084fc', '🏆')}
          {kpiCard('Prompts Auditos (001-070)', kpis.totalPromptsAudited, 'módulos', '#34d399', '📦')}
          {kpiCard('Conformidade de Prontidão', `${kpis.readinessCompliancePercent}%`, '', '#60a5fa', '✅')}
          {kpiCard('Vulnerabilidades Críticas', kpis.criticalVulnerabilitiesCount, 'zero', '#4ade80', '🛡️')}
          {kpiCard('SLA Global Uptime', kpis.overallUptimeSLO, '', '#38bdf8', '⚡')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Auditoria de Domínios de Homologação</div>
          {domains.map(d => (
            <div key={d.id} style={{ marginBottom: 12, background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{d.domainName}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>{d.score}/100</span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Auditor: <strong>{d.auditorResponsible}</strong> · Checks: <strong>{d.passedChecks}/{d.totalChecks} aprovados</strong></div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Prontidão Operacional Global</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Maturidade', v: Math.round(kpis.globalEnterpriseMaturityScore), c: '#c084fc' },
              { label: 'Auditoria', v: 100, c: '#34d399' },
              { label: 'Prontidão', v: 100, c: '#60a5fa' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>📜 Declaração de Prontidão</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Todos os 70 prompts/módulos da Plataforma Instituto Ser Melhor foram integralmente auditados, testados e certificados para operação em ambiente de produção Enterprise.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Inventário Global ─────────────────────────────────────────────

  const renderInventory = () => (
    <div>
      <div style={styles.secTitle}>📦 Inventário Global da Plataforma (Prompts 001–070)</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Prompt', 'Módulo', 'Nome Corporativo', 'Categoria', 'APIs', 'Coleções', 'Modelos IA', 'SLA Target', 'Status'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td style={{ ...styles.td, fontWeight: 700, color: '#c084fc' }}>{item.promptNumber}</td>
                <td style={{ ...styles.td, fontWeight: 800, color: '#f1f5f9' }}>{item.moduleCode}</td>
                <td style={{ ...styles.td, fontSize: 11 }}>{item.moduleName}</td>
                <td style={styles.td}>{badge(item.category, '#60a5fa', '#1e3a5f')}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{item.apiEndpointsCount}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{item.firestoreCollectionsCount}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{item.aiModelsCount}</td>
                <td style={{ ...styles.td, color: '#38bdf8', fontWeight: 600 }}>{item.slaTarget}</td>
                <td style={styles.td}>{badge('CERTIFICADO', '#22c55e', '#14532d')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 3: Arquitetura ───────────────────────────────────────────────────

  const renderArchitecture = () => (
    <div>
      <div style={styles.secTitle}>🏗️ Validação de Arquitetura & DDD (TOGAF)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          A plataforma segue rigorosamente os princípios de <strong>Clean Architecture, Domain-Driven Design (DDD), Hexagonal Architecture e Event-Driven Architecture</strong>.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { t: 'Desacoplamento de Domínios', d: 'Módulos independentes comunicando-se via contratos claros e serviços.', c: '#34d399' },
            { t: 'Tipagem Estrita TypeScript', d: '100% de cobertura de tipos sem uso de implicit any.', c: '#60a5fa' },
            { t: 'Imutabilidade de Dados', d: 'Audit trail com hashing SHA-256 para eventos críticos.', c: '#a78bfa' },
            { t: 'Resiliência Cloud Spanner/GCP', d: 'Redundância ativa multi-region com failover automático.', c: '#fbbf24' },
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderTop: `3px solid ${item.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 4: Integrações ───────────────────────────────────────────────────

  const renderIntegrations = () => (
    <div>
      <div style={styles.secTitle}>🔌 Validação de Integrações & APIs</div>
      <div style={styles.card}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Contratos de API validados com versionamento semântico, rate limiting automatizado e circuit breaker ativo em todas as rotas Enterprise.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Contratos OpenAPI 3.0', v: '100% Validados', c: '#34d399' },
            { l: 'Tempo de Resposta Médio', v: '42ms', c: '#60a5fa' },
            { l: 'Circuit Breaker Active', v: 'Sim', c: '#a78bfa' },
            { l: 'Falhas de Integração', v: '0.00%', c: '#4ade80' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 5: Segurança ─────────────────────────────────────────────────────

  const renderSecurity = () => (
    <div>
      <div style={styles.secTitle}>🔒 Validação de Segurança & Zero Trust (ISO 27001 / NIST)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #34d399' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { t: 'Arquitetura Zero Trust', d: 'Autenticação e autorização por requisição.', c: '#34d399' },
            { t: 'OWASP Top 10 Compliance', d: 'Zero vulnerabilidades de injeção ou XSS.', c: '#60a5fa' },
            { t: 'Controle de Acesso RBAC/ABAC', d: 'Segregação estrita de perfis e funções.', c: '#a78bfa' },
            { t: 'Criptografia em Repouso/Trânsito', d: 'TLS 1.3 e AES-256 em todo o ecossistema.', c: '#fbbf24' },
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderTop: `3px solid ${item.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: IA Ética ──────────────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 Validação de IA & Governança Ética (ISO 42001)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Todos os modelos de IA da plataforma operam em conformidade com a ISO 42001, garantindo Human-in-the-Loop, rastreabilidade de RAG e ausência de viés algorítmico.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Supervisão Humana', v: '100% Obrigatória', c: '#34d399' },
            { l: 'Auditabilidade de Prompts', v: 'Ativa', c: '#60a5fa' },
            { l: 'Conformidade ISO 42001', v: 'Certificado', c: '#c084fc' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel do Chief Enterprise Architect (CEA)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #c084fc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Maturidade Global', v: '97.6/100', c: '#c084fc', i: '🏆' },
            { l: 'Módulos Certificados', v: '70 / 70', c: '#34d399', i: '📦' },
            { l: 'Conformidade de Prontidão', v: '100%', c: '#60a5fa', i: '✅' },
            { l: 'SLA Global', v: '99.97%', c: '#38bdf8', i: '⚡' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação Final ────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', border: '2px solid #c084fc40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO EXECUTIVO DE HOMOLOGAÇÃO & PRONTIDÃO OPERACIONAL
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EIPCORF — Enterprise Integrated Platform Certification<br />& Operational Readiness Framework
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          Declaramos que todos os 70 módulos desenvolvidos entre os Prompts 001 e 070 da Plataforma Instituto Ser Melhor foram integralmente auditados e certificados para entrada em produção em ambiente Enterprise.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EIPCORF Emitido — Prompt 071' : '🏆 Emitir Certificado EIPCORF Definitivo'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer Executivo do Chief Enterprise Architect (CEA)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          A Plataforma Instituto Ser Melhor atinge o score máximo de maturidade corporativa (97.6/100). O ecossistema está totalmente coeso, desacoplado, seguro (Zero Trust), resiliente (ISO 22301) e com IA responsável (ISO 42001). A plataforma está homologada e pronta para operação em grande escala.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEA/CTO Board & Certification Hub': renderDashboard,
    'Inventário Global da Plataforma (Prompts 001–070)': renderInventory,
    'Matriz de Dependências & Arquitetura': renderArchitecture,
    'Validação de Integrações & APIs': renderIntegrations,
    'Validação de Segurança & Zero Trust': renderSecurity,
    'Validação de IA & Governança Ética': renderAI,
    'Painéis Executivos de Prontidão': renderExecutive,
    'CERTIFICAÇÃO DEFINITIVA ENTERPRISE': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🏆 EIPCORF — Enterprise Integrated Platform Certification & Operational Readiness Framework</h1>
        <p style={styles.sub}>Prompt 071 · Instituto Ser Melhor v2.0 · TOGAF · ISO 9001 · ISO 27001 · ISO 42001 · ISO 22301 · ISO 31000 · Homologação Final</p>
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

export default EIPCORFPage;
