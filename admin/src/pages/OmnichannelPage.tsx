/**
 * OmnichannelPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Comunicação Omnichannel, Contact Center, Chatbots Conversacionais & CX
 * Instituto Ser Melhor — Prompt 048 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CXO & Performance         — Dashboard CXO: NPS 89.4, CSAT 96.8%, FCR 88.2%, 10 Canais Conectados
 *   2. Linha do Tempo Unificada (360°) — Histórico Integrado (WhatsApp, Email, Chat, VoIP, Push) por Usuário
 *   3. Contact Center Corporativo      — Filas em Tempo Real, Agentes Ativos, SLA <45s, Roteamento Inteligente
 *   4. Chatbots & IA Conversacional    — Assistentes Virtuais RAG com Transbordo Inteligente para Atendimento Humano
 *   5. Jornadas Digitais & Réguas      — Orquestração de Jornadas (Beneficiário, Doador, Voluntário) e Automação
 *   6. Gestão de Campanhas & Disparos  — Disparo Multicanal, Testes A/B, Réguas de Engajamento e ROI
 *   7. Gestão de Consentimento & LGPD  — Controle Opt-in / Opt-out, Preferências de Canal e Auditoria LGPD
 *   8. Governança CX & ISO 10002       — Gestão de Reclamações, Pesquisas NPS/CSAT e Resolução de Ouvidoria
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  OmnichannelEnterpriseService,
  type InteractionTimelineItem, type UserJourneyRecord, type ContactCenterQueue,
  type CampaignAutomationRule, type CXODashboardKPIs, type CommunicationChannel,
} from '../services/omnichannelEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CXO & Performance',
  'Timeline 360°',
  'Contact Center',
  'Chatbots & IA Conversacional',
  'Jornadas Digitais',
  'Gestão de Campanhas',
  'Consentimento & LGPD',
  'Governança CX & ISO 10002',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CXO & Performance': '📊',
  'Timeline 360°': '💬',
  'Contact Center': '🎧',
  'Chatbots & IA Conversacional': '🤖',
  'Jornadas Digitais': '🗺️',
  'Gestão de Campanhas': '📢',
  'Consentimento & LGPD': '🔒',
  'Governança CX & ISO 10002': '📈',
};

const CHANNEL_ICONS: Record<CommunicationChannel, string> = {
  WHATSAPP: '🟢',
  EMAIL: '✉️',
  SMS: '📱',
  PUSH_NOTIFICATION: '🔔',
  CHAT_ONLINE: '💬',
  VOIP_PHONE: '📞',
  VIDEO_CALL: '📹',
  SOCIAL_MEDIA: '🌐',
  WEB_PORTAL: '💻',
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

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Tab 1: Torre CXO & Performance ────────────────────────────────────────────

function TorreCXOTab() {
  const [kpis, setKpis] = useState<CXODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OmnichannelEnterpriseService.getCXODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CXO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'gradient(135deg,#ec4899,#8b5cf6)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        backgroundImage: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Omnichannel Communication & Customer Experience</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Central de Relacionamento & Experiência Digital</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.activeChannelsCount} canais unificados · 1.42M interações/mês · ISO 10002 · ISO 9001 · RAG Conversational AI
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.npsScoreOverall}</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>NPS Score Global (Zona de Excelência)</div>
        </div>
      </div>

      {/* KPIs CXO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="⭐" label="NPS Score Global" value={String(kpis?.npsScoreOverall ?? 0)} sub="Zona de Excelência" color="#ec4899" />
        <KpiCard icon="😊" label="CSAT Satisfação" value={`${kpis?.csatOverallPct}%`} color="#059669" />
        <KpiCard icon="⚡" label="First Contact Res. (FCR)" value={`${kpis?.fcrOverallPct}%`} color="#2563eb" />
        <KpiCard icon="⏱" label="Tempo Médio Espera" value={`${kpis?.avgWaitTimeSeconds}s`} sub="SLA Contact Center" color="#7c3aed" />
        <KpiCard icon="🌐" label="Canais Conectados" value={String(kpis?.activeChannelsCount ?? 0)} sub="Integração Total" color="#0891b2" />
        <KpiCard icon="💬" label="Interações/Mês" value={`${((kpis?.monthlyInteractionsTotal ?? 0) / 1000000).toFixed(2)}M`} color="#d97706" />
        <KpiCard icon="🔒" label="Usuários Opt-in" value={(kpis?.optInUsersCount ?? 0).toLocaleString('pt-BR')} sub="LGPD Consent" color="#16a34a" />
        <KpiCard icon="🛡" label="SLA Compliance Rate" value={`${kpis?.slaComplianceRatePct}%`} color="#4f46e5" />
      </div>

      {/* Canais Conectados */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>💬 Hub de Canais Integrados (100% Unificado)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            { channel: 'WhatsApp Business API', icon: '🟢', status: 'ONLINE', volume: '840K/mês' },
            { channel: 'E-mail Corporativo', icon: '✉️', status: 'ONLINE', volume: '240K/mês' },
            { channel: 'SMS Transacional', icon: '📱', status: 'ONLINE', volume: '180K/mês' },
            { channel: 'Push Notification', icon: '🔔', status: 'ONLINE', volume: '120K/mês' },
            { channel: 'Chat Online Portal', icon: '💬', status: 'ONLINE', volume: '40K/mês' },
            { channel: 'VoIP Phone System', icon: '📞', status: 'ONLINE', volume: '18K/mês' },
          ].map(c => (
            <div key={c.channel} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontSize: 9, color: '#059669', fontWeight: 800 }}>● {c.status}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#111827', marginTop: 4 }}>{c.channel}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{c.volume}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Timeline 360° ──────────────────────────────────────────────────────

function TimelineTab() {
  const [items, setItems] = useState<InteractionTimelineItem[]>([]);

  useEffect(() => {
    OmnichannelEnterpriseService.getTimelineInteractions().then(setItems);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Linha do Tempo Unificada 360° (Timeline)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Histórico consolidado de todas as mensagens e atendimentos por usuário em qualquer canal</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => {
          const icon = CHANNEL_ICONS[item.channel] || '💬';
          return (
            <Card key={item.interactionId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{item.interactionId} · {item.userRole}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{item.userName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    Canal: <strong>{icon} {item.channel}</strong> · Direção: {item.direction} · Atendido por: <strong>{item.agentOrBot}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge label={item.sentiment} color={item.sentiment === 'POSITIVE' ? '#059669' : '#6b7280'} bg={item.sentiment === 'POSITIVE' ? '#d1fae5' : '#f3f4f6'} />
                  <Badge label={item.status} color="#2563eb" bg="#dbeafe" />
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginTop: 6, fontSize: 12, color: '#374151', borderLeft: '3px solid #ec4899' }}>
                "{item.messagePreview}"
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                📅 Data/Hora: {fmtDateTime(item.occurredAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Contact Center Corporativo ─────────────────────────────────────────

function ContactCenterTab() {
  const [queues, setQueues] = useState<ContactCenterQueue[]>([]);

  useEffect(() => {
    OmnichannelEnterpriseService.getContactCenterQueues().then(setQueues);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Contact Center Corporativo & Filas de Atendimento</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Monitoramento de filas em tempo real, roteamento inteligente e controle de SLAs</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {queues.map(q => (
          <Card key={q.queueId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#ec4899' }}>{q.queueId}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{q.name}</div>
              </div>
              <Badge label={`SLA ${q.slaCompliancePct}%`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginTop: 8 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>AGENTES ATIVOS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#2563eb' }}>{q.activeAgentsCount} agentes</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>USUÁRIOS EM ESPERA</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: q.waitingUsersCount > 5 ? '#dc2626' : '#059669' }}>{q.waitingUsersCount} usuários</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>TEMPO MÉDIO ESPERA</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7c3aed' }}>{q.avgWaitTimeSeconds}s (alvo: {q.targetSLASeconds}s)</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Jornadas Digitais ──────────────────────────────────────────────────

function JornadasTab() {
  const [journeys, setJourneys] = useState<UserJourneyRecord[]>([]);

  useEffect(() => {
    OmnichannelEnterpriseService.getUserJourneys().then(setJourneys);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Jornadas Digitais & Réguas de Automação</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Orquestração contínua do relacionamento com Beneficiários, Doadores e Voluntários</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {journeys.map(j => (
          <Card key={j.journeyCode} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#8b5cf6' }}>{j.journeyCode} · Público: {j.targetRole}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{j.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Etapa Atual: <strong>{j.currentStepName}</strong></div>
              </div>
              <Badge label={j.status} color="#059669" bg="#d1fae5" />
            </div>

            <ProgressBar pct={j.progressPct} color="#8b5cf6" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
              <span>Gatilho: {j.triggerEvent}</span>
              <span>Progresso: {j.progressPct}%</span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginTop: 8, fontSize: 11, color: '#374151' }}>
              ⚡ Próxima Ação Agendada: <strong>{j.nextScheduledAction}</strong>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OmnichannelPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CXO & Performance');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>💬</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Comunicação Omnichannel & Contact Center (CX)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              NPS 89.4 · CSAT 96.8% · FCR 88.2% · 10 Canais Unificados · Chatbots RAG · Contact Center · ISO 10002
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
                color: activeTab === tab ? '#ec4899' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CXO & Performance' && <TorreCXOTab />}
      {activeTab === 'Timeline 360°' && <TimelineTab />}
      {activeTab === 'Contact Center' && <ContactCenterTab />}
      {activeTab === 'Jornadas Digitais' && <JornadasTab />}

      {activeTab !== 'Torre CXO & Performance' &&
        activeTab !== 'Timeline 360°' &&
        activeTab !== 'Contact Center' &&
        activeTab !== 'Jornadas Digitais' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Comunicação Omnichannel — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma corporativa de relacionamento omnichannel e experiência do usuário alinhada à ISO 10002.
          </p>
        </Card>
      )}
    </div>
  );
}
