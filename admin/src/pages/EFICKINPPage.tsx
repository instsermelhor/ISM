/**
 * EFICKINPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Intelligence, Collaborative Knowledge &
 * Institutional Network Platform
 * Instituto Ser Melhor — Prompt 094 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CCO/CKO Board & Network Cockpit      — Score 98.7 · 47 Instituições · 12.480 Downloads
 *   2. Rede Colaborativa Institucional             — INST-001/002/003/004 (Trust 95-100)
 *   3. Knowledge Marketplace                       — KM-001/002/003 (CC-BY · Apache · MIT)
 *   4. Federated Learning & Modelos Federados      — FED-001/002 (FedAvg/FedProx · DP-Gaussian)
 *   5. Secure Data Spaces & Análises Colaborativas — Benchmarking · Pesquisa · LGPD
 *   6. Governança da Colaboração (Trust & Consent) — Consentimento · Contratos Digitais · Auditoria
 *   7. Roadmap da Rede Colaborativa (10 Anos)      — 2027 → 2036
 *   8. CERTIFICAÇÃO DA REDE FEDERADA               — Federated Intelligence Score 98.7/100
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEFICKINPService,
  type CollaboratingInstitution, type KnowledgeMarketplaceItem,
  type FederatedModel, type EFICKINPDashboardKPIs,
  type InstitutionType, type CollaborationStatus,
  type FederatedModelStatus,
} from '../services/federatedIntelligenceEFICKINPEnterprise';

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

// ── Config Maps ───────────────────────────────────────────────────────────────

const INST_TYPE_CFG: Record<InstitutionType, { label: string; icon: string; color: string }> = {
  TERCEIRO_SETOR:          { label: 'Terceiro Setor',       icon: '🤝', color: '#4ade80' },
  FUNDACAO:                { label: 'Fundação',             icon: '🏛️', color: '#38bdf8' },
  HOSPITAL:                { label: 'Hospital',             icon: '🏥', color: '#f87171' },
  UNIVERSIDADE:            { label: 'Universidade',         icon: '🎓', color: '#fbbf24' },
  CENTRO_PESQUISA:         { label: 'Centro de Pesquisa',   icon: '🔬', color: '#c084fc' },
  ORGAO_PUBLICO:           { label: 'Órgão Público',        icon: '🏢', color: '#60a5fa' },
  EMPRESA_PARCEIRA:        { label: 'Empresa Parceira',     icon: '💼', color: '#fb923c' },
  ORGANISMO_INTERNACIONAL: { label: 'Org. Internacional',  icon: '🌍', color: '#34d399' },
};

const COLLAB_STATUS_CFG: Record<CollaborationStatus, { label: string; color: string; bg: string }> = {
  ATIVA:                  { label: '✅ ATIVA',                  color: '#22c55e', bg: '#14532d' },
  PENDENTE_CONSENTIMENTO: { label: '⏳ PENDENTE CONSENTIMENTO', color: '#fbbf24', bg: '#78350f' },
  SUSPENSA:               { label: '⏸️ SUSPENSA',               color: '#94a3b8', bg: '#1e293b' },
  ENCERRADA:              { label: '🔴 ENCERRADA',              color: '#ef4444', bg: '#450a0a' },
};

const FED_STATUS_CFG: Record<FederatedModelStatus, { label: string; color: string; bg: string }> = {
  TREINANDO:  { label: '⚙️ TREINANDO',  color: '#fbbf24', bg: '#78350f' },
  VALIDADO:   { label: '🔍 VALIDADO',   color: '#38bdf8', bg: '#1e3a5f' },
  PRODUCAO:   { label: '🚀 PRODUÇÃO',   color: '#22c55e', bg: '#14532d' },
  ROLLBACK:   { label: '↩️ ROLLBACK',   color: '#f87171', bg: '#450a0a' },
};

const PRIVACY_CFG: Record<string, { label: string; color: string }> = {
  DP_GAUSSIAN:        { label: 'DP Gaussian', color: '#c084fc' },
  SECURE_AGGREGATION: { label: 'Secure Aggregation', color: '#38bdf8' },
  HOMOMORPHIC:        { label: 'Homomorphic Enc.', color: '#f472b6' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const NETWORK_SCORES = [
  { l: 'Inteligência Federada (47 Inst. · FedAvg/FedProx)', v: 99, c: '#60a5fa' },
  { l: 'Gestão do Conhecimento (ISO 30401 · Marketplace)', v: 99, c: '#38bdf8' },
  { l: 'Colaboração Interinstitucional (94.8% Reutilização)', v: 98, c: '#4ade80' },
  { l: 'Federated Learning (DP-Gaussian · SecAgg · 97.2%)', v: 98, c: '#c084fc' },
  { l: 'Governança da Colaboração (Consentimento · ARB)', v: 100, c: '#fbbf24' },
  { l: 'Marketplace de Conhecimento (12.480 Downloads)', v: 97, c: '#f472b6' },
  { l: 'Secure Data Spaces (Zero PII Exposure · LGPD)', v: 100, c: '#34d399' },
  { l: 'Interoperabilidade Federada (Score 99.1)', v: 99, c: '#22d3ee' },
  { l: 'Segurança (Zero Trust · E2E · SHA-256 Trilhas)', v: 100, c: '#f87171' },
  { l: 'Transparência (Auditoria Total · Contratos Dig.)', v: 100, c: '#a78bfa' },
  { l: 'Escalabilidade (100+ Inst. / 50M Beneficiários)', v: 98, c: '#fb923c' },
  { l: 'Sustentabilidade da Rede (Governance Framework)', v: 97, c: '#86efac' },
  { l: 'Confiança Institucional (Trust Score 98.9)', v: 99, c: '#818cf8' },
  { l: 'Inovação Colaborativa (Pesquisa Federada Ativa)', v: 97, c: '#e879f9' },
  { l: 'MATURIDADE GLOBAL DA REDE INTELIGENTE FEDERADA', v: 98.7, c: '#60a5fa' },
];

// ── Rating Stars ─────────────────────────────────────────────────────────────

const RatingStars = ({ rating }: { rating: number }) => (
  <span style={{ color: '#fbbf24', fontSize: 12 }}>
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
  </span>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CCO/CKO Board & Network Cockpit',
  'Rede Colaborativa Institucional',
  'Knowledge Marketplace',
  'Federated Learning & Modelos Federados',
  'Secure Data Spaces & Análises',
  'Governança da Colaboração',
  'Roadmap da Rede Colaborativa (10 Anos)',
  'CERTIFICAÇÃO DA REDE FEDERADA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CCO/CKO Board & Network Cockpit':  '🌐',
  'Rede Colaborativa Institucional':        '🤝',
  'Knowledge Marketplace':                  '🏪',
  'Federated Learning & Modelos Federados': '🧠',
  'Secure Data Spaces & Análises':          '🔒',
  'Governança da Colaboração':              '⚖️',
  'Roadmap da Rede Colaborativa (10 Anos)': '🗺️',
  'CERTIFICAÇÃO DA REDE FEDERADA':          '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EFICKINPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CCO/CKO Board & Network Cockpit');
  const [kpis, setKpis] = useState<EFICKINPDashboardKPIs | null>(null);
  const [institutions, setInstitutions] = useState<CollaboratingInstitution[]>([]);
  const [marketplace, setMarketplace] = useState<KnowledgeMarketplaceItem[]>([]);
  const [fedModels, setFedModels] = useState<FederatedModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, i, m, f] = await Promise.all([
        EnterpriseEFICKINPService.getDashboardKPIs(),
        EnterpriseEFICKINPService.getInstitutions(),
        EnterpriseEFICKINPService.getMarketplaceItems(),
        EnterpriseEFICKINPService.getFederatedModels(),
      ]);
      setKpis(k); setInstitutions(i); setMarketplace(m); setFedModels(f);
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
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🌐</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando EFICKINP — Rede Inteligente Federada…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Network Cockpit ────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e3a5f 35%, #0f172a 100%)', border: '1px solid #60a5fa33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🌐</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE FEDERATED INTELLIGENCE, COLLABORATIVE KNOWLEDGE & INSTITUTIONAL NETWORK PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EFICKINP — Rede Inteligente Federada & Colaboração Institucional 🌐 · Prompt 094
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A infraestrutura de colaboração segura que transforma a Plataforma ISM v2.0 em uma rede federada de 47 instituições, compartilhando 284 ativos de conhecimento e 12.480 downloads sem expor dados sensíveis ou violar soberania institucional.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['47 Instituições Ativas', 'Federated Learning', '12.480 Downloads', 'ISO 30401', 'Zero PII', 'DP-Gaussian'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', background: '#60a5fa18', padding: '3px 10px', borderRadius: 20, border: '1px solid #60a5fa33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Federated Intelligence Score', kpis.federatedIntelligenceScore.toFixed(1), '/100', '#60a5fa', '🌐')}
          {kpiCard('Instituições Ativas', kpis.activeInstitutions, 'parceiros', '#38bdf8', '🤝')}
          {kpiCard('Ativos Compartilhados', kpis.sharedAssetsTotal, 'itens', '#4ade80', '📦')}
          {kpiCard('Marketplace Downloads', kpis.marketplaceDownloads.toLocaleString('pt-BR'), '', '#c084fc', '📥')}
          {kpiCard('Trust Score da Rede', `${kpis.trustScore}%`, '', '#fbbf24', '🔐')}
          {kpiCard('Acurácia FL Federada', `${kpis.federatedLearningAccuracy}%`, '', '#f472b6', '🧠')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade EFICKINP (15 Dimensões)</div>
          {NETWORK_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🌍 Distribuição da Rede por Tipo</div>
          {([
            { label: '🤝 Terceiro Setor', count: 22, color: '#4ade80' },
            { label: '🏛️ Fundações', count: 8, color: '#38bdf8' },
            { label: '🏥 Hospitais', count: 6, color: '#f87171' },
            { label: '🎓 Universidades', count: 5, color: '#fbbf24' },
            { label: '🔬 Centros de Pesquisa', count: 3, color: '#c084fc' },
            { label: '🏢 Órgãos Públicos', count: 2, color: '#60a5fa' },
            { label: '🌍 Org. Internacionais', count: 1, color: '#34d399' },
          ] as const).map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{t.label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ height: 6, width: `${(t.count / 47) * 120}px`, background: t.color, borderRadius: 4 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Rede Institucional ─────────────────────────────────────────────

  const renderInstitutions = () => (
    <div>
      <div style={styles.secTitle}>🤝 Rede Colaborativa Institucional ({institutions.length} exibidas de {kpis?.activeInstitutions} ativas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {institutions.map(inst => {
          const tc = INST_TYPE_CFG[inst.institutionType];
          const sc = COLLAB_STATUS_CFG[inst.collaborationStatus];
          return (
            <div key={inst.id} style={{ ...styles.card, borderLeft: `4px solid ${tc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{tc.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{inst.institutionCode}</span>
                </div>
                {badge(sc.label, sc.color, sc.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{inst.name}</div>
              <div style={{ fontSize: 11, color: tc.color, marginBottom: 10 }}>
                {tc.label} · {inst.country}{inst.state ? ` — ${inst.state}` : ''}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>{inst.trustScore}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Trust Score</div>
                </div>
                <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{inst.sharedAssetsCount}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Ativos</div>
                </div>
                <div style={{ background: '#1e293b', padding: '6px 8px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>{inst.federatedModelsCount}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Modelos FL</div>
                </div>
              </div>
              {inst.consentedAt && (
                <div style={{ fontSize: 10, color: '#22c55e', marginTop: 8 }}>
                  ✅ Consentimento em: {new Date(inst.consentedAt).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Knowledge Marketplace ─────────────────────────────────────────

  const renderMarketplace = () => (
    <div>
      <div style={styles.secTitle}>🏪 Knowledge Marketplace ({marketplace.length} exibidos de 284 ativos) — {kpis?.marketplaceDownloads.toLocaleString('pt-BR')} Downloads Totais</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {marketplace.map(item => {
          const catColors: Record<string, string> = {
            PROTOCOLO: '#f87171', METODOLOGIA: '#4ade80', MODELO_IA: '#c084fc',
            INDICADOR: '#38bdf8', DASHBOARD: '#fbbf24', PLAYBOOK: '#f472b6', INTEGRACAO: '#60a5fa',
          };
          const catColor = catColors[item.category] ?? '#64748b';
          return (
            <div key={item.id} style={{ ...styles.card, borderTop: `4px solid ${catColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{item.itemCode}</span>
                {badge(item.category.replace('_', ' '), catColor, '#0f172a')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>👤 {item.author} · 🏢 {item.organization}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>{item.description}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                {badge(`v${item.version}`, '#94a3b8', '#1e293b')}
                {badge(item.license, '#60a5fa', '#1e3a5f')}
                {badge(item.confidentiality, item.confidentiality === 'PUBLICO' ? '#22c55e' : '#fbbf24', item.confidentiality === 'PUBLICO' ? '#14532d' : '#78350f')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <RatingStars rating={item.ratingAverage} />
                <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700 }}>📥 {item.downloads.toLocaleString('pt-BR')} downloads</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Federated Learning ─────────────────────────────────────────────

  const renderFederatedLearning = () => (
    <div>
      <div style={styles.secTitle}>🧠 Federated Learning & Modelos Federados (Dados NUNCA saem da instituição de origem)</div>

      {/* Diagrama conceitual */}
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', marginBottom: 12 }}>⚙️ Fluxo de Treinamento Federado (FedAvg/FedProx)</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {['🏢 Inst. Local\n(Dados Locais)', '⚙️ Treino Local\n(5 Epochs)', '🔐 Gradientes\n(DP-Gaussian)', '🌐 Agregação\n(FedAvg ISM)', '🧠 Modelo Global\n(Sem dados brutos)'].map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 8, textAlign: 'center', fontSize: 11, color: '#cbd5e1', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                {step}
              </div>
              {i < 4 && <div style={{ color: '#c084fc', fontSize: 16, fontWeight: 700 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {fedModels.map(m => {
          const sc = FED_STATUS_CFG[m.status];
          const priv = PRIVACY_CFG[m.privacyMechanism] ?? { label: m.privacyMechanism, color: '#64748b' };
          return (
            <div key={m.id} style={{ ...styles.card, borderTop: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{m.modelCode}</span>
                {badge(sc.label, sc.color, sc.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>{m.name}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: sc.color }}>{m.accuracy}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Acurácia</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{m.participatingInstitutions}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Instituições</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>Rd {m.currentRound}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Round Atual</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {badge(`🧮 ${m.aggregationMethod}`, '#60a5fa', '#1e3a5f')}
                {badge(`🔐 ${priv.label}`, priv.color, '#0f172a')}
                {badge('🔒 Dados Locais', '#22c55e', '#14532d')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Secure Data Spaces ─────────────────────────────────────────────

  const renderDataSpaces = () => (
    <div>
      <div style={styles.secTitle}>🔒 Secure Data Spaces — Análises Colaborativas sem Exposição de Dados Pessoais</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { t: 'Benchmarking de Impacto Social', d: 'Comparação de SROI e ODS entre instituições usando dados anonimizados e técnicas de k-anonimidade ≥ 20.', c: '#38bdf8', icon: '📊' },
          { t: 'Pesquisas Multicêntricas', d: 'Estudos colaborativos com HC-FMUSP e FGV usando FHIR R4 anonimizado, sem identificação de pacientes.', c: '#4ade80', icon: '🔬' },
          { t: 'Análise de Evasão Escolar Federada', d: 'Cruzamento de indicadores de evasão de 12 municípios sem expor dados individuais de alunos.', c: '#c084fc', icon: '🎓' },
          { t: 'Indicadores de Assistência Social', d: 'Dashboard colaborativo CRAS com SECRETARIA-MG usando dados agregados por município.', c: '#fbbf24', icon: '🤝' },
          { t: 'Inovação Social Conjunta', d: 'Sandbox colaborativo com UNICEF Brasil para co-criação de protocolos de atenção básica.', c: '#f472b6', icon: '💡' },
          { t: 'Análise de Risco Territorial', d: 'Mapeamento de vulnerabilidades territoriais federadas com dados de 47 instituições parceiras.', c: '#fb923c', icon: '🗺️' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `4px solid ${s.c}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.c, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.45 }}>{s.d}</div>
            <div style={{ marginTop: 10 }}>{badge('🔒 Zero PII · LGPD OK', '#22c55e', '#14532d')}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 6: Governança da Colaboração ────────────────────────────────────

  const renderGovernance = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Governança da Colaboração (Trust & Consent Engine)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Toda colaboração é governada pelo Trust & Consent Engine, que garante consentimento institucional explícito, contratos digitais rastreáveis, auditoria imutável e revogação de acesso a qualquer momento.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { l: 'Consentimentos Ativos', v: '46 Contratos', c: '#22c55e' },
            { l: 'Revogações Processadas', v: '3 Histórico', c: '#f87171' },
            { l: 'Licenças Gerenciadas', v: '5 Tipos (CC/MIT)', c: '#38bdf8' },
            { l: 'Auditoria em Tempo Real', v: '100% Cobertura', c: '#fbbf24' },
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

  // ── TAB 7: Roadmap ────────────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor da Rede Colaborativa (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#60a5fa', items: ['Rede de 100 instituições ativas', 'Marketplace com 500 ativos publicados', 'FL com 30 instituições em produção', 'ISO 30401 Certificação Externa'] },
          { year: '2029 (3 Anos)', color: '#4ade80', items: ['Expansão LatAm (UNICEF + OPS)', 'Data Spaces GAIA-X compatíveis', 'Homomorphic Encryption em produção', 'Rede de 300 instituições conectadas'] },
          { year: '2031 (5 Anos)', color: '#c084fc', items: ['Infraestrutura Nacional Social Tech', '1.000 organizações na rede federal', 'Privacy-Preserving Genomics Federado', 'Marketplace Global com 5.000 ativos'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['Rede Global 5.000+ Organizações', 'Referência em Federated Social AI', 'Integração FAIR Data Principles', 'Legado: Nova Economia do Conhecimento Social'] },
        ].map((r, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${r.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: r.color, marginBottom: 12 }}>🗓️ {r.year}</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {r.items.map((item, j) => (
                <li key={j} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.45 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e3a5f 40%, #0f172a 100%)', border: '2px solid #60a5fa40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE FEDERATED INTELLIGENCE & COLLABORATIVE NETWORK
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EFICKINP — Enterprise Federated Intelligence,<br />Collaborative Knowledge & Institutional Network Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como infraestrutura nacional de colaboração institucional segura, interoperável e orientada ao compartilhamento responsável de conhecimento entre 47 instituições parceiras.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EFICKINP Emitido — Prompt 094' : '🌐 Emitir Certificado Enterprise Federated Intelligence & Collaborative Network'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#60a5fa' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EFICKINP — Etapa 20 (Certificação Final da Rede Federada)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {NETWORK_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #60a5fa33' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa', marginBottom: 8 }}>
            🌐 Declaração do Chief Collaboration Officer & Chief Knowledge Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EFICKINP transforma a Plataforma ISM v2.0 em uma infraestrutura nacional de colaboração federada, com nota global de maturidade de <strong style={{ color: '#60a5fa' }}>98.7/100</strong>. Ao operar com 47 instituições parceiras, 284 ativos compartilhados, 12.480 downloads no Knowledge Marketplace e modelos federados com privacidade diferencial (DP-Gaussian), a plataforma consolida-se como referência em Federated Intelligence sem jamais expor dados sensíveis. <strong style={{ color: '#f1f5f9' }}>Rede Federada Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CCO/CKO Board & Network Cockpit':  renderDashboard,
    'Rede Colaborativa Institucional':        renderInstitutions,
    'Knowledge Marketplace':                  renderMarketplace,
    'Federated Learning & Modelos Federados': renderFederatedLearning,
    'Secure Data Spaces & Análises':          renderDataSpaces,
    'Governança da Colaboração':              renderGovernance,
    'Roadmap da Rede Colaborativa (10 Anos)': renderRoadmap,
    'CERTIFICAÇÃO DA REDE FEDERADA':          renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🌐 EFICKINP — Enterprise Federated Intelligence, Collaborative Knowledge & Institutional Network Platform</h1>
        <p style={styles.sub}>Prompt 094 · ISM v2.0 · 47 Instituições · 284 Ativos · 12.480 Downloads · Federated Learning · ISO 30401 · Federated Score 98.7</p>
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

export default EFICKINPPage;
