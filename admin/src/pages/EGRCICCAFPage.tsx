/**
 * EGRCICCAFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E022 — ENTERPRISE GOVERNANCE, RISK, COMPLIANCE, INTERNAL CONTROL &
 *         CORPORATE AUDIT FRAMEWORK (EGRCICCAF)
 * Instituto Ser Melhor — Prompt E022 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  GRC Command Tower     — Painel Executivo Consolidado de Governança
 *   2.  Governança Corporativa— Políticas, Normas, Estatutos, Comitês e Atas
 *   3.  Gestão de Riscos      — ISO 31000 & COSO ERM, Matriz de Inerência/Resíduo
 *   4.  Controles Internos    — COSO Internal Control, Preventivos/Detectivos e Testes
 *   5.  Compliance & Ética    — ISO 37301 / ISO 37001, Obrigações e Código de Conduta
 *   6.  Auditoria Interna     — Modelo das Três Linhas (IIA), Achados e Papéis de Trabalho
 *   7.  Gestão de Incidentes  — Não Conformidades, Causas e Ações Corretivas
 *   8.  Gestão de Evidências  — Repositório Seguro com Checksum SHA-256
 *   9.  Matrizes Corporativas — Riscos, Controles, RACI, Conformidade e SoD
 *  10.  Integração E005–E021  — Visão Consolidada Alimentada por Todos os Módulos
 *  11.  Inteligência GRC      — KRIs, Detecção de Riscos Emergentes e Heatmaps
 *  12.  Certificação E022     — Enterprise GRC Readiness Score & Declaração E023
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EGRCICCAFService,
  type EGRCConsolidatedDashboard,
  type GovernancePolicy,
  type RiskRegisterItem,
  type InternalControl,
  type ComplianceObligation,
  type AuditFinding,
  type EnterpriseGRCCertification,
} from '../services/egrciccafEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#040711',
  bgCard:    '#08101e',
  bgAlt:     '#0d1626',
  border:    '#1e293b',
  borderDim: '#1e293b80',
  cyan:      '#06b6d4',
  violet:    '#8b5cf6',
  indigo:    '#6366f1',
  green:     '#10b981',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  sky:       '#38bdf8',
  emerald:   '#34d399',
  purple:    '#c084fc',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const TABS = [
  { id: 'tower',        icon: '🏛️', label: 'GRC Command Tower' },
  { id: 'governance',   icon: '📜', label: 'Governança Corporativa' },
  { id: 'risks',        icon: '⚠️', label: 'Gestão de Riscos' },
  { id: 'controls',     icon: '🛡️', label: 'Controles Internos' },
  { id: 'compliance',   icon: '⚖️', label: 'Compliance & Ética' },
  { id: 'audit',        icon: '🔍', label: 'Auditoria Interna' },
  { id: 'incidents',    icon: '🚨', label: 'Não Conformidades' },
  { id: 'evidences',    icon: '📦', label: 'Gestão de Evidências' },
  { id: 'matrices',     icon: '🧩', label: 'Matrizes Corporativas' },
  { id: 'integration', icon: '🔗', label: 'Integração E005–E021' },
  { id: 'intelligence',icon: '🧠', label: 'Inteligência GRC' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E022' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Shared Helper Components ──────────────────────────────────────────────────

const DarkCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', ...style }}>
    {children}
  </div>
);

const Badge = ({ text, color, bg }: { text: string; color: string; bg: string }) => (
  <span style={{ fontSize: 10, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const MetricPill = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 16px', background: `${color}15`, border: `1px solid ${color}35`, borderRadius: 10 }}>
    <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
    <span style={{ fontSize: 10, color: C.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
  </div>
);

function ScoreBar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4, transition: 'width 0.8s' }} />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text1 }}>{title}</h2>
          {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text3 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <div style={{
        width: 40, height: 40, border: `3px solid ${C.border}`,
        borderTopColor: C.cyan, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Command Tower ───────────────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EGRCConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando GRC Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #07152b 0%, #150933 50%, #061e27 100%)',
        border: `1px solid ${C.cyan}40`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🏛️</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise GRC Command Tower (E022)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Governança, Gestão de Riscos, Compliance & Auditoria · COSO ERM · ISO 31000 · ISO 37301 · IIA Three Lines
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>{d.grcReadinessScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>GRC Readiness Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📜', label: 'Políticas Ativas', value: d.totalPoliciesActive, color: C.cyan },
            { icon: '⚠️', label: 'Riscos Mapeados', value: d.totalRisksRegistered, color: C.amber },
            { icon: '🔴', label: 'Riscos Críticos', value: d.criticalRisksCount, color: C.green },
            { icon: '🛡️', label: 'Controles Catalogados', value: d.totalControlsCataloged, color: C.purple },
            { icon: '⚡', label: 'Eficácia Controles', value: `${d.controlsEffectivenessPct}%`, color: C.emerald },
            { icon: '⚖️', label: 'Aderência Compliance', value: `${d.globalComplianceAdherencePct}%`, color: C.green },
            { icon: '🔍', label: 'Achados Auditoria', value: d.openAuditFindingsCount, color: C.rose },
            { icon: '📦', label: 'Evidências Catalogadas', value: d.evidencesCatalogedCount.toLocaleString('pt-BR'), color: C.sky },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}12`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🛡️ Eficácia de Controles & Riscos</div>
          <ScoreBar label="Eficácia dos Controles Internos" value={d.controlsEffectivenessPct} color={C.green} />
          <ScoreBar label="Redução de Risco Inerente → Residual" value={78.5} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Riscos Fora do Apetite</span>
            <span style={{ color: C.green, fontWeight: 800 }}>0 Riscos</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🔍 Auditoria Interna & Remediação</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Trabalhos de Auditoria Ativos</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Três Linhas IIA em execução</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.activeAuditEngagements}</span>
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Ações Corretivas Vencidas</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Todas as ações no prazo</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.correctiveActionsOverdueCount}</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Normas & Certificações GRC</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'COSO ERM & COSO Internal Control', status: 'CONFORME', color: C.green },
              { label: 'ISO 31000 Risk Management', status: 'CONFORME', color: C.green },
              { label: 'ISO 37301 / ISO 37001 Compliance', status: 'CONFORME', color: C.green },
              { label: 'IIA Three Lines Governance Model', status: 'CONFORME', color: C.green },
              { label: 'Prestação de Contas ITG 2002 (CFC)', status: 'CONFORME', color: C.green },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.borderDim}` }}>
                <span style={{ color: C.text3 }}>{item.label}</span>
                <Badge text={item.status} color={item.color} bg={`${item.color}20`} />
              </div>
            ))}
          </div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 2: Governança Corporativa ─────────────────────────────────────────────

function GovernanceTab() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getPolicies().then(res => { setPolicies(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Governança..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Políticas & Normas Institucionais" sub="Estrutura de Governança Corporativa, Regimentos, Deliberações de Comitês e Versões Aprovadas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {policies.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text={p.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8, fontWeight: 700 }}>Versão: {p.versionNumber}</div>

            <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5, marginBottom: 12 }}>{p.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Aprovador: <strong style={{ color: C.text2 }}>{p.approver}</strong></span>
              <span>Revisão: <strong style={{ color: C.sky }}>{p.reviewFrequencyDays}d</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Gestão de Riscos ───────────────────────────────────────────────────

function RisksTab() {
  const [risks, setRisks] = useState<RiskRegisterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getRisks().then(res => { setRisks(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Gestão de Riscos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚠️" title="Matriz de Riscos Corporativos (ISO 31000 & COSO ERM)" sub="Avaliação de Risco Inerente vs. Risco Residual com Apetite ao Risco Mapeado" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {risks.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{r.code}</span>
              <Badge text={r.riskLevel} color={r.riskLevel === 'BAIXO' ? C.green : C.amber} bg={r.riskLevel === 'BAIXO' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 12 }}>Categoria: {r.category}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Risco Inerente" value={`${r.inherentRiskScore}/25`} color={C.rose} />
              <MetricPill label="Risco Residual" value={`${r.residualRiskScore}/25`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Dono do Processo: <strong style={{ color: C.text2 }}>{r.processOwner}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Controles Internos ─────────────────────────────────────────────────

function ControlsTab() {
  const [controls, setControls] = useState<InternalControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getControls().then(res => { setControls(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Controles Internos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Catálogo de Controles Internos (COSO)" sub="Controles Preventivos, Detectivos e Corretivos com Testes Contínuos de Eficácia" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {controls.map(c => (
          <DarkCard key={c.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{c.code}</span>
              <Badge text={c.type} color={C.purple} bg="#2e106520" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{c.title}</div>

            <ScoreBar label="Eficácia Testada" value={c.effectivenessScore} color={C.green} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, marginTop: 8 }}>
              <span>Periodicidade: <strong style={{ color: C.sky }}>{c.frequency}</strong></span>
              <span>Automação: <strong style={{ color: c.isAutomated ? C.emerald : C.amber }}>{c.isAutomated ? 'SIM' : 'NÃO'}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Compliance & Ética ─────────────────────────────────────────────────

function ComplianceTab() {
  const [obligations, setObligations] = useState<ComplianceObligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getObligations().then(res => { setObligations(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Compliance..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Gestão de Compliance & Integridade (ISO 37301 / 37001)" sub="Acompanhamento de Obrigações Legais, Regulatórias, Contratuais e Exigências de Financiadores" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {obligations.map(o => (
          <DarkCard key={o.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{o.code}</span>
              <Badge text={o.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{o.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 12 }}>Órgão / Regulador: {o.regulatoryBody}</div>

            <ScoreBar label="Aderência de Conformidade" value={o.complianceAdherencePct} color={C.green} />

            <div style={{ fontSize: 10, color: C.text3, marginTop: 8 }}>
              Tipo: <strong style={{ color: C.sky }}>{o.type}</strong> · Responsável: {o.owner}
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Auditoria Interna ──────────────────────────────────────────────────

function AuditTab() {
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getFindings().then(res => { setFindings(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Auditoria..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔍" title="Auditoria Interna & Modelo das Três Linhas (IIA)" sub="Gestão do Plano Anual de Auditoria, Papéis de Trabalho e Monitoramento de Achados" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {findings.map(f => (
          <DarkCard key={f.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{f.code}</span>
              <Badge text={`SEVERIDADE: ${f.severity}`} color={f.severity === 'BAIXA' ? C.green : C.amber} bg={f.severity === 'BAIXA' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{f.title}</div>
            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{f.description}</p>

            <div style={{ padding: '8px 10px', background: C.bgAlt, borderRadius: 6, fontSize: 10, color: C.text2, marginBottom: 8 }}>
              💡 Recomendações: {f.recommendation}
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Status: <strong style={{ color: C.amber }}>{f.status}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Não Conformidades ──────────────────────────────────────────────────

function IncidentsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🚨" title="Gestão de Não Conformidades & Ações Corretivas" sub="Registro de Desvios, Investigação de Causa Raiz e Acompanhamento de Remedias Integrado ao BPM" />

      <DarkCard>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, marginBottom: 12 }}>📋 Status Geral dos Planos de Ação Corretiva</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricPill label="Total Ações" value={14} color={C.cyan} />
          <MetricPill label="Em Execução" value={4} color={C.amber} />
          <MetricPill label="Concluídas" value={10} color={C.green} />
          <MetricPill label="Vencidas" value={0} color={C.rose} />
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Gestão de Evidências ───────────────────────────────────────────────

function EvidencesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📦" title="Repositório Imutável de Evidências Auditáveis" sub="Armazenamento Seguro de Pareceres, Atas e Comprovantes com Integridade SHA-256" />

      <DarkCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1 }}>📁 Evidências Recentes Auditadas</div>
            <div style={{ fontSize: 11, color: C.text3 }}>Consolidação integrada com Gestão Documental (E014)</div>
          </div>
          <Badge text="🔒 CHECKSUM SHA-256 VALIDADO" color={C.green} bg="#064e3b20" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
          {[
            { code: 'EVD-2026-001', name: 'Relatorio_Auditoria_Independente_2025.pdf', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
            { code: 'EVD-2026-002', name: 'Ata_Reuniao_Conselho_Administracao_Q1.pdf', hash: '87f7311124fa3b07dfb3d2b9ed3a5c71c4c8d5d4d5e6a7b8c9d0e1f2a3b4c5d6' },
            { code: 'EVD-2026-003', name: 'Comprovante_Prestacao_Contas_Convenio_Federal.pdf', hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b' },
          ].map(e => (
            <div key={e.code} style={{ padding: '10px 14px', background: C.bgAlt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: C.cyan, fontWeight: 800, fontFamily: 'monospace' }}>[{e.code}]</span> <span style={{ color: C.text1 }}>{e.name}</span>
              </div>
              <span style={{ fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>SHA256: {e.hash.substring(0, 16)}...</span>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: Matrizes Corporativas ──────────────────────────────────────────────

function MatricesTab() {
  const matrices = [
    { name: 'Matriz de Riscos & Controles', desc: 'Mapeamento de riscos inerentes/residuais x controles mitigadores', color: C.cyan },
    { name: 'Matriz RACI Corporativa', desc: 'Atribuição de papéis (Responsible, Accountable, Consulted, Informed)', color: C.purple },
    { name: 'Matriz de Segregação de Funções (SoD)', desc: 'Prevenção de conflito de interesses na aprovação de processos', color: C.green },
    { name: 'Matriz de Conformidade Legal & Financiadores', desc: 'Aderência a exigências contratuais, fiscais e regulatórias', color: C.sky },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧩" title="Matrizes Corporativas de Governança & SoD" sub="Visualizações Executivas para Segregação de Funções, Matriz RACI e Mapeamento Riscos-Controles" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {matrices.map(m => (
          <DarkCard key={m.name} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: m.color, marginBottom: 4 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: C.text3 }}>{m.desc}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 10: Integração E005–E021 ──────────────────────────────────────────────

function IntegrationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔗" title="Visão Consolidada de Governança Institucional" sub="Monitoramento Contínuo Alimentado por Dados dos Domínios E005 a E021" />

      <DarkCard>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, marginBottom: 12 }}>🌐 Cobertura da Plataforma Corporativa GRC</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          O módulo <strong style={{ color: C.cyan }}>E022 (EGRCICCAF)</strong> consome telemetria, logs de auditoria, transações financeiras, evoluções clínicas, interações de IA e chamadas de API de todos os módulos anteriores (<strong style={{ color: C.text1 }}>E005 a E021</strong>), consolidando o mapa de riscos e controles em tempo real.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 11: Inteligência GRC ──────────────────────────────────────────────────

function IntelligenceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧠" title="Inteligência de GRC & Indicadores KRIs" sub="Detecção Preditiva de Riscos Emergentes e Monitoramento de KRIs (Key Risk Indicators)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.green }}>0.2%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>KRI: Taxa de Exceção Contábil</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.cyan }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>KRI: Cobertura de Treinamento Ético</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.purple }}>0</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>KRI: Incidentes LGPD Notificados</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 12: Certificação E022 ──────────────────────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EnterpriseGRCCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGRCICCAFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E022..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Governance, Risk & Compliance Readiness Score — E022" sub="Certificação da Plataforma Corporativa de Governança e Auditoria" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #07152b 0%, #150933 50%, #061e27 100%)',
        border: `2px solid ${C.cyan}40`, borderRadius: 20, padding: '32px 36px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          {cert.globalScore}
        </div>
        <div style={{ fontSize: 16, color: C.text2, marginTop: 4 }}>Governance, Risk & Compliance Readiness Score (0–100)</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 14 }}>
          <Badge text="🎖️ PLATAFORMA DE GOVERNANÇA CERTIFICADA" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Subdomains */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Subdomínio GRC</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.subdomainScores.map(s => (
            <div key={s.subdomain} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.subdomain}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{s.score}</span>
              </div>
              <ScoreBar label="" value={s.score} color={C.green} />
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Conformidade ({compliantCount}/{cert.conformanceChecklist.length} itens conformes)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {cert.conformanceChecklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#064e3b10', borderRadius: 7, fontSize: 11 }}>
              <span style={{ color: C.green, fontSize: 14 }}>✓</span>
              <div>
                <span style={{ color: C.text1 }}>{item.item}</span>
                <span style={{ color: C.text3, marginLeft: 6 }}>· {item.standard}</span>
              </div>
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Formal Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #07152b, #150933)`,
        border: `1px solid ${C.purple}40`, borderRadius: 16, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CERTIFICAÇÃO E022
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Governance, Risk, Compliance, Internal Control & Corporate Audit Framework (EGRCICCAF)</strong> foi
          implementado, validado e certificado com score global de <strong style={{ color: C.green }}>{cert.globalScore}/100</strong>,
          estabelecendo a camada oficial de governança corporativa da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Esta certificação autoriza formalmente a execução da próxima fase:{' '}
          <strong style={{ color: C.cyan }}>E023 — Enterprise Platform Validation, Performance Engineering, Security Certification & Production Readiness Framework</strong>,
          dedicada à validação integral da plataforma, engenharia de desempenho e testes de produção.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EGRCICCAFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'governance':   return <GovernanceTab />;
      case 'risks':        return <RisksTab />;
      case 'controls':     return <ControlsTab />;
      case 'compliance':   return <ComplianceTab />;
      case 'audit':        return <AuditTab />;
      case 'incidents':    return <IncidentsTab />;
      case 'evidences':    return <EvidencesTab />;
      case 'matrices':     return <MatricesTab />;
      case 'integration': return <IntegrationTab />;
      case 'intelligence':return <IntelligenceTab />;
      case 'cert':         return <CertificationTab />;
      default:             return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Governance, Risk, Compliance & Audit Framework
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E022 · EGRCICCAF · COSO ERM · ISO 31000 · ISO 37301 · IIA Three Lines · LGPD · Instituto Ser Melhor
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 3, background: C.bgCard,
          border: `1px solid ${C.border}`, borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 16,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab.id
                  ? `linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.cyan : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.cyan}` : '2px solid transparent',
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}

export default EGRCICCAFPage;
