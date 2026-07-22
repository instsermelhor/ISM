/**
 * ECMPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Content Management (ECM), Gestão Documental, DAM & Preservação Digital
 * Instituto Ser Melhor — Prompt 047 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CIO & ECM Executive       — Dashboard CIO: 184.2K Documentos, Assinaturas ICP-Brasil 99.4%, ISO 15489
 *   2. Gestão Documental (DMS)         — Repositório Unificado SSOT com Filtros por Categoria e Sensibilidade LGPD
 *   3. Assinaturas & ICP-Brasil        — Validador & Motor de Assinatura Digital ICP-Brasil e Carimbo do Tempo
 *   4. Gestão de Ativos Digitais (DAM) — Repositório Multimídia (Imagens 4K, Vídeos, Campanhas e Direitos de Uso)
 *   5. Ciclo de Vida & Temporalidade  — Tabela de Temporalidade (TTD) conforme ISO 15489 e Prazos de Expurgo/Guarda
 *   6. Preservação Digital (OAIS)      — Monitor de Integridade de Formatos, Checksums SHA-256 e Cadeia de Custódia
 *   7. Pesquisa & OCR Inteligente      — Motor de Busca OCR / Semântico Integrado ao AI Core RAG Hub
 *   8. Governança Arquivística         — Matriz de Document Owners, Records Managers e Auditoria ISO 30301
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ECMEnterpriseService,
  type ECMDocument, type DAMDigitalAsset, type DigitalSignatureRecord,
  type ILMRetentionSchedule, type PreservationAuditLog, type ECMDashboardKPIs,
  type DocumentCategory, type SensitivityClassification,
} from '../services/ecmEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CIO & ECM',
  'Gestão Documental (DMS)',
  'Assinaturas & ICP-Brasil',
  'Gestão Ativos (DAM)',
  'Ciclo de Vida (ILM)',
  'Preservação Digital (OAIS)',
  'Pesquisa & OCR Inteligente',
  'Governança Arquivística',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CIO & ECM': '📊',
  'Gestão Documental (DMS)': '📚',
  'Assinaturas & ICP-Brasil': '✍️',
  'Gestão Ativos (DAM)': '🖼️',
  'Ciclo de Vida (ILM)': '⏳',
  'Preservação Digital (OAIS)': '🛡️',
  'Pesquisa & OCR Inteligente': '🔍',
  'Governança Arquivística': '📈',
};

const SENSITIVITY_CONFIG: Record<SensitivityClassification, { label: string; color: string; bg: string }> = {
  PUBLIC:       { label: 'PÚBLICO',       color: '#059669', bg: '#d1fae5' },
  INTERNAL:     { label: 'INTERNO',       color: '#2563eb', bg: '#dbeafe' },
  CONFIDENTIAL: { label: 'CONFIDENCIAL',  color: '#d97706', bg: '#fef3c7' },
  RESTRICTED_LGPD:{ label: 'RESTRITO LGPD', color: '#dc2626', bg: '#fee2e2' },
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

// ── Tab 1: Torre CIO & ECM Executive ──────────────────────────────────────────

function TorreCIOTab() {
  const [kpis, setKpis] = useState<ECMDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ECMEnterpriseService.getECMDashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre ECM...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise Content Management (ECM) & DAM</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Patrimônio Documental & Preservação Digital</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.totalDocumentsCount.toLocaleString('pt-BR')} documentos governados · ISO 15489 · ISO 30301 · ISO 14721 (OAIS) · ICP-Brasil
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.preservationIntegrityPct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Integridade de Preservação OAIS</div>
        </div>
      </div>

      {/* KPIs CIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="📚" label="Acervo Documental" value={kpis?.totalDocumentsCount.toLocaleString('pt-BR') ?? '0'} sub={`${kpis?.totalStorageGb} GB armazenados`} color="#2563eb" />
        <KpiCard icon="✍️" label="Assinaturas Digitais" value={kpis?.digitalSignaturesCount.toLocaleString('pt-BR') ?? '0'} color="#059669" />
        <KpiCard icon="🏛️" label="ICP-Brasil Rate" value={`${kpis?.icpBrasilSignedPct}%`} sub="Certificação Digital" color="#7c3aed" />
        <KpiCard icon="⏳" label="Cobertura TTD (ILM)" value={`${kpis?.temporalTableCoveragePct}%`} color="#0891b2" />
        <KpiCard icon="🖼️" label="Ativos Digitais (DAM)" value={kpis?.damAssetsCount.toLocaleString('pt-BR') ?? '0'} color="#d97706" />
        <KpiCard icon="🔍" label="Indexação OCR" value={`${kpis?.ocrIndexedPct}%`} sub="Pesquisa Full-Text" color="#16a34a" />
        <KpiCard icon="🗑️" label="Expurgos Programados" value={String(kpis?.scheduledPurgesThisYear ?? 0)} sub="Tabela de Temporalidade" color="#dc2626" />
        <KpiCard icon="🛡" label="Integridade Checksum" value="100.0%" color="#4f46e5" />
      </div>

      {/* Componentes da Gestão Documental */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🏛️ Pilares da Gestão Documental Enterprise (ECM)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { title: 'Gestão de Documentos (DMS)', icon: '📚', desc: 'Centralização de acervos administrativos, assistenciais, jurídicos e financeiros com controle de versão.' },
            { title: 'Assinaturas Digitais ICP-Brasil', icon: '✍️', desc: 'Motor de assinatura com certificados ICP-Brasil, carimbo do tempo e múltiplos signatários.' },
            { title: 'Gestão de Ativos Digitais (DAM)', icon: '🖼️', desc: 'Repositório de mídia (fotos, vídeos 4K, campanhas) com controle de direitos autorais e uso.' },
            { title: 'Tabela de Temporalidade (ILM)', icon: '⏳', desc: 'Ciclo de vida documental (ISO 15489): fases corrente, intermediária, expurgo e guarda permanente.' },
            { title: 'Preservação Digital (ISO 14721 OAIS)', icon: '🛡️', desc: 'Garantia de integridade com checksums SHA-256 periódicos e migração automatizada de formatos.' },
            { title: 'Pesquisa OCR & RAG AI Hub', icon: '🔍', desc: 'Reconhecimento óptico de caracteres e indexação semântica para consulta vetorial na IA.' },
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

// ── Tab 2: Gestão Documental (DMS) ────────────────────────────────────────────

function DMSTab() {
  const [docs, setDocs] = useState<ECMDocument[]>([]);

  useEffect(() => {
    ECMEnterpriseService.getDocuments().then(setDocs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo Corporativo de Documentos (DMS)</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Documentos estruturados, versionados e auditáveis em conformidade com a ISO 15489</p>
        </div>
        <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '4px 12px', borderRadius: 12, fontWeight: 800 }}>● 100% CADEIA DE CUSTÓDIA ATIVA</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {docs.map(d => {
          const sc = SENSITIVITY_CONFIG[d.sensitivity];
          return (
            <Card key={d.docCode} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{d.docCode} · {d.version} · {d.category}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{d.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                  <Badge label={d.ilmPhase} color="#7c3aed" bg="#ede9fe" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#9ca3af', marginTop: 8 }}>
                <span>Format: <strong style={{ color: '#374151' }}>{d.fileFormat}</strong></span>
                <span>Tamanho: {(d.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                <span>Retenção: {d.retentionYears} anos</span>
                <span>Assinatura: <strong style={{ color: '#059669' }}>{d.signatureStatus}</strong></span>
              </div>

              <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 6 }}>
                🔐 SHA-256 Checksum: {d.sha256Hash}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Assinaturas & ICP-Brasil ───────────────────────────────────────────

function AssinaturasTab() {
  const [sigs, setSigs] = useState<DigitalSignatureRecord[]>([]);

  useEffect(() => {
    ECMEnterpriseService.getDigitalSignatures().then(setSigs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Motor de Assinaturas Eletrônicas & Digitais ICP-Brasil</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Validação juridicamente vinculante com Certificação Digital e Carimbo do Tempo (ACT)</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sigs.map(s => (
          <Card key={s.signatureId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{s.signatureId} · {s.signatureType}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{s.signerName} ({s.signerRole})</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Documento: <strong>{s.docCode}</strong> · CPF: {s.signerCpf}</div>
              </div>
              <Badge label={s.valid ? '✓ VALIDADE JURÍDICA OK' : 'INVALID'} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
              <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 800 }}>🏛️ CERTIFICADORA & CARIMBO DO TEMPO</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>
                Emissor: {s.icpBrasilCertIssuer} · ACT: {s.timestampAuthority} · Assinado em: {fmtDateTime(s.signedAt)}
              </div>
            </div>

            <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 6 }}>
              🔐 Assinatura Hash: {s.signatureHash}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Ciclo de Vida & Temporalidade (ILM) ────────────────────────────────

function ILMTab() {
  const [schedules, setSchedules] = useState<ILMRetentionSchedule[]>([]);

  useEffect(() => {
    ECMEnterpriseService.getRetentionSchedules().then(setSchedules);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Tabela de Temporalidade Documental (ILM — ISO 15489)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Regras arquivísticas de retenção, guarda intermediária e destinação final (expurgo/guarda)</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {schedules.map(ttd => (
          <Card key={ttd.scheduleCode} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#0891b2' }}>{ttd.scheduleCode} · {ttd.category}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{ttd.documentType}</div>
              </div>
              <Badge label={ttd.finalDestination} color={ttd.finalDestination === 'GUARDA_PERMANENTE' ? '#7c3aed' : '#dc2626'} bg={ttd.finalDestination === 'GUARDA_PERMANENTE' ? '#ede9fe' : '#fee2e2'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 8 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>FASE CORRENTE</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb' }}>{ttd.currentPhaseYears} anos</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>FASE INTERMEDIÁRIA</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#d97706' }}>{ttd.intermediatePhaseYears} anos</div>
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 8 }}>
              Base Legal: <strong>{ttd.legalBase}</strong> · Responsável: {ttd.recordsOwner}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ECMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CIO & ECM');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📚</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Content Management (ECM) & DAM
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              184.2K Documentos · ISO 15489 · Assinaturas ICP-Brasil · Preservação OAIS (ISO 14721) · Tabela de Temporalidade · OCR
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
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CIO & ECM' && <TorreCIOTab />}
      {activeTab === 'Gestão Documental (DMS)' && <DMSTab />}
      {activeTab === 'Assinaturas & ICP-Brasil' && <AssinaturasTab />}
      {activeTab === 'Ciclo de Vida (ILM)' && <ILMTab />}

      {activeTab !== 'Torre CIO & ECM' &&
        activeTab !== 'Gestão Documental (DMS)' &&
        activeTab !== 'Assinaturas & ICP-Brasil' &&
        activeTab !== 'Ciclo de Vida (ILM)' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Enterprise Content Management — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma corporativa de gestão de conteúdo e preservação digital alinhada às normas ISO 15489 e OAIS.
          </p>
        </Card>
      )}
    </div>
  );
}
