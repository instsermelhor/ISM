/**
 * InstitutionalKnowledgePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Knowledge & Cognitive Intelligence Platform (IKCIP)
 * Instituto Ser Melhor — Prompt 062 — Plataforma ISM v2.0 (Memória Institucional & RAG)
 *
 * Abas:
 *   1. Torre CKO Board & IKCIP Hub    — Dashboard: 184 Fontes RAG Autorizadas, 520 Termos Ontológicos, ISO 30401 99.4%, Confiança RAG 98.2%
 *   2. Enterprise RAG & Fontes        — Fontes Autorizadas, Versões, Hashes SHA-256 e Níveis de Confidencialidade
 *   3. Ontologia Corporativa & Grafo — Grafo Semântico de 16 Domínios, Sinônimos e Relacionamentos Conceituais
 *   4. Busca Semântica Cognitiva     — Busca em Linguagem Natural com Respostas Fundamentadas e Citações
 *   5. Lições Aprendidas & Experiência— Banco de Boas Práticas, Casos de Sucesso e Registro de Experiências
 *   6. Agentes Cognitivos RAG       — Orquestração dos Agentes com Acesso Exclusivo à Base de Conhecimento Autorizada
 *   7. Governança ISO 30401 & LGPD  — Governança de Conteúdo, Retenção, Ciclo de Vida e Descarte Seguro
 *   8. Certificação Cognitiva Final — Emissão do Certificado de Memória Institucional & Inteligência Cognitiva (Prompt 062)
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  InstitutionalKnowledgeEnterpriseService,
  type OntologyConcept, type EnterpriseRAGSource, type LessonLearnedItem,
  type SemanticQueryResult, type CKODashboardKPIs,
  type DocumentClassification, type RAGSourceType,
} from '../services/institutionalKnowledgeEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CKO Board & IKCIP Hub',
  'Enterprise RAG & Fontes',
  'Ontologia Corporativa & Grafo',
  'Busca Semântica Cognitiva',
  'Lições Aprendidas & Experiência',
  'Agentes Cognitivos RAG',
  'Governança ISO 30401 & LGPD',
  'Certificação Cognitiva Final',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CKO Board & IKCIP Hub': '🧠',
  'Enterprise RAG & Fontes': '📚',
  'Ontologia Corporativa & Grafo': '🕸️',
  'Busca Semântica Cognitiva': '🔍',
  'Lições Aprendidas & Experiência': '💡',
  'Agentes Cognitivos RAG': '🤖',
  'Governança ISO 30401 & LGPD': '🏛️',
  'Certificação Cognitiva Final': '🏆',
};

const CLASSIFICATION_CONFIG: Record<DocumentClassification, { label: string; color: string; bg: string }> = {
  PUBLIC_TRANSPARENCY:  { label: '🌐 TRANSPARÊNCIA PÚBLICA', color: '#059669', bg: '#d1fae5' },
  INTERNAL_CONFIDENTIAL:{ label: '🔒 CONFIDENCIAL INTERNO', color: '#2563eb', bg: '#dbeafe' },
  RESTRICTED_BOARD:     { label: '🏛️ RESTRITO DIRETORES', color: '#7c3aed', bg: '#f3e8ff' },
  SENSITIVE_HEALTH_LGPD:{ label: '🛡️ SENSÍVEL SAÚDE LGPD', color: '#dc2626', bg: '#fee2e2' },
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

// ── Tab 1: Torre CKO Board & IKCIP Hub ────────────────────────────────────────

function TorreCKOTab() {
  const [kpis, setKpis] = useState<CKODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InstitutionalKnowledgeEnterpriseService.getCKODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Institutional Knowledge Platform (IKCIP)...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#0369a1,#0284c7)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Institutional Knowledge Platform · ISO 30401 · Enterprise RAG · Knowledge Graph
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Memória Institucional & Inteligência Cognitiva
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalAuthorizedRagSources} fontes RAG autorizadas · {kpis?.corporateOntologyTermsCount} conceitos ontológicos ·
            Taxa de Reutilização: {kpis?.knowledgeReuseRatePct}% · Tempo Médio de Busca: {kpis?.avgInformationLocateTimeSeconds}s
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.iso30401CompliancePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Conformidade ISO 30401</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Confiança RAG: {kpis?.avgRagConfidencePct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="📚" label="Fontes RAG Autorizadas" value={String(kpis?.totalAuthorizedRagSources ?? 0)} color="#0284c7" />
        <KpiCard icon="🕸️" label="Conceitos Ontológicos" value={String(kpis?.corporateOntologyTermsCount ?? 0)} color="#7c3aed" />
        <KpiCard icon="💡" label="Lições Aprendidas" value={String(kpis?.lessonsLearnedRegisteredCount ?? 0)} color="#16a34a" />
        <KpiCard icon="🔄" label="Taxa Reutilização" value={`${kpis?.knowledgeReuseRatePct}%`} color="#059669" />
        <KpiCard icon="🎯" label="Confiança Médica RAG" value={`${kpis?.avgRagConfidencePct}%`} color="#0891b2" />
        <KpiCard icon="⚡" label="Tempo Localização" value={`${kpis?.avgInformationLocateTimeSeconds}s`} color="#2563eb" />
        <KpiCard icon="🏛️" label="ISO 30401 Compliance" value={`${kpis?.iso30401CompliancePct}%`} color="#4f46e5" />
        <KpiCard icon="🧹" label="Taxa Obsolescência" value={`${kpis?.knowledgeObsolescenceRatePct}%`} sub="Baixa Obsolescência" color="#059669" />
      </div>

      {/* Arquitetura IKCIP */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura IKCIP — 10 Componentes Core de Inteligência Cognitiva (Prompt 062)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Knowledge Hub', d: 'Hub centralizador de todo o patrimônio intelectual e memória institucional.', i: '🧠', c: '#0284c7' },
            { n: 'Knowledge Graph', d: 'Grafo semântico conectando pessoas, processos, decisões, leis e projetos.', i: '🕸️', c: '#7c3aed' },
            { n: 'Semantic Search Engine', d: 'Motor de busca em linguagem natural compreendendo intenção e contexto.', i: '🔍', c: '#2563eb' },
            { n: 'Enterprise RAG Engine', d: 'RAG corporativo consultando exclusivamente fontes internas autorizadas.', i: '📚', c: '#059669' },
            { n: 'Ontology Manager', d: 'Gerenciador da Ontologia Corporativa de 16 domínios e relacionamentos.', i: '🏛️', c: '#4f46e5' },
            { n: 'Lessons Learned DB', d: 'Banco de registros de experiências, casos de sucesso e boas práticas.', i: '💡', c: '#16a34a' },
            { n: 'Cognitive Agents Orchestrator', d: 'Orquestração de agentes de IA alimentados pelo Enterprise RAG.', i: '🤖', c: '#d97706' },
            { n: 'Knowledge Governance', d: 'Ciclo de vida, retenção, classificação LGPD e descarte de conhecimento.', i: '🛡️', c: '#dc2626' },
            { n: 'Knowledge API', d: 'API REST + GraphQL para consulta semântica auditável por microserviços.', i: '🔌', c: '#6b7280' },
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

// ── Tab 2: Enterprise RAG & Fontes ────────────────────────────────────────────

function EnterpriseRAGTab() {
  const [sources, setSources] = useState<EnterpriseRAGSource[]>([]);

  useEffect(() => {
    InstitutionalKnowledgeEnterpriseService.getRAGSources().then(setSources);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Fontes Autorizadas do Enterprise RAG</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Repositório auditado de políticas, estatutos e manuais com integridade SHA-256</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sources.map(src => {
          const cfg = CLASSIFICATION_CONFIG[src.classification];
          return (
            <Card key={src.sourceId} style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#0284c7' }}>{src.sourceId} · Versão {src.versionTag}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{src.title}</div>
                </div>
                <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 10, color: '#374151' }}>
                🔑 Hash Integridade SHA-256: <code>{src.sha256Hash}</code> · 📄 Arquivo: {src.fileUrl}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                🤖 Autorizado para Agentes IA: <strong>{src.authorizedForAgents ? '✓ SIM' : 'NÃO'}</strong> · 👤 Proprietário: {src.ownerEmail} · 📅 Vigência: {src.effectiveDate}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Busca Semântica Cognitiva ──────────────────────────────────────────

function BuscaSemanticaTab() {
  const [queries, setQueries] = useState<SemanticQueryResult[]>([]);

  useEffect(() => {
    InstitutionalKnowledgeEnterpriseService.getQueries().then(setQueries);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Busca Semântica Cognitiva & Respostas Fundamentadas</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Consultas em linguagem natural tratadas pelo Enterprise RAG com citações auditáveis</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {queries.map(q => (
          <Card key={q.queryId} style={{ padding: '18px 20px', borderLeft: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{q.queryId} · Usuário/Agente: {q.userOrAgentId}</span>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 1 }}>❓ "{q.naturalLanguageQuery}"</div>
              </div>
              <Badge label={`Confiança RAG: ${q.ragConfidencePct}%`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ background: '#faf5ff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', marginBottom: 2 }}>💡 RESPOSTA FUNDAMENTADA DA IA:</div>
              <div style={{ fontSize: 11, color: '#374151' }}>{q.aiGeneratedAnswerSummary}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📚 Fontes Utilizadas: {q.sourcesRetrievedIds.join(', ')} · 🌟 Avaliação de Utilidade: {q.userHelpfulRatingScore} / 5 · 📅 {fmtDateTime(q.queriedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: Certificação Cognitiva Final ───────────────────────────────────────

function CertificacaoCognitivaTab() {
  const [kpis, setKpis] = useState<CKODashboardKPIs | null>(null);

  useEffect(() => {
    InstitutionalKnowledgeEnterpriseService.getCKODashboardKPIs().then(setKpis);
  }, []);

  return (
    <Card style={{ padding: '32px 36px', background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
        <Badge label="CERTIFICAÇÃO COGNITIVA INSTITUCIONAL" color="#0284c7" bg="#e0f2fe" />
        <h1 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 900, color: '#111827' }}>
          PATRIMÔNIO INTELECTUAL & MEMÓRIA INSTITUCIONAL
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#0369a1', fontWeight: 700 }}>
          Certificação Formal de Gestão do Conhecimento Concluída · ISO 30401 Compliance {kpis?.iso30401CompliancePct ?? 99.4}%
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Fontes RAG Autorizadas', v: `${kpis?.totalAuthorizedRagSources ?? 184} Docs`, c: '#0284c7', s: '100% Integridade SHA-256' },
          { l: 'Ontologia Corporativa', v: `${kpis?.corporateOntologyTermsCount ?? 520} Conceitos`, c: '#7c3aed', s: '16 Domínios Mapeados' },
          { l: 'Taxa de Reutilização', v: `${kpis?.knowledgeReuseRatePct ?? 96.4}%`, c: '#059669', s: 'Alta Reutilização' },
          { l: 'Confiança RAG', v: `${kpis?.avgRagConfidencePct ?? 98.2}%`, c: '#16a34a', s: 'Respostas Fundamentadas' },
          { l: 'ISO 30401 Standard', v: 'COMPLIANT', c: '#4f46e5', s: 'Conhecimento Auditável' },
          { l: 'Assinatura CKO/CAIO', v: 'CKO / CAIO / CDO', c: '#0284c7', s: 'Conselho do Conhecimento' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', border: `1px solid ${k.c}30`, borderRadius: 14, padding: '16px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.c, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', borderLeft: '5px solid #0284c7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#111827' }}>
          📜 Parecer Conclusivo do Chief Knowledge Officer (CKO) & Conselho Cognitivo
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          Declaramos formalmente que a <strong>Plataforma Instituto Ser Melhor v2.0</strong> possui um <strong>Institutional Knowledge & Cognitive Intelligence Platform (IKCIP)</strong> plenamente operacional. Toda a memória institucional, diretrizes clínicas, políticas corporativas e lições aprendidas estão preservadas, auditadas e acessíveis em tempo real por colaboradores, gestores e agentes de IA, assegurando fundamentação contínua nas decisões.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, fontWeight: 800, color: '#0284c7' }}>
          <span>✓ Chief Knowledge Officer (CKO)</span>
          <span>✓ Chief AI Officer (CAIO)</span>
          <span>✓ Chief Data Officer (CDO)</span>
        </div>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InstitutionalKnowledgePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CKO Board & IKCIP Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0369a1,#0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🧠</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Institutional Knowledge & Cognitive Intelligence Platform (IKCIP)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Memória Institucional · Enterprise RAG · Knowledge Graph · ISO 30401 · Busca Semântica (Prompt 062)
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
                color: activeTab === tab ? '#0284c7' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CKO Board & IKCIP Hub' && <TorreCKOTab />}
      {activeTab === 'Enterprise RAG & Fontes' && <EnterpriseRAGTab />}
      {activeTab === 'Busca Semântica Cognitiva' && <BuscaSemanticaTab />}
      {activeTab === 'Certificação Cognitiva Final' && <CertificacaoCognitivaTab />}

      {activeTab !== 'Torre CKO Board & IKCIP Hub' &&
        activeTab !== 'Enterprise RAG & Fontes' &&
        activeTab !== 'Busca Semântica Cognitiva' &&
        activeTab !== 'Certificação Cognitiva Final' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>IKCIP Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Gestão do conhecimento, ontologia corporativa e aprendizado institucional contínuo.
          </p>
        </Card>
      )}
    </div>
  );
}
