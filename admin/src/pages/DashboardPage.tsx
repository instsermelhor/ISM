import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Eye, Mail, Activity } from 'lucide-react';
import { AnalyticsService, AuditService } from '../services/api';
import type { AnalyticsSummary, AuditLog } from '../types';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const KpiCard = ({ label, value, delta, deltaType, Icon, color, loading }: {
  label: string; value: string | number; delta?: string; deltaType?: string;
  Icon: React.ElementType; color: string; loading?: boolean;
}) => (
  <div className="card animate-fade-in" style={{ padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        <Icon size={22} />
      </div>
      {delta && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700,
          color: deltaType === 'up' ? '#16a34a' : deltaType === 'down' ? '#dc2626' : '#6b7280'
        }}>
          {deltaType === 'up' ? <TrendingUp size={13} /> : deltaType === 'down' ? <TrendingDown size={13} /> : null}
          {delta}
        </span>
      )}
    </div>
    {loading ? (
      <div style={{ height: 36, background: 'var(--gray-100)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
    ) : (
      <>
        <p style={{ fontSize: 30, fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, fontWeight: 600 }}>{label}</p>
      </>
    )}
  </div>
);

const PipelineMini = () => {
  const stages = [
    { label: 'Ideia', count: 2, color: '#6b7280' },
    { label: 'Escrita', count: 2, color: '#3b82f6' },
    { label: 'Revisão', count: 1, color: '#f59e0b' },
    { label: 'Aprovado', count: 1, color: '#8b5cf6' },
    { label: 'Publicado', count: 8, color: '#16a34a' },
  ];
  const max = Math.max(...stages.map(s => s.count));
  return (
    <div>
      {stages.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', width: 60, textAlign: 'right', flexShrink: 0 }}>{s.label}</span>
          <div style={{ flex: 1, height: 22, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(s.count / max) * 100}%`,
              background: `${s.color}25`, borderRadius: 6, display: 'flex', alignItems: 'center',
              paddingLeft: 8, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)'
            }}>
              <div style={{ width: `100%`, height: '60%', background: s.color, borderRadius: 4, opacity: 0.7 }} />
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: s.color, width: 16, textAlign: 'center' }}>{s.count}</span>
        </div>
      ))}
    </div>
  );
};

const AuditFeed = ({ logs }: { logs: AuditLog[] }) => {
  const actionColors: Record<string, string> = {
    CREATE: '#16a34a', UPDATE: '#3b82f6', DELETE: '#ef4444',
    PUBLISH: '#8b5cf6', LOGIN: '#6b7280', ARCHIVE: '#f59e0b'
  };
  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'agora mesmo';
    if (diff < 3600000) return `há ${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
    return `há ${Math.floor(diff / 86400000)}d`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {logs.map((log, i) => (
        <div key={log.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
          borderBottom: i < logs.length - 1 ? '1px solid var(--gray-100)' : 'none'
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={log.userAvatar} alt={log.userName} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', bottom: -3, right: -3, width: 14, height: 14,
              borderRadius: '50%', background: actionColors[log.action] || '#6b7280',
              border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={7} color="white" />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--gray-900)' }}>{log.userName}</strong>{' '}
              {log.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10,
                background: `${actionColors[log.action]}15`,
                color: actionColors[log.action], textTransform: 'uppercase'
              }}>
                {log.action}
              </span>
              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{relTime(log.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px'
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
      <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>
        {payload[0]?.value?.toLocaleString('pt-BR')} pageviews
      </p>
      {payload[1] && (
        <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13 }}>
          {payload[1]?.value} leads
        </p>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AnalyticsService.getSummary(),
      AuditService.getRecent(8),
    ]).then(([a, l]) => {
      setAnalytics(a);
      setLogs(l);
    }).finally(() => setLoading(false));
  }, []);

  const PIE_COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];

  return (
    <div className="animate-fade-in">
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Pageviews (30d)" value={analytics ? analytics.pageviews30d.toLocaleString('pt-BR') : '—'} delta="+12%" deltaType="up" Icon={Eye} color="#3b82f6" loading={loading} />
        <KpiCard label="Visitantes Únicos" value={analytics ? analytics.uniqueVisitors30d.toLocaleString('pt-BR') : '—'} delta="+8%" deltaType="up" Icon={Users} color="#8b5cf6" loading={loading} />
        <KpiCard label="Leads Gerados (30d)" value={analytics ? analytics.leadsGenerated30d : '—'} delta="+23%" deltaType="up" Icon={Mail} color="#16a34a" loading={loading} />
        <KpiCard label="Taxa de Rejeição" value={analytics ? `${analytics.bounceRate}%` : '—'} delta="-3.2%" deltaType="up" Icon={Activity} color="#f59e0b" loading={loading} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }} className="grid-responsive">
        {/* Pageviews Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>Tráfego & Leads</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Últimos 30 dias</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ color: '#4ade80', label: 'Pageviews' }, { color: '#60a5fa', label: 'Leads' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <div style={{ height: 220, background: 'var(--gray-100)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics?.series} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}
                  tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  interval={6}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pageviews" stroke="#4ade80" strokeWidth={2} fill="url(#gv)" dot={false} />
                <Area type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2} fill="url(#gl)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline Mini */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>Pipeline</h3>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 20 }}>Status do conteúdo</p>
          <PipelineMini />

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Leads por Fonte</span>
            </div>
            {loading ? null : (
              <div style={{ height: 120, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics?.leadsBySource} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                      {analytics?.leadsBySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [v, 'Leads']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-responsive">
        {/* Audit Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>Atividade Recente</h3>
            <a href="/auditoria" style={{ fontSize: 12, color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>Ver tudo →</a>
          </div>
          <AuditFeed logs={logs} />
        </div>

        {/* Top Pages */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 16 }}>Top Páginas (30d)</h3>
          {loading ? null : analytics?.topPages.map((p, i) => {
            const max = analytics.topPages[0].views;
            return (
              <div key={p.path} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>{p.path}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-900)' }}>{p.views.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 10,
                    width: `${(p.views / max) * 100}%`,
                    background: `hsl(${142 - i * 18}, 60%, ${40 + i * 5}%)`,
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
