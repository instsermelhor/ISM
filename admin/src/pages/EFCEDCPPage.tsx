/**
 * EFCEDCPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Collaborative Ecosystem & Digital Commons Platform
 * Instituto Ser Melhor — Prompt 083 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CEO/CCO Board & Collaborative Hub — Dashboard (Score 98.4 · 4 Orgs · 6 Commons Assets)
 *   2. Repositório Digital Commons             — 6 Ativos (Metodologia, Indicador, IA, Template, Política, Curso)
 *   3. Rede de Organizações & Membros          — 4 Membros (ISM, Fundação, Prefeitura, Universidade)
 *   4. Marketplace Institucional               — Vitrine de módulos, agentes IA e conectores reutilizáveis
 *   5. Inteligência Coletiva & Benchmarking    — Analytics agregado anonimizado & recomendações IA
 *   6. Governança do Ecossistema & Trust Layer — Regras opt-in, consentimento, ISO 27001 / Gaia-X / LGPD
 *   7. Observabilidade Colaborativa & Métricas — Monitor de reuso, downloads, reputação e engajamento
 *   8. CERTIFICAÇÃO DO ECOSSISTEMA COLABORATIVO— Emissão do Certificado Federado de Digital Commons
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEFCEDCPService,
  type DigitalCommonsAsset, type EcosystemMemberOrg,
  type EFCEDCPDashboardKPIs, type AssetCategory, type AssetLicense,
} from '../services/federatedEcosystemEFCEDCPEnterprise';

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
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const ASSET_CAT_CFG: Record<AssetCategory, { label: string; icon: string; color: string }> = {
  METODOLOGIA: { label: 'Metodologia', icon: '📐', color: '#60a5fa' },
  INDICADOR:   { label: 'Indicador',   icon: '📊', color: '#34d399' },
  MODELO_IA:   { label: 'Modelo IA',   icon: '🤖', color: '#c084fc' },
  TEMPLATE:    { label: 'Template',    icon: '📄', color: '#fbbf24' },
  POLITICA:    { label: 'Política',    icon: '⚖️', color: '#f87171' },
  PESQUISA:    { label: 'Pesquisa',    icon: '🔬', color: '#38bdf8' },
  COMPONENTE:  { label: 'Componente',  icon: '🧩', color: '#f472b6' },
  TREINAMENTO: { label: 'Treinamento', icon: '🎓', color: '#a78bfa' },
};

const MEMBER_LEVEL_CFG = {
  OURO:   { label: '🥇 Membro Ouro',   color: '#fbbf24', bg: '#78350f' },
  PRATA:  { label: '🥈 Membro Prata',  color: '#94a3b8', bg: '#1e293b' },
  BRONZE: { label: '🥉 Membro Bronze', color: '#b45309', bg: '#451a03' },
  MEMBRO: { label: '🔹 Membro Ativo',  color: '#60a5fa', bg: '#1e3a5f' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const FEDERATED_SCORES = [
  { l: 'Colaboração Federada (Data Spaces / Gaia-X)', v: 99, c: '#38bdf8' },
  { l: 'Digital Commons Repository (CC & Open Source)', v: 99, c: '#34d399' },
  { l: 'Marketplace Institucional (Módulos & IA)', v: 98, c: '#c084fc' },
  { l: 'Compartilhamento Seguro (Opt-in · LGPD)', v: 100, c: '#f87171' },
  { l: 'Governança do Ecossistema (Trust Layer)', v: 99, c: '#fbbf24' },
  { l: 'Inteligência Coletiva (Analytics Anonimizado)', v: 98, c: '#a78bfa' },
  { l: 'Reutilização de Ativos (5.680+ Downloads)', v: 99, c: '#f472b6' },
  { l: 'Federação Multi-Institucional', v: 99, c: '#60a5fa' },
  { l: 'Segurança (Zero Trust · Assinatura Digital)', v: 100, c: '#4ade80' },
  { l: 'Interoperabilidade (APIs REST / PubSub)', v: 98, c: '#38bdf8' },
  { l: 'Inovação Aberta (ISO 56002)', v: 97, c: '#e879f9' },
  { l: 'Gestão do Conhecimento Compartilhado', v: 98, c: '#818cf8' },
  { l: 'Escalabilidade do Ecossistema (10k+ Orgs Target)', v: 97, c: '#fb923c' },
  { l: 'Sustentabilidade Colaborativa', v: 98, c: '#86efac' },
  { l: 'MATURIDADE GLOBAL DO ECOSSISTEMA FEDERADO', v: 98.4, c: '#38bdf8' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CEO/CCO Board & Collaborative Hub',
  'Repositório Digital Commons',
  'Rede de Organizações & Membros',
  'Marketplace Institucional',
  'Inteligência Coletiva & Benchmarking',
  'Governança do Ecossistema & Trust Layer',
  'Observabilidade Colaborativa & Métricas',
  'CERTIFICAÇÃO DO ECOSSISTEMA COLABORATIVO',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEO/CCO Board & Collaborative Hub': '🌐',
  'Repositório Digital Commons':             '📚',
  'Rede de Organizações & Membros':          '🤝',
  'Marketplace Institucional':               '🛍️',
  'Inteligência Coletiva & Benchmarking':    '💡',
  'Governança do Ecossistema & Trust Layer': '🛡️',
  'Observabilidade Colaborativa & Métricas': '📈',
  'CERTIFICAÇÃO DO ECOSSISTEMA COLABORATIVO':'🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EFCEDCPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEO/CCO Board & Collaborative Hub');
  const [kpis, setKpis] = useState<EFCEDCPDashboardKPIs | null>(null);
  const [assets, setAssets] = useState<DigitalCommonsAsset[]>([]);
  const [members, setMembers] = useState<EcosystemMemberOrg[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, a, m] = await Promise.all([
        EnterpriseEFCEDCPService.getDashboardKPIs(),
        EnterpriseEFCEDCPService.getDigitalCommons(),
        EnterpriseEFCEDCPService.getEcosystemMembers(),
      ]);
      setKpis(k); setAssets(a); setMembers(m);
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
          <div style={{ fontSize: 48 }}>🌐</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Conectando Ecossistema Colaborativo Federado…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #0f172a 100%)', border: '1px solid #38bdf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🌐</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE FEDERATED COLLABORATIVE ECOSYSTEM & DIGITAL COMMONS PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EFCEDCP — Ecossistema Colaborativo Federado & Digital Commons 🌐 · Prompt 083
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Infraestrutura descentralizada que permite cooperação voluntária entre institutos, fundações e órgãos públicos. Compartilhamento opt-in de conhecimento, metodologias, modelos de IA e indicadores anonimizados preservando a soberania de dados.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Digital Commons', 'Gaia-X Data Space', 'Federated AI', 'Zero Trust', 'Opt-in Granular', 'Creative Commons', 'LGPD 100%'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Colaborativa', kpis.globalCollaborativeMaturityScore.toFixed(1), '/100', '#38bdf8', '🌐')}
          {kpiCard('Organizações Membros', kpis.totalMemberOrgs, 'entidades', '#60a5fa', '🤝')}
          {kpiCard('Ativos Digital Commons', kpis.totalDigitalCommonsAssets, 'recursos', '#34d399', '📚')}
          {kpiCard('Downloads & Reusos', kpis.totalDownloads.toLocaleString('pt-BR'), 'acessos', '#c084fc', '📥')}
          {kpiCard('Beneficiários Coletivos', `${(kpis.collectiveImpactBeneficiaries / 1000).toFixed(0)}k`, 'impactados', '#fbbf24', '🌱')}
          {kpiCard('Score de Confiança (Trust)', `${kpis.ecosystemTrustScore}%`, '', '#4ade80', '🛡️')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade da Rede Colaborativa EFCEDCP</div>
          {FEDERATED_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard do Ecossistema Digital</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Confiança', v: Math.round(kpis.ecosystemTrustScore), c: '#4ade80' },
              { label: 'Maturidade', v: Math.round(kpis.globalCollaborativeMaturityScore), c: '#38bdf8' },
              { label: 'Reuso', v: 99, c: '#c084fc' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #38bdf833' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>🌐 Inteligência Coletiva Federada</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Uma rede inteligente onde o aprendizado de uma instituição beneficia todo o ecossistema social. Soberania total mantida com criptografia ponta a ponta e anonimização de dados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Digital Commons Repository ───────────────────────────────────

  const renderCommons = () => (
    <div>
      <div style={styles.secTitle}>📚 Repositório Digital Commons ({assets.length} ativos públicos/compartilhados)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {assets.map(a => {
          const cat = ASSET_CAT_CFG[a.assetCategory];
          return (
            <div key={a.id} style={{ ...styles.card, borderTop: `4px solid ${cat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {badge(a.license, '#60a5fa', '#1e3a5f')}
                  {badge(a.sharingLevel, '#34d399', '#14532d')}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{a.assetCode} · {a.version}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{a.assetName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>Autor: <strong>{a.authorOrg}</strong></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'Downloads', v: a.downloadCount, c: '#38bdf8' },
                  { l: 'Reusos', v: a.reuseCount, c: '#c084fc' },
                  { l: 'Avaliação', v: `${a.ratingAvg}★`, c: '#fbbf24' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{m.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {a.tagsKeywords.map(t => (
                  <span key={t} style={{ fontSize: 10, color: '#94a3b8', background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Rede de Organizações & Membros ────────────────────────────────

  const renderMembers = () => (
    <div>
      <div style={styles.secTitle}>🤝 Rede de Organizações Participantes ({members.length} membros)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {members.map(m => {
          const lvl = MEMBER_LEVEL_CFG[m.collaborationLevel];
          return (
            <div key={m.id} style={{ ...styles.card, borderLeft: `4px solid ${lvl.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{m.orgCode}</span>
                {badge(lvl.label, lvl.color, lvl.bg)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>{m.orgName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{m.orgType}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'Compartilhados', v: m.assetsShared, c: '#34d399' },
                  { l: 'Consumidos', v: m.assetsConsumed, c: '#60a5fa' },
                  { l: 'Reputação', v: `${m.reputationScore}pt`, c: '#fbbf24' },
                ].map((st, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: st.c }}>{st.v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{st.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#64748b' }}>
                Especialidades: {m.specialties.join(' · ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Marketplace Institucional ─────────────────────────────────────

  const renderMarketplace = () => (
    <div>
      <div style={styles.secTitle}>🛍️ Marketplace Institucional — Vitrine de Recursos Reutilizáveis</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {[
          { item: 'Conector FHIR R4 DATASUS', type: 'Conector API', author: 'Instituto Ser Melhor', rating: '5.0★', badge: 'Popular' },
          { item: 'Workflow Triagem Telemedicina', type: 'BPM Workflow', author: 'Instituto Ser Melhor', rating: '4.9★', badge: 'Verificado' },
          { item: 'Template Prestação Contas Tribunal', type: 'Template Doc', author: 'Prefeitura Parceira', rating: '4.8★', badge: 'Novo' },
          { item: 'Agente IA RAG LGPD Auditable', type: 'Agente Cognitive', author: 'Instituto Ser Melhor', rating: '5.0★', badge: 'Top Rated' },
        ].map((mk, i) => (
          <div key={i} style={{ ...styles.card, borderTop: '3px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>{mk.type}</span>
              {badge(mk.badge, '#fbbf24', '#78350f')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{mk.item}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Por: {mk.author}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>{mk.rating}</span>
              <button style={{ background: '#1e3a5f', border: '1px solid #38bdf840', color: '#38bdf8', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                Importar Ativo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 5: Inteligência Coletiva ─────────────────────────────────────────

  const renderCollectiveAI = () => (
    <div>
      <div style={styles.secTitle}>💡 Inteligência Coletiva & Analytics Anonimizado</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #a78bfa', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Mecanismos de IA analisam tendências agregadas anonimizadas entre todos os membros do ecossistema, identificando boas práticas emergentes e oportunidades de cooperação sem expor dados privados.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Tendências Identificadas', v: '8 Padrões Nacionais', c: '#a78bfa' },
            { l: 'Benchmarking Anonimizado', v: 'Atualização Diária', c: '#34d399' },
            { l: 'Recomendações IA de Reuso', v: '98.2% Acurácia', c: '#38bdf8' },
            { l: 'Dados Sensíveis Compartilhados', v: '0 (100% Anonimizado)', c: '#f87171' },
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

  // ── TAB 6: Governança & Trust Layer ──────────────────────────────────────

  const renderGovernance = () => (
    <div>
      <div style={styles.secTitle}>🛡️ Governança do Ecossistema & Ecosystem Trust Layer</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>📜 Princípios de Governança Colaborativa</div>
          {['Adesão 100% Voluntária & Opt-in', 'Soberania Absoluta de Dados por Organização', 'Licenciamento Transparente (Creative Commons / Open Source)', 'Auditoria Imutável de Compartilhamento & Revogação Instantânea', 'Conformidade Rigorosa com LGPD & ISO 27001'].map((it, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
              <span style={{ color: '#34d399' }}>✓</span> {it}
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>🛡️ Camada de Confiança (Trust Layer)</div>
          {[
            { d: 'Assinatura Digital de Ativos', v: 'Verificada · PKI' },
            { d: 'Verificação de Integridade', v: 'SHA-256 Checksum' },
            { d: 'Protocolo de Dados', v: 'Gaia-X / Data Space Compatible' },
            { d: 'Mediação de Conflitos', v: 'Comitê Paritário de Governança' },
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

  // ── TAB 7: Observabilidade Colaborativa ──────────────────────────────────

  const renderObservability = () => (
    <div>
      <div style={styles.secTitle}>📈 Observabilidade Colaborativa & Métricas do Ecossistema</div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>📊 Engajamento & Reuso</div>
          {[
            { d: 'Total de Downloads Realizados', v: '5.680' },
            { d: 'Eventos de Reuso em Produção', v: '652' },
            { d: 'Média de Ativos por Membro', v: '11.5 ativos' },
            { d: 'Taxa de Crescimento da Rede', v: '+24%/trimestre' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 12 }}>🌱 Impacto Coletivo Calculado</div>
          {[
            { d: 'Beneficiários Coletivos Impactados', v: '82.000 pessoas' },
            { d: 'Economia Estimada por Reuso', v: 'R$ 1.8M em P&D' },
            { d: 'ODS Fortalecidos na Rede', v: 'ODS 1, 3, 4, 10, 16, 17' },
            { d: 'Reputação Média da Rede', v: '99.1%' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #0f172a 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE ECOSSISTEMA COLABORATIVO FEDERADO
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EFCEDCP — Enterprise Federated Collaborative Ecosystem<br />& Digital Commons Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é oficialmente certificada como uma Infraestrutura Digital Colaborativa Federada, permitindo que organizações do terceiro setor e setor público compartilhem conhecimento, IA e inovação com soberania total sobre seus dados.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EFCEDCP Emitido — Prompt 083' : '🏆 Emitir Certificado de Ecossistema Colaborativo Federado'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EFCEDCP — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {FEDERATED_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #38bdf833' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🌐 Declaração do Chief Ecosystem Officer & Chief Collaboration Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EFCEDCP estabelece a Plataforma Instituto Ser Melhor como o primeiro Ecossistema Digital Colaborativo Federado do Terceiro Setor no Brasil, com nota de maturidade de <strong style={{ color: '#38bdf8' }}>98.4/100</strong>. Com repositório Digital Commons ativo, marketplace de IA e governança baseada em padrões internacionais de Data Spaces (Gaia-X), a plataforma transforma a cooperação institucional em um motor permanente de impacto social. <strong style={{ color: '#f1f5f9' }}>Ecossistema Colaborativo Certificado.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEO/CCO Board & Collaborative Hub': renderDashboard,
    'Repositório Digital Commons':             renderCommons,
    'Rede de Organizações & Membros':          renderMembers,
    'Marketplace Institucional':               renderMarketplace,
    'Inteligência Coletiva & Benchmarking':    renderCollectiveAI,
    'Governança do Ecossistema & Trust Layer': renderGovernance,
    'Observabilidade Colaborativa & Métricas': renderObservability,
    'CERTIFICAÇÃO DO ECOSSISTEMA COLABORATIVO':renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🌐 EFCEDCP — Enterprise Federated Collaborative Ecosystem & Digital Commons Platform</h1>
        <p style={styles.sub}>Prompt 083 · Instituto Ser Melhor v2.0 · Federated Data Spaces · Gaia-X · Digital Commons · Marketplace Institucional · ISO 56002</p>
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

export default EFCEDCPPage;
