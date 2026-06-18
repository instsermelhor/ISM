import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../services/api';
import type { AnalyticsSummary } from '../types';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Mail, MousePointerClick } from 'lucide-react';

const PIE_COLORS = ['#16a34a', '#3b82f6', '#f59e0b'];

const MetricCard = ({ label, value, delta, deltaType, Icon, color }: any) => (
  <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      <Icon size={24} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>{label}</p>
    </div>
    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: deltaType === 'up' ? '#16a34a' : '#ef4444' }}>
      {deltaType === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {delta}
    </span>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>
          {p.value?.toLocaleString('pt-BR')} {p.name}
        </p>
      ))}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    AnalyticsService.getSummary().then(setData).finally(() => setLoading(false));
  }, []);

  const slicedSeries = data?.series.slice(-(period)) || [];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Analytics</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>Métricas de tráfego e leads</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([7, 14, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid',
              background: period === p ? 'var(--gray-900)' : 'transparent',
              color: period === p ? 'white' : 'var(--gray-400)',
              borderColor: period === p ? 'var(--gray-900)' : 'var(--gray-200)',
              transition: 'all 0.15s', fontFamily: 'var(--font-sans)'
            }}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Pageviews (30d)" value={data?.pageviews30d.toLocaleString('pt-BR')} delta="+12.3%" deltaType="up" Icon={Eye} color="#3b82f6" />
        <MetricCard label="Visitantes Únicos" value={data?.uniqueVisitors30d.toLocaleString('pt-BR')} delta="+8.1%" deltaType="up" Icon={Users} color="#8b5cf6" />
        <MetricCard label="Taxa de Rejeição" value={`${data?.bounceRate}%`} delta="-3.2%" deltaType="up" Icon={MousePointerClick} color="#f59e0b" />
        <MetricCard label="Leads Gerados" value={data?.leadsGenerated30d} delta="+23%" deltaType="up" Icon={Mail} color="#16a34a" />
      </div>

      {/* Main Chart */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>Tráfego do Site</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Últimos {period} dias</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ c: '#4ade80', l: 'Pageviews' }, { c: '#60a5fa', l: 'Leads' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: x.c }} />
                <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={slicedSeries} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}
              tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              interval={Math.floor(period / 7)}
            />
            <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pageviews" stroke="#4ade80" strokeWidth={2.5} fill="url(#ag1)" dot={false} name="pageviews" />
            <Area type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2} fill="url(#ag2)" dot={false} name="leads" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-responsive">
        {/* Top Pages */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 20 }}>Top Páginas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.topPages} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="path" tick={{ fontSize: 11, fill: 'var(--gray-600)', fontWeight: 600 }} tickLine={false} axisLine={false} width={70} />
              <Tooltip formatter={(v: any) => [v ? Number(v).toLocaleString('pt-BR') : '0', 'Pageviews']} />
              <Bar dataKey="views" fill="#4ade80" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Source */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 20 }}>Leads por Fonte</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.leadsBySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={0}>
                {data?.leadsBySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [v, 'Leads']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .grid-responsive { }
        @media (max-width: 1024px) { .grid-responsive { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};
