/**
 * BIAnalyticsDashboardPage.tsx — D003: Dashboard de BI & Analytics Preditivo de Captação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Dashboard executivo com charts recharts, KPIs, projeções preditivas e mapa de impacto por pilar.
 */

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2,
  Users, Target, Sparkles, Award, Leaf, BookOpen, Heart, Palette
} from 'lucide-react';
import { BIAnalyticsService, type BIAnalyticsSnapshot } from '../services/biAnalyticsService';

const fmtCurrency = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
    : `R$ ${v.toLocaleString('pt-BR')}`;

const PILLAR_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'Educação': BookOpen,
  'Social': Heart,
  'Meio Ambiente': Leaf,
  'Cultura': Palette,
};

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable'; change: number }> = ({ trend, change }) => {
  if (trend === 'up') return <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800 }}>▲ {Math.abs(change).toFixed(1)}%</span>;
  if (trend === 'down') return <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 800 }}>▼ {Math.abs(change).toFixed(1)}%</span>;
  return <span style={{ color: '#6b7280', fontSize: 12 }}>— estável</span>;
};

export const BIAnalyticsDashboardPage: React.FC = () => {
  const [snap, setSnap] = useState<BIAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'captacao' | 'retencao' | 'impacto' | 'campanhas'>('captacao');

  useEffect(() => {
    BIAnalyticsService.getSnapshot().then(s => { setSnap(s); setLoading(false); });
  }, []);

  if (loading || !snap) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
        <RefreshCw size={28} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        Compilando Inteligência de Captação...
      </div>
    );
  }

  const tabStyle = (t: string) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
    background: activeTab === t ? '#16a34a' : '#f3f4f6',
    color: activeTab === t ? 'white' : '#374151',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 28, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={26} color="#4ade80" /> Dashboard de BI & Analytics Preditivo
            </h1>
            <p style={{ fontSize: 12, color: '#86efac', margin: 0 }}>
              Projeções de captação, retenção de doadores e mapa de impacto por pilar — atualizado em {snap.generatedAt}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1 }}>SROI Projetado 2025</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#4ade80' }}>R$ {snap.projectedSROI.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {snap.kpis.map(k => (
          <div key={k.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', fontFamily: 'monospace', marginBottom: 6 }}>{k.value}</div>
            <TrendIcon trend={k.trend} change={k.change} />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{k.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['captacao', 'retencao', 'impacto', 'campanhas'] as const).map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {{ captacao: '📈 Captação & Previsão', retencao: '🔄 Retenção', impacto: '🌱 Impacto por Pilar', campanhas: '🎯 Campanhas' }[t]}
            </button>
          ))}
        </div>

        {/* ── TAB: Captação ── */}
        {activeTab === 'captacao' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
              Captação Mensal 2024 + Projeção T1/2025
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={snap.monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => v > 0 ? `R$ ${(v / 1000).toFixed(0)}k` : ''} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Captação Real" stroke="#16a34a" strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="predicted" name="Projeção Preditiva" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" fill="url(#predGrad)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Evolução de Doadores por Mês</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={snap.monthly.filter(m => m.donors > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newDonors" name="Novos Doadores" fill="#4ade80" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="recurringDonors" name="Doadores Recorrentes" fill="#16a34a" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TAB: Retenção ── */}
        {activeTab === 'retencao' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              Análise de Retenção de Doadores por Coorte
            </h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              Percentual de doadores que continuam ativos após 1, 3, 6 e 12 meses desde a primeira doação.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={snap.retention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
                <Line type="monotone" dataKey="month1" name="Mês 1" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="month3" name="Mês 3" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="month6" name="Mês 6" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="month12" name="Mês 12" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 24 }}>
              {[
                { label: 'Taxa Retenção 1M', val: '~100%', color: '#16a34a' },
                { label: 'Taxa Retenção 3M', val: '~77%', color: '#3b82f6' },
                { label: 'Taxa Retenção 6M', val: '~66%', color: '#f59e0b' },
                { label: 'Taxa Retenção 12M', val: '~53%', color: '#ef4444' },
              ].map(r => (
                <div key={r.label} style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 18px', borderLeft: `4px solid ${r.color}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{r.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: r.color, fontFamily: 'monospace' }}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Impacto por Pilar ── */}
        {activeTab === 'impacto' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
              Mapa de Impacto por Pilar de Atuação
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              {snap.pillars.map(p => {
                const Icon = PILLAR_ICONS[p.pillar] || Award;
                return (
                  <div key={p.pillar} style={{ background: 'white', border: `2px solid ${p.color}20`, borderRadius: 16, padding: 20, borderTop: `4px solid ${p.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Icon size={18} color={p.color} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{p.pillar}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: p.color, fontFamily: 'monospace' }}>R$ {p.sroi.toFixed(2).replace('.', ',')}x</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>SROI por R$ 1,00</div>
                    <div style={{ fontSize: 11, color: '#374151' }}>
                      <div>🏦 Investido: {fmtCurrency(p.invested)}</div>
                      <div>💚 Retorno: {fmtCurrency(p.returned)}</div>
                      <div>👥 Beneficiários: {p.beneficiaries.toLocaleString('pt-BR')}</div>
                      <div>📋 Projetos: {p.projects}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 12 }}>Distribuição de Recursos por Pilar</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={snap.pillars} dataKey="invested" nameKey="pillar" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {snap.pillars.map(p => <Cell key={p.pillar} fill={p.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 12 }}>Retorno Social por Pilar</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={snap.pillars} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" tickFormatter={v => fmtCurrency(v)} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="pillar" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                    <Bar dataKey="returned" name="Retorno Social" radius={[0, 6, 6, 0]}>
                      {snap.pillars.map(p => <Cell key={p.pillar} fill={p.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Campanhas ── */}
        {activeTab === 'campanhas' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              Top Campanhas de Captação em Andamento
            </h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              Desempenho de arrecadação vs. meta. Método preferencial: <strong>PIX CNPJ 09.040.440/0001-47</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {snap.topCampaigns.map(c => (
                <div key={c.name} style={{ background: '#f9fafb', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                      {c.pct}% atingido
                    </span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 99, height: 8, marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)', width: `${c.pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280' }}>
                    <span>Captado: <strong style={{ color: '#111827' }}>{fmtCurrency(c.raised)}</strong></span>
                    <span>Meta: <strong style={{ color: '#111827' }}>{fmtCurrency(c.goal)}</strong></span>
                    <span>👥 {c.donors.toLocaleString('pt-BR')} doadores</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 14 }}>Distribuição por Método de Pagamento</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {snap.donorMethodBreakdown.map(m => (
                  <div key={m.method} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', fontFamily: 'monospace' }}>{m.pct}%</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{m.method}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtCurrency(m.value)}</div>
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
