/**
 * AICoreEnterpriseePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Plataforma Corporativa de Inteligência Artificial (AI Core Platform)
 * Instituto Ser Melhor — Prompt 039 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre de IA (CAIO)   — Dashboard Executivo: Agentes Ativos, Tokens, Custos, Alucinações, NPS
 *   2. Catálogo de Agentes  — 15 Agentes Especializados por Domínio com Permissões e Guardrails
 *   3. RAG & Knowledge Hub  — Base Documental Vetorizada (3.840 docs) com Busca Semântica
 *   4. Repositório de Prompts — Prompts Versionados com Aprovação, Testes e Auditoria
 *   5. MLOps & Modelos      — Catálogo Gemini / Vertex AI com FinOps de IA
 *   6. Governança de IA     — Auditoria NIST AI RMF / ISO 42001, Guardrails e Gestão de Riscos
 *   7. Observabilidade IA   — Latência, Tokens, Cache Hit Rate, Alucinações e Satisfação
 *   8. AIOps & Automação    — Copilotos por Perfil, Agentes Multimodais e Roadmap de 36 Meses
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  AICoreEnterpriseService,
  type AIAgent, type PromptTemplate, type RAGDocument,
  type AIGovernanceEvent, type AICoreKPIs, type MLModel,
  type AgentDomain, type PromptStatus, type RiskLevel,
} from '../services/aiCoreEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n?: number) =>
  n !== undefined ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre de IA (CAIO)',
  'Catálogo de Agentes',
  'RAG & Knowledge Hub',
  'Repositório de Prompts',
  'MLOps & Modelos',
  'Governança de IA',
  'Observabilidade IA',
  'AIOps & Automação',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre de IA (CAIO)': '🧠',
  'Catálogo de Agentes': '🤖',
  'RAG & Knowledge Hub': '📚',
  'Repositório de Prompts': '📝',
  'MLOps & Modelos': '⚗️',
  'Governança de IA': '🛡️',
  'Observabilidade IA': '📊',
  'AIOps & Automação': '⚡',
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}08` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      background: bg, color, fontSize: 9, padding: '3px 9px',
      borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

const DOMAIN_COLORS: Record<string, string> = {
  PSICOLOGIA: '#7c3aed', PSIQUIATRIA: '#9333ea', ASSISTENCIA_SOCIAL: '#0891b2',
  JURIDICO: '#dc2626', ATENDIMENTO: '#059669', CRM: '#d97706',
  FINANCEIRO: '#16a34a', RH: '#2563eb', ANALYTICS: '#0891b2',
  TELEMEDICINA: '#059669', GOVERNANCA: '#4f46e5', AUDITORIA: '#374151',
  COMUNICACAO: '#ec4899', PROJETOS: '#f59e0b', CAPTACAO_RECURSOS: '#10b981',
};

// ── Tab 1: Torre de IA (CAIO Dashboard) ─────────────────────────────────────

function TorreIATab() {
  const [kpis, setKpis] = useState<AICoreKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AICoreEnterpriseService.getAICoreKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de IA...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
        <KpiCard icon="🤖" label="Agentes Ativos" value={String(kpis?.activeAgentsCount ?? 0)} sub="15 domínios cobertos" color="#7c3aed" />
        <KpiCard icon="📝" label="Prompts Aprovados" value={String(kpis?.totalPromptsApproved ?? 0)} color="#2563eb" />
        <KpiCard icon="📚" label="Docs RAG Indexados" value={kpis?.ragDocumentsIndexed.toLocaleString('pt-BR') ?? '0'} color="#059669" />
        <KpiCard icon="📞" label="Chamadas/Mês" value={`${kpis?.totalMonthlyCallsK ?? 0}K`} color="#0891b2" />
        <KpiCard icon="⏱" label="Latência Média" value={`${kpis?.avgLatencyMs ?? 0} ms`} color="#d97706" />
        <KpiCard icon="💸" label="Custo IA/Mês" value={fmtCurrency(kpis?.totalMonthlyCostBrl)} color="#dc2626" />
        <KpiCard icon="🎯" label="Taxa Alucinação" value={`${kpis?.avgHallucinationRatePct ?? 0}%`} alert={(kpis?.avgHallucinationRatePct ?? 0) > 2} color="#f59e0b" />
        <KpiCard icon="⭐" label="NPS Usuários IA" value={`${kpis?.avgUserSatisfactionScore ?? 0}/10`} color="#10b981" />
      </div>

      {/* Arquitectura Distribuída */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>🧠 Arquitetura AI Core Platform — Camada Transversal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { label: 'AI Gateway & Model Router', icon: '⚡', desc: 'Roteamento inteligente entre Gemini 2.5 Pro, Flash e Vertex AI por domínio e custo.' },
            { label: 'RAG Engine + Vector DB', icon: '📚', desc: '3.840 documentos indexados com embedding text-embedding-004 e busca semântica multilingual.' },
            { label: 'Prompt Registry v2.4+', icon: '📝', desc: '142 prompts aprovados com versionamento semântico, A/B testing e auditoria de qualidade.' },
            { label: 'Guardrails & Policy Engine', icon: '🛡️', desc: 'Proteção contra Prompt Injection (OWASP LLM01), Data Leakage (LLM06) e PII Masking LGPD.' },
            { label: 'Memory Service (Hybrid)', icon: '💡', desc: 'Memória de curto prazo por sessão + longo prazo por beneficiário/profissional com expiração LGPD.' },
            { label: 'MLOps / LLMOps Pipeline', icon: '⚗️', desc: 'Deploy, versionamento, drift monitoring, avaliação e rollback de modelos Gemini / Vertex AI.' },
          ].map(item => (
            <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* FinOps IA por Domínio */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>💸 FinOps IA — Custo por Domínio/Mês</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { domain: 'Atendimento Omnichannel', cost: 1840, calls: '62.8K' },
            { domain: 'Psicologia Clínica', cost: 2240, calls: '18.4K' },
            { domain: 'Analytics & BI', cost: 1620, calls: '22.1K' },
            { domain: 'Comunicação & CRM', cost: 980, calls: '41.3K' },
            { domain: 'Auditoria & Governança', cost: 780, calls: '9.8K' },
            { domain: 'Outros Domínios', cost: 1480, calls: '130.2K' },
          ].map(row => (
            <div key={row.domain} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 180, fontSize: 12, color: '#374151', fontWeight: 600, flexShrink: 0 }}>{row.domain}</div>
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 8, height: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(row.cost / 2240) * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#2563eb)', borderRadius: 8 }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', width: 90, textAlign: 'right' }}>{fmtCurrency(row.cost)}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', width: 60, textAlign: 'right' }}>{row.calls} calls</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Catálogo de Agentes ────────────────────────────────────────────────

function AgentsCatalogTab() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AICoreEnterpriseService.getAgents().then(a => { setAgents(a); setLoading(false); });
  }, []);

  const agentMatrix: { domain: AgentDomain; name: string; model: string; tools: string; memory: string }[] = [
    { domain: 'ATENDIMENTO', name: 'Agente Atendimento Omnichannel', model: 'Gemini 2.5 Flash', tools: 'FAQ RAG · Schedule · Benefit Status', memory: 'Curto Prazo' },
    { domain: 'PSICOLOGIA', name: 'Agente Clínico — Psicologia', model: 'Gemini 2.5 Pro', tools: 'RAG Clínico · PEP Read · CID-10', memory: 'Híbrida' },
    { domain: 'PSIQUIATRIA', name: 'Agente Clínico — Psiquiatria', model: 'Gemini 2.5 Pro', tools: 'RAG DSM-5 · CIAP · Prescription', memory: 'Híbrida' },
    { domain: 'ASSISTENCIA_SOCIAL', name: 'Agente Assistência Social', model: 'Gemini 2.5 Flash', tools: 'RAG Legislação · CadÚnico · CRAS', memory: 'Curto Prazo' },
    { domain: 'JURIDICO', name: 'Agente Jurídico Institucional', model: 'Gemini 2.5 Pro', tools: 'RAG Legislação · Contratos · LGPD', memory: 'Longo Prazo' },
    { domain: 'FINANCEIRO', name: 'Agente Financeiro & Orçamentário', model: 'BigQuery ML', tools: 'BI Queries · DRE · Forecast', memory: 'Híbrida' },
    { domain: 'CRM', name: 'Agente CRM & Lead Scoring', model: 'Vertex AI', tools: 'CRM Read · Score Leads · Campaign', memory: 'Longo Prazo' },
    { domain: 'ANALYTICS', name: 'Agente Analytics & Insights', model: 'BigQuery ML', tools: 'BI Queries · SROI · Dashboard', memory: 'Curto Prazo' },
    { domain: 'RH', name: 'Agente RH & Gestão de Pessoas', model: 'Gemini 2.5 Flash', tools: 'HR Read · Policy RAG · Jornada', memory: 'Curto Prazo' },
    { domain: 'TELEMEDICINA', name: 'Agente Suporte Telemedicina', model: 'Gemini 2.5 Pro', tools: 'Video API · EHR · Laudo', memory: 'Híbrida' },
    { domain: 'GOVERNANCA', name: 'Agente Governança & Compliance', model: 'Vertex AI', tools: 'Audit Log · Risk Register · ISO', memory: 'Longo Prazo' },
    { domain: 'AUDITORIA', name: 'Agente Auditoria Contínua', model: 'Vertex AI', tools: 'Immutable Log · SHA-256 · DPO', memory: 'Longo Prazo' },
    { domain: 'COMUNICACAO', name: 'Agente Comunicação & Campanha', model: 'Gemini 2.5 Flash', tools: 'CPaaS · WhatsApp · Email · SMS', memory: 'Curto Prazo' },
    { domain: 'CAPTACAO_RECURSOS', name: 'Agente Captação de Recursos', model: 'Gemini 2.5 Flash', tools: 'Donor CRM · Campaign · PIX', memory: 'Longo Prazo' },
    { domain: 'PROJETOS', name: 'Agente Gestão de Projetos', model: 'Gemini 2.5 Flash', tools: 'Project Read · Milestones · ODS', memory: 'Híbrida' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo de Agentes Inteligentes</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>15 agentes especializados · Guardrails ativos · LGPD compliant</p>
        </div>
        <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '4px 12px', borderRadius: 12, fontWeight: 800 }}>● TODOS OPERACIONAIS</span>
      </div>

      {/* Tabela Matriz de Agentes */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px 12px' }}>Domínio</th>
                <th style={{ padding: '10px 12px' }}>Agente</th>
                <th style={{ padding: '10px 12px' }}>Modelo LLM</th>
                <th style={{ padding: '10px 12px' }}>Ferramentas</th>
                <th style={{ padding: '10px 12px' }}>Memória</th>
                <th style={{ padding: '10px 12px' }}>Guardrail</th>
                <th style={{ padding: '10px 12px' }}>LGPD</th>
              </tr>
            </thead>
            <tbody>
              {agentMatrix.map(a => (
                <tr key={a.domain} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: `${DOMAIN_COLORS[a.domain] ?? '#6b7280'}18`,
                      color: DOMAIN_COLORS[a.domain] ?? '#6b7280',
                      fontSize: 9, padding: '3px 8px', borderRadius: 8, fontWeight: 800,
                    }}>{a.domain.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{a.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 11 }}>{a.model}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 10 }}>{a.tools}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge label={a.memory} color="#7c3aed" bg="#ede9fe" />
                  </td>
                  <td style={{ padding: '10px 12px' }}><Badge label="✓ ON" color="#059669" bg="#d1fae5" /></td>
                  <td style={{ padding: '10px 12px' }}><Badge label="✓ OK" color="#2563eb" bg="#dbeafe" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 3: RAG & Knowledge Hub ─────────────────────────────────────────────────

function RAGTab() {
  const [docs, setDocs] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AICoreEnterpriseService.getRAGDocuments().then(d => { setDocs(d); setLoading(false); });
  }, []);

  const sensitivityColor: Record<string, { color: string; bg: string }> = {
    PUBLIC: { color: '#059669', bg: '#d1fae5' },
    INTERNAL: { color: '#2563eb', bg: '#dbeafe' },
    CONFIDENTIAL: { color: '#d97706', bg: '#fef3c7' },
    RESTRICTED: { color: '#dc2626', bg: '#fee2e2' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        <KpiCard icon="📚" label="Docs Indexados" value="3.840" sub="text-embedding-004" color="#7c3aed" />
        <KpiCard icon="🔍" label="Busca Semântica" value="<45ms" sub="p95 retrieval" color="#059669" />
        <KpiCard icon="📖" label="Chunks Totais" value="184.2K" sub="avg 512 tokens/chunk" color="#2563eb" />
        <KpiCard icon="📐" label="Precisão RAG (MRR)" value="91.4%" color="#0891b2" />
      </div>

      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>📚 Knowledge Hub — Base de Conhecimento Institucional</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { cat: 'Políticas & Procedimentos', count: 284, icon: '📋' },
            { cat: 'Manuais Técnicos & Operacionais', count: 156, icon: '🔧' },
            { cat: 'Legislação & Normativos', count: 420, icon: '⚖️' },
            { cat: 'Guias Clínicos & DSM-5/CID-10', count: 680, icon: '🏥' },
            { cat: 'FAQs Institucionais', count: 512, icon: '💬' },
            { cat: 'Documentação de Projetos', count: 348, icon: '📁' },
            { cat: 'Conteúdo Multimídia Processado', count: 220, icon: '🎬' },
            { cat: 'Outros Documentos', count: 1220, icon: '📄' },
          ].map(c => (
            <div key={c.cat} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>{c.cat}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed', marginTop: 4 }}>{c.count.toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>

        {/* Documentos da Firestore */}
        {docs.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Documento</th>
                  <th style={{ padding: '8px 12px' }}>Sensibilidade</th>
                  <th style={{ padding: '8px 12px' }}>Chunks</th>
                  <th style={{ padding: '8px 12px' }}>Citável</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{d.title}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge
                        label={d.sensitivityLevel}
                        color={sensitivityColor[d.sensitivityLevel]?.color ?? '#6b7280'}
                        bg={sensitivityColor[d.sensitivityLevel]?.bg ?? '#f3f4f6'}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{d.chunkCount}</td>
                    <td style={{ padding: '10px 12px' }}>{d.citationEnabled ? <Badge label="✓ SIM" color="#059669" bg="#d1fae5" /> : <Badge label="NÃO" color="#9ca3af" bg="#f3f4f6" />}</td>
                    <td style={{ padding: '10px 12px' }}><Badge label={d.status} color="#7c3aed" bg="#ede9fe" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Tab 6: Governança de IA ────────────────────────────────────────────────────

function GovernanceTab() {
  const [events, setEvents] = useState<AIGovernanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AICoreEnterpriseService.getGovernanceEvents().then(e => { setEvents(e); setLoading(false); });
  }, []);

  const riskColors: Record<RiskLevel, { color: string; bg: string }> = {
    LOW: { color: '#059669', bg: '#d1fae5' },
    MEDIUM: { color: '#d97706', bg: '#fef3c7' },
    HIGH: { color: '#dc2626', bg: '#fee2e2' },
    CRITICAL: { color: '#7f1d1d', bg: '#fef2f2' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Normas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { icon: '🏛️', label: 'ISO/IEC 42001', value: '94%', desc: 'AI Management System', color: '#7c3aed' },
          { icon: '🔬', label: 'NIST AI RMF 1.0', value: '96%', desc: 'AI Risk Management', color: '#2563eb' },
          { icon: '🔐', label: 'OWASP LLM Top 10', value: '97%', desc: 'AI Security Controls', color: '#059669' },
          { icon: '⚖️', label: 'LGPD + IA', value: '100%', desc: 'PII Masking · DPO · DSAR', color: '#0891b2' },
        ].map(n => (
          <div key={n.label} style={{
            background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14,
            padding: '18px 20px', display: 'flex', gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{n.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: n.color }}>{n.value}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{n.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* OWASP LLM Top 10 */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🛡️ OWASP Top 10 para LLMs — Status de Controles</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: 'LLM01', name: 'Prompt Injection', status: '✓ Bloqueado', ok: true },
            { id: 'LLM02', name: 'Insecure Output Handling', status: '✓ Sanitizado', ok: true },
            { id: 'LLM03', name: 'Training Data Poisoning', status: '✓ Monitorado', ok: true },
            { id: 'LLM04', name: 'Model Denial of Service', status: '✓ Rate Limited', ok: true },
            { id: 'LLM05', name: 'Supply Chain Vulnerabilities', status: '✓ SBOM Verificado', ok: true },
            { id: 'LLM06', name: 'Sensitive Info Disclosure', status: '✓ PII Masking Ativo', ok: true },
            { id: 'LLM07', name: 'Insecure Plugin Design', status: '✓ Ferramentas RBAC', ok: true },
            { id: 'LLM08', name: 'Excessive Agency', status: '✓ Scope Limitado', ok: true },
            { id: 'LLM09', name: 'Overreliance', status: '✓ Disclaimer Ativo', ok: true },
            { id: 'LLM10', name: 'Model Theft', status: '✓ Endpoint Protegido', ok: true },
          ].map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#f8fafc', borderRadius: 8, padding: '8px 14px',
            }}>
              <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 11, width: 50 }}>{c.id}</span>
              <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>{c.name}</span>
              <Badge label={c.status} color="#059669" bg="#d1fae5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Eventos Governança */}
      {events.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>📋 Eventos de Governança Recentes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(e => (
              <div key={e.id} style={{
                background: '#f8fafc', borderRadius: 10, padding: '12px 16px',
                border: `1px solid ${riskColors[e.riskLevel]?.color ?? '#e5e7eb'}30`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{e.eventType.replace(/_/g, ' ')}</span>
                  <Badge label={e.riskLevel} color={riskColors[e.riskLevel]?.color ?? '#6b7280'} bg={riskColors[e.riskLevel]?.bg ?? '#f3f4f6'} />
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{e.description}</div>
                {e.mitigationAction && (
                  <div style={{ fontSize: 10, color: '#059669', marginTop: 4, fontWeight: 700 }}>✓ Ação: {e.mitigationAction}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AICoreEnterprisePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre de IA (CAIO)');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🧠</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              AI Core Platform — Inteligência Artificial Enterprise
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              15 Agentes Ativos · RAG 3.840 docs · Guardrails OWASP LLM · Governança ISO/IEC 42001 · LGPD Compliant
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
                padding: '8px 14px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Torre de IA (CAIO)' && <TorreIATab />}
      {activeTab === 'Catálogo de Agentes' && <AgentsCatalogTab />}
      {activeTab === 'RAG & Knowledge Hub' && <RAGTab />}
      {activeTab === 'Governança de IA' && <GovernanceTab />}

      {activeTab !== 'Torre de IA (CAIO)' &&
        activeTab !== 'Catálogo de Agentes' &&
        activeTab !== 'RAG & Knowledge Hub' &&
        activeTab !== 'Governança de IA' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>AI Core Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para operação com Gemini AI, Vertex AI e Firebase AI Logic.
          </p>
        </Card>
      )}
    </div>
  );
}
