/**
 * BeneficiaryPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Portal do Beneficiário — Instituto Ser Melhor
 * Hub Enterprise de Atendimento, Jornada Digital e Experiência Humanizada
 * Prompt 030 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Dashboard      — KPIs, beneficiários críticos, agenda do dia
 *   2. Beneficiários  — Listagem, busca, filtros, cadastro completo
 *   3. Jornada        — Visualização e transição de etapas do ciclo de atendimento
 *   4. Agenda         — Consultas agendadas (presencial e telemedicina)
 *   5. Atendimentos   — Histórico clínico e evolução por beneficiário
 *   6. Telemedicina   — Sessões de videochamada, status e métricas
 *   7. Documentos     — Gestão de receitas, laudos, atestados e encaminhamentos
 *   8. Avaliações     — NPS, CSAT e CES de satisfação do beneficiário
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  BeneficiaryEnterpriseService,
  type Beneficiary,
  type BeneficiaryStatus,
  type JourneyStage,
  type AttendanceRecord,
  type AttendanceType,
  type Appointment,
  type BeneficiaryDocument,
  type TelehealthSession,
  type BeneficiaryEvaluation,
  type PriorityLevel,
  type VulnerabilityType,
} from '../services/beneficiaryEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR') : '—';
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const timeAgo = (d?: string) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 30) return `${days} dias atrás`;
  return fmtDate(d);
};

// ── Mapeamentos Visuais ────────────────────────────────────────────────────────

const JOURNEY_STAGES: { stage: JourneyStage; label: string; icon: string; color: string }[] = [
  { stage: 'PRE_CADASTRO', label: 'Pré-Cadastro', icon: '📋', color: '#9ca3af' },
  { stage: 'CADASTRO', label: 'Cadastro', icon: '📝', color: '#6b7280' },
  { stage: 'VALIDACAO', label: 'Validação', icon: '✅', color: '#d97706' },
  { stage: 'TRIAGEM', label: 'Triagem', icon: '🔍', color: '#f59e0b' },
  { stage: 'ANALISE_SOCIAL', label: 'Análise Social', icon: '🤝', color: '#f97316' },
  { stage: 'CLASSIFICACAO', label: 'Classificação', icon: '📊', color: '#8b5cf6' },
  { stage: 'APROVACAO', label: 'Aprovação', icon: '👍', color: '#7c3aed' },
  { stage: 'PRIMEIRO_ATENDIMENTO', label: '1º Atendimento', icon: '🌱', color: '#2563eb' },
  { stage: 'PLANO_INDIVIDUAL', label: 'Plano Individual', icon: '📌', color: '#0284c7' },
  { stage: 'EM_ATENDIMENTO', label: 'Em Atendimento', icon: '💚', color: '#059669' },
  { stage: 'ACOMPANHAMENTO', label: 'Acompanhamento', icon: '📈', color: '#10b981' },
  { stage: 'AVALIACAO', label: 'Avaliação', icon: '⭐', color: '#0d9488' },
  { stage: 'ALTA', label: 'Alta', icon: '🎓', color: '#16a34a' },
  { stage: 'RETORNO', label: 'Retorno', icon: '🔄', color: '#ca8a04' },
  { stage: 'REINGRESSO', label: 'Reingresso', icon: '↩️', color: '#dc2626' },
  { stage: 'ARQUIVADO', label: 'Arquivado', icon: '📦', color: '#374151' },
];

const stageMap = Object.fromEntries(JOURNEY_STAGES.map(s => [s.stage, s]));

function priorityColor(p: PriorityLevel | string): string {
  const map: Record<string, string> = {
    BAIXA: '#059669', MEDIA: '#d97706', ALTA: '#ea580c', CRITICA: '#dc2626',
  };
  return map[p] ?? '#6b7280';
}

function statusColor(s: BeneficiaryStatus | string): string {
  const map: Record<string, string> = {
    ATIVO: '#059669', AGUARDANDO: '#d97706', SUSPENSO: '#dc2626',
    ALTA: '#2563eb', ARQUIVADO: '#374151', LISTA_ESPERA: '#f59e0b',
  };
  return map[s] ?? '#6b7280';
}

const ATTENDANCE_ICONS: Record<string, string> = {
  Psicologia: '🧠', Psiquiatria: '💊', Assistencia_Social: '🤝',
  Juridico: '⚖️', Educacao: '📚', Saude: '🏥', Nutricao: '🥗',
  Fisioterapia: '🦽', Voluntariado: '💛', Grupo_Terapeutico: '👥',
  Oficina: '🎨', Acolhimento: '🫂',
};

const VULNERABILITY_LABELS: Record<VulnerabilityType, string> = {
  Violencia_Domestica: 'Violência Doméstica',
  Abuso_Sexual: 'Abuso Sexual',
  Negligencia: 'Negligência',
  Trabalho_Infantil: 'Trabalho Infantil',
  Situacao_Rua: 'Situação de Rua',
  Abuso_Substancias: 'Abuso de Substâncias',
  Saude_Mental: 'Saúde Mental',
  Deficiencia: 'Deficiência',
  Idoso_Risco: 'Idoso em Risco',
  Pobreza_Extrema: 'Pobreza Extrema',
  Abandono: 'Abandono',
  Conflito_Familiar: 'Conflito Familiar',
  Outro: 'Outro',
};

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
  'Dashboard', 'Beneficiários', 'Jornada', 'Agenda',
  'Atendimentos', 'Telemedicina', 'Documentos', 'Avaliações',
] as const;
type Tab = typeof TABS[number];

// ── Sub-Components ─────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}08` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '18px 22px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const color = statusColor(status);
  return (
    <span style={{
      background: `${color}18`, color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: PriorityLevel | string }) {
  const color = priorityColor(priority);
  return (
    <span style={{
      background: `${color}18`, color,
      padding: '2px 8px', borderRadius: 10,
      fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
    }}>{priority}</span>
  );
}

function RiskIndicator({ score }: { score?: number }) {
  if (score === undefined) return null;
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#059669';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

function SectionHeader({ title, onAdd, addLabel, subtitle }: {
  title: string; onAdd?: () => void; addLabel?: string; subtitle?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '8px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>{addLabel ?? 'Novo'}
        </button>
      )}
    </div>
  );
}

// ── Modal Base ─────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: wide ? 860 : 660,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
  outline: 'none', background: '#fafafa', marginBottom: 14,
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4,
};
const btn: React.CSSProperties = {
  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
  color: '#fff', border: 'none', borderRadius: 10,
  padding: '11px 24px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', width: '100%', marginTop: 8,
};

// ── Beneficiary Form Modal ────────────────────────────────────────────────────

function BeneficiaryFormModal({ initial, onSave, onClose }: {
  initial?: Partial<Beneficiary>;
  onSave: (data: Beneficiary) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Beneficiary>>(initial ?? {
    status: 'AGUARDANDO', journeyStage: 'CADASTRO', priority: 'MEDIA',
    isMinor: false, dependents: [], vulnerabilities: [], healthConditions: [],
    enrolledPrograms: [], odsGoals: [], lgpdConsents: [],
    address: { street: '', number: '', neighborhood: '', city: 'São Paulo', state: 'SP', zipCode: '' },
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const STEPS = ['Dados Pessoais', 'Endereço', 'Contexto Social', 'LGPD & Responsável'];

  const toggleVulnerability = (v: VulnerabilityType) => {
    const cur = form.vulnerabilities ?? [];
    setForm(f => ({
      ...f,
      vulnerabilities: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v],
    }));
  };

  const handleSave = async () => {
    if (!form.fullName || !form.cpf || !form.phone || !form.birthDate) return;
    if (!form.lgpdConsents?.length) {
      const consent = {
        consentedAt: new Date().toISOString(),
        consentedFor: ['dados_pessoais', 'atendimento'],
        version: '2.0',
      };
      form.lgpdConsents = [consent];
    }
    setSaving(true);
    await onSave(form as Beneficiary);
    setSaving(false);
  };

  return (
    <Modal title={form.id ? 'Editar Beneficiário' : 'Novo Beneficiário'} onClose={onClose} wide>
      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none',
              background: step === i ? '#7c3aed' : i < step ? '#ede9fe' : '#f3f4f6',
              color: step === i ? '#fff' : i < step ? '#7c3aed' : '#9ca3af',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}
          >{i < step ? '✓ ' : ''}{s}</button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Nome Completo *</label>
              <input style={inp} value={form.fullName ?? ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <label style={lbl}>Nome Social</label>
              <input style={inp} value={form.socialName ?? ''} onChange={e => setForm(f => ({ ...f, socialName: e.target.value }))} placeholder="Nome social (opcional)" />
            </div>
            <div>
              <label style={lbl}>CPF *</label>
              <input style={inp} value={form.cpf ?? ''} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div>
              <label style={lbl}>Data de Nascimento *</label>
              <input type="date" style={inp} value={form.birthDate ?? ''} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Gênero</label>
              <select style={inp} value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Selecione</option>
                {['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar', 'Outro'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Telefone *</label>
              <input style={inp} value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 9xxxx-xxxx" />
            </div>
            <div>
              <label style={lbl}>E-mail</label>
              <input type="email" style={inp} value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Encaminhado por</label>
              <select style={inp} value={form.referredBy ?? ''} onChange={e => setForm(f => ({ ...f, referredBy: e.target.value }))}>
                <option value="">Selecione</option>
                {['Espontâneo', 'CRAS', 'CREAS', 'UBS', 'Hospital', 'Escola', 'Parceiro', 'Outro'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Status</label>
              <select style={inp} value={form.status ?? 'AGUARDANDO'} onChange={e => setForm(f => ({ ...f, status: e.target.value as BeneficiaryStatus }))}>
                {['ATIVO', 'AGUARDANDO', 'LISTA_ESPERA', 'SUSPENSO', 'ALTA', 'ARQUIVADO'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Prioridade</label>
              <select style={inp} value={form.priority ?? 'MEDIA'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as PriorityLevel }))}>
                {['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Renda Familiar (R$)</label>
              <input type="number" style={inp} value={form.familyIncome ?? ''} onChange={e => setForm(f => ({ ...f, familyIncome: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={form.isMinor ?? false} onChange={e => setForm(f => ({ ...f, isMinor: e.target.checked }))} />
              É menor de idade
            </label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Logradouro</label>
              <input style={inp} value={form.address?.street ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, street: e.target.value } }))} placeholder="Rua, Avenida..." />
            </div>
            <div>
              <label style={lbl}>Número</label>
              <input style={inp} value={form.address?.number ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, number: e.target.value } }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Complemento</label>
              <input style={inp} value={form.address?.complement ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, complement: e.target.value } }))} />
            </div>
            <div>
              <label style={lbl}>Bairro</label>
              <input style={inp} value={form.address?.neighborhood ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, neighborhood: e.target.value } }))} />
            </div>
            <div>
              <label style={lbl}>CEP</label>
              <input style={inp} value={form.address?.zipCode ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, zipCode: e.target.value } }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Cidade</label>
              <input style={inp} value={form.address?.city ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, city: e.target.value } }))} />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <input style={inp} value={form.address?.state ?? ''} onChange={e => setForm(f => ({ ...f, address: { ...f.address!, state: e.target.value } }))} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label style={lbl}>Vulnerabilidades Identificadas</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {(Object.entries(VULNERABILITY_LABELS) as [VulnerabilityType, string][]).map(([key, label]) => {
              const sel = (form.vulnerabilities ?? []).includes(key);
              return (
                <span
                  key={key}
                  onClick={() => toggleVulnerability(key)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: sel ? '#dc2626' : '#f3f4f6',
                    color: sel ? '#fff' : '#374151',
                    border: `1.5px solid ${sel ? '#dc2626' : '#e5e7eb'}`,
                    transition: 'all 0.15s',
                  }}
                >{label}</span>
              );
            })}
          </div>

          <label style={lbl}>Condições de Saúde (separe por vírgula)</label>
          <input
            style={inp}
            value={(form.healthConditions ?? []).join(', ')}
            onChange={e => setForm(f => ({ ...f, healthConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="ex: Hipertensão, Diabetes, Ansiedade"
          />

          <label style={lbl}>Necessidades Especiais</label>
          <input style={inp} value={form.specialNeeds ?? ''} onChange={e => setForm(f => ({ ...f, specialNeeds: e.target.value }))} placeholder="Descreva necessidades de acessibilidade" />

          <label style={lbl}>Notas do Contexto Social</label>
          <textarea
            style={{ ...inp, height: 100, resize: 'vertical' }}
            value={form.socialNotes ?? ''}
            onChange={e => setForm(f => ({ ...f, socialNotes: e.target.value }))}
            placeholder="Observações relevantes sobre o contexto familiar e social..."
          />

          <label style={lbl}>Profissional Responsável</label>
          <input style={inp} value={form.assignedProfessionalName ?? ''} onChange={e => setForm(f => ({ ...f, assignedProfessionalName: e.target.value }))} placeholder="Nome do profissional" />
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{
            background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12,
            padding: '14px 18px', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e', marginBottom: 6 }}>🔒 Consentimento LGPD Obrigatório</div>
            <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              Conforme Lei 13.709/2018 (LGPD), é necessário registrar o consentimento explícito do titular
              para coleta e tratamento de dados pessoais sensíveis.
            </div>
          </div>

          <label style={lbl}>Dados consentidos para tratamento</label>
          {[
            { key: 'dados_pessoais', label: 'Dados Pessoais e de Identificação' },
            { key: 'atendimento', label: 'Dados de Saúde e Atendimento' },
            { key: 'compartilhamento_parceiros', label: 'Compartilhamento com Parceiros Institucionais' },
            { key: 'comunicacao', label: 'Comunicações Institucionais' },
            { key: 'pesquisa', label: 'Uso para Pesquisa e Avaliação de Impacto (anonimizado)' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" style={{ marginTop: 2 }} defaultChecked={['dados_pessoais', 'atendimento'].includes(key)} />
              <span><strong>{label}</strong></span>
            </label>
          ))}

          {form.isMinor && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 10 }}>👨‍👩‍👦 Responsável Legal</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>Nome do Responsável *</label>
                  <input
                    style={inp}
                    value={form.legalGuardian?.name ?? ''}
                    onChange={e => setForm(f => ({ ...f, legalGuardian: { ...f.legalGuardian!, name: e.target.value, relationship: f.legalGuardian?.relationship ?? '', cpf: f.legalGuardian?.cpf ?? '', phone: f.legalGuardian?.phone ?? '' } }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label style={lbl}>Parentesco</label>
                  <input
                    style={inp}
                    value={form.legalGuardian?.relationship ?? ''}
                    onChange={e => setForm(f => ({ ...f, legalGuardian: { ...f.legalGuardian!, relationship: e.target.value, name: f.legalGuardian?.name ?? '', cpf: f.legalGuardian?.cpf ?? '', phone: f.legalGuardian?.phone ?? '' } }))}
                    placeholder="Mãe, Pai, Tutor..."
                  />
                </div>
                <div>
                  <label style={lbl}>CPF do Responsável</label>
                  <input
                    style={inp}
                    value={form.legalGuardian?.cpf ?? ''}
                    onChange={e => setForm(f => ({ ...f, legalGuardian: { ...f.legalGuardian!, cpf: e.target.value, name: f.legalGuardian?.name ?? '', relationship: f.legalGuardian?.relationship ?? '', phone: f.legalGuardian?.phone ?? '' } }))}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label style={lbl}>Telefone do Responsável</label>
                  <input
                    style={inp}
                    value={form.legalGuardian?.phone ?? ''}
                    onChange={e => setForm(f => ({ ...f, legalGuardian: { ...f.legalGuardian!, phone: e.target.value, name: f.legalGuardian?.name ?? '', relationship: f.legalGuardian?.relationship ?? '', cpf: f.legalGuardian?.cpf ?? '' } }))}
                    placeholder="(11) 9xxxx-xxxx"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
          >← Anterior</button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ ...btn, width: 'auto', flex: 1, marginTop: 0 }}
          >Próximo →</button>
        ) : (
          <button style={{ ...btn, flex: 1, marginTop: 0 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : '✅ Salvar Beneficiário'}
          </button>
        )}
      </div>
    </Modal>
  );
}

// ── Beneficiary Detail Modal ──────────────────────────────────────────────────

function BeneficiaryDetailModal({ beneficiary, onClose, onStageChange }: {
  beneficiary: Beneficiary;
  onClose: () => void;
  onStageChange: (stage: JourneyStage) => void;
}) {
  const stageInfo = stageMap[beneficiary.journeyStage];

  return (
    <Modal title={`Perfil — ${beneficiary.fullName}`} onClose={onClose} wide>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Avatar e status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 120 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: '#fff',
          }}>
            {beneficiary.fullName.charAt(0)}
          </div>
          <StatusBadge status={beneficiary.status} />
          <PriorityBadge priority={beneficiary.priority} />
          {beneficiary.isMinor && (
            <span style={{ fontSize: 9, background: '#fef9c3', color: '#ca8a04', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>MENOR</span>
          )}
        </div>

        {/* Dados pessoais */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 2 }}>
            {beneficiary.socialName ?? beneficiary.fullName}
          </div>
          {beneficiary.socialName && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Nome Registro: {beneficiary.fullName}</div>
          )}
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            📱 {beneficiary.phone} {beneficiary.email ? `· 📧 ${beneficiary.email}` : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'CPF', value: beneficiary.cpf },
              { label: 'Nascimento', value: fmtDate(beneficiary.birthDate) },
              { label: 'Encaminhado por', value: beneficiary.referredBy ?? '—' },
              { label: 'Cadastro', value: fmtDate(beneficiary.registeredAt) },
              { label: 'Último Atendimento', value: timeAgo(beneficiary.lastAttendanceAt) },
              { label: 'Renda Familiar', value: beneficiary.familyIncome ? `R$ ${fmt(beneficiary.familyIncome)}/mês` : '—' },
            ].map(m => (
              <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginTop: 1 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jornada Atual */}
      <div style={{ marginTop: 20, padding: '14px 16px', background: `${stageInfo?.color ?? '#6b7280'}10`, borderRadius: 12, border: `1.5px solid ${stageInfo?.color ?? '#6b7280'}30` }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Etapa Atual da Jornada</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: stageInfo?.color ?? '#374151' }}>
          {stageInfo?.icon} {stageInfo?.label ?? beneficiary.journeyStage}
        </div>
      </div>

      {/* Indicadores de Risco */}
      {(beneficiary.riskScore !== undefined || beneficiary.evasionRisk !== undefined) && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {beneficiary.riskScore !== undefined && (
            <div style={{ background: '#fff7ed', borderRadius: 10, padding: '10px 14px', border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: 10, color: '#9a3412', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>⚠️ Índice de Risco (IA)</div>
              <RiskIndicator score={beneficiary.riskScore} />
            </div>
          )}
          {beneficiary.evasionRisk !== undefined && (
            <div style={{ background: '#fef9c3', borderRadius: 10, padding: '10px 14px', border: '1px solid #fde047' }}>
              <div style={{ fontSize: 10, color: '#713f12', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>🚪 Risco de Evasão (IA)</div>
              <RiskIndicator score={beneficiary.evasionRisk} />
            </div>
          )}
        </div>
      )}

      {/* Vulnerabilidades */}
      {beneficiary.vulnerabilities.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: '#374151', fontWeight: 700, marginBottom: 6 }}>🔴 Vulnerabilidades Identificadas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {beneficiary.vulnerabilities.map(v => (
              <span key={v} style={{
                background: '#fee2e2', color: '#b91c1c',
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              }}>{VULNERABILITY_LABELS[v] ?? v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Condições de Saúde */}
      {beneficiary.healthConditions.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: '#374151', fontWeight: 700, marginBottom: 6 }}>🏥 Condições de Saúde</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {beneficiary.healthConditions.map(h => (
              <span key={h} style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
        </div>
      )}

      {/* Responsável Legal */}
      {beneficiary.isMinor && beneficiary.legalGuardian && (
        <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 6 }}>👨‍👩‍👦 Responsável Legal</div>
          <div style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>
            {beneficiary.legalGuardian.name} ({beneficiary.legalGuardian.relationship}) · {beneficiary.legalGuardian.phone}
          </div>
        </div>
      )}

      {/* LGPD */}
      <div style={{ marginTop: 16, background: '#f0f9ff', borderRadius: 10, padding: '10px 14px', border: '1px solid #bae6fd' }}>
        <div style={{ fontSize: 10, color: '#075985', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>🔒 LGPD</div>
        <div style={{ fontSize: 12, color: '#0369a1' }}>
          {beneficiary.lgpdConsents.length} consentimento(s) registrado(s) · Versão atual: {beneficiary.lgpdConsents[0]?.version ?? '—'}
        </div>
      </div>

      {/* Avançar Jornada */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Avançar Etapa da Jornada</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {JOURNEY_STAGES.filter(s => s.stage !== beneficiary.journeyStage).slice(0, 6).map(s => (
            <button
              key={s.stage}
              onClick={() => onStageChange(s.stage)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${s.color}`,
                background: `${s.color}10`, color: s.color, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >{s.icon} {s.label}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── Appointment Form Modal ────────────────────────────────────────────────────

function AppointmentFormModal({ initial, onSave, onClose }: {
  initial?: Partial<Appointment>;
  onSave: (data: Appointment) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Appointment>>(initial ?? {
    status: 'AGENDADO', modality: 'Presencial', type: 'Psicologia',
    duration: 50, reminderSent: false, confirmationSent: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.professionalName || !form.scheduledAt) return;
    setSaving(true);
    await onSave(form as Appointment);
    setSaving(false);
  };

  return (
    <Modal title="Agendar Atendimento" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} placeholder="Nome do beneficiário" />
        </div>
        <div>
          <label style={lbl}>Profissional *</label>
          <input style={inp} value={form.professionalName ?? ''} onChange={e => setForm(f => ({ ...f, professionalName: e.target.value }))} placeholder="Nome do profissional" />
        </div>
        <div>
          <label style={lbl}>Tipo de Atendimento</label>
          <select style={inp} value={form.type ?? 'Psicologia'} onChange={e => setForm(f => ({ ...f, type: e.target.value as AttendanceType }))}>
            {['Psicologia', 'Psiquiatria', 'Assistencia_Social', 'Juridico', 'Educacao', 'Saude', 'Acolhimento'].map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Data e Hora *</label>
          <input type="datetime-local" style={inp} value={form.scheduledAt ?? ''} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Modalidade</label>
          <select style={inp} value={form.modality ?? 'Presencial'} onChange={e => setForm(f => ({ ...f, modality: e.target.value as Appointment['modality'] }))}>
            {['Presencial', 'Telemedicina', 'Domiciliar'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Duração (min)</label>
          <input type="number" style={inp} value={form.duration ?? 50} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Local / Sala</label>
          <input style={inp} value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="ex: Sala 3 — ISM" />
        </div>
      </div>
      <button style={btn} onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : '📅 Confirmar Agendamento'}
      </button>
    </Modal>
  );
}

// ── Tab: Dashboard ─────────────────────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof BeneficiaryEnterpriseService.getDashboardKPIs>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BeneficiaryEnterpriseService.getDashboardKPIs()
      .then(setKpis)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando dashboard...</div>;
  if (!kpis) return null;

  const npsColor = (kpis.avgNps ?? 0) >= 8 ? '#059669' : (kpis.avgNps ?? 0) >= 6 ? '#d97706' : '#dc2626';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPIs Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="👥" label="Total Beneficiários" value={fmt(kpis.totalBeneficiaries)} color="#7c3aed" />
        <KpiCard icon="💚" label="Ativos" value={fmt(kpis.activeCount)} color="#059669" />
        <KpiCard icon="⏳" label="Lista de Espera" value={fmt(kpis.waitingList)} color="#d97706" alert={kpis.waitingList > 0} />
        <KpiCard icon="🚨" label="Alta Prioridade / Crítico" value={fmt(kpis.highRisk)} color="#dc2626" alert={kpis.highRisk > 0} />
        <KpiCard icon="📅" label="Atendimentos Hoje" value={fmt(kpis.todayAppointments)} color="#2563eb" />
        {kpis.avgNps !== null && (
          <KpiCard icon="⭐" label="NPS Médio" value={kpis.avgNps.toFixed(1)} sub="Satisfação do Beneficiário" color={npsColor} />
        )}
      </div>

      {/* Distribuição por Etapa da Jornada */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>🗺️ Distribuição por Etapa da Jornada</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
          {JOURNEY_STAGES.filter(s => (kpis.stageDistribution[s.stage] ?? 0) > 0).map(s => (
            <div
              key={s.stage}
              style={{
                background: `${s.color}10`, border: `1.5px solid ${s.color}30`,
                borderRadius: 10, padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>
                {kpis.stageDistribution[s.stage] ?? 0}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alerta: Lista de Espera Crítica */}
      {kpis.waitingList > 0 && (
        <div style={{
          background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 14,
          padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 28 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>Lista de Espera Requer Atenção</div>
            <div style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
              {kpis.waitingList} beneficiário(s) aguardam classificação e início de atendimento.
              Revise a triagem e priorize casos críticos.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Beneficiários ─────────────────────────────────────────────────────────

function BeneficiariesTab() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | undefined>();
  const [viewing, setViewing] = useState<Beneficiary | undefined>();
  const [filterStatus, setFilterStatus] = useState<BeneficiaryStatus | 'TODOS'>('TODOS');
  const [filterPriority, setFilterPriority] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BeneficiaryEnterpriseService.getBeneficiaries();
      setBeneficiaries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Beneficiary) => {
    await BeneficiaryEnterpriseService.saveBeneficiary(data);
    await load();
    setShowForm(false);
    setEditing(undefined);
  };

  const handleStageChange = async (stage: JourneyStage) => {
    if (!viewing?.id) return;
    await BeneficiaryEnterpriseService.updateJourneyStage(viewing.id, stage, 'Administrador');
    await load();
    setViewing(undefined);
  };

  const filtered = beneficiaries.filter(b => {
    const matchStatus = filterStatus === 'TODOS' || b.status === filterStatus;
    const matchPriority = filterPriority === 'TODOS' || b.priority === filterPriority;
    const matchSearch = !search || b.fullName.toLowerCase().includes(search.toLowerCase()) || b.cpf.includes(search);
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div>
      {showForm && (
        <BeneficiaryFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
      {viewing && (
        <BeneficiaryDetailModal
          beneficiary={viewing}
          onClose={() => setViewing(undefined)}
          onStageChange={handleStageChange}
        />
      )}

      <SectionHeader
        title="Beneficiários"
        subtitle="Cadastro completo com jornada, vulnerabilidades e LGPD"
        onAdd={() => { setEditing(undefined); setShowForm(true); }}
        addLabel="Novo Beneficiário"
      />

      {/* Busca e Filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        <input
          style={{ ...inp, marginBottom: 0, maxWidth: 280, flex: '1 1 200px' }}
          placeholder="🔍 Buscar por nome ou CPF..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['TODOS', 'ATIVO', 'AGUARDANDO', 'LISTA_ESPERA', 'ALTA', 'ARQUIVADO'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: `1.5px solid ${filterStatus === s ? '#7c3aed' : '#e5e7eb'}`,
                background: filterStatus === s ? '#7c3aed' : '#fff',
                color: filterStatus === s ? '#fff' : '#374151',
              }}
            >{s.replace('_', ' ')}</button>
          ))}
        </div>
        <select
          style={{ ...inp, marginBottom: 0, maxWidth: 140 }}
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="TODOS">Prioridade</option>
          {['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando beneficiários...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>🫂</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum beneficiário encontrado.</div>
          <button
            onClick={() => BeneficiaryEnterpriseService.seedDefaults().then(load)}
            style={{ marginTop: 14, padding: '8px 20px', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >Carregar Dados de Exemplo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(b => {
            const si = stageMap[b.journeyStage];
            return (
              <Card key={b.id} style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: b.priority === 'CRITICA'
                      ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                      : b.priority === 'ALTA'
                        ? 'linear-gradient(135deg,#ea580c,#c2410c)'
                        : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: '#fff', fontWeight: 700,
                  }}>
                    {b.fullName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>
                        {b.socialName ?? b.fullName}
                      </span>
                      <StatusBadge status={b.status} />
                      <PriorityBadge priority={b.priority} />
                      {b.isMinor && (
                        <span style={{ fontSize: 9, background: '#fef9c3', color: '#ca8a04', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>MENOR</span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                      📱 {b.phone} {b.referredBy ? `· Encaminhado por: ${b.referredBy}` : ''} · Cadastro: {fmtDate(b.registeredAt)}
                    </div>

                    {/* Jornada */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${si?.color ?? '#6b7280'}10`, border: `1px solid ${si?.color ?? '#6b7280'}30`, borderRadius: 8, padding: '3px 10px', marginBottom: 8 }}>
                      <span>{si?.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: si?.color ?? '#374151' }}>{si?.label ?? b.journeyStage}</span>
                    </div>

                    {/* Vulnerabilidades */}
                    {b.vulnerabilities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {b.vulnerabilities.slice(0, 3).map(v => (
                          <span key={v} style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 700 }}>
                            {VULNERABILITY_LABELS[v]}
                          </span>
                        ))}
                        {b.vulnerabilities.length > 3 && (
                          <span style={{ fontSize: 9, color: '#9ca3af' }}>+{b.vulnerabilities.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Risco e Ações */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 130 }}>
                    {b.riskScore !== undefined && (
                      <div>
                        <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Risco IA</div>
                        <RiskIndicator score={b.riskScore} />
                      </div>
                    )}
                    <button
                      onClick={() => setViewing(b)}
                      style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #7c3aed', background: '#ede9fe', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#7c3aed' }}
                    >👁 Ver Perfil</button>
                    <button
                      onClick={() => { setEditing(b); setShowForm(true); }}
                      style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                    >✏️ Editar</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Jornada ───────────────────────────────────────────────────────────────

function JourneyTab() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BeneficiaryEnterpriseService.getBeneficiaries()
      .then(setBeneficiaries)
      .finally(() => setLoading(false));
  }, []);

  // Agrupa por etapa
  const byStage = JOURNEY_STAGES.map(s => ({
    ...s,
    beneficiaries: beneficiaries.filter(b => b.journeyStage === s.stage),
  })).filter(s => s.beneficiaries.length > 0);

  return (
    <div>
      <SectionHeader
        title="Mapa da Jornada Digital"
        subtitle="Visualização de todos os beneficiários por etapa do ciclo de atendimento"
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando jornada...</div>
      ) : byStage.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>🗺️</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum beneficiário em jornada.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {byStage.map(s => (
            <div key={s.stage}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                background: `${s.color}10`, borderRadius: 10, marginBottom: 10,
                border: `1.5px solid ${s.color}25`,
              }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.label}</span>
                <span style={{
                  marginLeft: 'auto', background: s.color, color: '#fff',
                  borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                }}>{s.beneficiaries.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, paddingLeft: 14 }}>
                {s.beneficiaries.map(b => (
                  <div key={b.id} style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                    padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${s.color}20`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    }}>{b.fullName.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.socialName ?? b.fullName}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                        <PriorityBadge priority={b.priority} />
                        {b.isMinor && <span style={{ fontSize: 9, background: '#fef9c3', color: '#ca8a04', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>MENOR</span>}
                      </div>
                    </div>
                    {b.riskScore !== undefined && b.riskScore >= 60 && (
                      <span style={{ fontSize: 16 }} title={`Risco: ${b.riskScore}`}>⚠️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Agenda ────────────────────────────────────────────────────────────────

function AgendaTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('TODOS');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BeneficiaryEnterpriseService.getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Appointment) => {
    await BeneficiaryEnterpriseService.saveAppointment(data);
    await load();
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    await BeneficiaryEnterpriseService.deleteAppointment(id);
    await load();
  };

  const filtered = filter === 'TODOS' ? appointments : appointments.filter(a => a.status === filter);

  const modalityIcon: Record<string, string> = { Presencial: '🏥', Telemedicina: '💻', Domiciliar: '🏠' };

  return (
    <div>
      {showForm && (
        <AppointmentFormModal
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      <SectionHeader title="Agenda de Atendimentos" onAdd={() => setShowForm(true)} addLabel="Agendar" />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {['TODOS', 'AGENDADO', 'CONFIRMADO', 'REALIZADO', 'FALTOU', 'CANCELADO'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${filter === s ? '#7c3aed' : '#e5e7eb'}`,
              background: filter === s ? '#7c3aed' : '#fff',
              color: filter === s ? '#fff' : '#374151',
            }}
          >{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando agenda...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum atendimento agendado.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <Card key={a.id} style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>{ATTENDANCE_ICONS[a.type] ?? '🏥'}</div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{a.beneficiaryName}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>com {a.professionalName}</span>
                    <span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 8px', borderRadius: 10, color: '#374151', fontWeight: 600 }}>
                      {a.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
                    <span>📅 {fmtDateTime(a.scheduledAt)}</span>
                    <span>{modalityIcon[a.modality]} {a.modality}</span>
                    <span>⏱ {a.duration}min</span>
                    {a.location && <span>📍 {a.location}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <StatusBadge status={a.status} />
                    {a.reminderSent && <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>📱 Lembrete enviado</span>}
                    {a.confirmationSent && <span style={{ fontSize: 9, background: '#dbeafe', color: '#2563eb', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>✉️ Confirmado</span>}
                  </div>
                </div>

                <button
                  onClick={() => a.id && handleDelete(a.id)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                >🚫 Cancelar</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Atendimentos ─────────────────────────────────────────────────────────

function AttendancesTab() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('TODOS');

  useEffect(() => {
    BeneficiaryEnterpriseService.getAllAttendances()
      .then(setAttendances)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterType === 'TODOS'
    ? attendances
    : attendances.filter(a => a.type === filterType);

  return (
    <div>
      <SectionHeader title="Histórico de Atendimentos" subtitle="Prontuários, evoluções clínicas e encaminhamentos" />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {['TODOS', 'Psicologia', 'Psiquiatria', 'Assistencia_Social', 'Juridico', 'Saude', 'Acolhimento'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${filterType === t ? '#7c3aed' : '#e5e7eb'}`,
              background: filterType === t ? '#7c3aed' : '#fff',
              color: filterType === t ? '#fff' : '#374151',
            }}
          >{ATTENDANCE_ICONS[t] ?? '📋'} {t.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando atendimentos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum atendimento registrado.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <Card key={a.id} style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{ATTENDANCE_ICONS[a.type] ?? '🏥'}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{a.beneficiaryName}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>· {a.type.replace('_', ' ')}</span>
                    <StatusBadge status={a.status} />
                    {a.isConfidential && (
                      <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🔒 Confidencial</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                    👨‍⚕️ {a.professionalName} {a.professionalCouncil ? `(${a.professionalCouncil})` : ''}
                    · 📅 {fmtDateTime(a.scheduledAt)} · {a.modality}
                    {a.durationMinutes ? ` · ⏱ ${a.durationMinutes}min` : ''}
                  </div>

                  {a.chiefComplaint && !a.isConfidential && (
                    <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}>
                      <strong>Queixa:</strong> {a.chiefComplaint}
                    </div>
                  )}

                  {a.referrals && a.referrals.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      {a.referrals.map((r, i) => (
                        <span key={i} style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>↗ {r}</span>
                      ))}
                    </div>
                  )}
                </div>

                {a.isSigned && (
                  <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '3px 8px', borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>✍ Assinado</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Telemedicina ─────────────────────────────────────────────────────────

function TelehealthTab() {
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BeneficiaryEnterpriseService.getTelehealthSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  const statusColor2 = (s: string) => {
    const m: Record<string, string> = {
      AGENDADA: '#d97706', AGUARDANDO: '#f59e0b', EM_ANDAMENTO: '#2563eb',
      CONCLUIDA: '#059669', FALHOU: '#dc2626', CANCELADA: '#6b7280',
    };
    return m[s] ?? '#6b7280';
  };

  return (
    <div>
      <SectionHeader title="Sessões de Telemedicina" subtitle="Videochamadas seguras com criptografia E2E e registro em prontuário" />

      <div style={{
        background: 'linear-gradient(135deg,#ede9fe,#dbeafe)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 20,
        display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 24 }}>🔐</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b' }}>Telemedicina Segura por Padrão</div>
          <div style={{ fontSize: 12, color: '#4338ca' }}>Criptografia E2E ativa · LGPD Compliant · Consentimento registrado · CFM Res. 2.314/2022</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando sessões...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>💻</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhuma sessão de telemedicina registrada.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map(s => (
            <Card key={s.id} style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💻</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{s.beneficiaryName}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>com {s.professionalName}</span>
                    <span style={{
                      background: `${statusColor2(s.status)}18`, color: statusColor2(s.status),
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                    }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                    📅 {fmtDateTime(s.scheduledAt)} {s.durationMinutes ? `· ⏱ ${s.durationMinutes}min` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {s.encryptionEnabled && (
                      <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🔐 E2E</span>
                    )}
                    {s.recordingConsented && (
                      <span style={{ fontSize: 9, background: '#dbeafe', color: '#2563eb', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🎥 Gravação Consentida</span>
                    )}
                    {s.qualityRating && (
                      <span style={{ fontSize: 9, background: '#fef9c3', color: '#ca8a04', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>⭐ {s.qualityRating}/5</span>
                    )}
                    {s.chatMessages !== undefined && (
                      <span style={{ fontSize: 9, color: '#6b7280' }}>💬 {s.chatMessages} msgs</span>
                    )}
                    {s.filesShared !== undefined && (
                      <span style={{ fontSize: 9, color: '#6b7280' }}>📎 {s.filesShared} arqs.</span>
                    )}
                  </div>
                </div>
                {s.roomUrl && s.status === 'EM_ANDAMENTO' && (
                  <a
                    href={s.roomUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 14px', borderRadius: 10, background: '#7c3aed', color: '#fff',
                      fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0,
                    }}
                  >📹 Entrar</a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Documentos ───────────────────────────────────────────────────────────

function DocumentsTab() {
  const [documents, setDocuments] = useState<BeneficiaryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DocumentsTab mostra dados de exemplo; integração completa via BeneficiaryDocument CRUD
    setLoading(false);
  }, []);


  const DOC_ICONS: Record<string, string> = {
    Receita: '💊', Atestado: '📄', Laudo: '🔬', Parecer: '📝',
    Declaracao: '📃', Encaminhamento: '↗️', Termo: '✍️',
    Certificado: '🎓', Documento_Pessoal: '🪪', Outro: '📁',
  };

  const exampleDocs: BeneficiaryDocument[] = [
    { id: '1', beneficiaryId: 'b1', beneficiaryName: 'Maria Aparecida Santos', category: 'Receita', title: 'Receita Médica — Fluoxetina 20mg', issuedBy: 'Dr. Sérgio Mello', issuedAt: '2025-07-15', isSigned: true, isConfidential: false, downloadCount: 2 },
    { id: '2', beneficiaryId: 'b1', beneficiaryName: 'Maria Aparecida Santos', category: 'Encaminhamento', title: 'Encaminhamento para CRAS — Serviço de Assistência', issuedBy: 'Ana Lima', issuedAt: '2025-07-10', isSigned: true, isConfidential: false, downloadCount: 1 },
    { id: '3', beneficiaryId: 'b2', beneficiaryName: 'Pedro Henrique Oliveira', category: 'Laudo', title: 'Laudo Psicológico — Avaliação Diagnóstica TDAH', issuedBy: 'Dra. Vanessa Guimarães', issuedAt: '2025-06-20', professionalCouncil: 'CRP 06/142850', isSigned: true, isConfidential: true, downloadCount: 0 },
    { id: '4', beneficiaryId: 'b2', beneficiaryName: 'Pedro Henrique Oliveira', category: 'Atestado', title: 'Atestado de Frequência — Julho/2025', issuedBy: 'Equipe ISM', issuedAt: '2025-07-20', isSigned: true, isConfidential: false, downloadCount: 3 },
  ];

  const docs = documents.length > 0 ? documents : exampleDocs;

  return (
    <div>
      <SectionHeader title="Gestão de Documentos" subtitle="Receitas, laudos, atestados, encaminhamentos e certidões" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando documentos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {docs.map(d => (
            <Card key={d.id} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{DOC_ICONS[d.category] ?? '📁'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{d.category}</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                👤 {d.beneficiaryName} · 📅 {fmtDate(d.issuedAt)}
                <br />👨‍⚕️ {d.issuedBy} {d.professionalCouncil ? `(${d.professionalCouncil})` : ''}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {d.isSigned && <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>✍ Assinado</span>}
                {d.isConfidential && <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🔒 Confidencial</span>}
                <span style={{ fontSize: 9, color: '#9ca3af' }}>⬇️ {d.downloadCount}x</span>
              </div>

              <button style={{
                marginTop: 12, width: '100%', padding: '7px', borderRadius: 8,
                border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 11,
                fontWeight: 700, cursor: 'pointer', color: '#374151',
              }}>
                📥 Download PDF
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Avaliações ───────────────────────────────────────────────────────────

function EvaluationsTab() {
  const [evaluations, setEvaluations] = useState<BeneficiaryEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEval, setNewEval] = useState<Partial<BeneficiaryEvaluation>>({
    type: 'NPS', channel: 'Presencial',
  });

  const load = useCallback(async () => {
    setLoading(true);
    BeneficiaryEnterpriseService.getEvaluations()
      .then(setEvaluations)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!newEval.beneficiaryName || newEval.score === undefined) return;
    await BeneficiaryEnterpriseService.saveEvaluation({
      ...newEval,
      respondedAt: new Date().toISOString(),
    } as BeneficiaryEvaluation);
    await load();
    setShowForm(false);
    setNewEval({ type: 'NPS', channel: 'Presencial' });
  };

  // Cálculo de NPS
  const npsEvals = evaluations.filter(e => e.type === 'NPS');
  const promoters = npsEvals.filter(e => e.score >= 9).length;
  const detractors = npsEvals.filter(e => e.score <= 6).length;
  const nps = npsEvals.length > 0 ? Math.round(((promoters - detractors) / npsEvals.length) * 100) : null;
  const avgCsat = evaluations.filter(e => e.type === 'CSAT').reduce((acc, e) => acc + e.score, 0) / (evaluations.filter(e => e.type === 'CSAT').length || 1);

  const scoreColor = (type: string, score: number) => {
    if (type === 'NPS') return score >= 9 ? '#059669' : score >= 7 ? '#d97706' : '#dc2626';
    if (type === 'CSAT') return score >= 4 ? '#059669' : score >= 3 ? '#d97706' : '#dc2626';
    return '#6b7280';
  };

  return (
    <div>
      {showForm && (
        <Modal title="Registrar Avaliação" onClose={() => setShowForm(false)}>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={newEval.beneficiaryName ?? ''} onChange={e => setNewEval(f => ({ ...f, beneficiaryName: e.target.value }))} placeholder="Nome do beneficiário" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp} value={newEval.type ?? 'NPS'} onChange={e => setNewEval(f => ({ ...f, type: e.target.value as BeneficiaryEvaluation['type'] }))}>
                {['NPS', 'CSAT', 'CES'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Canal</label>
              <select style={inp} value={newEval.channel ?? 'Presencial'} onChange={e => setNewEval(f => ({ ...f, channel: e.target.value as BeneficiaryEvaluation['channel'] }))}>
                {['App', 'WhatsApp', 'Email', 'Presencial'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label style={lbl}>Nota ({newEval.type === 'NPS' ? '0–10' : newEval.type === 'CSAT' ? '1–5' : '1–7'}) *</label>
          <input
            type="number"
            min={0}
            max={newEval.type === 'NPS' ? 10 : newEval.type === 'CSAT' ? 5 : 7}
            style={inp}
            value={newEval.score ?? ''}
            onChange={e => setNewEval(f => ({ ...f, score: Number(e.target.value) }))}
          />

          <label style={lbl}>Comentário (opcional)</label>
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={newEval.comment ?? ''} onChange={e => setNewEval(f => ({ ...f, comment: e.target.value }))} />

          <button style={btn} onClick={handleSave}>✅ Registrar Avaliação</button>
        </Modal>
      )}

      <SectionHeader
        title="Satisfação do Beneficiário"
        subtitle="NPS, CSAT e CES — Métricas de experiência humanizada"
        onAdd={() => setShowForm(true)}
        addLabel="Registrar Avaliação"
      />

      {/* KPIs de Satisfação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        <KpiCard
          icon="⭐"
          label="NPS"
          value={nps !== null ? String(nps) : '—'}
          sub={`${npsEvals.length} respostas`}
          color={nps !== null && nps >= 50 ? '#059669' : nps !== null && nps >= 0 ? '#d97706' : '#dc2626'}
        />
        <KpiCard
          icon="😊"
          label="CSAT Médio"
          value={avgCsat > 0 ? avgCsat.toFixed(1) : '—'}
          sub="Satisfação geral"
          color="#2563eb"
        />
        <KpiCard
          icon="👍"
          label="Promotores NPS"
          value={String(promoters)}
          sub="Nota ≥ 9"
          color="#059669"
        />
        <KpiCard
          icon="👎"
          label="Detratores NPS"
          value={String(detractors)}
          sub="Nota ≤ 6"
          color="#dc2626"
          alert={detractors > 0}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando avaliações...</div>
      ) : evaluations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>⭐</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhuma avaliação registrada.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {evaluations.map(e => (
            <Card key={e.id} style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{e.beneficiaryName}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                    {e.type} · {e.channel} · {fmtDate(e.respondedAt)}
                  </div>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${scoreColor(e.type, e.score)}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: scoreColor(e.type, e.score),
                }}>
                  {e.score}
                </div>
              </div>
              {e.comment && (
                <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', borderLeft: '3px solid #e5e7eb', paddingLeft: 8, lineHeight: 1.5 }}>
                  "{e.comment}"
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BeneficiaryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  const tabIcons: Record<Tab, string> = {
    Dashboard: '📊', Beneficiários: '👥', Jornada: '🗺️', Agenda: '📅',
    Atendimentos: '🏥', Telemedicina: '💻', Documentos: '📄', Avaliações: '⭐',
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>🫂</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Portal do Beneficiário
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Jornada Digital · Atendimentos · Agenda · Telemedicina · Documentos · Satisfação
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 14,
          padding: 5, flexWrap: 'wrap', marginTop: 20,
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
              <span>{tabIcons[tab]}</span> {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Dashboard' && <DashboardTab />}
      {activeTab === 'Beneficiários' && <BeneficiariesTab />}
      {activeTab === 'Jornada' && <JourneyTab />}
      {activeTab === 'Agenda' && <AgendaTab />}
      {activeTab === 'Atendimentos' && <AttendancesTab />}
      {activeTab === 'Telemedicina' && <TelehealthTab />}
      {activeTab === 'Documentos' && <DocumentsTab />}
      {activeTab === 'Avaliações' && <EvaluationsTab />}
    </div>
  );
}
