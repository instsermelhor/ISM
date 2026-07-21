/**
 * CommunicationPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hub Enterprise de Comunicação, Marketing Digital, Conteúdo e Engajamento
 * Instituto Ser Melhor — Prompt 030
 *
 * Abas:
 *   1. Dashboard   — KPIs de alcance, engajamento, conversão e redes sociais
 *   2. Campanhas   — Gestão de campanhas multicanal com metas vs. realizado
 *   3. Conteúdo    — Biblioteca de conteúdo (posts, releases, newsletters)
 *   4. Social Media — Agenda de publicações e métricas por canal
 *   5. Newsletter  — Disparos, métricas de abertura e clique (LGPD)
 *   6. Imprensa    — Cadastro de contatos de mídia e influenciadores
 *   7. Analytics   — Histórico de KPIs mensais consolidados
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  CommunicationEnterpriseService,
  type CommunicationCampaign,
  type CampaignStatus,
  type CommContent,
  type ContentStatus,
  type ContentType,
  type CampaignChannel,
  type NewsletterDispatch,
  type SocialPost,
  type MediaContact,
  type CommAnalyticsSnapshot,
} from '../services/communicationEnterprise';

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n?: number) => (n !== undefined ? n.toLocaleString('pt-BR') : '—');
const fmtPct = (n?: number) => (n !== undefined ? `${n.toFixed(1)}%` : '—');
const fmtCurr = (n?: number) => n !== undefined
  ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  : '—';

function statusColor(status: CampaignStatus | ContentStatus | string): string {
  const map: Record<string, string> = {
    RASCUNHO: '#6b7280', REVISAO: '#d97706', APROVADO: '#2563eb',
    PUBLICADO: '#059669', ARQUIVADO: '#9ca3af',
    AGENDADA: '#7c3aed', EM_EXECUCAO: '#2563eb', PAUSADA: '#d97706',
    CONCLUIDA: '#059669', CANCELADA: '#ef4444',
    AGENDADO: '#7c3aed', ENVIANDO: '#2563eb', ENVIADO: '#059669', FALHOU: '#ef4444',
  };
  return map[status] ?? '#6b7280';
}

const TABS = [
  'Dashboard', 'Campanhas', 'Conteúdo', 'Social Media', 'Newsletter', 'Imprensa', 'Analytics',
] as const;
type Tab = typeof TABS[number];

const CHANNELS: CampaignChannel[] = [
  'Email', 'WhatsApp', 'Instagram', 'Facebook', 'LinkedIn',
  'Twitter', 'YouTube', 'TikTok', 'Site', 'Imprensa', 'SMS',
];

const CONTENT_TYPES: ContentType[] = [
  'Post', 'Release', 'Newsletter', 'Video', 'Podcast', 'Infografico',
  'Relatorio', 'Depoimento', 'Galeria', 'Stories', 'Reels',
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, color,
}: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
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
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      background: `${statusColor(status)}18`,
      color: statusColor(status),
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h2>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '8px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> {addLabel ?? 'Novo'}
        </button>
      )}
    </div>
  );
}

// ── Modal Base ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 18, padding: 32,
        width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box',
  outline: 'none', background: '#fafafa', marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4,
};

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
  color: '#fff', border: 'none', borderRadius: 10,
  padding: '10px 24px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', width: '100%', marginTop: 4,
};

// ── Campaign Form Modal ────────────────────────────────────────────────────────

function CampaignFormModal({ initial, onSave, onClose }: {
  initial?: Partial<CommunicationCampaign>;
  onSave: (data: CommunicationCampaign) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CommunicationCampaign>>(initial ?? {
    status: 'RASCUNHO', channels: [], hashtags: [], contentIds: [], lgpdCompliant: true,
    goalReach: 0, goalEngagement: 0,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSave = async () => {
    if (!form.title || !form.objective || !form.startDate || !form.endDate || !form.responsibleName) return;
    setSaving(true);
    await onSave(form as CommunicationCampaign);
    setSaving(false);
  };

  return (
    <Modal title={form.id ? 'Editar Campanha' : 'Nova Campanha'} onClose={onClose}>
      <label style={labelStyle}>Título da Campanha *</label>
      <input style={inputStyle} value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da campanha" />

      <label style={labelStyle}>Objetivo *</label>
      <input style={inputStyle} value={form.objective ?? ''} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} placeholder="ex: Captação de Doadores" />

      <label style={labelStyle}>Público-Alvo</label>
      <input style={inputStyle} value={form.targetAudience ?? ''} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="Descreva o público-alvo" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Data Início *</label>
          <input type="date" style={{ ...inputStyle, marginBottom: 0 }} value={form.startDate ?? ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Data Fim *</label>
          <input type="date" style={{ ...inputStyle, marginBottom: 0 }} value={form.endDate ?? ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.status ?? 'RASCUNHO'} onChange={e => setForm(f => ({ ...f, status: e.target.value as CampaignStatus }))}>
            {['RASCUNHO', 'AGENDADA', 'EM_EXECUCAO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Meta Alcance</label>
          <input type="number" style={{ ...inputStyle, marginBottom: 0 }} value={form.goalReach ?? 0} onChange={e => setForm(f => ({ ...f, goalReach: Number(e.target.value) }))} />
        </div>
        <div>
          <label style={labelStyle}>Orçamento (R$)</label>
          <input type="number" style={{ ...inputStyle, marginBottom: 0 }} value={form.budget ?? ''} onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))} />
        </div>
      </div>

      <label style={labelStyle}>Canais</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {CHANNELS.map(ch => {
          const sel = (form.channels ?? []).includes(ch);
          return (
            <span
              key={ch}
              onClick={() => setForm(f => ({ ...f, channels: toggle(f.channels ?? [], ch) as CampaignChannel[] }))}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: sel ? '#7c3aed' : '#f3f4f6',
                color: sel ? '#fff' : '#374151',
                border: `1.5px solid ${sel ? '#7c3aed' : '#e5e7eb'}`,
                transition: 'all 0.15s',
              }}
            >{ch}</span>
          );
        })}
      </div>

      <label style={labelStyle}>Responsável *</label>
      <input style={inputStyle} value={form.responsibleName ?? ''} onChange={e => setForm(f => ({ ...f, responsibleName: e.target.value }))} placeholder="Nome do responsável" />

      <label style={labelStyle}>URL da CTA</label>
      <input style={inputStyle} value={form.ctaUrl ?? ''} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://..." />

      <label style={labelStyle}>Hashtags (separadas por vírgula)</label>
      <input style={inputStyle} value={(form.hashtags ?? []).join(', ')} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value.split(',').map(h => h.trim()).filter(Boolean) }))} placeholder="#ISM, #ImpactoSocial" />

      <button style={btnPrimary} onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar Campanha'}
      </button>
    </Modal>
  );
}

// ── Content Form Modal ────────────────────────────────────────────────────────

function ContentFormModal({ initial, onSave, onClose }: {
  initial?: Partial<CommContent>;
  onSave: (data: CommContent) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CommContent>>(initial ?? {
    status: 'RASCUNHO', type: 'Post', channels: [], tags: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.body || !form.authorName) return;
    setSaving(true);
    await onSave(form as CommContent);
    setSaving(false);
  };

  return (
    <Modal title={form.id ? 'Editar Conteúdo' : 'Novo Conteúdo'} onClose={onClose}>
      <label style={labelStyle}>Título *</label>
      <input style={inputStyle} value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do conteúdo" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.type ?? 'Post'} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentType }))}>
            {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.status ?? 'RASCUNHO'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))}>
            {['RASCUNHO', 'REVISAO', 'APROVADO', 'PUBLICADO', 'ARQUIVADO'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Corpo do Conteúdo *</label>
      <textarea
        style={{ ...inputStyle, height: 120, resize: 'vertical' }}
        value={form.body ?? ''}
        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
        placeholder="Texto completo do conteúdo..."
      />

      <label style={labelStyle}>SEO — Título</label>
      <input style={inputStyle} value={form.seoTitle ?? ''} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder="Título SEO" />

      <label style={labelStyle}>SEO — Descrição</label>
      <input style={inputStyle} value={form.seoDescription ?? ''} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="Meta description" />

      <label style={labelStyle}>Autor *</label>
      <input style={inputStyle} value={form.authorName ?? ''} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Nome do autor" />

      <label style={labelStyle}>Publicação Agendada</label>
      <input type="datetime-local" style={inputStyle} value={form.scheduledAt ?? ''} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />

      <button style={btnPrimary} onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar Conteúdo'}
      </button>
    </Modal>
  );
}

// ── Media Contact Form Modal ──────────────────────────────────────────────────

function MediaContactFormModal({ initial, onSave, onClose }: {
  initial?: Partial<MediaContact>;
  onSave: (data: MediaContact) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<MediaContact>>(initial ?? {
    active: true, lgpdConsent: false, niche: [],
    type: 'Jornalista',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.outlet) return;
    setSaving(true);
    await onSave(form as MediaContact);
    setSaving(false);
  };

  return (
    <Modal title={form.id ? 'Editar Contato' : 'Novo Contato de Mídia'} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Nome *</label>
          <input style={inputStyle} value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
        </div>
        <div>
          <label style={labelStyle}>E-mail *</label>
          <input type="email" style={inputStyle} value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@..." />
        </div>
        <div>
          <label style={labelStyle}>Telefone</label>
          <input style={inputStyle} value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 9xxxx-xxxx" />
        </div>
        <div>
          <label style={labelStyle}>Veículo / Portal *</label>
          <input style={inputStyle} value={form.outlet ?? ''} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))} placeholder="Nome do veículo" />
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.type ?? 'Jornalista'} onChange={e => setForm(f => ({ ...f, type: e.target.value as MediaContact['type'] }))}>
            {['Jornalista', 'Influenciador', 'Blogger', 'Podcast', 'TV', 'Radio', 'Agencia'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Audiência estimada</label>
          <input type="number" style={inputStyle} value={form.reach ?? ''} onChange={e => setForm(f => ({ ...f, reach: Number(e.target.value) }))} placeholder="Seguidores" />
        </div>
      </div>

      <label style={labelStyle}>Nichos (separados por vírgula)</label>
      <input style={inputStyle} value={(form.niche ?? []).join(', ')} onChange={e => setForm(f => ({ ...f, niche: e.target.value.split(',').map(n => n.trim()).filter(Boolean) }))} placeholder="Terceiro Setor, Educação, Saúde" />

      <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.lgpdConsent ?? false} onChange={e => setForm(f => ({ ...f, lgpdConsent: e.target.checked }))} />
          Consentimento LGPD obtido
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          Contato ativo
        </label>
      </div>

      <button style={btnPrimary} onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar Contato'}
      </button>
    </Modal>
  );
}

// ── Tab: Dashboard ─────────────────────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<{
    activeCampaigns: number;
    scheduledPosts: number;
    contentPending: number;
    latestAnalytics: CommAnalyticsSnapshot | null;
    recentContent: CommContent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommunicationEnterpriseService.getDashboardKPIs()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando KPIs...</div>;
  if (!kpis) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40 }}>📢</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#374151', marginTop: 12 }}>Nenhum dado ainda.</div>
      <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>Crie campanhas e conteúdos para visualizar os KPIs.</div>
    </div>
  );

  const a = kpis.latestAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPIs Operacionais */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>🎯 Status Operacional</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
          <KpiCard icon="📣" label="Campanhas Ativas" value={String(kpis.activeCampaigns)} color="#7c3aed" />
          <KpiCard icon="📅" label="Posts Agendados" value={String(kpis.scheduledPosts)} color="#2563eb" />
          <KpiCard icon="✏️" label="Conteúdos Pendentes" value={String(kpis.contentPending)} color="#d97706" />
          {a && <KpiCard icon="📰" label="Menções na Imprensa" value={String(a.pressMentions)} sub={`Período: ${a.period}`} color="#059669" />}
        </div>
      </div>

      {/* Analytics do Último Período */}
      {a && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
            📊 Analytics — {a.period}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
            <KpiCard icon="👁️" label="Alcance Total" value={fmt(a.totalReach)} color="#7c3aed" />
            <KpiCard icon="💬" label="Engajamentos" value={fmt(a.totalEngagements)} color="#2563eb" />
            <KpiCard icon="🔗" label="Cliques" value={fmt(a.totalClicks)} color="#059669" />
            <KpiCard icon="🎯" label="Conversões" value={fmt(a.totalConversions)} color="#d97706" />
            <KpiCard icon="📧" label="Taxa de Abertura (E-mail)" value={fmtPct(a.emailOpenRate)} color="#7c3aed" />
            <KpiCard icon="🖱️" label="Taxa de Clique (E-mail)" value={fmtPct(a.emailClickRate)} color="#2563eb" />
            <KpiCard icon="🌐" label="Visitantes Site" value={fmt(a.websiteVisitors)} color="#059669" />
            <KpiCard icon="📱" label="Instagram" value={fmt(a.instagramFollowers)} sub="seguidores" color="#ec4899" />
          </div>
        </div>
      )}

      {/* Conteúdos Recentes */}
      {kpis.recentContent.length > 0 && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>📄 Últimos Conteúdos Publicados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {kpis.recentContent.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < kpis.recentContent.length - 1 ? '1px solid #f3f4f6' : 'none',
                flexWrap: 'wrap', gap: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.type} · por {c.authorName}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={c.status} />
                  {c.viewCount !== undefined && (
                    <span style={{ fontSize: 11, color: '#6b7280' }}>👁 {fmt(c.viewCount)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Tab: Campanhas ─────────────────────────────────────────────────────────────

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CommunicationCampaign | undefined>();
  const [filter, setFilter] = useState<CampaignStatus | 'TODAS'>('TODAS');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationEnterpriseService.getCampaigns();
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: CommunicationCampaign) => {
    await CommunicationEnterpriseService.saveCampaign(data);
    await load();
    setShowModal(false);
    setEditing(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta campanha?')) return;
    await CommunicationEnterpriseService.deleteCampaign(id);
    await load();
  };

  const filtered = filter === 'TODAS' ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div>
      {(showModal || editing) && (
        <CampaignFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}

      <SectionHeader title="Campanhas de Comunicação" onAdd={() => setShowModal(true)} addLabel="Nova Campanha" />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['TODAS', 'RASCUNHO', 'AGENDADA', 'EM_EXECUCAO', 'PAUSADA', 'CONCLUIDA'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: `1.5px solid ${filter === s ? '#7c3aed' : '#e5e7eb'}`,
              background: filter === s ? '#7c3aed' : '#fff',
              color: filter === s ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando campanhas...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📣</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhuma campanha encontrada.</div>
          <button
            onClick={() => CommunicationEnterpriseService.seedDefaults().then(load)}
            style={{ marginTop: 14, padding: '8px 20px', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            Carregar Dados de Exemplo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(c => (
            <Card key={c.id} style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{c.title}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{c.objective}</div>

                  {/* Canais */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {c.channels.map(ch => (
                      <span key={ch} style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{ch}</span>
                    ))}
                  </div>

                  {/* Métricas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 8 }}>
                    {[
                      { label: 'Meta Alcance', value: fmt(c.goalReach) },
                      { label: 'Real Alcance', value: fmt(c.actualReach) },
                      { label: 'Conversões', value: fmt(c.actualConversions) },
                      { label: 'ROI', value: c.roi ? `${c.roi.toFixed(1)}x` : '—' },
                      { label: 'Orçamento', value: fmtCurr(c.budget) },
                      { label: 'Período', value: `${c.startDate} → ${c.endDate}` },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditing(c); setShowModal(false); }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                  >✏️ Editar</button>
                  <button
                    onClick={() => c.id && handleDelete(c.id)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}
                  >🗑 Excluir</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Conteúdo ─────────────────────────────────────────────────────────────

function ContentTab() {
  const [contents, setContents] = useState<CommContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CommContent | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationEnterpriseService.getContents();
      setContents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: CommContent) => {
    await CommunicationEnterpriseService.saveContent(data);
    await load();
    setShowModal(false);
    setEditing(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este conteúdo?')) return;
    await CommunicationEnterpriseService.deleteContent(id);
    await load();
  };

  return (
    <div>
      {(showModal || editing) && (
        <ContentFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}

      <SectionHeader title="Biblioteca de Conteúdo" onAdd={() => setShowModal(true)} addLabel="Novo Conteúdo" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando conteúdos...</div>
      ) : contents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📝</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum conteúdo criado ainda.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {contents.map(c => (
            <Card key={c.id} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{c.type} · {c.authorName}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {c.excerpt && (
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, borderLeft: '3px solid #e5e7eb', paddingLeft: 10 }}>
                  {c.excerpt}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {c.channels.map(ch => (
                  <span key={ch} style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600 }}>{ch}</span>
                ))}
              </div>

              {/* Métricas de engajamento */}
              {(c.viewCount !== undefined || c.likeCount !== undefined) && (
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280' }}>
                  {c.viewCount !== undefined && <span>👁 {fmt(c.viewCount)}</span>}
                  {c.likeCount !== undefined && <span>❤️ {fmt(c.likeCount)}</span>}
                  {c.shareCount !== undefined && <span>🔁 {fmt(c.shareCount)}</span>}
                  {c.clickCount !== undefined && <span>🔗 {fmt(c.clickCount)}</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => { setEditing(c); setShowModal(false); }}
                  style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                >✏️ Editar</button>
                <button
                  onClick={() => c.id && handleDelete(c.id)}
                  style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}
                >🗑 Excluir</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Social Media ─────────────────────────────────────────────────────────

function SocialMediaTab() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<CampaignChannel | 'TODOS'>('TODOS');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationEnterpriseService.getSocialPosts();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filterChannel === 'TODOS' ? posts : posts.filter(p => p.channel === filterChannel);

  const channelIcon: Record<string, string> = {
    Instagram: '📸', Facebook: '👍', LinkedIn: '💼', Twitter: '🐦',
    YouTube: '▶️', TikTok: '🎵', WhatsApp: '💬', Site: '🌐',
    Email: '📧', Imprensa: '📰', SMS: '📱',
  };

  return (
    <div>
      <SectionHeader title="Agenda de Redes Sociais" />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['TODOS', ...CHANNELS] as const).map(ch => (
          <button
            key={ch}
            onClick={() => setFilterChannel(ch as CampaignChannel | 'TODOS')}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: `1.5px solid ${filterChannel === ch ? '#7c3aed' : '#e5e7eb'}`,
              background: filterChannel === ch ? '#7c3aed' : '#fff',
              color: filterChannel === ch ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >{channelIcon[ch] ?? '📢'} {ch}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando posts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📱</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum post agendado.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => (
            <Card key={p.id} style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>{channelIcon[p.channel] ?? '📢'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{p.channel}</span>
                    <StatusBadge status={p.status} />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      📅 {new Date(p.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 6 }}>{p.body}</div>
                  {p.hashtags.length > 0 && (
                    <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{p.hashtags.join(' ')}</div>
                  )}
                  {(p.reach !== undefined || p.engagements !== undefined) && (
                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                      {p.reach !== undefined && <span>👁 {fmt(p.reach)}</span>}
                      {p.impressions !== undefined && <span>📊 {fmt(p.impressions)}</span>}
                      {p.engagements !== undefined && <span>💬 {fmt(p.engagements)}</span>}
                      {p.clicks !== undefined && <span>🔗 {fmt(p.clicks)}</span>}
                      {p.shares !== undefined && <span>🔁 {fmt(p.shares)}</span>}
                    </div>
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

// ── Tab: Newsletter ────────────────────────────────────────────────────────────

function NewsletterTab() {
  const [newsletters, setNewsletters] = useState<NewsletterDispatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationEnterpriseService.getNewsletters();
      setNewsletters(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <SectionHeader title="Disparos de Newsletter" />

      {/* Benchmarks da indústria */}
      <div style={{
        background: 'linear-gradient(135deg,#ede9fe,#dbeafe)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 20,
        display: 'flex', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 12, color: '#374151' }}>
          <span style={{ fontWeight: 700 }}>📊 Benchmarks do Setor (Terceiro Setor):</span>{' '}
          Taxa de Abertura média: <strong>25–40%</strong> · Taxa de Clique média: <strong>3–8%</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando newsletters...</div>
      ) : newsletters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📧</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum disparo registrado.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {newsletters.map(nl => (
            <Card key={nl.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{nl.subject}</div>
                  {nl.previewText && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{nl.previewText}</div>}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Segmento: {nl.recipientSegment} · {fmt(nl.recipientCount)} destinatários · Agendado: {new Date(nl.scheduledAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={nl.status} />
                  {nl.lgpdCompliant && (
                    <span style={{ fontSize: 10, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>🔒 LGPD OK</span>
                  )}
                </div>
              </div>

              {nl.deliveredCount !== undefined && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8 }}>
                  {[
                    { label: 'Entregues', value: fmt(nl.deliveredCount), icon: '📨' },
                    { label: 'Abertos', value: fmt(nl.openedCount), icon: '👁' },
                    { label: 'Clicados', value: fmt(nl.clickedCount), icon: '🔗' },
                    { label: 'Bounces', value: fmt(nl.bouncedCount), icon: '↩️' },
                    { label: 'Taxa Abertura', value: fmtPct(nl.openRate), icon: '📊' },
                    { label: 'Taxa Clique', value: fmtPct(nl.clickRate), icon: '🎯' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16 }}>{m.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{m.value}</div>
                      <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                    </div>
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

// ── Tab: Imprensa ─────────────────────────────────────────────────────────────

function PressTab() {
  const [contacts, setContacts] = useState<MediaContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MediaContact | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunicationEnterpriseService.getMediaContacts();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: MediaContact) => {
    await CommunicationEnterpriseService.saveMediaContact(data);
    await load();
    setShowModal(false);
    setEditing(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este contato?')) return;
    await CommunicationEnterpriseService.deleteMediaContact(id);
    await load();
  };

  const typeIcon: Record<string, string> = {
    Jornalista: '📰', Influenciador: '⭐', Blogger: '✍️',
    Podcast: '🎙️', TV: '📺', Radio: '📻', Agencia: '🏢',
  };

  return (
    <div>
      {(showModal || editing) && (
        <MediaContactFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(undefined); }}
        />
      )}

      <SectionHeader title="Contatos de Mídia e Influenciadores" onAdd={() => setShowModal(true)} addLabel="Novo Contato" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando contatos...</div>
      ) : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>🤝</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum contato de mídia cadastrado.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {contacts.map(c => (
            <Card key={c.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>{typeIcon[c.type] ?? '📢'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.type} · {c.outlet}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{c.email}</div>
                  {c.reach && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4, fontWeight: 600 }}>👥 {fmt(c.reach)} alcance</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {c.niche.map(n => (
                      <span key={n} style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 6px', borderRadius: 8, fontSize: 9, fontWeight: 700 }}>{n}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {c.lgpdConsent && <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🔒 LGPD</span>}
                    {!c.active && <span style={{ fontSize: 9, background: '#fee2e2', color: '#ef4444', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>INATIVO</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => { setEditing(c); setShowModal(false); }}
                  style={{ flex: 1, padding: '5px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                >✏️ Editar</button>
                <button
                  onClick={() => c.id && handleDelete(c.id)}
                  style={{ flex: 1, padding: '5px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}
                >🗑 Excluir</button>
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
  const [snapshots, setSnapshots] = useState<CommAnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommunicationEnterpriseService.getAnalyticsHistory(12)
      .then(setSnapshots)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHeader title="Histórico de Analytics" />

      <div style={{
        background: 'linear-gradient(135deg,#ede9fe,#dbeafe)',
        borderRadius: 14, padding: '14px 20px', marginBottom: 20,
        fontSize: 12, color: '#374151',
      }}>
        📊 <strong>Snapshots mensais consolidados</strong> de alcance, engajamento, seguidores e performance web. Registre um novo snapshot ao final de cada mês.
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando analytics...</div>
      ) : snapshots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40 }}>📈</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhum dado de analytics registrado.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {snapshots.map(s => (
            <Card key={s.id} style={{ padding: '16px 22px' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 14 }}>
                📅 Período: {s.period}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
                {[
                  { label: 'Alcance', value: fmt(s.totalReach), icon: '👁️' },
                  { label: 'Impressões', value: fmt(s.totalImpressions), icon: '📊' },
                  { label: 'Engajamentos', value: fmt(s.totalEngagements), icon: '💬' },
                  { label: 'Cliques', value: fmt(s.totalClicks), icon: '🔗' },
                  { label: 'Conversões', value: fmt(s.totalConversions), icon: '🎯' },
                  { label: 'Leads Gerados', value: fmt(s.totalLeadsGenerated), icon: '🌱' },
                  { label: 'Abertura E-mail', value: fmtPct(s.emailOpenRate), icon: '📧' },
                  { label: 'Clique E-mail', value: fmtPct(s.emailClickRate), icon: '🖱️' },
                  { label: 'Instagram', value: fmt(s.instagramFollowers), icon: '📸' },
                  { label: 'Facebook', value: fmt(s.facebookFollowers), icon: '👍' },
                  { label: 'LinkedIn', value: fmt(s.linkedinFollowers), icon: '💼' },
                  { label: 'YouTube', value: fmt(s.youtubeSubscribers), icon: '▶️' },
                  { label: 'Visitantes Site', value: fmt(s.websiteVisitors), icon: '🌐' },
                  { label: 'Sessões Site', value: fmt(s.websiteSessions), icon: '📍' },
                  { label: 'Bounce Rate', value: fmtPct(s.websiteBounceRate), icon: '↩️' },
                  { label: 'Menções Imprensa', value: fmt(s.pressMentions), icon: '📰' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{m.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>📢</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Hub de Comunicação
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Marketing Digital · Campanhas · Conteúdo · Social Media · Newsletter · Imprensa · Analytics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12,
          padding: 4, flexWrap: 'wrap', marginTop: 18,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Dashboard' && <DashboardTab />}
      {activeTab === 'Campanhas' && <CampaignsTab />}
      {activeTab === 'Conteúdo' && <ContentTab />}
      {activeTab === 'Social Media' && <SocialMediaTab />}
      {activeTab === 'Newsletter' && <NewsletterTab />}
      {activeTab === 'Imprensa' && <PressTab />}
      {activeTab === 'Analytics' && <AnalyticsTab />}
    </div>
  );
}
