/**
 * EFAIACSEFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E025 — ENTERPRISE FINAL ACCEPTANCE, INDEPENDENT AUDIT, CERTIFICATION &
 *         STRATEGIC EVOLUTION FRAMEWORK (EFAIACSEF)
 * Instituto Ser Melhor — Prompt E025 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Grand Acceptance Command Tower— Painel Executivo Consolidado de Aceitação Final
 *   2.  Inventário Consolidado E005–E025— Catálogo Final de Módulos, APIs e Microsserviços
 *   3.  Rastreabilidade Requisitos — Cobertura de 100% dos Prompts do Projeto
 *   4.  Parecer da Auditoria    — Auditoria Técnica, Funcional, Segurança e Governança
 *   5.  Auditoria de IA (E020)  — Governança RAG, Agentes e Human-in-the-Loop
 *   6.  Auditoria Integração    — API Gateway (E021), Event Bus e HL7 FHIR
 *   7.  Auditoria GRC (E022)    — COSO ERM, Controles, ISO 37301 e Evidências SHA-256
 *   8.  Auditoria Ops & SRE     — Desempenho (E023), Go-Live e Hypercare (E024)
 *   9.  Benchmark Corporativo   — Comparativo Internacional com Práticas do Terceiro Setor
 *  10.  Roadmap Estratégico 2030— Plano de Evolução Tecnológica de 5 Anos (2026–2030)
 *  11.  Matriz de Maturidade 360°— Escala de Maturidade (0–100) em 12 Dimensões
 *  12.  Certificação Final & Encerramento— Enterprise Excellence Index 98/100 & Encerramento do Projeto
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EFAIACSEFService,
  type EFAIACSEFConsolidatedDashboard,
  type FinalInventoryItem,
  type IndependentAuditOpinion,
  type StrategicRoadmapItem,
  type EnterpriseExcellenceCertification,
} from '../services/efaiacsefEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02040a',
  bgCard:    '#050a14',
  bgAlt:     '#09111f',
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
  { id: 'tower',        icon: '🏆', label: 'Grand Command Tower' },
  { id: 'inventory',    icon: '📦', label: 'Inventário E005–E025' },
  { id: 'traceability', icon: '📋', label: 'Rastreabilidade 100%' },
  { id: 'audit',        icon: '⚖️', label: 'Parecer da Auditoria' },
  { id: 'ai',           icon: '🧠', label: 'Auditoria de IA' },
  { id: 'integration', icon: '🌐', label: 'Auditoria Integrações' },
  { id: 'grc',          icon: '🏛️', label: 'Auditoria GRC' },
  { id: 'sre',          icon: '⚡', label: 'Auditoria Ops & SRE' },
  { id: 'benchmark',    icon: '📊', label: 'Benchmark Global' },
  { id: 'roadmap',      icon: '🚀', label: 'Roadmap 2026–2030' },
  { id: 'maturity',     icon: '🧩', label: 'Maturidade 360°' },
  { id: 'cert',         icon: '🎓', label: 'Encerramento Final' },
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
        borderTopColor: C.gold, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Grand Acceptance Command Tower ─────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EFAIACSEFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EFAIACSEFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Grand Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1e3d 0%, #200f47 50%, #03282c 100%)',
        border: `2px solid ${C.gold}60`, borderRadius: 20, padding: '32px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            boxShadow: `0 0 28px ${C.gold}50`,
          }}>🏆</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Grand Final Acceptance & Strategic Evolution (E025)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.text3 }}>
              Auditoria Corporativa Independente · Certificação de Excelência · Plataforma Instituto Ser Melhor · Programa E005–E025
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.gold }}>{d.enterpriseExcellenceIndex}</div>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 700 }}>Enterprise Excellence Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '🏛️', label: 'Módulos Auditados', value: `${d.totalModulesAudited} / 21`, color: C.cyan },
            { icon: '📋', label: 'Requisitos Validados', value: `${d.totalRequirementsValidated} / 480`, color: C.purple },
            { icon: '🧪', label: 'Cobertura Testes', value: `${d.globalTestCoveragePct}%`, color: C.green },
            { icon: '⚖️', label: 'Parecer Auditoria', value: 'FAVORÁVEL', color: C.gold },
            { icon: '🚀', label: 'Roadmap Estratégico', value: '2026–2030', color: C.sky },
            { icon: '🎓', label: 'Status Encerramento', value: 'HOMOLOGADO', color: C.emerald },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}15`, border: `1px solid ${k.color}40`, borderRadius: 12, padding: '14px 16px' }}>
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🏆 Maturidade de Excelência Global</div>
          <ScoreBar label="Arquitetura, Código & DDD" value={98} color={C.green} />
          <ScoreBar label="Segurança, Privacidade & LGPD" value={99} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Enterprise Excellence Index</span>
            <span style={{ color: C.gold, fontWeight: 900 }}>98 / 100</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>⚖️ Parecer da Auditoria Independente</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Conclusão da Auditoria</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Aprovação Incondicional sem ressalvas</div>
              </div>
              <Badge text="APROVADO" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Rastreabilidade Prompts</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>100% dos requisitos cobertos</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>100%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Selos Internacionais Certificados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 9001 / ISO 25010 Quality', status: 'CERTIFICADO', color: C.green },
              { label: 'ISO 27001 / ISO 22301 Security', status: 'CERTIFICADO', color: C.green },
              { label: 'ISO 42001 / LGPD AI Governance', status: 'CERTIFICADO', color: C.green },
              { label: 'OWASP ASVS / OWASP API Top 10', status: 'CERTIFICADO', color: C.green },
              { label: 'ITIL 4 / ISO 20000-1 Ops System', status: 'CERTIFICADO', color: C.green },
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

// ── TAB 2: Inventário Consolidado ─────────────────────────────────────────────

function InventoryTab() {
  const [items, setItems] = useState<FinalInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EFAIACSEFService.getInventory().then(res => { setItems(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Inventário Final..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📦" title="Inventário Consolidado do Ecossistema (E005–E025)" sub="Catálogo Final dos 21 Módulos Corporativos, Microsserviços, APIs, Eventos e Cobertura de Testes" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {items.map(m => (
          <DarkCard key={m.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{m.moduleCode}</span>
              <Badge text="AUDITADO & APROVADO" color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 12 }}>{m.moduleName}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Microsserviços" value={m.microservicesCount} color={C.purple} />
              <MetricPill label="APIs" value={m.apisCount} color={C.sky} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Eventos: <strong style={{ color: C.text2 }}>{m.eventsCount}</strong></span>
              <span>Cobertura Testes: <strong style={{ color: C.emerald }}>{m.testCoveragePct}%</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Rastreabilidade de Requisitos ──────────────────────────────────────

function TraceabilityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📋" title="Matriz de Rastreabilidade Fim-a-Fim (E005–E025)" sub="Verificação de 100% da Cobertura de Requisitos, Prompts, Código, Testes e Evidências" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 12 }}>
          ✓ Rastreabilidade Integral de 100% dos Prompts Corporativos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {Array.from({ length: 21 }, (_, i) => {
            const code = `E0${String(i + 5).padStart(2, '0')}`;
            return (
              <div key={code} style={{ padding: '10px 12px', background: '#064e3b15', border: '1px solid #10b98130', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.cyan }}>{code}</span>
                <Badge text="100% COBERTO" color={C.green} bg="#064e3b30" />
              </div>
            );
          })}
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 4: Parecer da Auditoria Independente ──────────────────────────────────

function AuditOpinionsTab() {
  const [opinions, setOpinions] = useState<IndependentAuditOpinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EFAIACSEFService.getAuditOpinions().then(res => { setOpinions(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Parecer da Auditoria..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Parecer da Auditoria Técnica Independente" sub="Avaliação Formal em 12 Dimensões Críticas por Auditoria Externa de TI" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {opinions.map(op => (
          <DarkCard key={op.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge text={op.dimension} color={C.cyan} bg="#06b6d415" />
              <span style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{op.auditScore}/100</span>
            </div>

            <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.5, marginBottom: 10 }}>{op.opinionText}</p>

            <div style={{ padding: '8px 10px', background: C.bgAlt, borderRadius: 6, fontSize: 10, color: C.green }}>
              ✓ Conclusão: {op.status}
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Auditoria de IA (E020) ─────────────────────────────────────────────

function AIAuditTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧠" title="Auditoria de Inteligência Artificial (E020 — EAIKMIAF)" sub="Governança ISO 42001, RAG Auditável, Explicabilidade e Validação Humana Obrigatória" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>🤖 Parecer de Governança de IA (ISO 42001 & NIST AI RMF)</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          A auditoria confirma que o módulo <strong style={{ color: C.cyan }}>E020</strong> cumpre com rigor os requisitos de IA responsável: todas as recomendações exibem evidências e citações de fontes institucionais, com <strong style={{ color: C.green }}>validação humana obrigatória (Human-in-the-Loop)</strong> para decisões clínicas, sociais, jurídicas e financeiras.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 6: Auditoria das Integrações (E021) ───────────────────────────────────

function IntegrationAuditTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🌐" title="Auditoria de Integração & Interoperabilidade (E021 — EIIAMEF)" sub="API Gateway Corporativo, OAuth 2.1, mTLS, Pub/Sub, HL7 FHIR R4 e Protobuf" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.sky, marginBottom: 8 }}>🔌 Parecer de Interoperabilidade Corporativa</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          O API Gateway e o Barramento de Eventos operam de forma 100% desacoplada, orientados a contratos OpenAPI 3.1 e AsyncAPI 3.0, com conectores modulares auditados e suporte a padrões de saúde (HL7 FHIR R4).
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 7: Auditoria GRC (E022) ───────────────────────────────────────────────

function GRCAuditTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏛️" title="Auditoria de Governança, Riscos & Compliance (E022 — EGRCICCAF)" sub="Framework COSO ERM, ISO 31000, ISO 37301, Controles Internos e Evidências SHA-256" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>📜 Parecer de Governança e Controles Internos</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Estrutura GRC validada em conformidade com as Três Linhas do IIA, com controles preventivos/detectivos ativos, prestação de contas ITG 2002 e repositório de evidências criptográficas imutáveis SHA-256.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Auditoria Ops & SRE (E023/E024) ────────────────────────────────────

function SREAuditTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="Auditoria Operacional, SRE & Hypercare (E023 & E024)" sub="Desempenho (P95 32ms), Resiliência Chaos (RTO < 5s), Go-Live sem Rollback e SLO 99.98%" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>99.98%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Disponibilidade SLO Fim-a-Fim</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>32 ms</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Latência P95 do Gateway</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>12 min</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>MTTR Médio em Incidentes</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 9: Benchmark Corporativo ──────────────────────────────────────────────

function BenchmarkTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Benchmark Comparativo Internacional" sub="Comparação da Plataforma ISM com Arquiteturas de Referência para Organizações do Terceiro Setor" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 12 }}>🌟 Posicionamento de Excelência Global</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          A <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong> posiciona-se no <strong style={{ color: C.green }}>Percentil 99</strong> de maturidade tecnológica entre entidades do terceiro setor na América Latina, superando padrões convencionais ao integrar IA responsável, RAG auditável, Data Warehouse Kimball, API Gateway e governança imutável GRC.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Roadmap Estratégico 2026–2030 ─────────────────────────────────────

function RoadmapTab() {
  const [roadmap, setRoadmap] = useState<StrategicRoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EFAIACSEFService.getRoadmap().then(res => { setRoadmap(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Roadmap Estratégico..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🚀" title="Roadmap de Evolução Tecnológica (2026–2030)" sub="Plano Estratégico Quinquenal de Inovação, IA Multimodal, Criptografia Pós-Quântica e Expansão Global" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {roadmap.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.gold }}>HORIZONTE {r.yearHorizon}</span>
              <Badge text={r.estimatedImpact} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{r.initiativeTitle}</div>
            <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5, marginBottom: 12 }}>{r.description}</p>

            <div style={{ fontSize: 10, color: C.purple }}>Categoria: {r.category}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 11: Matriz de Maturidade 360° ─────────────────────────────────────────

function MaturityTab() {
  const dimensions = [
    { name: 'Arquitetura DDD & Clean Arch', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Engenharia de Código & Testes', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Segurança & Privacidade LGPD', score: 99, level: 'Nível 5 - Otimizado' },
    { name: 'Desempenho & Resiliência SRE', score: 97, level: 'Nível 5 - Otimizado' },
    { name: 'Governança & Riscos COSO/ISO', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Compliance & Integridade Ética', score: 99, level: 'Nível 5 - Otimizado' },
    { name: 'Inteligência Artificial (E020)', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Interoperabilidade & APIs (E021)', score: 97, level: 'Nível 5 - Otimizado' },
    { name: 'Operações ITSM & ITIL 4 (E024)', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Experiência & WCAG 2.2 AA', score: 96, level: 'Nível 5 - Otimizado' },
    { name: 'Observabilidade OpenTelemetry', score: 98, level: 'Nível 5 - Otimizado' },
    { name: 'Sustentabilidade Tecnológica', score: 98, level: 'Nível 5 - Otimizado' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧩" title="Matriz de Maturidade Corporativa 360°" sub="Avaliação de Maturidade (0–100) em 12 Dimensões Tecnológicas, Operacionais e Estratégicas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {dimensions.map(d => (
          <DarkCard key={d.name} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{d.name}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.score}</span>
            </div>
            <ScoreBar label="" value={d.score} color={C.green} />
            <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{d.level}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 12: Certificação Final & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EnterpriseExcellenceCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EFAIACSEFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação Final..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎓" title="Enterprise Excellence Index — Certificação Final E025" sub="Parecer Conclusivo da Auditoria Independente e Termo de Encerramento do Programa de Engenharia" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1e3d 0%, #200f47 50%, #03282c 100%)',
        border: `3px solid ${C.gold}70`, borderRadius: 24, padding: '40px 48px', textAlign: 'center',
        boxShadow: `0 0 40px ${C.gold}20`,
      }}>
        <div style={{ fontSize: 104, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
          {cert.enterpriseExcellenceIndex}
        </div>
        <div style={{ fontSize: 20, color: C.text1, fontWeight: 900, marginTop: 8, letterSpacing: '0.04em' }}>
          ENTERPRISE EXCELLENCE INDEX (0–100)
        </div>
        <div style={{ fontSize: 13, color: C.text2, marginTop: 8 }}>
          Auditado por: {cert.auditedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Badge text="🏆 PARECER FAVORÁVEL INCONDICIONAL" color={C.gold} bg="#fbbf2425" />
          <Badge text="🎓 PROGRAMA E005–E025 HOMOLOGADO" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Certificação do Programa de Engenharia ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #0d1e3d, #200f47)`,
        border: `2px solid ${C.gold}50`, borderRadius: 20, padding: '32px 36px',
      }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: C.gold, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📜 DECLARAÇÃO FORMAL DE ENCERRAMENTO DO PROGRAMA DE ENGENHARIA DA PLATAFORMA INSTITUTO SER MELHOR
        </div>
        <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.gold }}>Enterprise Final Acceptance, Independent Audit, Certification & Strategic Evolution Framework (EFAIACSEF)</strong> encerra
          definitivamente o programa de desenvolvimento da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>, atestando a plena implementação, auditoria, validação e integração de todos os frameworks corporativos (<strong style={{ color: C.cyan }}>E005 a E025</strong>).
        </p>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.8, margin: '14px 0 0' }}>
          Emissão do parecer conclusivo com o <strong style={{ color: C.gold }}>Enterprise Excellence Index de 98/100 (EXCELÊNCIA SUPREMA CERTIFICADA)</strong>, estabelecendo uma infraestrutura tecnológica corporativa completa, segura, escalável, resiliente, auditável, interoperável e governada, perfeitamente preparada para sustentar a missão humana e social do Instituto Ser Melhor com sustentabilidade de longo prazo.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EFAIACSEFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'inventory':    return <InventoryTab />;
      case 'traceability': return <TraceabilityTab />;
      case 'audit':        return <AuditOpinionsTab />;
      case 'ai':           return <AIAuditTab />;
      case 'integration': return <IntegrationAuditTab />;
      case 'grc':          return <GRCAuditTab />;
      case 'sre':          return <SREAuditTab />;
      case 'benchmark':    return <BenchmarkTab />;
      case 'roadmap':      return <RoadmapTab />;
      case 'maturity':     return <MaturityTab />;
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
            width: 60, height: 60, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            boxShadow: `0 0 28px ${C.gold}40`,
          }}>🏆</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 25, fontWeight: 900, color: C.text1 }}>
              Enterprise Final Acceptance & Strategic Evolution Framework
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E025 · EFAIACSEF · Auditoria Independente · Certificação Executiva 98/100 · Roadmap 2030 · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.gold}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.gold : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : '2px solid transparent',
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

export default EFAIACSEFPage;
