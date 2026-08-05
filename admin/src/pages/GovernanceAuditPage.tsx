/**
 * GovernanceAuditPage.tsx — D004: Copiloto de Governança & Auditoria LGPD
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Painel administrativo de conformidade LGPD com checklist automatizado,
 * logs de auditoria imutáveis (hash SHA-256) e dashboard de governança.
 */

import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Lock, FileText, Users, Hash, Clock, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import {
  LGPDAuditService,
  type LGPDComplianceSnapshot,
  type LGPDCheckItem,
  type LGPDStatus,
} from '../services/lgpdAuditService';

const STATUS_CONFIG: Record<LGPDStatus, { color: string; bg: string; border: string; Icon: React.FC<{ size?: number }> }> = {
  'CONFORME':      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
  'ATENÇÃO':       { color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: AlertTriangle },
  'CRÍTICO':       { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: XCircle },
  'NÃO_APLICÁVEL': { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', Icon: Info },
};

const SEV_CONFIG = {
  INFO:    { color: '#3b82f6', bg: '#eff6ff' },
  AVISO:   { color: '#d97706', bg: '#fffbeb' },
  CRÍTICO: { color: '#dc2626', bg: '#fef2f2' },
};

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'agora mesmo';
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `há ${Math.floor(diff / 86400000)} dias`;
  return new Date(iso).toLocaleDateString('pt-BR');
};

const CheckRow: React.FC<{ item: LGPDCheckItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[item.status];
  const { Icon } = cfg;

  return (
    <div style={{ border: `1px solid ${cfg.border}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: open ? cfg.bg : 'white',
          padding: '14px 18px', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s',
        }}
      >
        <Icon size={18} color={cfg.color} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              }}>{item.status}</span>
              {open ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {item.category} · {item.legalBasis}
          </div>
        </div>
      </button>

      {open && (
        <div style={{ background: cfg.bg, padding: '12px 18px 16px', borderTop: `1px solid ${cfg.border}` }}>
          <p style={{ fontSize: 12, color: '#374151', marginBottom: 10, lineHeight: 1.6 }}>{item.description}</p>
          <div style={{ background: 'white', borderRadius: 8, padding: '10px 14px', border: `1px solid ${cfg.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', marginBottom: 4 }}>Evidência / Observações</div>
            <p style={{ fontSize: 11, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{item.evidence}</p>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 10, color: '#9ca3af' }}>
            <span>📅 Verificado em: <strong style={{ color: '#374151' }}>{item.lastChecked}</strong></span>
            <span>👤 Responsável: <strong style={{ color: '#374151' }}>{item.responsible}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export const GovernanceAuditPage: React.FC = () => {
  const [snap, setSnap] = useState<LGPDComplianceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checklist' | 'logs' | 'dpo'>('checklist');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');

  useEffect(() => {
    LGPDAuditService.getComplianceSnapshot().then(s => { setSnap(s); setLoading(false); });
  }, []);

  if (loading || !snap) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
        <RefreshCw size={26} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        Verificando conformidade LGPD...
      </div>
    );
  }

  const scoreCfg = snap.status === 'CONFORME'
    ? { color: '#16a34a', bg: 'linear-gradient(135deg, #052e16, #166534)', badge: '#4ade80' }
    : snap.status === 'ATENÇÃO'
      ? { color: '#d97706', bg: 'linear-gradient(135deg, #451a03, #92400e)', badge: '#fde68a' }
      : { color: '#dc2626', bg: 'linear-gradient(135deg, #450a0a, #991b1b)', badge: '#fca5a5' };

  const categories = ['TODOS', ...Array.from(new Set(snap.checks.map(c => c.category)))];
  const filteredChecks = categoryFilter === 'TODOS'
    ? snap.checks
    : snap.checks.filter(c => c.category === categoryFilter);

  const tabStyle = (t: string) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
    background: activeTab === t ? '#1e40af' : '#f3f4f6',
    color: activeTab === t ? 'white' : '#374151',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: scoreCfg.bg, borderRadius: 20, padding: '28px 32px', marginBottom: 28, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={26} color={scoreCfg.badge} />
              Copiloto de Governança & Auditoria LGPD
            </h1>
            <p style={{ fontSize: 12, color: scoreCfg.badge, margin: 0, opacity: 0.9 }}>
              Verificação automatizada de conformidade — Lei Geral de Proteção de Dados (Lei 13.709/2018)
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: scoreCfg.badge, textTransform: 'uppercase' }}>Score Geral</div>
              <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace', color: scoreCfg.badge, lineHeight: 1 }}>
                {snap.overallScore}%
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
              <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 8 }}>
                ✅ {snap.conformeCount} Conformes
              </div>
              <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 8 }}>
                ⚠️ {snap.atencaoCount} Em Atenção
              </div>
              <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 8 }}>
                ❌ {snap.criticoCount} Críticos
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div style={{
            background: `linear-gradient(90deg, ${scoreCfg.badge}, white)`,
            width: `${snap.overallScore}%`, height: '100%', borderRadius: 99,
            transition: 'width 1s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
          <span>Última auditoria: {snap.lastAuditDate}</span>
          <span>Próxima: {snap.nextAuditDate}</span>
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['checklist', 'logs', 'dpo'] as const).map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {{ checklist: '🛡️ Checklist LGPD', logs: '📋 Logs de Auditoria', dpo: '👤 DPO & Governança' }[t]}
            </button>
          ))}
        </div>

        {/* ── TAB: Checklist ── */}
        {activeTab === 'checklist' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Filtrar:</span>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                  padding: '4px 12px', borderRadius: 20, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: categoryFilter === cat ? '#1e40af' : '#f9fafb',
                  color: categoryFilter === cat ? 'white' : '#374151',
                }}>{cat}</button>
              ))}
            </div>

            <div>
              {filteredChecks.map(item => <CheckRow key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* ── TAB: Logs de Auditoria ── */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>Logs de Auditoria Imutáveis</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                  Cada entrada contém hash SHA-256 para garantia de integridade e não-repúdio.
                </p>
              </div>
              <div style={{ fontSize: 11, background: '#f0fdf4', color: '#16a34a', padding: '5px 12px', borderRadius: 8, border: '1px solid #bbf7d0', fontWeight: 700 }}>
                <Lock size={11} style={{ display: 'inline', marginRight: 4 }} />
                Logs Imutáveis
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {snap.recentLogs.map(log => {
                const sev = SEV_CONFIG[log.severity];
                return (
                  <div key={log.id} style={{ border: '1px solid #e5e7eb', borderLeft: `4px solid ${sev.color}`, borderRadius: 10, padding: '14px 16px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: sev.bg, color: sev.color }}>{log.severity}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>{log.action}</span>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>→ {log.resource}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>{log.details}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#9ca3af', flexWrap: 'wrap' }}>
                          <span>👤 {log.actor}</span>
                          <span><Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {relTime(log.timestamp)}</span>
                          <span>🌐 {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, background: '#f3f4f6', borderRadius: 6, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Hash size={10} color="#9ca3af" />
                      <code style={{ fontSize: 9, color: '#6b7280', wordBreak: 'break-all', fontFamily: 'monospace' }}>{log.hash}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: DPO & Governança ── */}
        {activeTab === 'dpo' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} color="#16a34a" /> Encarregado de Dados (DPO)
                </h3>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{snap.dpo.name}</div>
                <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 4 }}>📧 {snap.dpo.email}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Nomeado desde: {snap.dpo.since}</div>
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'white', borderRadius: 8, fontSize: 11, color: '#374151', border: '1px solid #bbf7d0' }}>
                  Art. 41 LGPD — Indicação obrigatória do encarregado pelo controlador.
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1e40af', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} color="#3b82f6" /> Bases Legais de Tratamento
                </h3>
                {[
                  { art: 'Art. 7 I', base: 'Consentimento do titular', uso: 'Newsletter e marketing' },
                  { art: 'Art. 7 II', base: 'Cumprimento de obrigação legal', uso: 'Prestação de contas (OSCIP)' },
                  { art: 'Art. 7 VI', base: 'Legítimo interesse', uso: 'Melhoria do serviço' },
                  { art: 'Art. 7 VIII', base: 'Proteção da vida', uso: 'Projetos de emergência social' },
                ].map(b => (
                  <div key={b.art} style={{ marginBottom: 8, padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', marginBottom: 2 }}>{b.art} LGPD — {b.base}</div>
                    <div style={{ fontSize: 11, color: '#4b5563' }}>Uso: {b.uso}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#6b21a8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="#a855f7" /> Direitos do Titular (Art. 18)
                </h3>
                {[
                  { right: 'Confirmação de tratamento', status: '✅ Canal disponível' },
                  { right: 'Acesso aos dados', status: '✅ Canal disponível' },
                  { right: 'Correção de dados', status: '✅ Canal disponível' },
                  { right: 'Portabilidade', status: '✅ Exportação CSV' },
                  { right: 'Eliminação de dados', status: '✅ Prazo 15 dias' },
                  { right: 'Revogação de consentimento', status: '✅ Opt-out disponível' },
                ].map(r => (
                  <div key={r.right} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #f3e8ff', fontSize: 11 }}>
                    <span style={{ color: '#374151' }}>{r.right}</span>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
