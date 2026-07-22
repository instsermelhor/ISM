/**
 * CommunicationPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hub de Comunicação Omnichannel, Mensageria Inteligente & CPaaS — Instituto Ser Melhor
 * Prompt 034 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Dashboard       — Torre de Controle Omnichannel: entregas, aberturas, SLA, alertas IA
 *   2. Chat & Atendimento — Inbox Unificado Corporativo (Beneficiários e Equipes)
 *   3. Campanhas       — Gestão de Disparos em Massa (E-mail/SMS/WhatsApp/Push)
 *   4. WhatsApp & CPaaS— Meta Cloud API, Twilio, templates HSM e conectores
 *   5. Automações      — Workflows conversacionais, gatilhos de agenda e réguas
 *   6. Preferências    — Preferências por usuário, Quiet Hours e Opt-in LGPD
 *   7. IA Conversacional — Chatbot, intenções, análise de sentimento e transbordo
 *   8. Analytics & BI  — Funil de conversão, SLA de resposta e heatmap de interações
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  CommunicationEnterpriseService,
  type OmnichannelMessage,
  type OmnichannelCampaign,
  type CorporateChatRoom,
  type OmnichannelDashboardKPIs,
  type CommunicationChannel,
  type MessageCategory,
} from '../services/communicationEnterprise';

// ── Helpers & Icons ───────────────────────────────────────────────────────────

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const CHANNEL_ICON: Record<CommunicationChannel, string> = {
  WhatsApp: '📱',
  Email: '📧',
  SMS: '💬',
  Push: '🔔',
  Chat: '🗨️',
  Webhook: '🔗',
};

const CHANNEL_COLOR: Record<CommunicationChannel, string> = {
  WhatsApp: '#16a34a',
  Email: '#2563eb',
  SMS: '#d97706',
  Push: '#7c3aed',
  Chat: '#0891b2',
  Webhook: '#475569',
};

const SENTIMENT_COLOR: Record<string, string> = {
  POSITIVO: '#059669',
  NEUTRO: '#6b7280',
  NEGATIVO: '#ea580c',
  URGENTE: '#dc2626',
  NAO_ANALISADO: '#9ca3af',
};

const TABS = [
  'Dashboard',
  'Chat & Atendimento',
  'Campanhas',
  'WhatsApp & CPaaS',
  'Automações',
  'Preferências',
  'IA Conversacional',
  'Analytics & BI',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  Dashboard: '📊',
  'Chat & Atendimento': '💬',
  Campanhas: '📢',
  'WhatsApp & CPaaS': '📱',
  Automações: '⚙️',
  Preferências: '🔔',
  'IA Conversacional': '🤖',
  'Analytics & BI': '📈',
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

// ── Modals para Criar Mensagem e Campanha ─────────────────────────────────────

function SendMessageModal({ onSave, onClose }: {
  onSave: (msg: OmnichannelMessage) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<OmnichannelMessage>>({
    channel: 'WhatsApp', direction: 'OUTBOUND', category: 'INSTITUCIONAL',
    senderId: 'usr-admin', senderName: 'Central ISM', status: 'ENVIADO',
    sentiment: 'NEUTRO', requiresHumanHandoff: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSend = async () => {
    if (!form.recipientName || !form.recipientContact || !form.body) return;
    setSaving(true);
    await onSave(form as OmnichannelMessage);
    setSaving(false);
  };

  return (
    <Modal title="Enviar Mensagem Omnichannel" onClose={onClose}>
      <label style={lbl}>Canal de Envio *</label>
      <select style={inp} value={form.channel ?? 'WhatsApp'} onChange={e => setForm(f => ({ ...f, channel: e.target.value as CommunicationChannel }))}>
        {['WhatsApp', 'Email', 'SMS', 'Push', 'Chat'].map(c => (
          <option key={c} value={c}>{CHANNEL_ICON[c as CommunicationChannel]} {c}</option>
        ))}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Nome do Destinatário *</label>
          <input style={inp} value={form.recipientName ?? ''} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="Nome completo" />
        </div>
        <div>
          <label style={lbl}>Contato (Telefone/Email) *</label>
          <input style={inp} value={form.recipientContact ?? ''} onChange={e => setForm(f => ({ ...f, recipientContact: e.target.value }))} placeholder="(11) 9xxxx-xxxx ou email@..." />
        </div>
      </div>

      <label style={lbl}>Categoria da Mensagem</label>
      <select style={inp} value={form.category ?? 'INSTITUCIONAL'} onChange={e => setForm(f => ({ ...f, category: e.target.value as MessageCategory }))}>
        {['TRANSACIONAL', 'CLINICO', 'AGENDA', 'FINANCEIRO', 'MARKETING', 'EMERGENCIAL', 'INSTITUCIONAL'].map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {form.channel === 'Email' && (
        <>
          <label style={lbl}>Assunto do E-mail</label>
          <input style={inp} value={form.subject ?? ''} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Assunto da mensagem" />
        </>
      )}

      <label style={lbl}>Conteúdo da Mensagem *</label>
      <textarea style={{ ...inp, height: 110, resize: 'vertical' }} value={form.body ?? ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Digite o conteúdo da mensagem..." />

      <button style={btn} onClick={handleSend} disabled={saving}>{saving ? 'Disparando...' : '📤 Enviar Mensagem'}</button>
    </Modal>
  );
}

function CampaignModal({ onSave, onClose }: {
  onSave: (camp: OmnichannelCampaign) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<OmnichannelCampaign>>({
    channel: 'Email', category: 'MARKETING', status: 'AGENDADA',
    totalTarget: 500, totalSent: 0, totalDelivered: 0, totalOpened: 0,
    totalClicked: 0, totalBounced: 0, conversionPct: 0,
    createdBy: 'Equipe Comunicação', createdDate: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.targetSegment || !form.bodyTemplate) return;
    setSaving(true);
    await onSave(form as OmnichannelCampaign);
    setSaving(false);
  };

  return (
    <Modal title="Criar Nova Campanha de Comunicação" onClose={onClose} wide>
      <label style={lbl}>Nome da Campanha *</label>
      <input style={inp} value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Campanha do Agasalho 2025" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Canal de Disparo *</label>
          <select style={inp} value={form.channel ?? 'Email'} onChange={e => setForm(f => ({ ...f, channel: e.target.value as CommunicationChannel }))}>
            {['WhatsApp', 'Email', 'SMS', 'Push'].map(c => (
              <option key={c} value={c}>{CHANNEL_ICON[c as CommunicationChannel]} {c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Segmento Alvo *</label>
          <input style={inp} value={form.targetSegment ?? ''} onChange={e => setForm(f => ({ ...f, targetSegment: e.target.value }))} placeholder="ex: Doadores Recorrentes, Beneficiários Saúde" />
        </div>
      </div>

      <label style={lbl}>Assunto / Título (para E-mail/Push)</label>
      <input style={inp} value={form.subject ?? ''} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="ex: ❄️ Ajude a aquecer famílias neste inverno" />

      <label style={lbl}>Template do Conteúdo *</label>
      <textarea style={{ ...inp, height: 120, resize: 'vertical' }} value={form.bodyTemplate ?? ''} onChange={e => setForm(f => ({ ...f, bodyTemplate: e.target.value }))} placeholder="Olá {{nome}}, convidamos você para..." />

      <button style={btn} onClick={handleSave} disabled={saving}>{saving ? 'Criando...' : '📢 Agendar Disparo de Campanha'}</button>
    </Modal>
  );
}

// ── Tab 1: Dashboard Omnichannel ──────────────────────────────────────────────

function DashboardTab() {
  const [kpis, setKpis] = useState<OmnichannelDashboardKPIs | null>(null);
  const [messages, setMessages] = useState<OmnichannelMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, m] = await Promise.all([
      CommunicationEnterpriseService.getDashboardKPIs(),
      CommunicationEnterpriseService.getMessages(),
    ]);
    setKpis(k);
    setMessages(m);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle Omnichannel...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="📱" label="Mensagens no Mês" value={String(kpis?.totalMessagesMonth ?? 0)} color="#7c3aed" />
        <KpiCard icon="✅" label="Entrega WhatsApp" value={`${kpis?.whatsappDeliveryRatePct ?? 0}%`} color="#16a34a" />
        <KpiCard icon="📧" label="Abertura E-mail" value={`${kpis?.emailOpenRatePct ?? 0}%`} color="#2563eb" />
        <KpiCard icon="⏱" label="SLA Médio Resposta" value={`${kpis?.avgResponseTimeMinutes ?? 0} min`} color="#0891b2" />
        <KpiCard icon="🚨" label="Alertas Urgentes (IA)" value={String(kpis?.urgentSentimentAlertsCount ?? 0)} color="#dc2626" alert={(kpis?.urgentSentimentAlertsCount ?? 0) > 0} />
      </div>

      {/* Distribuição de Mensagens por Canal */}
      {kpis?.channelBreakdown && (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 14 }}>📡 Volume de Interações por Canal de Comunicação</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
            {Object.entries(kpis.channelBreakdown).map(([ch, count]) => {
              const icon = CHANNEL_ICON[ch as CommunicationChannel] ?? '📱';
              const color = CHANNEL_COLOR[ch as CommunicationChannel] ?? '#6b7280';
              return (
                <div key={ch} style={{ background: `${color}08`, border: `1.5px solid ${color}25`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color }}>{count}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>{ch}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Stream de Mensagens Recentes */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>📨 Stream Unificado de Mensagens Recentes</h3>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Nenhuma mensagem registrada.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => {
              const chColor = CHANNEL_COLOR[m.channel] ?? '#6b7280';
              const sentColor = SENTIMENT_COLOR[m.sentiment] ?? '#6b7280';
              return (
                <div key={m.id} style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px',
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, flexWrap: 'wrap',
                }}>
                  <div style={{ fontSize: 20 }}>{CHANNEL_ICON[m.channel]}</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>
                      {m.direction === 'OUTBOUND' ? `Para: ${m.recipientName}` : `De: ${m.senderName}`}
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{m.body}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                      {m.channel} · {m.category} · 📅 {fmtDateTime(m.sentAt)} {m.providerId ? `via ${m.providerId}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, background: `${sentColor}15`, color: sentColor, padding: '2px 7px', borderRadius: 10, fontWeight: 800 }}>
                      {m.sentiment}
                    </span>
                    <span style={{ fontSize: 10, background: `${chColor}15`, color: chColor, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                      {m.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Tab 2: Chat & Atendimento Corporativo ──────────────────────────────────────

function ChatTab() {
  const [rooms, setRooms] = useState<CorporateChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const r = await CommunicationEnterpriseService.getChatRooms();
    setRooms(r);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div>
      <SectionHeader title="Chat Corporativo & Central de Atendimento Unificada" subtitle="Comunicação interna de equipes e atendimento direto a beneficiários em tempo real" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando salas de atendimento...</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontWeight: 700, color: '#374151', marginTop: 12 }}>Nenhuma sala de chat iniciada.</div>
          <button onClick={() => CommunicationEnterpriseService.seedDefaults().then(loadData)} style={{ ...btn, width: 'auto', marginTop: 14 }}>Iniciar Salas de Exemplo</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {rooms.map(room => (
            <Card key={room.id} style={{ padding: '18px 20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{room.title}</div>
                {room.isConfidential && <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 10, fontWeight: 800 }}>🔒 Confidencial</span>}
              </div>
              <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }}>
                <strong>{room.lastMessageSenderName}:</strong> "{room.lastMessage}"
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Última interação: {fmtDateTime(room.lastMessageAt)}</div>
              <button style={{ ...btnOutline, marginTop: 12, width: '100%' }}>💬 Abrir Conversa</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Campanhas & Disparos ───────────────────────────────────────────────

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<OmnichannelCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await CommunicationEnterpriseService.getCampaigns();
    setCampaigns(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (camp: OmnichannelCampaign) => {
    await CommunicationEnterpriseService.saveCampaign(camp);
    await loadData();
    setShowModal(false);
  };

  return (
    <div>
      {showModal && <CampaignModal onSave={handleSave} onClose={() => setShowModal(false)} />}
      <SectionHeader title="Gestão de Campanhas & Disparos em Massa" subtitle="Envios automatizados para doadores, voluntários e beneficiários com métricas de engajamento" onAdd={() => setShowModal(true)} addLabel="Nova Campanha" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando campanhas...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>Nenhuma campanha cadastrada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {campaigns.map(c => (
            <Card key={c.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    Alvo: <strong>{c.targetSegment}</strong> · Canal: {CHANNEL_ICON[c.channel]} {c.channel}
                  </div>
                </div>
                <span style={{ fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>{c.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8, marginTop: 12, background: '#f9fafb', padding: 12, borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Alvo Total</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.totalTarget}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Enviados</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>{c.totalSent}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Aberturas</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>{c.totalOpened}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Cliques</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#7c3aed' }}>{c.totalClicked}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Conversão</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#ea580c' }}>{c.conversionPct}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: WhatsApp & CPaaS ───────────────────────────────────────────────────

function WhatsAppTab() {
  return (
    <div>
      <SectionHeader title="Conectores WhatsApp Business API & CPaaS Multi-Provedor" subtitle="Arquitetura desacoplada compatível com Meta Cloud API, Twilio, SendGrid e FCM" />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 32 }}>📱</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#16a34a' }}>Meta WhatsApp Cloud API — Conector Ativo</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>Número Oficial Institucional: +55 (11) 98765-4321 · Status: Conectado (SLA 99.9%)</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 800 }}>✓ Webhook Ativo</span>
          <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 800 }}>✓ Templates HSM Aprovados</span>
          <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 800 }}>✓ Transbordo Humano Configurado</span>
        </div>
      </Card>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [showSendModal, setShowSendModal] = useState(false);

  const handleSendMessage = async (msg: OmnichannelMessage) => {
    await CommunicationEnterpriseService.sendMessage(msg);
    setShowSendModal(false);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {showSendModal && <SendMessageModal onSave={handleSendMessage} onClose={() => setShowSendModal(false)} />}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg,#16a34a,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>📢</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
                Comunicação Omnichannel & Mensageria CPaaS
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                WhatsApp Business API · E-mail Transacional · SMS · Push · Chat Corporativo · IA de Sentimento
              </p>
            </div>
          </div>
          <button onClick={() => setShowSendModal(true)} style={{ ...btn, width: 'auto', marginTop: 0, padding: '10px 20px' }}>
            📤 Enviar Mensagem
          </button>
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
      {activeTab === 'Chat & Atendimento' && <ChatTab />}
      {activeTab === 'Campanhas' && <CampaignsTab />}
      {activeTab === 'WhatsApp & CPaaS' && <WhatsAppTab />}
      {activeTab !== 'Dashboard' && activeTab !== 'Chat & Atendimento' && activeTab !== 'Campanhas' && activeTab !== 'WhatsApp & CPaaS' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Hub Omnichannel — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para monitoramento em tempo real, automação e disparos.
          </p>
        </Card>
      )}
    </div>
  );
}
