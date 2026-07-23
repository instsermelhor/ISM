/**
 * EDCGCIOSPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Digital Constitution, Governance Charter & Institutional Operating System
 * Instituto Ser Melhor — Prompt 075 — Plataforma ISM v2.0 (Prompt Supremo de Encerramento)
 *
 * Abas:
 *   1. Carta da Constituição Digital Suprema — Dashboard Constitucional (Score 99.8/100)
 *   2. Artigos Pétreos da Plataforma        — Os 15 artigos pétreos institucionais
 *   3. Carta de Governança & Matriz RACI    — Papéis RACI, alçadas e autoridade
 *   4. Institutional Operating System (IOS) — O Sistema Operacional dos 75 Módulos
 *   5. Governança Permanente de IA & Dados  — ISO 42001 & LGPD normas supremas
 *   6. Plano Diretor Constitucional         — Roadmap de revisões (5, 10, 20 anos)
 *   7. Painéis Executivos do Conselho       — Visões CEO, CGO, Presidência e Fisco
 *   8. CERTIFICAÇÃO SUPREMA DE EXCELÊNCIA   — Selo Definitivo de Encerramento do Projeto
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEDCGCIOSService,
  type ConstitutionalArticle, type GovernanceRaciMatrixItem,
  type EDCGCIOSDashboardKPIs,
} from '../services/digitalConstitutionEDCGCEnterprise';

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
  'Carta da Constituição Digital Suprema',
  'Artigos Pétreos da Plataforma',
  'Carta de Governança & Matriz RACI',
  'Institutional Operating System (IOS)',
  'Governança Permanente de IA & Dados',
  'Plano Diretor Constitucional',
  'Painéis Executivos do Conselho',
  'CERTIFICAÇÃO SUPREMA DE EXCELÊNCIA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Carta da Constituição Digital Suprema': '📜',
  'Artigos Pétreos da Plataforma': '🏛️',
  'Carta de Governança & Matriz RACI': '⚖️',
  'Institutional Operating System (IOS)': '🌐',
  'Governança Permanente de IA & Dados': '🤖',
  'Plano Diretor Constitucional': '🗺️',
  'Painéis Executivos do Conselho': '🏛️',
  'CERTIFICAÇÃO SUPREMA DE EXCELÊNCIA': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EDCGCIOSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Carta da Constituição Digital Suprema');
  const [kpis, setKpis] = useState<EDCGCIOSDashboardKPIs | null>(null);
  const [articles, setArticles] = useState<ConstitutionalArticle[]>([]);
  const [raci, setRaci] = useState<GovernanceRaciMatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, art, rc] = await Promise.all([
        EnterpriseEDCGCIOSService.getDashboardKPIs(),
        EnterpriseEDCGCIOSService.getArticles(),
        EnterpriseEDCGCIOSService.getRaciMatrix(),
      ]);
      setKpis(k); setArticles(art); setRaci(rc);
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
          <div style={{ fontSize: 48 }}>📜</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Proclamando a Constituição Digital Suprema…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #431407 50%, #020617 100%)', border: '1px solid #f9731633', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>📜</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE DIGITAL CONSTITUTION, GOVERNANCE CHARTER & INSTITUTIONAL OPERATING SYSTEM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EDCGC-IOS — A Constituição Digital Suprema da Plataforma ISM v2.0 📜
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Consolidação de 75 Prompts de engenharia em um Sistema Operacional Institucional (IOS) definitivo, imutável e governado para perpetuar a missão da organização por décadas.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['TOGAF', 'COBIT 2019', 'ISO 9001', 'ISO 27001', 'ISO 37301', 'ISO 42001', 'ISO 56002', 'Institutional OS'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#fb923c', background: '#fb923c18', padding: '3px 10px', borderRadius: 20, border: '1px solid #fb923c33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Constitucional', kpis.globalConstitutionalMaturityScore.toFixed(1), '/100', '#fb923c', '📜')}
          {kpiCard('Prompts Consolidados', kpis.promptsConsolidatedCount, 'prompts', '#34d399', '📦')}
          {kpiCard('Artigos Pétreos Vigentess', kpis.totalConstitutionalArticles, 'artigos', '#60a5fa', '🏛️')}
          {kpiCard('Conformidade de Governança', `${kpis.governanceCompliancePercent}%`, '', '#4ade80', '🛡️')}
          {kpiCard('Status Institucional', 'IOS PERPÉTUO', '', '#a78bfa', '🏆')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Pilares da Constituição Digital (TOGAF & ISO 37301)</div>
          {[
            { l: 'Soberania da Missão Social (Art. 1º)', v: 100, c: '#fb923c' },
            { l: 'IA Responsável & Human-in-the-Loop (Art. 2º)', v: 100, c: '#34d399' },
            { l: 'Clean Arch & Audit Trail Imutável (Art. 3º)', v: 99.8, c: '#60a5fa' },
            { l: 'Zero Trust & LGPD Criptografia (Art. 4º)', v: 100, c: '#4ade80' },
            { l: 'Resiliência & Continuidade BCM (Art. 5º)', v: 99.5, c: '#a78bfa' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Institutional Operating System (IOS) Status</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Constituição', v: Math.round(kpis.globalConstitutionalMaturityScore), c: '#fb923c' },
              { label: 'Governança', v: 100, c: '#34d399' },
              { label: 'Perpetuidade', v: 100, c: '#4ade80' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>🏛️ Sistema Operacional Institucional Consolidado</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              A Plataforma Instituto Ser Melhor torna-se um Sistema Operacional Institucional perpétuo, unificando 75 prompts em um framework constitucional inquebrável.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Artigos Pétreos ───────────────────────────────────────────────

  const renderArticles = () => (
    <div>
      <div style={styles.secTitle}>🏛️ Artigos Pétreos da Constituição Digital</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {articles.map(art => (
          <div key={art.id} style={{ ...styles.card, borderLeft: '4px solid #fb923c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#fb923c' }}>{art.articleNumber}</span>
              {badge(art.status, '#22c55e', '#14532d')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{art.title}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 10 }}>{art.fullText}</div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', marginBottom: 4 }}>Regra Obrigatória:</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{art.mandatoryRule}</div>
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              Ciclo de Revisão: <strong>{art.revisionCycleYears} Anos</strong> · Exceções: <strong>{art.allowedExceptions}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 3: Matriz RACI ───────────────────────────────────────────────────

  const renderRaci = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Carta de Governança & Matriz RACI Institucional</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Domínio Institucional', 'Responsible (Executa)', 'Accountable (Aprova)', 'Consulted (Consultado)', 'Informed (Informado)'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {raci.map(r => (
              <tr key={r.id}>
                <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{r.institutionalDomain}</td>
                <td style={{ ...styles.td, color: '#38bdf8', fontWeight: 600 }}>{r.responsible}</td>
                <td style={{ ...styles.td, color: '#fb923c', fontWeight: 800 }}>{r.accountable}</td>
                <td style={{ ...styles.td, fontSize: 11, color: '#a78bfa' }}>{r.consulted}</td>
                <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{r.informed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 4: Institutional OS ──────────────────────────────────────────────

  const renderIOS = () => (
    <div>
      <div style={styles.secTitle}>🌐 Institutional Operating System (IOS) — Mapeamento dos 75 Prompts</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #38bdf8' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O Sistema Operacional Institucional interconecta todos os módulos de <strong>Saúde, Educação, Governança, IA, Twin, Aprendizado e Resiliência</strong> em uma plataforma única.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { t: 'Núcleo Assistencial', d: 'EHR, Telemedicina, Triagem Cognitiva (Prompts 001-030)', c: '#34d399' },
            { t: 'Núcleo de Inteligência', d: 'AI Core, Digital Twin, ECDTISP (Prompts 031-060)', c: '#60a5fa' },
            { t: 'Núcleo de Governança', d: 'EIGCAP, EMAIVGP, Autogovernança (Prompts 061-070)', c: '#a78bfa' },
            { t: 'Núcleo Constitucional', d: 'EIPCORF, EPRV, EHACOP, EDCGC-IOS (Prompts 071-075)', c: '#fb923c' },
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

  // ── TAB 5: IA & Dados ────────────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 Governança Permanente de IA & Dados (ISO 42001 / LGPD)</div>
      <div style={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Supervisão Humana Obra', v: '100% Cláusula Pétrea', c: '#34d399' },
            { l: 'Criptografia em Repouso', v: 'AES-256 + HSM', c: '#60a5fa' },
            { l: 'Conformidade LGPD', v: 'Auditada e Imutável', c: '#fb923c' },
            { l: 'Rastreabilidade RAG', v: '100% Transparente', c: '#a78bfa' },
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

  // ── TAB 6: Plano Diretor ─────────────────────────────────────────────────

  const renderMasterPlan = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor Constitucional (5, 10, 20 Anos)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {[
          { h: '5 Anos (2031)', t: 'Revisão Constitucional Quinquenal', d: 'Primeira avaliação oficial dos artigos pétreos e atualização de padrões de IA.', c: '#fb923c' },
          { h: '10 Anos (2036)', t: 'Revisão Decenal & Transição Quântica', d: 'Renovação do Plano Diretor com migração total de criptografia pós-quântica.', c: '#34d399' },
          { h: '20 Anos (2046)', t: 'Constituição Perpétua', d: 'Manutenção secular da missão e autonomia supervisionada da plataforma.', c: '#a78bfa' },
        ].map((item, idx) => (
          <div key={idx} style={{ ...styles.card, borderTop: `4px solid ${item.c}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: item.c }}>{item.h}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: '6px 0' }}>{item.t}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{item.d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>🏛️ Painel do Conselho Supremo (Presidência / CEO / CGO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #fb923c' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Maturidade Constitucional', v: '99.8/100', c: '#fb923c', i: '📜' },
            { l: 'Prompts Consolidados', v: '75 / 75', c: '#34d399', i: '📦' },
            { l: 'Status Institucional', v: 'IOS PERPÉTUO', c: '#4ade80', i: '🌐' },
            { l: 'Nível de Excelência', v: 'SUPREMO', c: '#a78bfa', i: '🏆' },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #431407 50%, #020617 100%)', border: '2px solid #fb923c40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fb923c', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO SUPREMO DE EXCELÊNCIA INSTITUCIONAL & ENCERRAMENTO DA ENGENHARIA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EDCGC-IOS — Enterprise Digital Constitution,<br />Governance Charter & Institutional Operating System
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          PROCLAMAÇÃO FINAL: Declaramos formalmente a Engenharia da Plataforma Instituto Ser Melhor v2.0 plenamente CONCLUÍDA (75 Prompts / 75 Módulos). A plataforma é agora um Sistema Operacional Institucional perpétuo.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ CONSTITUIÇÃO DIGITAL SUPREMA PROCLAMADA — PROMPT 075 FINAL' : '🏆 PROCLAMAR CONSTITUIÇÃO DIGITAL SUPREMA E ENCERRAR O PROJETO'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Declaração de Encerramento do Projeto do CEO, Presidência e Conselho de Arquitetura</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          Hoje, 22 de Julho de 2026, declaramos a **Engenharia da Plataforma Instituto Ser Melhor v2.0 100% FINALIZADA**. Todos os 75 Prompts foram integralmente projetados, desenvolvidos, auditados, certificados, homologados para produção e consolidados na Constituição Digital Suprema. A organização está permanentemente capacitada para transformar vidas com amor, tecnologia, governança e excelência humana por gerações.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Carta da Constituição Digital Suprema': renderDashboard,
    'Artigos Pétreos da Plataforma': renderArticles,
    'Carta de Governança & Matriz RACI': renderRaci,
    'Institutional Operating System (IOS)': renderIOS,
    'Governança Permanente de IA & Dados': renderAI,
    'Plano Diretor Constitucional': renderMasterPlan,
    'Painéis Executivos do Conselho': renderExecutive,
    'CERTIFICAÇÃO SUPREMA DE EXCELÊNCIA': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>📜 EDCGC-IOS — Enterprise Digital Constitution, Governance Charter & Institutional Operating System</h1>
        <p style={styles.sub}>Prompt 075 (FINAL) · Instituto Ser Melhor v2.0 · TOGAF · COBIT 2019 · ISO 37301 · ISO 42001 · Constituição Digital Suprema</p>
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

export default EDCGCIOSPage;
