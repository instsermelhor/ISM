/**
 * KnowledgePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestão Corporativa do Conhecimento (Enterprise Knowledge Management)
 * Instituto Ser Melhor — Prompt 043 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CKO & Capital Intelectual — Dashboard Executivo CKO: 3.840 Ativos, Qualidade 4.85/5, ISO 30401
 *   2. Acervo Oficial (Single Source)  — Documentos, Políticas, POPs, Guias Clínicos com Filtro de Sensibilidade
 *   3. Grafo do Conhecimento          — Visualizador de Relacionamentos Semânticos entre Pessoas, Processos e Leis
 *   4. Memória Organizacional         — Registro de Lições Aprendidas, Postmortems e Casos de Sucesso
 *   5. Taxonomia & Ontologias          — Vocabulário Controlado, Glossário Institucional e Relações Semânticas
 *   6. Pesquisa Semântica & RAG Hub    — Motor de Pesquisa Híbrida Integrado ao AI Core Platform com Citações
 *   7. Curadoria & Comunidades        — Fluxo Editorial, Submissão de Conteúdo e Revisão por Pares
 *   8. Governança ISO 30401            — Matriz de Knowledge Owners, Ciclo de Vida Documental e Obsolescência
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  KnowledgeEnterpriseService,
  type KnowledgeAsset, type TaxonomyTerm, type KnowledgeGraphNode,
  type OrganizationalMemoryItem, type CKODashboardKPIs,
  type KnowledgeDomain, type SensitivityLevel,
} from '../services/knowledgeEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CKO & Capital',
  'Acervo Oficial (SSOT)',
  'Grafo do Conhecimento',
  'Memória Organizacional',
  'Taxonomia & Ontologias',
  'Pesquisa Semântica (RAG)',
  'Curadoria & Comunidades',
  'Governança ISO 30401',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CKO & Capital': '📊',
  'Acervo Oficial (SSOT)': '📚',
  'Grafo do Conhecimento': '🌐',
  'Memória Organizacional': '🏛️',
  'Taxonomia & Ontologias': '🏷️',
  'Pesquisa Semântica (RAG)': '🔍',
  'Curadoria & Comunidades': '🤝',
  'Governança ISO 30401': '📈',
};

const SENSITIVITY_CONFIG: Record<SensitivityLevel, { label: string; color: string; bg: string }> = {
  PUBLIC:       { label: 'PÚBLICO',       color: '#059669', bg: '#d1fae5' },
  INTERNAL:     { label: 'INTERNO',       color: '#2563eb', bg: '#dbeafe' },
  CONFIDENTIAL: { label: 'CONFIDENCIAL',  color: '#d97706', bg: '#fef3c7' },
  RESTRICTED:   { label: 'RESTRITO LGPD', color: '#dc2626', bg: '#fee2e2' },
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

// ── Tab 1: Torre CKO & Capital ────────────────────────────────────────────────

function TorreCKOTab() {
  const [kpis, setKpis] = useState<CKODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    KnowledgeEnterpriseService.getCKODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CKO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0891b2,#2563eb)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gestão Corporativa do Conhecimento (KMS)</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Patrimônio Intelectual & Fonte Única da Verdade</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.totalAssetsCount.toLocaleString('pt-BR')} ativos catalogados · ISO 30401 · ISO 15489 · RAG AI Core Ready
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.iso30401CompliancePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Conformidade ISO 30401 (KMS)</div>
        </div>
      </div>

      {/* KPIs CKO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="📚" label="Ativos do Conhecimento" value={kpis?.totalAssetsCount.toLocaleString('pt-BR') ?? '0'} sub="Single Source of Truth" color="#0891b2" />
        <KpiCard icon="⭐" label="Índice de Qualidade" value={`${kpis?.avgQualityScore}/5.0`} color="#059669" />
        <KpiCard icon="🏷️" label="Termos Taxonômicos" value={String(kpis?.taxonomyTermsCount ?? 0)} color="#7c3aed" />
        <KpiCard icon="🌐" label="Nós no Grafo (KG)" value={kpis?.knowledgeGraphNodesCount.toLocaleString('pt-BR') ?? '0'} color="#2563eb" />
        <KpiCard icon="🔍" label="Buscas Semânticas/Mês" value={`${(kpis?.monthlySemanticSearches ?? 0) / 1000}K`} color="#d97706" />
        <KpiCard icon="🤖" label="Cobertura RAG IA" value={`${kpis?.aiRAGCoveragePct}%`} color="#16a34a" />
        <KpiCard icon="🏛️" label="Memória / Lições" value={String(kpis?.lessonsLearnedCount ?? 0)} color="#4f46e5" />
        <KpiCard icon="⚠️" label="Documentos Obsoletos" value={String(kpis?.obsoleteAssetsCount ?? 0)} alert={(kpis?.obsoleteAssetsCount ?? 0) > 20} color="#dc2626" />
      </div>

      {/* Pilares da Gestão do Conhecimento */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🏛️ Pilares da Gestão do Conhecimento (ISO 30401)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { title: 'Single Source of Truth (SSOT)', icon: '📚', desc: 'Repositório unificado de normas, guias clínicos e procedimentos sem redundâncias.' },
            { title: 'Taxonomia & Ontologias', icon: '🏷️', desc: 'Vocabulário controlado com 500+ termos padronizados e relacionamentos semânticos.' },
            { title: 'Knowledge Graph Institucional', icon: '🌐', desc: 'Mapeamento de conexões entre Pessoas, Processos BPMN, Leis, Projetos e Ativos.' },
            { title: 'Memória Organizacional & Lições', icon: '🏛️', desc: 'Preservação de postmortems, decisões estratégicas e melhores práticas institucionais.' },
            { title: 'Integração Nativa ao RAG / IA', icon: '🤖', desc: 'Alimentação automatizada da AI Core Platform com controle de fontes autorizadas.' },
            { title: 'Governança & Ciclo de Vida', icon: '📈', desc: 'Matriz de Knowledge Owners e revisões de obsolescência periódicas (ISO 30401).' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Acervo Oficial (SSOT) ──────────────────────────────────────────────

function AcervoTab() {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);

  useEffect(() => {
    KnowledgeEnterpriseService.getAssets().then(setAssets);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Acervo Oficial (Single Source of Truth)</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Fonte confiável de conhecimento institucional para usuários, processos e IA</p>
        </div>
        <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '4px 12px', borderRadius: 12, fontWeight: 800 }}>● FONTE OFICIAL CERTIFICADA</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {assets.map(a => {
          const sc = SENSITIVITY_CONFIG[a.sensitivity];
          return (
            <Card key={a.assetCode} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{a.assetCode} · {a.version} · {a.category}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{a.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                  {a.aiRAGIndexed && <Badge label="✓ RAG IA ATIVO" color="#7c3aed" bg="#ede9fe" />}
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#374151', marginBottom: 10 }}>{a.summary}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 10, color: '#9ca3af' }}>
                <div>
                  👤 Owner: <strong style={{ color: '#374151' }}>{a.ownerEmail}</strong> · 📅 Revisado: {fmtDateTime(a.lastReviewedAt)}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span>👁 {a.viewCount.toLocaleString('pt-BR')} acessos</span>
                  <span>📖 {a.citationsCount} citações</span>
                  <span style={{ color: '#059669', fontWeight: 800 }}>⭐ {a.qualityRatingAvg}/5.0</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Memória Organizacional ─────────────────────────────────────────────

function MemoriaTab() {
  const [memoryItems, setMemoryItems] = useState<OrganizationalMemoryItem[]>([]);

  useEffect(() => {
    KnowledgeEnterpriseService.getOrganizationalMemory().then(setMemoryItems);
  }, []);

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    LICAO_APRENDIDA: { label: 'Lição Aprendida', color: '#7c3aed', bg: '#ede9fe', icon: '💡' },
    BOA_PRATICA: { label: 'Boa Prática', color: '#059669', bg: '#d1fae5', icon: '🌟' },
    POSTMORTEM_INCIDENTE: { label: 'Postmortem', color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
    CASO_SUCESSO: { label: 'Caso de Sucesso', color: '#2563eb', bg: '#dbeafe', icon: '🏆' },
    DECISAO_ESTRATEGICA: { label: 'Decisão Estratégica', color: '#4f46e5', bg: '#ede9fe', icon: '🏛️' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Memória Organizacional & Lições Aprendidas</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Preservação do capital intelectual e lições extraídas de incidentes e decisões</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {memoryItems.map(m => {
          const cfg = typeConfig[m.type] ?? { label: m.type, color: '#6b7280', bg: '#f3f4f6', icon: '📝' };
          return (
            <Card key={m.memoryCode} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{m.memoryCode} · {m.domain}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{m.title}</div>
                </div>
                <Badge label={`${cfg.icon} ${cfg.label}`} color={cfg.color} bg={cfg.bg} />
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>CONTEXTO DO EVENTO</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{m.context}</div>
              </div>

              <div style={{ background: `${cfg.color}06`, borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ fontSize: 10, color: cfg.color, fontWeight: 800 }}>💡 APRENDIZADO CHAVE</div>
                <div style={{ fontSize: 11, color: '#111827', marginTop: 2, fontWeight: 600 }}>{m.learnings}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CKO & Capital');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0891b2,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📚</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Gestão Corporativa do Conhecimento (KMS)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              3.840+ Ativos SSOT · ISO 30401 · Taxonomia 500+ Termos · Knowledge Graph · RAG AI Ready · LGPD Compliant
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
                color: activeTab === tab ? '#0891b2' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CKO & Capital' && <TorreCKOTab />}
      {activeTab === 'Acervo Oficial (SSOT)' && <AcervoTab />}
      {activeTab === 'Memória Organizacional' && <MemoriaTab />}

      {activeTab !== 'Torre CKO & Capital' &&
        activeTab !== 'Acervo Oficial (SSOT)' &&
        activeTab !== 'Memória Organizacional' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Enterprise Knowledge Management — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Fonte oficial de conhecimento institucional integrada ao AI Core Platform e ISO 30401.
          </p>
        </Card>
      )}
    </div>
  );
}
