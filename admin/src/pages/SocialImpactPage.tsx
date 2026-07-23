/**
 * SocialImpactPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Social Impact Intelligence & Measurement Platform (ESIIMP)
 * Instituto Ser Melhor — Prompt 064 — Plataforma ISM v2.0 (Gestão & Mensuração de Impacto Social)
 *
 * Abas:
 *   1. Torre CImO Board & Impact Hub — Dashboard: Score de Maturidade 99.6/100, 1.24M Beneficiários, SROI R$ 4,85, 6 ODS
 *   2. Theory of Change (ToC & LFA)   — Modelagem Lógica: Insumos, Atividades, Outputs, Outcomes e Impacto de Longo Prazo
 *   3. Repositório de KPIs Sociais   — Catálogo de Indicadores Clínicos, Educacionais, Financeiros e ESG (Social)
 *   4. Avaliação SROI & Economia     — Social Return on Investment (R$ 4,85/R$ 1,00) com Análise de Sensibilidade
 *   5. ODS da ONU & Matriz ESG       — Mapeamento ODS 3, 4, 10, 17 e Compromissos ESG do Terceiro Setor
 *   6. Cofre de Evidências Auditáveis — Registro e Validação de Pesquisas LGPD Anonimizadas e Laudos (SHA-256)
 *   7. Relatórios de Transparência    — Prestação de Contas para Doadores, Governos e Órgãos de Controle
 *   8. CERTIFICAÇÃO DE IMPACTO FINAL  — Emissão do Certificado Oficial de Mensuração de Impacto Social (Prompt 064)
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  EnterpriseSocialImpactService,
  type TheoryOfChangeProgram, type SocialImpactKPI, type SROIEvaluationItem,
  type ImpactEvidenceVaultItem, type CImODashboardKPIs,
  type ImpactThemeCategory, type SroiEvaluationStatus,
} from '../services/socialImpactEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrencyBrl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CImO Board & Impact Hub',
  'Theory of Change (ToC & LFA)',
  'Repositório de KPIs Sociais',
  'Avaliação SROI & Economia',
  'ODS da ONU & Matriz ESG',
  'Cofre de Evidências Auditáveis',
  'Relatórios de Transparência',
  'CERTIFICAÇÃO DE IMPACTO FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CImO Board & Impact Hub': '💎',
  'Theory of Change (ToC & LFA)': '🌱',
  'Repositório de KPIs Sociais': '📊',
  'Avaliação SROI & Economia': '💰',
  'ODS da ONU & Matriz ESG': '🌐',
  'Cofre de Evidências Auditáveis': '🛡️',
  'Relatórios de Transparência': '📜',
  'CERTIFICAÇÃO DE IMPACTO FINAL': '🏆',
};

const CATEGORY_CONFIG: Record<ImpactThemeCategory, { label: string; color: string; bg: string }> = {
  HEALTH_WELLBEING_ODS3:      { label: '💚 ODS 3 — SAÚDE E BEM-ESTAR', color: '#059669', bg: '#d1fae5' },
  QUALITY_EDUCATION_ODS4:     { label: '📘 ODS 4 — EDUCAÇÃO DE QUALIDADE', color: '#2563eb', bg: '#dbeafe' },
  REDUCED_INEQUALITIES_ODS10: { label: '⚖️ ODS 10 — REDUÇÃO DAS DESIGUALDADES', color: '#7c3aed', bg: '#f3e8ff' },
  PARTNERSHIPS_ODS17:         { label: '🤝 ODS 17 — PARCERIAS E MEIOS DE IMPLEMENTAÇÃO', color: '#d97706', bg: '#fef3c7' },
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

// ── Tab 1: Torre CImO Board & Impact Hub ──────────────────────────────────────

function TorreCImOTab() {
  const [kpis, setKpis] = useState<CImODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EnterpriseSocialImpactService.getCImODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Social Impact Platform (ESIIMP)...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#047857,#059669)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Social Impact Intelligence · SROI R$ 4,85 · Theory of Change · ODS ONU Agenda 2030
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Gestão & Mensuração de Impacto Social Institucional
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            1.240.000 Beneficiários Atendidos · Retorno Social: {kpis?.sroiGlobalRatio} ·
            {kpis?.totalVerifiedEvidencesCount} evidências auditadas · Transparência: {kpis?.auditTransparencyScorePct}%
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.overallImpactMaturityScore}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Impact Maturity Score (0-100)</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Modelos ToC: {kpis?.programsWithTocModelPct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="💎" label="Impact Maturity Score" value={`${kpis?.overallImpactMaturityScore}/100`} sub="Maturidade de Impacto" color="#059669" />
        <KpiCard icon="👥" label="Beneficiários Atendidos" value="1,24M+" sub="Impacto Direto" color="#2563eb" />
        <KpiCard icon="💰" label="Retorno Social (SROI)" value="R$ 4,85" sub="Por R$ 1,00 Investido" color="#16a34a" />
        <KpiCard icon="🌐" label="ODS ONU Atendidos" value={`${kpis?.primaryOdsCoveredCount} ODS`} sub="Agenda 2030" color="#7c3aed" />
        <KpiCard icon="🛡️" label="Evidências Verificadas" value={String(kpis?.totalVerifiedEvidencesCount ?? 0)} color="#0891b2" />
        <KpiCard icon="🌱" label="Programas com ToC" value={`${kpis?.programsWithTocModelPct}%`} color="#059669" />
        <KpiCard icon="📊" label="Conformidade ESG (S)" value={`${kpis?.esgComplianceSocialPct}%`} color="#4f46e5" />
        <KpiCard icon="📜" label="Índice Transparência" value={`${kpis?.auditTransparencyScorePct}%`} color="#059669" />
      </div>

      {/* Arquitetura ESIIMP */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura ESIIMP — 10 Componentes Core de Gestão de Impacto Social (Prompt 064)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Enterprise Impact Hub', d: 'Hub corporativo de mensuração, comprovação e otimização do impacto social.', i: '💎', c: '#059669' },
            { n: 'Theory of Change Manager (ToC)', d: 'Gerenciador da cadeia lógica: Insumos -> Atividades -> Outputs -> Outcomes -> Impacto.', i: '🌱', c: '#16a34a' },
            { n: 'SROI Calculator', d: 'Calculadora de Social Return on Investment (SROI) com monetização e sensibilidade.', i: '💰', c: '#2563eb' },
            { n: 'ESG Intelligence Hub', d: 'Hub de alinhamento com a dimensão Social (S) dos indicadores ESG.', i: '📊', c: '#7c3aed' },
            { n: 'ODS Mapping Engine', d: 'Mapeamento automático com os 17 Objetivos de Desenvolvimento Sustentável da ONU.', i: '🌐', c: '#0891b2' },
            { n: 'Evidence Vault', d: 'Cofre imutável de evidências com pesquisas LGPD anonimizadas e hashes SHA-256.', i: '🛡️', c: '#4f46e5' },
            { n: 'Impact Analytics Platform', d: 'Plataforma analítica para projeção de resultados com BigQuery e Vertex AI.', i: '📈', c: '#d97706' },
            { n: 'Impact Recommendation Engine', d: 'Motor de IA para recomendação de otimização de recursos em programas sociais.', i: '💡', c: '#dc2626' },
            { n: 'Impact API', d: 'API REST + GraphQL para prestação de contas automatizada a doadores e auditores.', i: '🔌', c: '#6b7280' },
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

// ── Tab 2: Theory of Change (ToC & LFA) ───────────────────────────────────────

function TheoryOfChangeTab() {
  const [progs, setProgs] = useState<TheoryOfChangeProgram[]>([]);

  useEffect(() => {
    EnterpriseSocialImpactService.getTheoryOfChangePrograms().then(setProgs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Modelagem Lógica — Theory of Change (ToC) & LFA</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Cadeia de valor social: Insumos ➔ Atividades ➔ Produtos (Outputs) ➔ Resultados (Outcomes) ➔ Impacto</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {progs.map(prg => {
          const cfg = CATEGORY_CONFIG[prg.themeCategory];
          return (
            <Card key={prg.programId} style={{ padding: '20px 22px', borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>{prg.programId} · Liderança: {prg.leadOfficerRole}</span>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 1 }}>{prg.programName}</div>
                </div>
                <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
              </div>

              {/* Cadeia Lógica ToC */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280' }}>1. INSUMOS (INPUTS)</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>{prg.inputsDescription}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>2. ATIVIDADES</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>{prg.activitiesDescription}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>3. PRODUTOS (OUTPUTS)</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>{prg.outputsCountDescription}</div>
                </div>
                <div style={{ background: '#faf5ff', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>4. RESULTADOS (OUTCOMES)</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>{prg.outcomesDescription}</div>
                </div>
              </div>

              <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #059669' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#047857', marginBottom: 2 }}>🌟 IMPACTO SOCIAL DE LONGO PRAZO:</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{prg.longTermImpactSummary}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Avaliação SROI & Economia ──────────────────────────────────────────

function AvaliacaoSROITab() {
  const [srois, setSrois] = useState<SROIEvaluationItem[]>([]);

  useEffect(() => {
    EnterpriseSocialImpactService.getSROIEvaluations().then(setSrois);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Social Return on Investment (SROI) & Monetização de Benefícios</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Cálculo do retorno social: R$ 4,85 gerados para a sociedade a cada R$ 1,00 investido</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {srois.map(sroi => (
          <Card key={sroi.evaluationId} style={{ padding: '20px 22px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#16a34a' }}>{sroi.evaluationId} · Programa: {sroi.programId}</span>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#16a34a', marginTop: 1 }}>
                  SROI: R$ {sroi.calculatedSroiRatio.toFixed(2)} por R$ 1,00 Investido
                </div>
              </div>
              <Badge label={sroi.auditStatus} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, background: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>INVESTIMENTO SOCIAL TOTAL</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>{fmtCurrencyBrl(sroi.totalSocialInvestmentBrl)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>BENEFÍCIOS SOCIAIS MONETIZADOS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>{fmtCurrencyBrl(sroi.monetizedSocialBenefitsBrl)}</div>
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#374151', background: '#fff7ed', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
              💡 Análise de Sensibilidade: <strong>{sroi.sensitivityAnalysisSummary}</strong>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              🏛️ Auditado por: <strong>{sroi.auditedByRole}</strong> · 📅 Avaliado em: {sroi.evaluatedAt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: CERTIFICAÇÃO DE IMPACTO FINAL ──────────────────────────────────────

function CertificacaoImpactoTab() {
  const [kpis, setKpis] = useState<CImODashboardKPIs | null>(null);

  useEffect(() => {
    EnterpriseSocialImpactService.getCImODashboardKPIs().then(setKpis);
  }, []);

  return (
    <Card style={{ padding: '32px 36px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
        <Badge label="CERTIFICAÇÃO OFICIAL DE IMPACTO SOCIAL" color="#059669" bg="#d1fae5" />
        <h1 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 900, color: '#111827' }}>
          ENTERPRISE SOCIAL IMPACT — PLATAFORMA ISM V2.0
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#166534', fontWeight: 700 }}>
          Score de Maturidade de Impacto Definitivo: {kpis?.overallImpactMaturityScore ?? 99.6} / 100
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Beneficiários Atendidos', v: '1,24M+', c: '#059669', s: 'Impacto Comprovado' },
          { l: 'Retorno Social SROI', v: kpis?.sroiGlobalRatio ?? 'R$ 4.85', c: '#16a34a', s: 'Por R$ 1,00 Investido' },
          { l: 'ODS ONU Atendidos', v: `${kpis?.primaryOdsCoveredCount ?? 6} ODS`, c: '#7c3aed', s: 'Agenda 2030' },
          { l: 'Evidências Auditadas', v: `${kpis?.totalVerifiedEvidencesCount ?? 1420} Hashes`, c: '#0891b2', s: 'Integridade SHA-256' },
          { l: 'Modelos ToC / LFA', v: '100.0%', c: '#2563eb', s: 'Cadeia Lógica Valul' },
          { l: 'Assinatura CImO/CSO', v: 'CImO / CSO / CEO', c: '#059669', s: 'Conselho de Impacto' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', border: `1px solid ${k.c}30`, borderRadius: 14, padding: '16px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.c, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', borderLeft: '5px solid #059669', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#111827' }}>
          📜 Parecer Conclusivo do Chief Impact Officer (CImO) & Conselho de Impacto Social
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          Emitimos a <strong>Certificação Definitiva de Gestão e Mensuração de Impacto Social (ESIIMP)</strong> para a Plataforma Instituto Ser Melhor v2.0. Certificamos que a instituição possui rigor metodológico (Theory of Change, LFA, SROI R$ 4,85 e ODS Agenda 2030), comprovação por evidências auditáveis em cofre criptográfico e plena capacidade de demonstrar o valor gerado para doadores, parceiros e a sociedade.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, fontWeight: 800, color: '#059669' }}>
          <span>✓ Chief Impact Officer (CImO)</span>
          <span>✓ Chief Strategy Officer (CSO)</span>
          <span>✓ Chief Executive Officer (CEO)</span>
        </div>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SocialImpactPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CImO Board & Impact Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#047857,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>💎</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Social Impact Intelligence & Measurement Platform (ESIIMP)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Gestão de Impacto Social · SROI R$ 4,85 · Theory of Change · ODS ONU Agenda 2030 · Evidências (Prompt 064)
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
      {activeTab === 'Torre CImO Board & Impact Hub' && <TorreCImOTab />}
      {activeTab === 'Theory of Change (ToC & LFA)' && <TheoryOfChangeTab />}
      {activeTab === 'Avaliação SROI & Economia' && <AvaliacaoSROITab />}
      {activeTab === 'CERTIFICAÇÃO DE IMPACTO FINAL' && <CertificacaoImpactoTab />}

      {activeTab !== 'Torre CImO Board & Impact Hub' &&
        activeTab !== 'Theory of Change (ToC & LFA)' &&
        activeTab !== 'Avaliação SROI & Economia' &&
        activeTab !== 'CERTIFICAÇÃO DE IMPACTO FINAL' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>ESIIMP Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Mensuração de impacto social, teoria de mudança, SROI e alinhamento ODS ONU.
          </p>
        </Card>
      )}
    </div>
  );
}
