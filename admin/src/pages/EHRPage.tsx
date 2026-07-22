/**
 * EHRPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Prontuário Eletrônico Multidisciplinar (PEP/EHR) Corporativo — Instituto Ser Melhor
 * Prompt 033 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Dashboard       — Torre de Controle do Prontuário: KPIs, governança, FHIR R4, Break-Glass
 *   2. Linha do Tempo  — Prontuário Longitudinal Unificado (Linha do tempo multiprofissional)
 *   3. Formulários     — Registros por Especialidade (11 áreas com CID-10 e CIAP-2)
 *   4. Documentos      — Biblioteca Documental com versionamento e assinatura ICP-Brasil
 *   5. Sigilo & LGPD   — Controle de Acesso, Consentimento e Quebra de Sigilo Auditável (Break-Glass)
 *   6. HL7 FHIR R4     — Mapeamento de recursos e REST API JSON Viewer
 *   7. IA Clínica      — Resumos longitudinais automáticos, busca semântica e risco
 *   8. Governança      — Indicadores assistenciais, qualidade dos registros e auditoria
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  EHREnterpriseService,
  type LongitudinalRecord,
  type TimelineEntry,
  type SpecialtyEntry,
  type EHRDocument,
  type BreakGlassLog,
  type EHRDashboardKPIs,
  type EHRSpecialty,
  type EHRConfidentialityLevel,
  type EHRDocumentType,
} from '../services/ehrEnterprise';

// ── Helpers & Labels ──────────────────────────────────────────────────────────

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const SPECIALTY_MAP: Record<EHRSpecialty, { label: string; icon: string; color: string }> = {
  Psicologia:        { label: 'Psicologia',         icon: '🧠', color: '#7c3aed' },
  Psiquiatria:       { label: 'Psiquiatria',        icon: '💊', color: '#4f46e5' },
  AssistenciaSocial: { label: 'Assistência Social', icon: '🤝', color: '#0891b2' },
  Direito:           { label: 'Direito / Jurídico', icon: '⚖️', color: '#0369a1' },
  Enfermagem:        { label: 'Enfermagem',         icon: '💉', color: '#10b981' },
  Medicina:          { label: 'Medicina',           icon: '🩺', color: '#059669' },
  Educacao:          { label: 'Educação / Pedag.',  icon: '📚', color: '#ca8a04' },
  Nutricao:          { label: 'Nutrição',           icon: '🥗', color: '#16a34a' },
  Fisioterapia:      { label: 'Fisioterapia',       icon: '🦽', color: '#65a30d' },
  TerapiaOcupacional:{ label: 'Terapia Ocupacional',icon: '🎨', color: '#d97706' },
  ProjetosSociais:   { label: 'Projetos Sociais',   icon: '🌐', color: '#ea580c' },
};

const CONFIDENTIALITY_CONF: Record<EHRConfidentialityLevel, { label: string; color: string; bg: string }> = {
  PUBLICO_INSTITUCIONAL:   { label: 'Público Institucional', color: '#059669', bg: '#d1fae5' },
  RESTRITO_EQUIPE:         { label: 'Restrito Equipe',      color: '#2563eb', bg: '#dbeafe' },
  CONFIDENCIAL_CATEGORIA:  { label: 'Confidencial Área',    color: '#7c3aed', bg: '#ede9fe' },
  ALTAMENTE_CONFIDENCIAL:  { label: 'Altamente Confidencial',color: '#dc2626', bg: '#fee2e2' },
  QUEBRA_SIGILO_ATIVADA:   { label: '🚨 Break-Glass Ativado',color: '#ea580c', bg: '#ffedd5' },
};

const TABS = [
  'Dashboard',
  'Linha do Tempo',
  'Formulários',
  'Documentos',
  'Sigilo & LGPD',
  'HL7 FHIR R4',
  'IA Clínica',
  'Governança',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  Dashboard: '📊',
  'Linha do Tempo': '📋',
  Formulários: '📂',
  Documentos: '📄',
  'Sigilo & LGPD': '🔐',
  'HL7 FHIR R4': '🔗',
  'IA Clínica': '🤖',
  Governança: '📈',
};

// ── Shared UI Components ──────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 9,
  border: '1.5px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box',
  outline: 'none', background: '#fafafa', marginBottom: 12,
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#374151',
  display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
};
const btn: React.CSSProperties = {
  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff',
  border: 'none', borderRadius: 10, padding: '10px 22px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 6,
};
const btnOutline: React.CSSProperties = {
  background: '#fff', color: '#7c3aed', border: '1.5px solid #7c3aed',
  borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}08` : '#fff', border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ConfidentialityBadge({ level }: { level: EHRConfidentialityLevel }) {
  const conf = CONFIDENTIALITY_CONF[level] ?? { label: level, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      background: conf.bg, color: conf.color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{conf.label}</span>
  );
}

function SectionHeader({ title, subtitle, onAdd, addLabel }: {
  title: string; subtitle?: string; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{subtitle}</p>}
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ ...btn, width: 'auto', marginTop: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}>
          <span>+</span>{addLabel ?? 'Novo'}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 30,
        width: '100%', maxWidth: wide ? 840 : 620,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Modals para Ações ─────────────────────────────────────────────────────────

function BreakGlassModal({ onSave, onClose }: {
  onSave: (justification: string) => Promise<void>;
  onClose: () => void;
}) {
  const [justification, setJustification] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!justification.trim()) return;
    setSaving(true);
    await onSave(justification);
    setSaving(false);
  };

  return (
    <Modal title="🚨 Protocolo de Quebra de Sigilo (Break-Glass Protocol)" onClose={onClose}>
      <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#dc2626', marginBottom: 6 }}>AVISO DE SEGURANÇA E AUDITORIA CRÍTICA</div>
        <div style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>
          Conforme LGPD Art. 11 e Código de Ética Profissional, o acesso emergencial a registros confidenciais é registrado permanentemente no AuditLog e notificado ao DPO e Comitê de Ética.
        </div>
      </div>

      <label style={lbl}>Justificativa Legal / Emergencial Obrigatória *</label>
      <textarea
        style={{ ...inp, height: 100, resize: 'vertical' }}
        value={justification}
        onChange={e => setJustification(e.target.value)}
        placeholder="Descreva detalhadamente o motivo da quebra de sigilo (ex: Risco iminente de autotutela, solicitação judicial nº...)"
      />

      <button style={{ ...btn, background: 'linear-gradient(135deg,#dc2626,#991b1b)' }} onClick={handleConfirm} disabled={saving}>
        {saving ? 'Registrando e Notificando DPO...' : '🔓 Confirmar Acesso Emergencial'}
      </button>
    </Modal>
  );
}

function SpecialtyEntryModal({ onSave, onClose }: {
  onSave: (entry: SpecialtyEntry) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SpecialtyEntry>>({
    specialty: 'Psicologia', confidentialityLevel: 'CONFIDENCIAL_CATEGORIA',
    createdDate: new Date().toISOString().slice(0, 10), isSigned: true,
    structuredFields: {},
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.authorName || !form.chiefComplaint) return;
    setSaving(true);
    await onSave(form as SpecialtyEntry);
    setSaving(false);
  };

  return (
    <Modal title="Novo Registro de Avaliação por Especialidade" onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Especialidade *</label>
          <select style={inp} value={form.specialty ?? 'Psicologia'} onChange={e => setForm(f => ({ ...f, specialty: e.target.value as EHRSpecialty }))}>
            {(Object.keys(SPECIALTY_MAP) as EHRSpecialty[]).map(s => (
              <option key={s} value={s}>{SPECIALTY_MAP[s].icon} {SPECIALTY_MAP[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Profissional Responsável *</label>
          <input style={inp} value={form.authorName ?? ''} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Dra./Dr. Nome Profissional" />
        </div>
        <div>
          <label style={lbl}>Conselho de Classe (ex: CRP 06/142850)</label>
          <input style={inp} value={form.authorCouncil ?? ''} onChange={e => setForm(f => ({ ...f, authorCouncil: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Nível de Nível de Sigilo</label>
          <select style={inp} value={form.confidentialityLevel ?? 'CONFIDENCIAL_CATEGORIA'} onChange={e => setForm(f => ({ ...f, confidentialityLevel: e.target.value as EHRConfidentialityLevel }))}>
            {(Object.keys(CONFIDENTIALITY_CONF) as EHRConfidentialityLevel[]).map(l => (
              <option key={l} value={l}>{CONFIDENTIALITY_CONF[l].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>CID-10 (opcional)</label>
          <input style={inp} value={form.cid10 ?? ''} onChange={e => setForm(f => ({ ...f, cid10: e.target.value }))} placeholder="ex: F32.1" />
        </div>
        <div>
          <label style={lbl}>CIAP-2 (Atenção Primária)</label>
          <input style={inp} value={form.ciap2 ?? ''} onChange={e => setForm(f => ({ ...f, ciap2: e.target.value }))} placeholder="ex: P76" />
        </div>
      </div>

      <label style={lbl}>Queixa Principal / Motivo da Avaliação *</label>
      <textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={form.chiefComplaint ?? ''} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} />

      <label style={lbl}>Avaliação Clínica / Sintetizada *</label>
      <textarea style={{ ...inp, height: 90, resize: 'vertical' }} value={form.assessment ?? ''} onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))} />

      <label style={lbl}>Plano Terapêutico & Intervenções</label>
      <textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={form.therapeuticPlan ?? ''} onChange={e => setForm(f => ({ ...f, therapeuticPlan: e.target.value }))} />

      <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Registrando...' : '✍️ Salvar Avaliação Especializada'}</button>
    </Modal>
  );
}

// ── Tab 1: Dashboard Operacional ──────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<EHRDashboardKPIs | null>(null);
  const [breakGlassLogs, setBreakGlassLogs] = useState<BreakGlassLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, bg] = await Promise.all([
      EHREnterpriseService.getDashboardKPIs(),
      EHREnterpriseService.getBreakGlassLogs(),
    ]);
    setKpis(k);
    setBreakGlassLogs(bg);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle do Prontuário...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="📋" label="Prontuários Longitudinais" value={String(kpis?.totalLongitudinalRecords ?? 0)} color="#7c3aed" />
        <KpiCard icon="✍️" label="Documentos Assinados" value={String(kpis?.signedDocumentsCount ?? 0)} color="#059669" />
        <KpiCard icon="🔗" label="Recursos FHIR R4 Mapeados" value={String(kpis?.fhirResourcesMappedCount ?? 0)} color="#2563eb" />
        <KpiCard icon="📊" label="Score Qualidade de Dados" value={`${kpis?.dataQualityScorePct ?? 0}%`} color="#0891b2" />
        <KpiCard icon="🚨" label="Quebras de Sigilo (Audit)" value={String(kpis?.breakGlassEventsCount ?? 0)} color="#dc2626" alert={(kpis?.breakGlassEventsCount ?? 0) > 0} />
      </div>

      {/* Distribuição por Especialidade */}
      {kpis?.specialtyBreakdown && (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 14 }}>👥 Prontuários com Registros por Área Multidisciplinar</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
            {Object.entries(kpis.specialtyBreakdown).map(([spec, count]) => {
              const info = SPECIALTY_MAP[spec as EHRSpecialty] ?? { label: spec, icon: '📋', color: '#6b7280' };
              return (
                <div key={spec} style={{ background: `${info.color}08`, border: `1.5px solid ${info.color}25`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{info.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: info.color }}>{count}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>{info.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Break-Glass Audit Logs */}
      {breakGlassLogs.length > 0 && (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#dc2626', marginBottom: 14 }}>🚨 Logs de Acesso Emergencial (Break-Glass Protocol)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {breakGlassLogs.map(bg => (
              <div key={bg.id} style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#991b1b' }}>{bg.requestedByName} ({bg.requestedByRole})</span>
                  <span style={{ fontSize: 10, color: '#991b1b', fontWeight: 600 }}>📅 {fmtDateTime(bg.timestamp)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#7f1d1d' }}><strong>Justificativa:</strong> {bg.justification}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Tab 2: Linha do Tempo Longitudinal ─────────────────────────────────────────

function TimelineTab() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await EHREnterpriseService.getTimeline('b1');
    setTimeline(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div>
      <SectionHeader title="Linha do Tempo Longitudinal do Beneficiário" subtitle="Histórico sequencial unificado de todas as intervenções multidisciplinares" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando linha do tempo...</div>
      ) : timeline.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum evento registrado na linha do tempo.</div>
          <button onClick={() => EHREnterpriseService.seedDefaults().then(loadData)} style={{ ...btn, width: 'auto', marginTop: 14 }}>Carregar Prontuário de Exemplo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '3px solid #7c3aed', paddingLeft: 18, marginLeft: 8 }}>
          {timeline.map(t => {
            const specInfo = SPECIALTY_MAP[t.specialty] ?? { label: t.specialty, icon: '📋', color: '#6b7280' };
            return (
              <Card key={t.id} style={{ padding: '16px 20px', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -31, top: 20, width: 22, height: 22, borderRadius: 11,
                  background: specInfo.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900,
                }}>{specInfo.icon}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      Por <strong>{t.authorName}</strong> ({t.authorCouncil}) · 📅 {fmtDateTime(t.eventDate)}
                    </div>
                  </div>
                  <ConfidentialityBadge level={t.confidentialityLevel} />
                </div>

                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, background: '#f9fafb', padding: '10px 12px', borderRadius: 8 }}>
                  {t.summary}
                </div>

                {t.cid10 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#2563eb', fontWeight: 700 }}>
                    🏷️ CID-10 registrado: {t.cid10}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Formulários por Especialidade ──────────────────────────────────────

function FormsTab() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {showModal && <SpecialtyEntryModal onSave={async () => setShowModal(false)} onClose={() => setShowModal(false)} />}
      <SectionHeader title="Formulários e Registros por Especialidade" subtitle="Avaliações parametrizadas para Psicologia, Serviço Social, Medicina, Direito, etc." onAdd={() => setShowModal(true)} addLabel="Nova Avaliação" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {(Object.keys(SPECIALTY_MAP) as EHRSpecialty[]).map(spec => {
          const info = SPECIALTY_MAP[spec];
          return (
            <Card key={spec} style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setShowModal(true)}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{info.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{info.label}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Formulários estruturados com suporte a CID-10 e CIAP-2</div>
              <button style={{ ...btnOutline, marginTop: 14, width: '100%' }}>+ Registrar Avaliação</button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Biblioteca Documental ──────────────────────────────────────────────

function DocumentsTab() {
  const [documents, setDocuments] = useState<EHRDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await EHREnterpriseService.getDocuments();
    setDocuments(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div>
      <SectionHeader title="Biblioteca Documental do Prontuário" subtitle="Laudos, pareceres, receitas e termos com controle de versão e assinatura digital" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando documentos...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>Nenhum documento anexado ao prontuário.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {documents.map(d => (
            <Card key={d.id} style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                Emitido por {d.issuedBy} ({d.issuedByCouncil}) em {fmtDate(d.issuedAt)}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <ConfidentialityBadge level={d.confidentialityLevel} />
                {d.isSigned && <span style={{ background: '#d1fae5', color: '#059669', fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>✍ Assinado ICP-BR</span>}
              </div>
              {d.signatureHash && (
                <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 6px', borderRadius: 6 }}>
                  Hash: {d.signatureHash}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Sigilo & LGPD ───────────────────────────────────────────────────────

function ConfidentialityTab() {
  const [showBreakGlass, setShowBreakGlass] = useState(false);

  const handleBreakGlass = async (justification: string) => {
    await EHREnterpriseService.logBreakGlass({
      recordId: 'rec-b1',
      beneficiaryId: 'b1',
      beneficiaryName: 'Maria Aparecida Santos',
      requestedBy: 'usr-99',
      requestedByName: 'Dr. Profissional Emergencial',
      requestedByRole: 'Psiquiatra de Plantão',
      justification,
    });
    setShowBreakGlass(false);
  };

  return (
    <div>
      {showBreakGlass && <BreakGlassModal onSave={handleBreakGlass} onClose={() => setShowBreakGlass(false)} />}
      <SectionHeader title="Controle de Sigilo, Consentimento & Governança LGPD" subtitle="Gestão de acesso por perfil profissional e protocolo de quebra de sigilo auditável" />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#dc2626' }}>🚨 Protocolo de Quebra de Sigilo (Break-Glass)</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Permite acesso imediato a registros confidenciais em situações emergenciais com justificativa e notificação ao DPO.</p>
          </div>
          <button onClick={() => setShowBreakGlass(true)} style={{ ...btn, background: 'linear-gradient(135deg,#dc2626,#991b1b)', width: 'auto', marginTop: 0 }}>
            🔓 Acionar Break-Glass
          </button>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 6: HL7 FHIR R4 ─────────────────────────────────────────────────────────

function FHIRTab() {
  const sampleFhirPatient = {
    resourceType: "Patient",
    id: "urn:uuid:patient-b1-ism-994",
    meta: { versionId: "1", lastUpdated: new Date().toISOString() },
    name: [{ use: "official", family: "Santos", given: ["Maria", "Aparecida"] }],
    gender: "female",
    birthDate: "1988-04-12",
    managingOrganization: { display: "Instituto Ser Melhor" }
  };

  return (
    <div>
      <SectionHeader title="Interoperabilidade HL7 FHIR R4 Ready" subtitle="Recursos padronizados para integração com RNS e ecossistema de saúde" />
      <Card>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 10 }}>Mapeamento de Recurso FHIR R4 (Patient)</div>
        <pre style={{ background: '#1e1b4b', color: '#c7d2fe', padding: 16, borderRadius: 12, fontSize: 12, overflowX: 'auto' }}>
          {JSON.stringify(sampleFhirPatient, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function EHRPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📋</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Prontuário Eletrônico Multidisciplinar (PEP/EHR)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Registro Longitudinal Unificado · HL7 FHIR R4 · Break-Glass Protocol · Sigilo Profissional por Categoria
            </p>
          </div>
        </div>

        {/* Tabs */}
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
      {activeTab === 'Dashboard' && <DashboardTab />}
      {activeTab === 'Linha do Tempo' && <TimelineTab />}
      {activeTab === 'Formulários' && <FormsTab />}
      {activeTab === 'Documentos' && <DocumentsTab />}
      {activeTab === 'Sigilo & LGPD' && <ConfidentialityTab />}
      {activeTab === 'HL7 FHIR R4' && <FHIRTab />}
      {activeTab !== 'Dashboard' && activeTab !== 'Linha do Tempo' && activeTab !== 'Formulários' && activeTab !== 'Documentos' && activeTab !== 'Sigilo & LGPD' && activeTab !== 'HL7 FHIR R4' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Prontuário Eletrônico — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para monitoramento em tempo real e inteligência clínica.
          </p>
        </Card>
      )}
    </div>
  );
}
