/**
 * ProfessionalPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Portal do Profissional — Instituto Ser Melhor
 * Hub Clínico Enterprise: Agenda · Prontuário · Evoluções · Prescrições ·
 *   Telemedicina · Discussão Multiprofissional · Alertas · BI
 * Prompt 031 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Dashboard       — KPIs, alertas clínicos, agenda do dia, pendências
 *   2. Profissionais   — Listagem, credenciamento, perfil clínico
 *   3. Prontuário      — PEP/EHR com anamnese, diagnósticos e plano terapêutico
 *   4. Evoluções       — SOAP, assinatura digital, IA assistida
 *   5. Prescrições     — Receitas, laudos, atestados, encaminhamentos
 *   6. Discussão       — Casos multiprofissionais, pareceres, urgências
 *   7. Agenda & Bloqueios — Disponibilidade, bloqueios, plantões
 *   8. Analytics       — Produtividade, comparecimento, indicadores clínicos
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ProfessionalEnterpriseService,
  type Professional,
  type ProfessionalCategory,
  type ClinicalRecord,
  type ClinicalEvolution,
  type Prescription,
  type CaseDiscussion,
  type ScheduleBlock,
  type ClinicalAlert,
  type DiagnosticEntry,
  type EvolutionType,
  type DocumentCategory,
} from '../services/professionalEnterprise';

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

const CATEGORY_MAP: Record<ProfessionalCategory, { label: string; icon: string; color: string }> = {
  Psicologo:       { label: 'Psicólogo(a)',        icon: '🧠', color: '#7c3aed' },
  Psiquiatra:      { label: 'Psiquiatra',          icon: '💊', color: '#4f46e5' },
  AssistenteSocial:{ label: 'Assistente Social',   icon: '🤝', color: '#0891b2' },
  Advogado:        { label: 'Advogado(a)',          icon: '⚖️', color: '#0369a1' },
  Medico:          { label: 'Médico(a)',            icon: '🩺', color: '#059669' },
  Enfermeiro:      { label: 'Enfermeiro(a)',        icon: '💉', color: '#10b981' },
  Nutricionista:   { label: 'Nutricionista',        icon: '🥗', color: '#16a34a' },
  Fisioterapeuta:  { label: 'Fisioterapeuta',       icon: '🦽', color: '#65a30d' },
  Pedagogo:        { label: 'Pedagogo(a)',          icon: '📚', color: '#ca8a04' },
  Educador:        { label: 'Educador(a)',          icon: '🎓', color: '#d97706' },
  Coordenador:     { label: 'Coordenador(a)',       icon: '📋', color: '#ea580c' },
  Diretor:         { label: 'Diretor(a)',           icon: '🏛️', color: '#dc2626' },
  Voluntario:      { label: 'Voluntário(a)',        icon: '💛', color: '#f59e0b' },
  Estagiario:      { label: 'Estagiário(a)',        icon: '🌱', color: '#6b7280' },
};

const CREDENTIAL_STATUS: Record<string, { label: string; color: string }> = {
  APROVADO:    { label: 'Aprovado',         color: '#059669' },
  EM_ANALISE:  { label: 'Em Análise',       color: '#d97706' },
  PENDENTE_DOC:{ label: 'Pendente Docs',    color: '#ea580c' },
  SUSPENSO:    { label: 'Suspenso',         color: '#dc2626' },
};

const STATUS_COLOR: Record<string, string> = {
  Ativo: '#059669', 'Em Onboarding': '#d97706', Afastado: '#f59e0b',
  Inativo: '#9ca3af', Desligado: '#dc2626',
};

const RISK_COLOR = (r?: string) => {
  if (!r) return '#9ca3af';
  return { Baixo: '#059669', Moderado: '#d97706', Alto: '#ea580c', Critico: '#dc2626' }[r] ?? '#9ca3af';
};

const ALERT_COLOR: Record<string, string> = {
  INFO: '#2563eb', AVISO: '#d97706', URGENTE: '#ea580c', CRITICO: '#dc2626',
};

const DOC_ICONS: Record<DocumentCategory, string> = {
  Receita_Simples: '💊', Receita_Especial: '🔴', Atestado: '📄',
  Laudo: '🔬', Parecer: '📝', Declaracao: '📃',
  Encaminhamento: '↗️', Relatorio: '📊', Certificado: '🎓',
  Termo_Consentimento: '✍️',
};

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = ['Dashboard', 'Profissionais', 'Prontuário', 'Evoluções', 'Prescrições', 'Discussão', 'Agenda', 'Analytics'] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  Dashboard: '📊', Profissionais: '👨‍⚕️', 'Prontuário': '📋',
  'Evoluções': '📝', 'Prescrições': '💊', 'Discussão': '💬',
  Agenda: '📅', Analytics: '📈',
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

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

function Badge({ text, color, bg }: { text: string; color: string; bg?: string }) {
  return (
    <span style={{
      background: bg ?? `${color}18`, color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{text}</span>
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
        width: '100%', maxWidth: wide ? 900 : 680,
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

function EmptyState({ icon, title, action, onAction }: { icon: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
      <div style={{ fontSize: 44 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#374151', fontSize: 15, marginTop: 14 }}>{title}</div>
      {action && onAction && (
        <button onClick={onAction} style={{ marginTop: 18, padding: '9px 22px', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Professional Form Modal ────────────────────────────────────────────────────

function ProfessionalFormModal({ initial, onSave, onClose }: {
  initial?: Partial<Professional>;
  onSave: (p: Professional) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Professional>>(initial ?? {
    status: 'Em Onboarding', credentialStatus: 'EM_ANALISE',
    category: 'Psicologo', councilType: 'CRP', councilState: 'SP',
    sessionDurationMinutes: 50, maxDailyAppointments: 8,
    specialties: [], competencies: [], certifications: [],
    availabilitySlots: [], enrolledPrograms: [], odsGoals: [],
    hasDigitalCertificate: false, lgpdConsent: false,
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const STEPS = ['Identificação', 'Credenciamento', 'Agenda & Perfil', 'Acesso'];

  const handleSave = async () => {
    if (!form.fullName || !form.cpf || !form.councilNumber || !form.email) return;
    setSaving(true);
    await onSave({
      ...form,
      joinedAt: form.joinedAt ?? new Date().toISOString().slice(0, 10),
    } as Professional);
    setSaving(false);
  };

  const toggleSpec = (v: string) => {
    const cur = form.specialties ?? [];
    setForm(f => ({ ...f, specialties: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }));
  };

  const SPECIALTIES_BY_CAT: Record<string, string[]> = {
    Psicologo: ['Psicologia Social', 'TCC', 'Psicanálise', 'EMDR', 'Trauma', 'Infantil', 'Neuropsicologia', 'Saúde Mental'],
    AssistenteSocial: ['Políticas Públicas', 'SUAS', 'Criança & Adolescente', 'Idoso', 'Família', 'Habitação', 'Renda'],
    Advogado: ['Família', 'Violência Doméstica', 'LGPD', 'Terceiro Setor', 'Previdenciário', 'Trabalhista'],
    Medico: ['Clínica Geral', 'Psiquiatria', 'Saúde Pública', 'Pediatria', 'Geriatria', 'Saúde da Família'],
    Enfermeiro: ['Saúde Mental', 'Saúde Coletiva', 'Urgência', 'Pediatria', 'Geriatria'],
    Nutricionista: ['Nutrição Clínica', 'Alimentação Coletiva', 'Nutrição Infantil', 'Comportamento Alimentar'],
    Fisioterapeuta: ['Reabilitação', 'Ortopedia', 'Neurologia', 'Saúde da Mulher', 'Pediatria'],
  };
  const specs = SPECIALTIES_BY_CAT[form.category as string] ?? [];

  return (
    <Modal title={form.id ? 'Editar Profissional' : 'Credenciar Profissional'} onClose={onClose} wide>
      <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{
            flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: step === i ? '#7c3aed' : i < step ? '#ede9fe' : '#f3f4f6',
            color: step === i ? '#fff' : i < step ? '#7c3aed' : '#9ca3af',
            fontSize: 10, fontWeight: 700,
          }}>{i < step ? '✓ ' : ''}{s}</button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Nome Completo *</label>
              <input style={inp} value={form.fullName ?? ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nome completo com título" />
            </div>
            <div>
              <label style={lbl}>CPF *</label>
              <input style={inp} value={form.cpf ?? ''} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div>
              <label style={lbl}>Data de Nascimento</label>
              <input type="date" style={inp} value={form.birthDate ?? ''} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>E-mail Institucional *</label>
              <input type="email" style={inp} value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Telefone</label>
              <input style={inp} value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 9xxxx-xxxx" />
            </div>
            <div>
              <label style={lbl}>Gênero</label>
              <select style={inp} value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Selecione</option>
                {['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Departamento / Área</label>
              <input style={inp} value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="ex: Saúde Mental & Emancipação" />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Categoria *</label>
              <select style={inp} value={form.category ?? 'Psicologo'} onChange={e => setForm(f => ({ ...f, category: e.target.value as ProfessionalCategory, specialties: [] }))}>
                {(Object.keys(CATEGORY_MAP) as ProfessionalCategory[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_MAP[c].icon} {CATEGORY_MAP[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Conselho Profissional *</label>
              <select style={inp} value={form.councilType ?? 'CRP'} onChange={e => setForm(f => ({ ...f, councilType: e.target.value as any }))}>
                {['CRP', 'CRM', 'COREN', 'CRAS', 'OAB', 'CFF', 'CREFITO', 'CFN', 'CRO', 'Outro'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Número do Registro *</label>
              <input style={inp} value={form.councilNumber ?? ''} onChange={e => setForm(f => ({ ...f, councilNumber: e.target.value }))} placeholder="ex: 06/142850" />
            </div>
            <div>
              <label style={lbl}>Estado do Registro</label>
              <input style={inp} value={form.councilState ?? 'SP'} onChange={e => setForm(f => ({ ...f, councilState: e.target.value }))} placeholder="SP" maxLength={2} />
            </div>
            <div>
              <label style={lbl}>Vencimento do Registro</label>
              <input type="date" style={inp} value={form.councilExpiresAt ?? ''} onChange={e => setForm(f => ({ ...f, councilExpiresAt: e.target.value }))} />
            </div>
          </div>

          {specs.length > 0 && (
            <>
              <label style={lbl}>Especialidades</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {specs.map(s => {
                  const sel = (form.specialties ?? []).includes(s);
                  return (
                    <span key={s} onClick={() => toggleSpec(s)} style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: sel ? '#7c3aed' : '#f3f4f6',
                      color: sel ? '#fff' : '#374151',
                      border: `1.5px solid ${sel ? '#7c3aed' : '#e5e7eb'}`,
                      transition: 'all 0.15s',
                    }}>{s}</span>
                  );
                })}
              </div>
            </>
          )}

          <label style={lbl}>Status de Credenciamento</label>
          <select style={inp} value={form.credentialStatus ?? 'EM_ANALISE'} onChange={e => setForm(f => ({ ...f, credentialStatus: e.target.value as any }))}>
            {['APROVADO', 'EM_ANALISE', 'PENDENTE_DOC', 'SUSPENSO'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Duração da Sessão (min)</label>
              <input type="number" style={inp} value={form.sessionDurationMinutes ?? 50} onChange={e => setForm(f => ({ ...f, sessionDurationMinutes: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={lbl}>Máx. Atendimentos/dia</label>
              <input type="number" style={inp} value={form.maxDailyAppointments ?? 8} onChange={e => setForm(f => ({ ...f, maxDailyAppointments: Number(e.target.value) }))} />
            </div>
          </div>

          <label style={lbl}>Dias de Atendimento (marque os dias disponíveis)</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => {
              const has = (form.availabilitySlots ?? []).some(s => s.dayOfWeek === i);
              return (
                <button key={d} onClick={() => {
                  const cur = form.availabilitySlots ?? [];
                  setForm(f => ({
                    ...f,
                    availabilitySlots: has
                      ? cur.filter(s => s.dayOfWeek !== i)
                      : [...cur, { dayOfWeek: i as any, startTime: '08:00', endTime: '17:00', modality: 'Ambos' }],
                  }));
                }} style={{
                  width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${has ? '#7c3aed' : '#e5e7eb'}`,
                  background: has ? '#7c3aed' : '#fff', color: has ? '#fff' : '#374151',
                  fontWeight: 700, fontSize: 10, cursor: 'pointer',
                }}>{d}</button>
              );
            })}
          </div>

          <label style={lbl}>Competências (vírgula separado)</label>
          <input
            style={inp}
            value={(form.competencies ?? []).join(', ')}
            onChange={e => setForm(f => ({ ...f, competencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="Avaliação Psicológica, Psicoterapia Individual, ..."
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e', marginBottom: 6 }}>🔒 Credenciamento e LGPD</div>
            <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              O profissional terá acesso a dados sensíveis de beneficiários conforme LGPD Art. 11.
              O credenciamento exige validação do conselho profissional e assinatura do Termo de Sigilo.
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.lgpdConsent ?? false} onChange={e => setForm(f => ({ ...f, lgpdConsent: e.target.checked }))} style={{ marginTop: 2 }} />
            <span><strong>Confirmo que li e aceito o Termo de Sigilo Profissional e a Política de Privacidade</strong> conforme LGPD Lei 13.709/2018</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.hasDigitalCertificate ?? false} onChange={e => setForm(f => ({ ...f, hasDigitalCertificate: e.target.checked }))} />
            <span>Possui Certificado Digital ICP-Brasil para Assinatura Eletrônica</span>
          </label>

          <label style={lbl}>Status do Profissional</label>
          <select style={inp} value={form.status ?? 'Em Onboarding'} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
            {['Ativo', 'Em Onboarding', 'Afastado', 'Inativo', 'Desligado'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>← Anterior</button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} style={{ ...btn, width: 'auto', flex: 1, marginTop: 0 }}>Próximo →</button>
        ) : (
          <button style={{ ...btn, flex: 1, marginTop: 0 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Credenciando...' : '✅ Credenciar Profissional'}
          </button>
        )}
      </div>
    </Modal>
  );
}

// ── Professional Profile Modal ─────────────────────────────────────────────────

function ProfessionalProfileModal({ professional, onClose }: { professional: Professional; onClose: () => void }) {
  const cat = CATEGORY_MAP[professional.category];
  const cred = CREDENTIAL_STATUS[professional.credentialStatus];

  return (
    <Modal title="Perfil do Profissional" onClose={onClose} wide>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 110 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: `linear-gradient(135deg,${cat.color},${cat.color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>{cat.icon}</div>
          <Badge text={professional.status} color={STATUS_COLOR[professional.status]} />
          <Badge text={cred.label} color={cred.color} />
          {professional.hasDigitalCertificate && (
            <Badge text="Cert. Digital" color="#059669" bg="#d1fae5" />
          )}
        </div>

        {/* Dados */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 2 }}>{professional.fullName}</div>
          <div style={{ fontSize: 13, color: cat.color, fontWeight: 700, marginBottom: 6 }}>
            {cat.icon} {cat.label} · {professional.councilType} {professional.councilNumber}/{professional.councilState}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
            📧 {professional.email} · 📱 {professional.phone} · 🏢 {professional.department}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Na instituição desde', value: fmtDate(professional.joinedAt) },
              { label: 'Último acesso', value: timeAgo(professional.lastAccessAt) },
              { label: 'Sessão padrão', value: `${professional.sessionDurationMinutes} min` },
              { label: 'Máx. atendimentos/dia', value: String(professional.maxDailyAppointments) },
              { label: 'Total de atendimentos', value: fmt(professional.totalAttendances) },
              { label: 'NPS médio', value: professional.satisfactionAvg ? `${professional.satisfactionAvg}/10` : '—' },
            ].map(m => (
              <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginTop: 1 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Especialidades */}
      {professional.specialties.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>🎯 Especialidades</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {professional.specialties.map(s => (
              <span key={s} style={{ background: `${cat.color}12`, color: cat.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Competências */}
      {professional.competencies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>💡 Competências</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {professional.competencies.map(c => (
              <span key={c} style={{ background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certificações */}
      {professional.certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>🎓 Formação Acadêmica</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {professional.certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 16 }}>🎓</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>{c.institution} · {c.year} · {c.type.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disponibilidade */}
      {professional.availabilitySlots.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>📅 Disponibilidade Semanal</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => {
              const slot = professional.availabilitySlots.find(s => s.dayOfWeek === i);
              return (
                <div key={d} style={{
                  textAlign: 'center', padding: '8px 10px', borderRadius: 10, flex: 1,
                  background: slot ? `${cat.color}12` : '#f3f4f6',
                  border: `1.5px solid ${slot ? cat.color + '40' : '#e5e7eb'}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: slot ? cat.color : '#9ca3af' }}>{d}</div>
                  {slot && (
                    <div style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>
                      {slot.startTime}–{slot.endTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assinatura Digital */}
      {professional.digitalSignature && (
        <div style={{ marginTop: 16, background: '#f0f9ff', borderRadius: 10, padding: '12px 16px', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#075985', marginBottom: 4 }}>🔐 Assinatura Digital</div>
          <div style={{ fontSize: 12, color: '#0369a1' }}>
            {professional.digitalSignature.provider} · Válida até {fmtDate(professional.digitalSignature.validUntil)}
            {professional.digitalSignature.active && <Badge text="Ativa" color="#059669" bg="#d1fae5" />}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Evolution Form Modal ───────────────────────────────────────────────────────

function EvolutionFormModal({ records, onSave, onClose }: {
  records: ClinicalRecord[];
  onSave: (e: ClinicalEvolution) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<ClinicalEvolution>>({
    evolutionType: 'Psicologica', modality: 'Presencial',
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionDurationMinutes: 50,
    interventionsApplied: [], prescriptionsIssued: [], referralsMade: [],
    isConfidential: false, isSigned: false, aiAssisted: false, version: 1,
    subjectiveData: '', objectiveData: '', assessment: '', plan: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.professionalName || !form.sessionDate) return;
    setSaving(true);
    await onSave(form as ClinicalEvolution);
    setSaving(false);
  };

  return (
    <Modal title="Registrar Evolução Clínica (SOAP)" onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} placeholder="Nome do beneficiário" />
        </div>
        <div>
          <label style={lbl}>Profissional Responsável *</label>
          <input style={inp} value={form.professionalName ?? ''} onChange={e => setForm(f => ({ ...f, professionalName: e.target.value }))} placeholder="Dr(a). Nome" />
        </div>
        <div>
          <label style={lbl}>Conselho (ex: CRP 06/142850)</label>
          <input style={inp} value={form.professionalCouncil ?? ''} onChange={e => setForm(f => ({ ...f, professionalCouncil: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Tipo de Evolução</label>
          <select style={inp} value={form.evolutionType ?? 'Psicologica'} onChange={e => setForm(f => ({ ...f, evolutionType: e.target.value as EvolutionType }))}>
            {(['Psicologica', 'Psiquiatrica', 'Social', 'Juridica', 'Medica', 'Nutricional', 'Multidisciplinar', 'Acolhimento'] as EvolutionType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Data da Sessão *</label>
          <input type="date" style={inp} value={form.sessionDate ?? ''} onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Duração (min)</label>
          <input type="number" style={inp} value={form.sessionDurationMinutes ?? 50} onChange={e => setForm(f => ({ ...f, sessionDurationMinutes: Number(e.target.value) }))} />
        </div>
        <div>
          <label style={lbl}>Modalidade</label>
          <select style={inp} value={form.modality ?? 'Presencial'} onChange={e => setForm(f => ({ ...f, modality: e.target.value as ClinicalEvolution['modality'] }))}>
            {['Presencial', 'Telemedicina', 'Domiciliar', 'Grupo'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Risco Identificado</label>
          <select style={inp} value={form.riskAssessment ?? ''} onChange={e => setForm(f => ({ ...f, riskAssessment: e.target.value as any }))}>
            <option value="">Não avaliado</option>
            {['Baixo', 'Moderado', 'Alto', 'Critico'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* SOAP */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#374151', marginBottom: 12 }}>
          📋 SOAP — Evolução Estruturada
          {form.aiAssisted && <span style={{ marginLeft: 8, fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>✨ IA Assistida</span>}
        </div>

        <label style={lbl}>S — Subjetivo (O que o beneficiário relata)</label>
        <textarea
          style={{ ...inp, height: 80, resize: 'vertical' }}
          value={form.subjectiveData ?? ''}
          onChange={e => setForm(f => ({ ...f, subjectiveData: e.target.value }))}
          placeholder="Queixa principal, relato espontâneo, humor, afeto, pensamentos..."
        />

        <label style={lbl}>O — Objetivo (Dados observados pelo profissional)</label>
        <textarea
          style={{ ...inp, height: 70, resize: 'vertical' }}
          value={form.objectiveData ?? ''}
          onChange={e => setForm(f => ({ ...f, objectiveData: e.target.value }))}
          placeholder="Comportamento, sinais clínicos, exame mental, observações objetivas..."
        />

        <label style={lbl}>A — Avaliação (Análise clínica)</label>
        <textarea
          style={{ ...inp, height: 70, resize: 'vertical' }}
          value={form.assessment ?? ''}
          onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))}
          placeholder="Impressão clínica, hipóteses diagnósticas, evolução em relação à sessão anterior..."
        />

        <label style={lbl}>P — Plano (Ações para a próxima sessão)</label>
        <textarea
          style={{ ...inp, height: 70, resize: 'vertical', marginBottom: 0 }}
          value={form.plan ?? ''}
          onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
          placeholder="Objetivos, técnicas, encaminhamentos, orientações, retorno..."
        />
      </div>

      <label style={lbl}>Observações sobre Risco (se aplicável)</label>
      <textarea
        style={{ ...inp, height: 60, resize: 'vertical' }}
        value={form.riskNotes ?? ''}
        onChange={e => setForm(f => ({ ...f, riskNotes: e.target.value }))}
        placeholder="Registre fatores de risco ou proteção identificados..."
      />

      <label style={lbl}>Data do Próximo Atendimento</label>
      <input type="date" style={inp} value={form.followUpDate ?? ''} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={form.isConfidential ?? false} onChange={e => setForm(f => ({ ...f, isConfidential: e.target.checked }))} />
          🔒 Registro Confidencial (acesso apenas ao profissional)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={form.aiAssisted ?? false} onChange={e => setForm(f => ({ ...f, aiAssisted: e.target.checked }))} />
          ✨ Documentação assistida por IA
        </label>
      </div>

      {form.riskAssessment === 'Critico' && (
        <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: 4 }}>🚨 RISCO CRÍTICO IDENTIFICADO</div>
          <div style={{ fontSize: 12, color: '#991b1b' }}>
            Risco crítico requer acionamento imediato do coordenador clínico e notificação à equipe multiprofissional.
            Certifique-se de registrar o Plano de Segurança nas notas.
          </div>
        </div>
      )}

      <button style={btn} onClick={handleSave} disabled={saving}>
        {saving ? 'Registrando...' : '✍️ Salvar Evolução Clínica'}
      </button>
    </Modal>
  );
}

// ── Prescription Form Modal ───────────────────────────────────────────────────

function PrescriptionFormModal({ onSave, onClose }: {
  onSave: (p: Prescription) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Prescription>>({
    category: 'Atestado', isSigned: false, isDigital: false,
    downloadCount: 0, isConfidential: false,
    issuedAt: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.professionalName || !form.title || !form.content) return;
    setSaving(true);
    await onSave(form as Prescription);
    setSaving(false);
  };

  return (
    <Modal title="Emitir Documento Clínico" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Profissional Responsável *</label>
          <input style={inp} value={form.professionalName ?? ''} onChange={e => setForm(f => ({ ...f, professionalName: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Conselho</label>
          <input style={inp} value={form.professionalCouncil ?? ''} onChange={e => setForm(f => ({ ...f, professionalCouncil: e.target.value }))} placeholder="CRP 06/142850" />
        </div>
        <div>
          <label style={lbl}>Tipo de Documento *</label>
          <select style={inp} value={form.category ?? 'Atestado'} onChange={e => setForm(f => ({ ...f, category: e.target.value as DocumentCategory }))}>
            {(Object.keys(DOC_ICONS) as DocumentCategory[]).map(c => (
              <option key={c} value={c}>{DOC_ICONS[c]} {c.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Título do Documento *</label>
          <input style={inp} value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ex: Atestado de Comparecimento — Julho/2025" />
        </div>
        <div>
          <label style={lbl}>Data de Emissão</label>
          <input type="date" style={inp} value={form.issuedAt ?? ''} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Validade (opcional)</label>
          <input type="date" style={inp} value={form.expiresAt ?? ''} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>CID-10 (opcional)</label>
          <input style={inp} value={form.cid10 ?? ''} onChange={e => setForm(f => ({ ...f, cid10: e.target.value }))} placeholder="ex: F32.0" />
        </div>
        <div>
          <label style={lbl}>Modo de Entrega</label>
          <select style={inp} value={form.deliveryMethod ?? 'Portal'} onChange={e => setForm(f => ({ ...f, deliveryMethod: e.target.value as any }))}>
            {['Impresso', 'Email', 'WhatsApp', 'Portal'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <label style={lbl}>Conteúdo do Documento *</label>
      <textarea
        style={{ ...inp, height: 160, resize: 'vertical', fontFamily: 'Georgia, serif', fontSize: 13 }}
        value={form.content ?? ''}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="Redigir o conteúdo completo do documento aqui..."
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={form.isDigital ?? false} onChange={e => setForm(f => ({ ...f, isDigital: e.target.checked }))} />
          📱 Prescrição Eletrônica (CFM/MEMED)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <input type="checkbox" checked={form.isConfidential ?? false} onChange={e => setForm(f => ({ ...f, isConfidential: e.target.checked }))} />
          🔒 Documento Confidencial
        </label>
      </div>

      <button style={btn} onClick={handleSave} disabled={saving}>
        {saving ? 'Emitindo...' : '📄 Emitir Documento'}
      </button>
    </Modal>
  );
}

// ── Tab: Dashboard ─────────────────────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof ProfessionalEnterpriseService.getDashboardKPIs>> | null>(null);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ProfessionalEnterpriseService.getDashboardKPIs(),
      ProfessionalEnterpriseService.getAlerts('current'),
    ]).then(([k, a]) => { setKpis(k); setAlerts(a); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando dashboard clínico...</div>;
  if (!kpis) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
        <KpiCard icon="👨‍⚕️" label="Total Profissionais" value={fmt(kpis.totalProfessionals)} color="#7c3aed" />
        <KpiCard icon="✅" label="Ativos" value={fmt(kpis.activeProfessionals)} color="#059669" />
        <KpiCard icon="⏳" label="Credencial Pendente" value={fmt(kpis.pendingCredentials)} color="#d97706" alert={kpis.pendingCredentials > 0} />
        <KpiCard icon="📋" label="Prontuários Ativos" value={fmt(kpis.totalRecords)} color="#2563eb" />
        <KpiCard icon="💬" label="Discussões Abertas" value={fmt(kpis.openDiscussions)} color="#ea580c" alert={kpis.openDiscussions > 0} />
      </div>

      {/* Distribuição por Categoria */}
      {Object.keys(kpis.categoryDistribution).length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>👥 Equipe por Categoria</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
            {(Object.entries(kpis.categoryDistribution) as [string, number][]).map(([cat, count]) => {
              const c = CATEGORY_MAP[cat as ProfessionalCategory];
              if (!c) return null;
              return (
                <div key={cat} style={{ background: `${c.color}10`, border: `1.5px solid ${c.color}30`, borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{count}</div>
                  <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{c.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Alertas Clínicos */}
      {alerts.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 14 }}>⚠️ Alertas Clínicos e Pendências</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(a => (
              <div key={a.id} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: `${ALERT_COLOR[a.severity]}08`,
                border: `1.5px solid ${ALERT_COLOR[a.severity]}30`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {a.severity === 'CRITICO' ? '🚨' : a.severity === 'URGENTE' ? '⚠️' : a.severity === 'AVISO' ? '🔔' : 'ℹ️'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: ALERT_COLOR[a.severity] }}>
                    {a.beneficiaryName ? `${a.beneficiaryName} — ` : ''}{a.type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{a.message}</div>
                  {a.dueDate && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>📅 Prazo: {fmtDate(a.dueDate)}</div>}
                </div>
                <button
                  onClick={() => a.id && ProfessionalEnterpriseService.markAlertRead(a.id)}
                  style={{ ...btnOutline, padding: '4px 10px', fontSize: 10, flexShrink: 0 }}
                >Marcar lido</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* FHIR Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#ede9fe,#dbeafe)',
        borderRadius: 14, padding: '18px 24px',
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 32 }}>🔗</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1e1b4b' }}>Interoperabilidade HL7 FHIR R4 — Estrutura Preparada</div>
          <div style={{ fontSize: 12, color: '#4338ca', marginTop: 4, lineHeight: 1.5 }}>
            Todos os prontuários e evoluções possuem campos compatíveis com FHIR R4 (Patient, Encounter, Condition, MedicationRequest).
            Integração com RNS (Rede Nacional de Saúde) e sistemas hospitalares disponível na Fase 2.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Profissionais ─────────────────────────────────────────────────────────

function ProfessionalsTab() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<Professional | undefined>();
  const [editing, setEditing] = useState<Professional | undefined>();
  const [filterCat, setFilterCat] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    ProfessionalEnterpriseService.getProfessionals().then(setProfessionals).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Professional) => {
    await ProfessionalEnterpriseService.saveProfessional(data);
    await load();
    setShowForm(false);
    setEditing(undefined);
  };

  const filtered = professionals.filter(p => {
    const matchCat = filterCat === 'TODOS' || p.category === filterCat;
    const matchSearch = !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.councilNumber.includes(search);
    return matchCat && matchSearch;
  });

  const categories = [...new Set(professionals.map(p => p.category))];

  return (
    <div>
      {showForm && (
        <ProfessionalFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
      {viewing && <ProfessionalProfileModal professional={viewing} onClose={() => setViewing(undefined)} />}

      <SectionHeader title="Profissionais" subtitle="Equipe credenciada, competências e disponibilidade" onAdd={() => { setEditing(undefined); setShowForm(true); }} addLabel="Credenciar" />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        <input style={{ ...inp, marginBottom: 0, maxWidth: 280, flex: '1 1 200px' }} placeholder="🔍 Buscar por nome ou nº de registro..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('TODOS')} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${filterCat === 'TODOS' ? '#7c3aed' : '#e5e7eb'}`, background: filterCat === 'TODOS' ? '#7c3aed' : '#fff', color: filterCat === 'TODOS' ? '#fff' : '#374151' }}>Todos</button>
          {categories.map(c => {
            const info = CATEGORY_MAP[c];
            if (!info) return null;
            return (
              <button key={c} onClick={() => setFilterCat(c)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${filterCat === c ? info.color : '#e5e7eb'}`, background: filterCat === c ? info.color : '#fff', color: filterCat === c ? '#fff' : '#374151' }}>
                {info.icon} {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando profissionais...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👨‍⚕️"
          title="Nenhum profissional encontrado."
          action="Carregar Profissionais de Exemplo"
          onAction={() => ProfessionalEnterpriseService.seedDefaults().then(load)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {filtered.map(p => {
            const cat = CATEGORY_MAP[p.category];
            const cred = CREDENTIAL_STATUS[p.credentialStatus];
            return (
              <Card key={p.id} style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg,${cat.color},${cat.color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.fullName}
                    </div>
                    <div style={{ fontSize: 11, color: cat.color, fontWeight: 700, marginBottom: 4 }}>
                      {cat.icon} {cat.label}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge text={p.status} color={STATUS_COLOR[p.status]} />
                      <Badge text={cred.label} color={cred.color} />
                      {p.hasDigitalCertificate && <Badge text="🔐 Cert" color="#059669" bg="#d1fae5" />}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                  {p.councilType} {p.councilNumber}/{p.councilState} · 📧 {p.email}
                </div>

                {p.specialties.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {p.specialties.slice(0, 3).map(s => (
                      <span key={s} style={{ background: `${cat.color}12`, color: cat.color, padding: '2px 8px', borderRadius: 12, fontSize: 9, fontWeight: 600 }}>{s}</span>
                    ))}
                    {p.specialties.length > 3 && <span style={{ fontSize: 9, color: '#9ca3af' }}>+{p.specialties.length - 3}</span>}
                  </div>
                )}

                {p.totalAttendances !== undefined && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {[
                      { label: 'Atendimentos', value: fmt(p.totalAttendances) },
                      { label: 'Tempo médio', value: p.avgSessionMinutes ? `${p.avgSessionMinutes}min` : '—' },
                      { label: 'NPS', value: p.satisfactionAvg ? `${p.satisfactionAvg}` : '—' },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>{m.value}</div>
                        <div style={{ fontSize: 8, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setViewing(p)} style={{ ...btnOutline, flex: 1 }}>👁 Perfil</button>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} style={{ ...btnOutline, flex: 1 }}>✏️ Editar</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Prontuário ────────────────────────────────────────────────────────────

function ClinicalRecordsTab() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Partial<ClinicalRecord>>({
    clinicalStatus: 'EM_ACOMPANHAMENTO', diagnostics: [], allergies: [],
    currentMedications: [], interventions: [], shortTermGoals: [],
    longTermGoals: [], accessibleByProfessionals: [], changeLog: [],
    isConfidential: false, requiresMFA: false, version: 1,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    ProfessionalEnterpriseService.getClinicalRecords().then(setRecords).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.primaryProfessionalName || !form.chiefComplaint) return;
    setSaving(true);
    await ProfessionalEnterpriseService.saveClinicalRecord({
      ...form,
      openedAt: form.openedAt ?? new Date().toISOString().slice(0, 10),
      lastModifiedBy: form.primaryProfessionalName ?? 'Sistema',
    } as ClinicalRecord);
    await load();
    setShowNew(false);
    setSaving(false);
  };

  const statusIcon: Record<string, string> = {
    EM_ACOMPANHAMENTO: '💚', ALTA: '🎓', SUSPENSO: '⏸️',
    AGUARDANDO: '⏳', ENCAMINHADO: '↗️', ARQUIVADO: '📦',
  };
  const statusColors: Record<string, string> = {
    EM_ACOMPANHAMENTO: '#059669', ALTA: '#2563eb', SUSPENSO: '#d97706',
    AGUARDANDO: '#f59e0b', ENCAMINHADO: '#7c3aed', ARQUIVADO: '#374151',
  };

  return (
    <div>
      {showNew && (
        <Modal title="Abrir Prontuário Eletrônico (PEP)" onClose={() => setShowNew(false)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Beneficiário *</label>
              <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>CPF do Beneficiário</label>
              <input style={inp} value={form.beneficiaryCpf ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryCpf: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Profissional Responsável *</label>
              <input style={inp} value={form.primaryProfessionalName ?? ''} onChange={e => setForm(f => ({ ...f, primaryProfessionalName: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Conselho (ex: CRP 06/142850)</label>
              <input style={inp} value={form.primaryCouncil ?? ''} onChange={e => setForm(f => ({ ...f, primaryCouncil: e.target.value }))} />
            </div>
          </div>

          <label style={lbl}>Queixa Principal (Motivo da Abertura) *</label>
          <textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={form.chiefComplaint ?? ''} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder="Queixa principal relatada pelo beneficiário ou motivo do encaminhamento..." />

          <label style={lbl}>História da Doença Atual (HDA)</label>
          <textarea style={{ ...inp, height: 100, resize: 'vertical' }} value={form.historyOfPresentIllness ?? ''} onChange={e => setForm(f => ({ ...f, historyOfPresentIllness: e.target.value }))} placeholder="Início, evolução, fatores de agravamento e melhora, tratamentos anteriores..." />

          <label style={lbl}>Alergias (separadas por vírgula)</label>
          <input style={inp} value={(form.allergies ?? []).join(', ')} onChange={e => setForm(f => ({ ...f, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="ex: Penicilina, Dipirona" />

          <label style={lbl}>Plano Terapêutico Inicial</label>
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={form.therapeuticPlan ?? ''} onChange={e => setForm(f => ({ ...f, therapeuticPlan: e.target.value }))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Data de Abertura</label>
              <input type="date" style={inp} value={form.openedAt ?? new Date().toISOString().slice(0, 10)} onChange={e => setForm(f => ({ ...f, openedAt: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Status Clínico</label>
              <select style={inp} value={form.clinicalStatus ?? 'EM_ACOMPANHAMENTO'} onChange={e => setForm(f => ({ ...f, clinicalStatus: e.target.value as any }))}>
                {['EM_ACOMPANHAMENTO', 'AGUARDANDO', 'SUSPENSO', 'ENCAMINHADO', 'ALTA', 'ARQUIVADO'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <input type="checkbox" checked={form.isConfidential ?? false} onChange={e => setForm(f => ({ ...f, isConfidential: e.target.checked }))} />
              🔒 Prontuário Confidencial
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <input type="checkbox" checked={form.requiresMFA ?? false} onChange={e => setForm(f => ({ ...f, requiresMFA: e.target.checked }))} />
              🛡️ Requer MFA para acesso
            </label>
          </div>

          <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Abrindo...' : '📋 Abrir Prontuário'}</button>
        </Modal>
      )}

      <SectionHeader title="Prontuários Eletrônicos (PEP)" subtitle="SOAP · CID-10 · HL7 FHIR R4 · Versionado · Auditável" onAdd={() => setShowNew(true)} addLabel="Abrir Prontuário" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando prontuários...</div>
      ) : records.length === 0 ? (
        <EmptyState icon="📋" title="Nenhum prontuário aberto ainda." action="Abrir Prontuário de Exemplo" onAction={() => ProfessionalEnterpriseService.seedDefaults().then(load)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map(r => (
            <Card key={r.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: `${statusColors[r.clinicalStatus] ?? '#6b7280'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>{statusIcon[r.clinicalStatus] ?? '📋'}</div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{r.beneficiaryName}</span>
                    <Badge text={r.clinicalStatus.replace('_', ' ')} color={statusColors[r.clinicalStatus] ?? '#6b7280'} />
                    {r.isConfidential && <Badge text="🔒 Confidencial" color="#92400e" bg="#fef3c7" />}
                    {r.requiresMFA && <Badge text="🛡️ MFA" color="#7c3aed" bg="#ede9fe" />}
                    <span style={{ fontSize: 9, color: '#9ca3af' }}>v{r.version}</span>
                  </div>

                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                    👨‍⚕️ {r.primaryProfessionalName} ({r.primaryCouncil}) · 📅 Aberto em {fmtDate(r.openedAt)}
                  </div>

                  <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', borderRadius: 8, padding: '6px 10px', marginBottom: 8 }}>
                    <strong>Queixa:</strong> {r.chiefComplaint}
                  </div>

                  {r.diagnostics.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {r.diagnostics.map((d, i) => (
                        <span key={i} style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                          {d.cid10 ? `${d.cid10} — ` : ''}{d.description} ({d.type})
                        </span>
                      ))}
                    </div>
                  )}

                  {r.allergies.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.allergies.map(a => (
                        <span key={a} style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 7px', borderRadius: 8, fontSize: 9, fontWeight: 700 }}>⚠️ {a}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Modificado por</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{r.lastModifiedBy}</div>
                  </div>
                  <button style={{ ...btnOutline, padding: '6px 12px', fontSize: 11 }}>📄 Abrir PEP</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Evoluções ─────────────────────────────────────────────────────────────

function EvolutionsTab() {
  const [evolutions, setEvolutions] = useState<ClinicalEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    Promise.all([
      ProfessionalEnterpriseService.getClinicalRecords(),
      ProfessionalEnterpriseService.getProfessionalEvolutions('current', 60),
    ]).then(([r, e]) => { setRecords(r); setEvolutions(e); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: ClinicalEvolution) => {
    await ProfessionalEnterpriseService.saveEvolution(data);
    await load();
    setShowForm(false);
  };

  const handleSign = async (id: string) => {
    await ProfessionalEnterpriseService.signDocument(id, 'clinical_evolutions', 'Profissional Responsável');
    await load();
  };

  return (
    <div>
      {showForm && <EvolutionFormModal records={records} onSave={handleSave} onClose={() => setShowForm(false)} />}

      <SectionHeader title="Evoluções Clínicas (SOAP)" subtitle="Registro estruturado, assinatura digital e suporte por IA" onAdd={() => setShowForm(true)} addLabel="Nova Evolução" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando evoluções...</div>
      ) : evolutions.length === 0 ? (
        <EmptyState icon="📝" title="Nenhuma evolução registrada." action="Nova Evolução" onAction={() => setShowForm(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {evolutions.map(e => (
            <Card key={e.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>📝</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{e.beneficiaryName}</span>
                    <Badge text={e.evolutionType} color="#7c3aed" />
                    <Badge text={e.modality} color="#2563eb" />
                    {e.isConfidential && <Badge text="🔒 Confidencial" color="#92400e" bg="#fef3c7" />}
                    {e.isSigned && <Badge text="✍ Assinado" color="#059669" bg="#d1fae5" />}
                    {e.aiAssisted && <Badge text="✨ IA" color="#7c3aed" bg="#ede9fe" />}
                    {e.riskAssessment && (
                      <Badge
                        text={`⚠️ ${e.riskAssessment}`}
                        color={RISK_COLOR(e.riskAssessment)}
                        bg={`${RISK_COLOR(e.riskAssessment)}15`}
                      />
                    )}
                    <span style={{ fontSize: 9, color: '#9ca3af' }}>v{e.version}</span>
                  </div>

                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                    👨‍⚕️ {e.professionalName} ({e.professionalCouncil}) · 📅 {fmtDate(e.sessionDate)} · ⏱ {e.sessionDurationMinutes}min
                  </div>

                  {/* SOAP Preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'S — Subjetivo', content: e.subjectiveData, color: '#7c3aed' },
                      { label: 'O — Objetivo', content: e.objectiveData, color: '#2563eb' },
                      { label: 'A — Avaliação', content: e.assessment, color: '#059669' },
                      { label: 'P — Plano', content: e.plan, color: '#d97706' },
                    ].map(s => s.content && !e.isConfidential ? (
                      <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: s.color, textTransform: 'uppercase', marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
                          {s.content.length > 120 ? `${s.content.slice(0, 120)}...` : s.content}
                        </div>
                      </div>
                    ) : null)}
                  </div>

                  {e.followUpDate && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#059669', fontWeight: 600 }}>
                      📅 Próximo atendimento: {fmtDate(e.followUpDate)}
                    </div>
                  )}
                </div>

                {!e.isSigned && (
                  <button
                    onClick={() => e.id && handleSign(e.id)}
                    style={{ ...btn, width: 'auto', marginTop: 0, padding: '7px 14px', fontSize: 11, flexShrink: 0 }}
                  >✍️ Assinar</button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Prescrições ───────────────────────────────────────────────────────────

function PrescriptionsTab() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    ProfessionalEnterpriseService.getPrescriptions().then(setPrescriptions).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Prescription) => {
    await ProfessionalEnterpriseService.savePrescription(data);
    await load();
    setShowForm(false);
  };

  const handleSign = async (id: string) => {
    await ProfessionalEnterpriseService.signDocument(id, 'prescriptions', 'Profissional Responsável');
    await load();
  };

  return (
    <div>
      {showForm && <PrescriptionFormModal onSave={handleSave} onClose={() => setShowForm(false)} />}

      <SectionHeader title="Prescrições e Documentos Clínicos" subtitle="Receitas digitais, atestados, laudos e encaminhamentos com assinatura eletrônica" onAdd={() => setShowForm(true)} addLabel="Emitir Documento" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando documentos...</div>
      ) : prescriptions.length === 0 ? (
        <EmptyState icon="💊" title="Nenhum documento emitido." action="Emitir Documento" onAction={() => setShowForm(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
          {prescriptions.map(p => (
            <Card key={p.id} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {DOC_ICONS[p.category] ?? '📄'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{p.category.replace(/_/g, ' ')}</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                👤 {p.beneficiaryName} · 📅 {fmtDate(p.issuedAt)}<br />
                👨‍⚕️ {p.professionalName} {p.professionalCouncil ? `(${p.professionalCouncil})` : ''}
                {p.cid10 && ` · CID: ${p.cid10}`}
                {p.expiresAt && ` · Vence: ${fmtDate(p.expiresAt)}`}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {p.isSigned && <Badge text="✍ Assinado" color="#059669" bg="#d1fae5" />}
                {p.isDigital && <Badge text="📱 Digital" color="#2563eb" bg="#dbeafe" />}
                {p.isConfidential && <Badge text="🔒 Conf." color="#92400e" bg="#fef3c7" />}
                {p.deliveryMethod && <Badge text={`📤 ${p.deliveryMethod}`} color="#6b7280" bg="#f3f4f6" />}
                <span style={{ fontSize: 9, color: '#9ca3af' }}>⬇️ {p.downloadCount}x</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!p.isSigned && (
                  <button onClick={() => p.id && handleSign(p.id)} style={{ ...btn, flex: 1, marginTop: 0, padding: '7px' }}>✍️ Assinar</button>
                )}
                <button style={{ ...btnOutline, flex: 1 }}>📥 PDF</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Discussão Multiprofissional ───────────────────────────────────────────

function DiscussionTab() {
  const [discussions, setDiscussions] = useState<CaseDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<CaseDiscussion | undefined>();
  const [newMsg, setNewMsg] = useState('');
  const [form, setForm] = useState<Partial<CaseDiscussion>>({
    status: 'ABERTO', isUrgent: false, participants: [], messages: [],
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    ProfessionalEnterpriseService.getCaseDiscussions().then(setDiscussions).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    if (!form.beneficiaryName || !form.title || !form.requestedByName) return;
    setSaving(true);
    await ProfessionalEnterpriseService.saveCaseDiscussion(form as CaseDiscussion);
    await load();
    setShowNew(false);
    setSaving(false);
  };

  const handleSendMsg = async () => {
    if (!selected?.id || !newMsg.trim()) return;
    await ProfessionalEnterpriseService.addDiscussionMessage(selected.id, 'current-user', 'Profissional Atual', newMsg);
    await load();
    setNewMsg('');
    const updated = await ProfessionalEnterpriseService.getCaseDiscussions();
    setSelected(updated.find(d => d.id === selected.id));
  };

  const statusColors2: Record<string, string> = {
    ABERTO: '#059669', EM_DISCUSSAO: '#2563eb', PARECER_EMITIDO: '#7c3aed', ENCERRADO: '#6b7280',
  };

  return (
    <div>
      {showNew && (
        <Modal title="Abrir Discussão de Caso" onClose={() => setShowNew(false)}>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} />
          <label style={lbl}>Título da Discussão *</label>
          <input style={inp} value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ex: Avaliação Multiprofissional — Risco de Suicídio" />
          <label style={lbl}>Solicitante *</label>
          <input style={inp} value={form.requestedByName ?? ''} onChange={e => setForm(f => ({ ...f, requestedByName: e.target.value }))} placeholder="Dr(a). Nome" />
          <label style={lbl}>Descrição / Motivo</label>
          <textarea style={{ ...inp, height: 100, resize: 'vertical' }} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.isUrgent ?? false} onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))} />
            🚨 Marcar como URGENTE (notifica equipe imediatamente)
          </label>
          <button style={btn} onClick={handleNew} disabled={saving}>{saving ? 'Abrindo...' : '💬 Abrir Discussão'}</button>
        </Modal>
      )}

      {selected && (
        <Modal title={`Discussão — ${selected.beneficiaryName}`} onClose={() => setSelected(undefined)} wide>
          {selected.isUrgent && (
            <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, color: '#dc2626' }}>🚨 CASO URGENTE — {selected.title}</span>
            </div>
          )}
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 16 }}>{selected.description}</div>

          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px', marginBottom: 14, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.messages.map(m => (
              <div key={m.id} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>{m.authorName}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmtDateTime(m.sentAt)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{m.content}</div>
                {m.isConfidential && <Badge text="🔒 Confidencial" color="#92400e" bg="#fef3c7" />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Adicionar mensagem à discussão..." onKeyDown={e => { if (e.key === 'Enter') handleSendMsg(); }} />
            <button onClick={handleSendMsg} style={{ ...btn, width: 'auto', marginTop: 0, padding: '10px 20px' }}>📤</button>
          </div>
        </Modal>
      )}

      <SectionHeader title="Discussão Multiprofissional de Casos" subtitle="Encaminhamentos, pareceres e colaboração entre especialidades" onAdd={() => setShowNew(true)} addLabel="Abrir Discussão" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando discussões...</div>
      ) : discussions.length === 0 ? (
        <EmptyState icon="💬" title="Nenhuma discussão aberta." action="Abrir Discussão" onAction={() => setShowNew(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {discussions.map(d => (
            <Card key={d.id} style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setSelected(d)}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: d.isUrgent ? '#fee2e2' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {d.isUrgent ? '🚨' : '💬'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{d.title}</span>
                    <Badge text={d.status.replace('_', ' ')} color={statusColors2[d.status] ?? '#6b7280'} />
                    {d.isUrgent && <Badge text="🚨 Urgente" color="#dc2626" bg="#fee2e2" />}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                    👤 {d.beneficiaryName} · Solicitado por {d.requestedByName} · {d.messages.length} mensagens
                  </div>
                  {d.description && (
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                      {d.description.length > 150 ? `${d.description.slice(0, 150)}...` : d.description}
                    </div>
                  )}
                </div>
                <button style={{ ...btnOutline, flexShrink: 0 }}>Abrir →</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Agenda & Bloqueios ────────────────────────────────────────────────────

function ScheduleTab() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Partial<ScheduleBlock>>({ type: 'Bloqueio', isRecurring: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    ProfessionalEnterpriseService.getScheduleBlocks('current').then(setBlocks).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.professionalName || !form.startAt || !form.endAt || !form.reason) return;
    setSaving(true);
    await ProfessionalEnterpriseService.saveScheduleBlock(form as ScheduleBlock);
    await load();
    setShowNew(false);
    setSaving(false);
  };

  const typeColors: Record<string, string> = {
    Bloqueio: '#6b7280', Ferias: '#059669', Feriado: '#2563eb',
    Plantao: '#d97706', Reuniao: '#7c3aed', Particular: '#ea580c',
  };

  // Grade visual de disponibilidade simulada
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const hours = Array.from({ length: 9 }, (_, i) => `${8 + i}:00`);

  return (
    <div>
      {showNew && (
        <Modal title="Adicionar Bloqueio de Agenda" onClose={() => setShowNew(false)}>
          <label style={lbl}>Profissional *</label>
          <input style={inp} value={form.professionalName ?? ''} onChange={e => setForm(f => ({ ...f, professionalName: e.target.value }))} placeholder="Nome do profissional" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Início *</label>
              <input type="datetime-local" style={inp} value={form.startAt ?? ''} onChange={e => setForm(f => ({ ...f, startAt: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Fim *</label>
              <input type="datetime-local" style={inp} value={form.endAt ?? ''} onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))} />
            </div>
          </div>
          <label style={lbl}>Tipo de Bloqueio</label>
          <select style={inp} value={form.type ?? 'Bloqueio'} onChange={e => setForm(f => ({ ...f, type: e.target.value as ScheduleBlock['type'] }))}>
            {['Bloqueio', 'Ferias', 'Feriado', 'Plantao', 'Reuniao', 'Particular'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label style={lbl}>Motivo *</label>
          <input style={inp} value={form.reason ?? ''} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="ex: Férias anuais, Reunião de equipe..." />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.isRecurring ?? false} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} />
            Recorrente (semanal)
          </label>
          <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : '📅 Adicionar Bloqueio'}</button>
        </Modal>
      )}

      <SectionHeader title="Agenda & Bloqueios" subtitle="Disponibilidade, plantões, feriados e bloqueios de agenda" onAdd={() => setShowNew(true)} addLabel="Novo Bloqueio" />

      {/* Grade de disponibilidade visual */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 16 }}>📅 Grade Semanal de Disponibilidade</div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 500 }}>
            {/* Header dos dias */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5,1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {weekDays.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Linhas de horário */}
            {hours.map(h => (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5,1fr)', gap: 4, marginBottom: 3 }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, paddingTop: 4 }}>{h}</div>
                {weekDays.map((d, di) => (
                  <div key={d} style={{
                    height: 28, borderRadius: 6,
                    background: di < 4 ? '#d1fae5' : '#f3f4f6',
                    border: `1px solid ${di < 4 ? '#6ee7b7' : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {di < 4 && <span style={{ fontSize: 8, color: '#059669', fontWeight: 700 }}>✓</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 10 }}>
          * Grade simulada. Configure disponibilidade por profissional no perfil.
        </div>
      </Card>

      {/* Bloqueios listados */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando bloqueios...</div>
      ) : blocks.length === 0 ? (
        <EmptyState icon="📅" title="Nenhum bloqueio registrado." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {blocks.map(b => (
            <Card key={b.id} style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${typeColors[b.type] ?? '#6b7280'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {b.type === 'Ferias' ? '🌴' : b.type === 'Plantao' ? '🏥' : b.type === 'Reuniao' ? '👥' : '🚫'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{b.professionalName} — {b.reason}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {fmtDateTime(b.startAt)} → {fmtDateTime(b.endAt)}
                    {b.isRecurring && <span style={{ marginLeft: 8, fontSize: 9, color: '#7c3aed', fontWeight: 700 }}>🔄 Recorrente</span>}
                  </div>
                </div>
                <Badge text={b.type} color={typeColors[b.type] ?? '#6b7280'} />
                <button
                  onClick={() => b.id && ProfessionalEnterpriseService.deleteScheduleBlock(b.id).then(load)}
                  style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                >🚫 Remover</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Analytics ─────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const analyticsData = {
    totalAtendimentos: 1.233,
    taxaComparecimento: 87.4,
    tempoMedioSessao: 51.2,
    totalEvolucoesSignadas: 1.198,
    satisfacaoMedia: 9.1,
    taxaAdesaoTratamento: 82.6,
  };

  const barData: { label: string; value: number; color: string; icon: string }[] = [
    { label: 'Psicologia', value: 487, color: '#7c3aed', icon: '🧠' },
    { label: 'Assist. Social', value: 312, color: '#0891b2', icon: '🤝' },
    { label: 'Jurídico', value: 134, color: '#0369a1', icon: '⚖️' },
    { label: 'Médico', value: 98, color: '#059669', icon: '🩺' },
    { label: 'Nutrição', value: 87, color: '#16a34a', icon: '🥗' },
    { label: 'Fisio', value: 64, color: '#65a30d', icon: '🦽' },
    { label: 'Educação', value: 51, color: '#ca8a04', icon: '📚' },
  ];
  const maxBar = Math.max(...barData.map(b => b.value));

  const monthlyTrend: { mes: string; atend: number; evolucoes: number }[] = [
    { mes: 'Jan', atend: 148, evolucoes: 142 },
    { mes: 'Fev', atend: 162, evolucoes: 155 },
    { mes: 'Mar', atend: 178, evolucoes: 174 },
    { mes: 'Abr', atend: 191, evolucoes: 186 },
    { mes: 'Mai', atend: 203, evolucoes: 198 },
    { mes: 'Jun', atend: 217, evolucoes: 211 },
    { mes: 'Jul', atend: 134, evolucoes: 132 },
  ];
  const maxMonth = Math.max(...monthlyTrend.map(m => m.atend));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPIs Analíticos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        <KpiCard icon="📅" label="Total Atendimentos" value={fmt(analyticsData.totalAtendimentos)} sub="Acumulado" color="#7c3aed" />
        <KpiCard icon="✅" label="Taxa Comparecimento" value={`${analyticsData.taxaComparecimento}%`} sub="Meta: 85%" color="#059669" />
        <KpiCard icon="⏱" label="Tempo Médio Sessão" value={`${analyticsData.tempoMedioSessao}min`} sub="Referência: 50min" color="#2563eb" />
        <KpiCard icon="⭐" label="Satisfação Média" value={`${analyticsData.satisfacaoMedia}/10`} sub="NPS Beneficiários" color="#d97706" />
        <KpiCard icon="💊" label="Adesão Tratamento" value={`${analyticsData.taxaAdesaoTratamento}%`} sub="Meta: 80%" color="#059669" />
        <KpiCard icon="✍️" label="Evoluções Assinadas" value={fmt(analyticsData.totalEvolucoesSignadas)} sub="de 1.233 sessões" color="#ea580c" />
      </div>

      {/* Atendimentos por Especialidade */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 18 }}>📊 Atendimentos por Especialidade — 2025</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {barData.map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, textAlign: 'center', fontSize: 14 }}>{b.icon}</div>
              <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: '#374151', flexShrink: 0 }}>{b.label}</div>
              <div style={{ flex: 1, height: 20, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${(b.value / maxBar) * 100}%`, height: '100%',
                  background: `linear-gradient(90deg,${b.color},${b.color}99)`,
                  borderRadius: 6, transition: 'width 0.8s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{b.value}</span>
                </div>
              </div>
              <div style={{ width: 50, textAlign: 'right', fontSize: 11, fontWeight: 700, color: b.color }}>{Math.round((b.value / maxBar) * 100)}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tendência Mensal */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 18 }}>📈 Tendência Mensal — Atendimentos vs. Evoluções</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, paddingTop: 10 }}>
          {monthlyTrend.map(m => (
            <div key={m.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', gap: 3, width: '100%', justifyContent: 'center', alignItems: 'flex-end', height: 90 }}>
                <div style={{
                  width: '42%', background: 'linear-gradient(180deg,#7c3aed,#4f46e5)',
                  borderRadius: '4px 4px 0 0', height: `${(m.atend / maxMonth) * 88}px`,
                  transition: 'height 0.6s ease',
                }} title={`Atendimentos: ${m.atend}`} />
                <div style={{
                  width: '42%', background: 'linear-gradient(180deg,#059669,#10b981)',
                  borderRadius: '4px 4px 0 0', height: `${(m.evolucoes / maxMonth) * 88}px`,
                  transition: 'height 0.6s ease',
                }} title={`Evoluções: ${m.evolucoes}`} />
              </div>
              <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{m.mes}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#7c3aed' }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>Atendimentos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#059669' }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>Evoluções Assinadas</span>
          </div>
        </div>
      </Card>

      {/* FHIR + IA Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 14, padding: '20px 24px', color: '#fff' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>IA Clínica — Roadmap</div>
          <div style={{ fontSize: 11, color: '#c7d2fe', lineHeight: 1.7 }}>
            • Resumo automático de consultas (Gemini 1.5 Pro)<br />
            • Transcrição por voz em tempo real<br />
            • Sugestão de protocolos clínicos<br />
            • Alertas preditivos para alto risco<br />
            • Análise longitudinal de evolução
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#0c4a6e,#0369a1)', borderRadius: 14, padding: '20px 24px', color: '#fff' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🔗</div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Interoperabilidade HL7 FHIR R4</div>
          <div style={{ fontSize: 11, color: '#bae6fd', lineHeight: 1.7 }}>
            • Patient · Practitioner · Encounter<br />
            • Condition (Diagnósticos CID-10)<br />
            • MedicationRequest (Prescrições)<br />
            • Observation · DocumentReference<br />
            • Integração RNS e Sistemas Hospitalares
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProfessionalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0369a1,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🩺</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Portal do Profissional
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Agenda · Prontuário Eletrônico (PEP) · Evoluções SOAP · Prescrições · Telemedicina · Discussão Multiprofissional
            </p>
          </div>
        </div>

        {/* Compliance Strip */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 20 }}>
          {['🔐 LGPD Art. 11', '🔗 HL7 FHIR R4', '🛡️ OWASP ASVS L3', '✍️ Assinatura Digital', '♿ WCAG 2.2 AAA', '🏥 CFM 2.314/2022'].map(tag => (
            <span key={tag} style={{ fontSize: 9, background: '#f3f4f6', color: '#374151', padding: '3px 9px', borderRadius: 10, fontWeight: 700 }}>{tag}</span>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6',
          borderRadius: 14, padding: 5, flexWrap: 'wrap',
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
      {activeTab === 'Dashboard'      && <DashboardTab />}
      {activeTab === 'Profissionais'  && <ProfessionalsTab />}
      {activeTab === 'Prontuário'     && <ClinicalRecordsTab />}
      {activeTab === 'Evoluções'      && <EvolutionsTab />}
      {activeTab === 'Prescrições'    && <PrescriptionsTab />}
      {activeTab === 'Discussão'      && <DiscussionTab />}
      {activeTab === 'Agenda'         && <ScheduleTab />}
      {activeTab === 'Analytics'      && <AnalyticsTab />}
    </div>
  );
}
