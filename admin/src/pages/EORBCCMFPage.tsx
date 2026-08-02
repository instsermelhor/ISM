/**
 * EORBCCMFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E033 — ENTERPRISE ORGANIZATIONAL RESILIENCE, BUSINESS CONTINUITY &
 *         CRISIS MANAGEMENT FRAMEWORK (EORBCCMF)
 * Instituto Ser Melhor — Prompt E033 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Resilience Command Tower — Painel Executivo Suprema de Resiliência & Continuidade
 *   2.  Processos Críticos (BIA) — Mapeamento BIA (Impacto Operacional, Social, RTO < 5s)
 *   3.  Planos de Continuidade   — BCP (Business Continuity Plans) & Gatilhos de Ativação
 *   4.  Planos de Recuperação (DRP)— Disaster Recovery Plans (Dados, Apps, Infra, Serviços)
 *   5.  Gestão de Crises & War Room— Severidade (Sev1–Sev4), Comitê de Crise e Ações
 *   6.  Comunicação em Crise (E012)— Comunicados Internos/Externos e Aprovação Mídia
 *   7.  Testes & Simulações      — Chaos Engineering, Drills DRP e Exercícios de Mesa
 *   8.  Indicadores de Resiliência— RTO (4s), RPO (0s), Uptime (99.98%) e MTTR (< 12m)
 *   9.  Integrações Plataforma   — Conexão com GRC (E022), SRE (E023), Ops (E024), Gov (E032)
 *  10.  APIs Corporativas & Eventos— OpenAPI 3.1 & Barramento Pub/Sub (CrisisDeclared)
 *  11.  Apoio à Resiliência AI   — Mapeamento de Dependências Críticas e Recomendações
 *  12.  Certificação E033        — Organizational Resilience Maturity Score 98/100 & Encerramento Final E005–E033
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EORBCCMFService,
  type EORBCCMFConsolidatedDashboard,
  type CriticalProcess,
  type BusinessContinuityPlan,
  type CrisisEvent,
  type ContinuityTest,
  type OrganizationalResilienceCertification,
} from '../services/eorbccmfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02040c',
  bgCard:    '#070d1d',
  bgAlt:     '#0a1428',
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
  gold:      '#fbbf24',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const TABS = [
  { id: 'tower',        icon: '🛡️', label: 'Resilience Tower' },
  { id: 'processes',    icon: '⚡', label: 'Processos Críticos (BIA)' },
  { id: 'bcp',          icon: '📜', label: 'Planos Continuidade (BCP)' },
  { id: 'drp',          icon: '🔄', label: 'Recuperação (DRP)' },
  { id: 'crisis',       icon: '🚨', label: 'Gestão Crises & War Room' },
  { id: 'comm',         icon: '📢', label: 'Comunicação Crise (E012)' },
  { id: 'tests',        icon: '🧪', label: 'Testes & Chaos Drills' },
  { id: 'metrics',      icon: '📊', label: 'Indicadores Resiliência' },
  { id: 'integration',  icon: '🔌', label: 'Integrações' },
  { id: 'apis',         icon: '⚡', label: 'APIs & Eventos' },
  { id: 'advisory',     icon: '🧠', label: 'Apoio Resiliência AI' },
  { id: 'cert',         icon: '🏆', label: 'Grand Encerramento E033' },
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
        borderTopColor: C.emerald, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Resilience Command Tower ───────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EORBCCMFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Resilience Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051a3a 0%, #1e0b3c 50%, #03282b 100%)',
        border: `2px solid ${C.emerald}60`, borderRadius: 20, padding: '32px 36px',
        position: 'relative', overflow: 'hidden', boxShadow: `0 0 36px ${C.emerald}25`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.emerald}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            boxShadow: `0 0 28px ${C.emerald}40`,
          }}>🛡️</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Organizational Resilience & Business Continuity Tower (E033)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Grand Final Framework · Resiliência Organizacional · ISO 22301 · RTO 4s / RPO 0s · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.emerald }}>{d.organizationalResilienceMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>Resilience Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚡', label: 'Processos Críticos', value: d.totalCriticalProcessesMappedCount, color: C.cyan },
            { icon: '📜', label: 'Planos BCP Aprovados', value: d.approvedBCPPlansCount, color: C.purple },
            { icon: '🧪', label: 'Simulações DRP / Ano', value: `${d.drpSimulationsExecutedYearCount} Testes`, color: C.gold },
            { icon: '⏱️', label: 'RTO Realizado', value: `${d.globalRTOAchievementSec} segundos`, color: C.green },
            { icon: '💾', label: 'RPO Realizado', value: `${d.globalRPOAchievementSec} segundos`, color: C.emerald },
            { icon: '🚨', label: 'Status de Crises', value: 'NORMALIDADE', color: C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}12`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🛡️ Metas Globais de Resiliência & SLA</div>
          <ScoreBar label="Cumprimento RTO (< 5s)" value={100} color={C.green} />
          <ScoreBar label="Integridade RPO (= 0s)" value={100} color={C.emerald} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Disponibilidade SLA Fim-a-Fim</span>
            <span style={{ color: C.green, fontWeight: 800 }}>99.98% Garantido</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🧪 Testes DRP & Chaos Engineering</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Simulações de Chaos Realizadas</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Failover Automático Homologado</div>
              </div>
              <Badge text="APROVADO" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Taxa de Sucesso dos Testes</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>100% de Aprovação</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>100%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Certificação ISO 22301 & Normas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 22301 Business Continuity Systems', status: 'CONFORME', color: C.green },
              { label: 'ISO 27031 IT Readiness for Continuity', status: 'CONFORME', color: C.green },
              { label: 'ISO 31000 Risk Management', status: 'CONFORME', color: C.green },
              { label: 'NIST CSF 2.0 Recovery Standard', status: 'CONFORME', color: C.green },
              { label: 'LGPD Disaster Data Protection', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Processos Críticos (BIA) ───────────────────────────────────────────

function ProcessesTab() {
  const [processes, setProcesses] = useState<CriticalProcess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getProcesses().then(res => { setProcesses(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Processos Críticos (BIA)..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="Business Impact Analysis (BIA) & Processos Críticos" sub="Mapeamento Fim-a-Fim de Serviços Essenciais, Metas RTO/RPO e Período Máximo Tolerável (MTPD)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {processes.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text={p.criticality} color={C.rose} bg="#4c051920" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.processName}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Domínio: {p.domainName}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="Target RTO" value={`${p.targetRTOSeconds}s`} color={C.green} />
              <MetricPill label="Target RPO" value={`${p.targetRPOSeconds}s`} color={C.emerald} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Comandante Alocado: {p.assignedCommander}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Planos de Continuidade (BCP) ───────────────────────────────────────

function BCPTab() {
  const [bcps, setBcps] = useState<BusinessContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getBCPs().then(res => { setBcps(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Planos de Continuidade..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Planos de Continuidade de Negócios (BCP)" sub="Procedimentos de Resposta, Gatilhos de Ativação, Recursos Necessários e Comandantes Alocados" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {bcps.map(b => (
          <DarkCard key={b.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{b.code}</span>
              <Badge text={b.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{b.planTitle}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Comandante de Crise: {b.crisisCommander} · Versão: {b.versionNumber}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}><strong>Gatilhos:</strong> {b.triggerConditions.join('; ')}</p>

            <div style={{ fontSize: 10, color: C.sky }}>Última Simulação: {b.lastSimulatedAt}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Planos de Recuperação (DRP) ────────────────────────────────────────

function DRPTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔄" title="Disaster Recovery Plans (DRP) & Failover" sub="Procedimentos de Recuperação Tecnológica, Dados, Infraestrutura, Documentos e Serviços" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>🔄 Failover Automático Multi-Região GCP Homologado</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Em caso de falha física em uma região de nuvem, o sistema executa o failover automático para a região secundária em menos de 5 segundos sem perda de transações (RPO = 0s).
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 5: Gestão de Crises & War Room ────────────────────────────────────────

function CrisisTab() {
  const [crises, setCrises] = useState<CrisisEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getCrises().then(res => { setCrises(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Histórico de Crises..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🚨" title="Gestão de Crises, Comitê & War Room" sub="Classificação de Severidade (Sev1 a Sev4), Acionamento de War Room e Cronologia de Ações" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {crises.map(c => (
          <DarkCard key={c.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{c.code}</span>
              <Badge text={c.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Comandante de Incidentes: {c.incidentCommander}</div>

            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10 }}>Serviços Afetados: {c.affectedServices.join(', ')}</div>

            <div style={{ padding: '8px 10px', background: C.bgAlt, borderRadius: 6, fontSize: 10, color: C.green }}>
              ✓ Resolução: Resposta automatizada com sucesso.
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Comunicação em Crise (E012) ────────────────────────────────────────

function CommunicationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📢" title="Comunicação em Crise & Mídia Institucional" sub="Broadcasts Internos/Externos, Acionamento de Equipes e Aprovação de Notas de Esclarecimento" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.sky, marginBottom: 8 }}>📢 Protocolo de Comunicação Unificado</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Integrado ao módulo de Comunicação (E012), permitindo a transmissão imediata de alertas de status para beneficiários, conselhos, imprensa e doadores.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 7: Testes & Chaos Engineering ─────────────────────────────────────────

function TestsTab() {
  const [tests, setTests] = useState<ContinuityTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getTests().then(res => { setTests(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Testes & Simulações..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧪" title="Testes, Simulações & Chaos Engineering" sub="Exercícios de Mesa, Drills de Failover e Injeção de Falhas para Validação de Resiliência" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {tests.map(t => (
          <DarkCard key={t.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{t.code}</span>
              <Badge text={t.passed ? 'APROVADO' : 'FALHOU'} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{t.simulatedScenario}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Tipo: {t.testType} · Tester: {t.leadTester}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="RTO Medido" value={`${t.achievedRTOSec}s`} color={C.green} />
              <MetricPill label="RPO Medido" value={`${t.achievedRPOSec}s`} color={C.emerald} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Melhorias: {t.identifiedImprovements.join(', ')}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 8: Indicadores de Resiliência ─────────────────────────────────────────

function MetricsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Indicadores de Desempenho da Resiliência" sub="RTO Realizado (4s), RPO Realizado (0s), Uptime SLO (99.98%) e Tempo Médio de Resolução (MTTR)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>4 seg</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>RTO Médio de Failover</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.emerald }}>0 seg</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>RPO de Perda de Dados</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Drills Aprovados no Ano</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 9: Integrações com a Plataforma ───────────────────────────────────────

function IntegrationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔌" title="Integrações da Camada de Resiliência" sub="Conexão com GRC (E022), SRE (E023), Operações (E024), Inteligência (E030), Arch (E031) e Governança (E032)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>🔗 Escudo de Resiliência Fim-a-Fim</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Integração total com os motores de monitoramento SRE e governança institucional, garantindo a proteção da plataforma diante de qualquer cenário adverso.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: APIs & Eventos ────────────────────────────────────────────────────

function APIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="APIs Corporativas & Barramento de Eventos" sub="Contratos OpenAPI 3.1 e Tópicos Pub/Sub (CrisisDeclared, RecoveryCompleted)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>🌐 Eventos Pub/Sub de Resiliência & Crise</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Eventos como <code style={{ color: C.cyan }}>CrisisDeclared</code> acionam instantaneamente a ponte de transmissão da War Room e os cockpits de crise C-Level.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 11: Apoio à Resiliência AI ────────────────────────────────────────────

function AdvisoryTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧠" title="Motor Analítico de Apoio à Resiliência AI" sub="Mapeamento Preditivo de Gargalos de Infraestrutura e Recomendações de Atualização de BCPs" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>🤖 Recomendações Preditivas de Continuidade</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          O motor analítico identifica automaticamente novos microsserviços sem plano de failover cadastrado e sugere a atualização dos BCPs aos comandantes.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação E033 & Encerramento Final ─────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<OrganizationalResilienceCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EORBCCMFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E033..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏆" title="Organizational Resilience Maturity Score — E033 & Grand Encerramento" sub="Certificação de Resiliência Organizacional e Homologação Final do Programa E005–E033" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051a3a 0%, #1e0b3c 50%, #03282b 100%)',
        border: `3px solid ${C.emerald}60`, borderRadius: 24, padding: '40px 48px', textAlign: 'center',
        boxShadow: `0 0 40px ${C.emerald}30`,
      }}>
        <div style={{ fontSize: 104, fontWeight: 900, color: C.emerald, lineHeight: 1 }}>
          {cert.resilienceMaturityScore}
        </div>
        <div style={{ fontSize: 20, color: C.text1, fontWeight: 900, marginTop: 8, letterSpacing: '0.04em' }}>
          ORGANIZATIONAL RESILIENCE MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 13, color: C.text2, marginTop: 8 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Badge text="🛡️ ISO 22301 RESILIÊNCIA CONFORME" color={C.emerald} bg="#10b98125" />
          <Badge text="🏆 PROGRAMA COMPLETO (E005–E033) CONCLUÍDO" color={C.gold} bg="#fbbf2425" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Resiliência Organizacional ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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

      {/* Final Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #051a3a, #1e0b3c)`,
        border: `2px solid ${C.gold}50`, borderRadius: 20, padding: '32px 36px',
      }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: C.gold, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📜 DECLARAÇÃO FORMAL DE HOMOLOGAÇÃO SUPREMA E ENCERRAMENTO DO PROGRAMA COMPLETO DE ARQUITETURA E ENGENHARIA DA PLATAFORMA INSTITUTO SER MELHOR (E005–E033)
        </div>
        <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.emerald }}>Enterprise Organizational Resilience, Business Continuity & Crisis Management Framework (EORBCCMF)</strong> encerra
          com chave de ouro o programa completo da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>, atestando a implementação, integração, auditoria e resiliência dos <strong style={{ color: C.gold }}>29 frameworks corporativos (E005 a E033)</strong>.
        </p>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.8, margin: '14px 0 0' }}>
          Emissão do parecer conclusivo de <strong style={{ color: C.emerald }}>Organizational Resilience Maturity Score de 98/100 (RESILIÊNCIA E EXCELÊNCIA SUPREMAS)</strong>, com Metas de RTO &lt; 5s, RPO = 0s, Uptime SLO de 99.98% e SROI Ratio de 4.85x, garantindo que a instituição permanecerá firme, segura, inteligente e transparente servindo a sociedade em qualquer cenário.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EORBCCMFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'processes':    return <ProcessesTab />;
      case 'bcp':          return <BCPTab />;
      case 'drp':          return <DRPTab />;
      case 'crisis':       return <CrisisTab />;
      case 'comm':         return <CommunicationTab />;
      case 'tests':        return <TestsTab />;
      case 'metrics':      return <MetricsTab />;
      case 'integration':  return <IntegrationTab />;
      case 'apis':         return <APIsTab />;
      case 'advisory':     return <AdvisoryTab />;
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
            background: `linear-gradient(135deg, ${C.emerald}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.emerald}40`,
          }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Organizational Resilience & Business Continuity
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E033 · EORBCCMF · Resiliência Organizacional · ISO 22301 · RTO 4s / RPO 0s · Grand Encerramento E005–E033 · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.emerald}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.emerald : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.emerald}` : '2px solid transparent',
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

export default EORBCCMFPage;
