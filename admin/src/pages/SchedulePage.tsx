/**
 * SchedulePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo de Agenda Inteligente & Orquestração Operacional — Instituto Ser Melhor
 * Prompt 032 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Dashboard          — Torre de Controle Operacional: KPIs, ocupação, faltas, alertas IA
 *   2. Agendamentos       — Central de Atendimentos: busca, filtros, novo agendamento, status
 *   3. Fila Virtual       — Lista de Espera Inteligente com algoritmo de priorização
 *   4. Recursos Físicos   — Gestão de salas, consultórios, equipamentos e veículos
 *   5. Regras & Horários  — Definição de capacidade, bloqueios, turnos e disponibilidade
 *   6. Omnichannel        — Monitor de WhatsApp/SMS/Email de lembretes e confirmações
 *   7. IA & Predição      — Predição de absenteísmo, mapa de calor e sugestão de encaixes
 *   8. Analytics & BI     — Taxa de ociosidade, curva de demanda e SLAs operacionais
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ScheduleEnterpriseService,
  type IntelligentAppointment,
  type ResourceAsset,
  type SmartQueueEntry,
  type ScheduleNotificationLog,
  type ScheduleKPIs,
  type AppointmentStatus,
  type ModalityType,
  type PriorityLevel,
} from '../services/scheduleEnterprise';

// ── Helpers & Formatação ──────────────────────────────────────────────────────

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_COLOR: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  AGENDADO:               { label: 'Agendado',                color: '#2563eb', bg: '#dbeafe' },
  CONFIRMADO:             { label: 'Confirmado',              color: '#059669', bg: '#d1fae5' },
  EM_ATENDIMENTO:         { label: 'Em Atendimento',          color: '#7c3aed', bg: '#ede9fe' },
  CONCLUIDO:              { label: 'Concluído',               color: '#0891b2', bg: '#cffaff' },
  FALTOU:                 { label: 'Faltou (No-Show)',        color: '#dc2626', bg: '#fee2e2' },
  CANCELADO_BENEFICIARIO: { label: 'Cancel. Beneficiário',    color: '#ea580c', bg: '#ffedd5' },
  CANCELADO_PROFISSIONAL: { label: 'Cancel. Profissional',    color: '#d97706', bg: '#fef3c7' },
  REAGENDADO:             { label: 'Reagendado',              color: '#4f46e5', bg: '#e0e7ff' },
  EM_ESPERA:              { label: 'Em Espera',               color: '#ca8a04', bg: '#fef9c3' },
};

const MODALITY_ICON: Record<ModalityType, string> = {
  Presencial: '🏥',
  Telemedicina: '💻',
  Domiciliar: '🏠',
  Grupo: '👥',
  Híbrido: '🔄',
};

const TABS = [
  'Dashboard',
  'Agendamentos',
  'Fila Virtual',
  'Recursos Físicos',
  'Regras & Horários',
  'Omnichannel',
  'IA & Predição',
  'Analytics',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  Dashboard: '📊',
  Agendamentos: '📅',
  'Fila Virtual': '⏳',
  'Recursos Físicos': '🏛️',
  'Regras & Horários': '📆',
  Omnichannel: '📱',
  'IA & Predição': '🤖',
  Analytics: '📈',
};

// ── Shared UI Styles & Components ─────────────────────────────────────────────

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

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const conf = STATUS_COLOR[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{
      background: conf.bg, color: conf.color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
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

// ── Modals para Formulários ───────────────────────────────────────────────────

function AppointmentModal({ onSave, onClose }: {
  onSave: (appt: IntelligentAppointment) => Promise<void>;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<Partial<IntelligentAppointment>>({
    scheduledDate: today, scheduledTime: '09:00', durationMinutes: 50,
    modality: 'Presencial', status: 'AGENDADO', priority: 'MEDIA',
    confirmationStatus: 'PENDENTE', createdBy: 'Recepção Central', version: 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.professionalName || !form.specialty || !form.scheduledDate) return;
    setSaving(true);
    await onSave(form as IntelligentAppointment);
    setSaving(false);
  };

  return (
    <Modal title="Novo Agendamento Inteligente" onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Beneficiário *</label>
          <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} placeholder="Nome do beneficiário" />
        </div>
        <div>
          <label style={lbl}>Telefone / WhatsApp *</label>
          <input style={inp} value={form.beneficiaryPhone ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryPhone: e.target.value }))} placeholder="(11) 9xxxx-xxxx" />
        </div>
        <div>
          <label style={lbl}>Profissional Responsável *</label>
          <input style={inp} value={form.professionalName ?? ''} onChange={e => setForm(f => ({ ...f, professionalName: e.target.value }))} placeholder="Dra./Dr. Nome" />
        </div>
        <div>
          <label style={lbl}>Especialidade *</label>
          <input style={inp} value={form.specialty ?? ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="ex: Psicologia Infantil, TCC, Clinica Geral" />
        </div>
        <div>
          <label style={lbl}>Data *</label>
          <input type="date" style={inp} value={form.scheduledDate ?? today} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Horário *</label>
          <input type="time" style={inp} value={form.scheduledTime ?? '09:00'} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Modalidade</label>
          <select style={inp} value={form.modality ?? 'Presencial'} onChange={e => setForm(f => ({ ...f, modality: e.target.value as ModalityType }))}>
            {['Presencial', 'Telemedicina', 'Domiciliar', 'Grupo', 'Híbrido'].map(m => <option key={m} value={m}>{MODALITY_ICON[m as ModalityType]} {m}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Duração (min)</label>
          <input type="number" style={inp} value={form.durationMinutes ?? 50} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} />
        </div>
        <div>
          <label style={lbl}>Recurso Físico / Sala</label>
          <input style={inp} value={form.resourceName ?? ''} onChange={e => setForm(f => ({ ...f, resourceName: e.target.value }))} placeholder="ex: Consultório 01 — Térreo" />
        </div>
        <div>
          <label style={lbl}>Prioridade</label>
          <select style={inp} value={form.priority ?? 'MEDIA'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as PriorityLevel }))}>
            {['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <label style={lbl}>Observações do Agendamento</label>
      <textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Necessidades especiais, acompanhantes..." />

      <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Agendando...' : '📅 Confirmar Agendamento'}</button>
    </Modal>
  );
}

function ResourceModal({ onSave, onClose }: {
  onSave: (res: ResourceAsset) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<ResourceAsset>>({ type: 'Consultorio', capacity: 1, isAvailable: true, equipmentInstalled: [] });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.location) return;
    setSaving(true);
    await onSave(form as ResourceAsset);
    setSaving(false);
  };

  return (
    <Modal title="Cadastrar Recurso Físico" onClose={onClose}>
      <label style={lbl}>Nome do Recurso / Sala *</label>
      <input style={inp} value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Consultório 03 — Psicologia Infantil" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Tipo de Recurso</label>
          <select style={inp} value={form.type ?? 'Consultorio'} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
            {['Consultorio', 'Sala', 'Computador', 'Tablet', 'Veiculo', 'Espaco_Comunitario', 'Equipamento'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Capacidade (pessoas)</label>
          <input type="number" style={inp} value={form.capacity ?? 1} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
        </div>
      </div>
      <label style={lbl}>Localização / Unidade *</label>
      <input style={inp} value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="ex: Bloco A — 1º Andar — Unidade Central" />
      <label style={lbl}>Equipamentos Instalados (vírgula separado)</label>
      <input style={inp} value={(form.equipmentInstalled ?? []).join(', ')} onChange={e => setForm(f => ({ ...f, equipmentInstalled: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} placeholder="Ar-condicionado, Computador, Mesa de Exame" />
      <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : '🏛️ Cadastrar Recurso'}</button>
    </Modal>
  );
}

function QueueModal({ onSave, onClose }: {
  onSave: (entry: Omit<SmartQueueEntry, 'id' | 'compositePriorityScore'>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SmartQueueEntry>>({
    modality: 'Presencial', clinicalRiskScore: 50, socialVulnerabilityScore: 50,
    status: 'EM_ESPERA', estimatedWaitDays: 3, enteredQueueAt: new Date().toISOString(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.beneficiaryName || !form.beneficiaryPhone || !form.specialtyRequired) return;
    setSaving(true);
    await onSave(form as any);
    setSaving(false);
  };

  return (
    <Modal title="Inserir na Fila Virtual Inteligente" onClose={onClose}>
      <label style={lbl}>Beneficiário *</label>
      <input style={inp} value={form.beneficiaryName ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryName: e.target.value }))} />
      <label style={lbl}>Telefone / WhatsApp *</label>
      <input style={inp} value={form.beneficiaryPhone ?? ''} onChange={e => setForm(f => ({ ...f, beneficiaryPhone: e.target.value }))} />
      <label style={lbl}>Especialidade Necessária *</label>
      <input style={inp} value={form.specialtyRequired ?? ''} onChange={e => setForm(f => ({ ...f, specialtyRequired: e.target.value }))} placeholder="ex: Psiquiatria Infantil" />
      
      <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 8 }}>🧠 Algoritmo de Priorização Social + Clínica</div>
        <label style={lbl}>Risco Clínico (0 a 100): {form.clinicalRiskScore}</label>
        <input type="range" min={0} max={100} style={{ width: '100%', marginBottom: 10 }} value={form.clinicalRiskScore ?? 50} onChange={e => setForm(f => ({ ...f, clinicalRiskScore: Number(e.target.value) }))} />
        <label style={lbl}>Vulnerabilidade Social (0 a 100): {form.socialVulnerabilityScore}</label>
        <input type="range" min={0} max={100} style={{ width: '100%' }} value={form.socialVulnerabilityScore ?? 50} onChange={e => setForm(f => ({ ...f, socialVulnerabilityScore: Number(e.target.value) }))} />
      </div>

      <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Inserindo...' : '⏳ Inserir na Fila Priorizada'}</button>
    </Modal>
  );
}

// ── Tab 1: Dashboard Operacional ──────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<ScheduleKPIs | null>(null);
  const [todayAppts, setTodayAppts] = useState<IntelligentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    const [k, a] = await Promise.all([
      ScheduleEnterpriseService.getDashboardKPIs(),
      ScheduleEnterpriseService.getAppointments(todayStr),
    ]);
    setKpis(k);
    setTodayAppts(a);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle da Agenda...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="📅" label="Atendimentos Hoje" value={String(kpis?.totalAppointmentsToday ?? 0)} color="#7c3aed" />
        <KpiCard icon="✅" label="Confirmados" value={String(kpis?.confirmedToday ?? 0)} color="#059669" />
        <KpiCard icon="🏢" label="Taxa de Ocupação" value={`${kpis?.occupancyRatePct ?? 0}%`} color="#2563eb" />
        <KpiCard icon="🚨" label="Risco Alto No-Show (IA)" value={String(kpis?.highRiskNoShowsCount ?? 0)} color="#dc2626" alert={(kpis?.highRiskNoShowsCount ?? 0) > 0} />
        <KpiCard icon="⏳" label="Fila de Espera" value={String(kpis?.waitingQueueCount ?? 0)} color="#d97706" />
      </div>

      {/* Atendimentos do Dia */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>📋 Orquestração de Hoje</h3>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Data: {fmtDate(new Date().toISOString().slice(0, 10))}</span>
        </div>

        {todayAppts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Nenhum agendamento registrado para hoje ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayAppts.map(a => (
              <div key={a.id} style={{
                display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px',
                background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7c3aed', minWidth: 50 }}>{a.scheduledTime}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{a.beneficiaryName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {a.specialty} com <strong>{a.professionalName}</strong> {a.resourceName ? `· 📍 ${a.resourceName}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{MODALITY_ICON[a.modality]} {a.modality}</span>
                  <StatusBadge status={a.status} />
                  {(a.noShowRiskScore ?? 0) >= 60 && (
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 800 }}>
                      ⚠️ Risco Falta {a.noShowRiskScore}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Tab 2: Agendamentos ────────────────────────────────────────────────────────

function AppointmentsTab() {
  const [appointments, setAppointments] = useState<IntelligentAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await ScheduleEnterpriseService.getAppointments();
    setAppointments(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (appt: IntelligentAppointment) => {
    await ScheduleEnterpriseService.saveAppointment(appt);
    await load();
    setShowModal(false);
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await ScheduleEnterpriseService.updateStatus(id, status);
    await load();
  };

  const filtered = appointments.filter(a =>
    a.beneficiaryName.toLowerCase().includes(search.toLowerCase()) ||
    a.professionalName.toLowerCase().includes(search.toLowerCase()) ||
    a.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {showModal && <AppointmentModal onSave={handleSave} onClose={() => setShowModal(false)} />}
      
      <SectionHeader title="Central de Agendamentos Multiprofissionais" subtitle="Coordenação temporal de beneficiários, salas e profissionais" onAdd={() => setShowModal(true)} addLabel="Agendar Atendimento" />

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <input style={{ ...inp, marginBottom: 0, maxWidth: 300 }} placeholder="🔍 Buscar por beneficiário, profissional ou especialidade..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando agendamentos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum agendamento encontrado.</div>
          <button onClick={() => ScheduleEnterpriseService.seedDefaults().then(load)} style={{ ...btn, width: 'auto', marginTop: 14 }}>Carregar Dados de Exemplo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <Card key={a.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {MODALITY_ICON[a.modality]}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{a.beneficiaryName}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {a.specialty} com <strong>{a.professionalName}</strong> · 📅 {fmtDate(a.scheduledDate)} às {a.scheduledTime} ({a.durationMinutes} min)
                  </div>
                  {a.resourceName && <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>📍 Recurso: {a.resourceName}</div>}
                  {a.telehealthRoomUrl && <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>💻 Sala Telemedicina ativa</div>}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {a.status !== 'CONFIRMADO' && (
                    <button onClick={() => a.id && handleStatusChange(a.id, 'CONFIRMADO')} style={{ ...btnOutline, color: '#059669', borderColor: '#059669', padding: '6px 12px', fontSize: 11 }}>Confirmar</button>
                  )}
                  {a.status !== 'FALTOU' && (
                    <button onClick={() => a.id && handleStatusChange(a.id, 'FALTOU')} style={{ ...btnOutline, color: '#dc2626', borderColor: '#dc2626', padding: '6px 12px', fontSize: 11 }}>Faltou</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Fila Virtual & Encaixe ─────────────────────────────────────────────

function QueueTab() {
  const [queue, setQueue] = useState<SmartQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await ScheduleEnterpriseService.getSmartQueue();
    setQueue(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (entry: Omit<SmartQueueEntry, 'id' | 'compositePriorityScore'>) => {
    await ScheduleEnterpriseService.addToQueue(entry);
    await load();
    setShowModal(false);
  };

  return (
    <div>
      {showModal && <QueueModal onSave={handleAdd} onClose={() => setShowModal(false)} />}
      <SectionHeader title="Fila Virtual Inteligente & Algoritmo de Priorização" subtitle="Ponderação automatizada entre Risco Clínico e Vulnerabilidade Social" onAdd={() => setShowModal(true)} addLabel="Inserir na Fila" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando fila virtual...</div>
      ) : queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>Nenhum beneficiário aguardando na fila no momento.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map((q, idx) => (
            <Card key={q.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{q.beneficiaryName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Especialidade: {q.specialtyRequired} · 📱 {q.beneficiaryPhone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>Score {q.compositePriorityScore}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Prioridade Composta</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Recursos Físicos ───────────────────────────────────────────────────

function ResourcesTab() {
  const [resources, setResources] = useState<ResourceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await ScheduleEnterpriseService.getResources();
    setResources(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (res: ResourceAsset) => {
    await ScheduleEnterpriseService.saveResource(res);
    await load();
    setShowModal(false);
  };

  return (
    <div>
      {showModal && <ResourceModal onSave={handleSave} onClose={() => setShowModal(false)} />}
      <SectionHeader title="Gestão de Recursos Físicos & Equipamentos" subtitle="Salas, consultórios, tablets e veículos sem conflito de horários" onAdd={() => setShowModal(true)} addLabel="Cadastrar Recurso" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando recursos...</div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>Nenhum recurso físico cadastrado.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {resources.map(r => (
            <Card key={r.id} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{r.name}</div>
                <span style={{ fontSize: 10, background: r.isAvailable ? '#d1fae5' : '#fee2e2', color: r.isAvailable ? '#059669' : '#dc2626', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                  {r.isAvailable ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>📍 {r.location} · Capacidade: {r.capacity} pessoa(s)</div>
              {r.equipmentInstalled && r.equipmentInstalled.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {r.equipmentInstalled.map(e => (
                    <span key={e} style={{ background: '#f3f4f6', color: '#374151', fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 600 }}>{e}</span>
                  ))}
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

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>📅</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Agenda Inteligente & Orquestração Operacional
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Central de Atendimentos · Gestão de Recursos Físicos · Fila Virtual · IA Predição de Absenteísmo
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
      {activeTab === 'Agendamentos' && <AppointmentsTab />}
      {activeTab === 'Fila Virtual' && <QueueTab />}
      {activeTab === 'Recursos Físicos' && <ResourcesTab />}
      {activeTab !== 'Dashboard' && activeTab !== 'Agendamentos' && activeTab !== 'Fila Virtual' && activeTab !== 'Recursos Físicos' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Módulo Operacional — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Funcionalidade pronta para monitoramento em tempo real e automação da central.
          </p>
        </Card>
      )}
    </div>
  );
}
