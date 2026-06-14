import React, { useState, useEffect, useCallback } from 'react';
import type {
  FinancialSummary, Donation, Donor, BankConnection, BankTransaction, FinancialGoal,
  DonationStatus, DonationMethod, DonorTier
} from '../types';
import { FinancialService } from '../services/financial';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';


// ── UTILITIES ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
const fmtFull = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-BR');
const fmtDateTime = (s: string) => new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const STATUS_COLORS: Record<DonationStatus, string> = {
  CONFIRMED: '#16a34a', PENDING: '#f59e0b', FAILED: '#ef4444',
  REFUNDED: '#6b7280', CHARGEBACK: '#dc2626',
};
const STATUS_LABELS: Record<DonationStatus, string> = {
  CONFIRMED: 'Confirmado', PENDING: 'Pendente', FAILED: 'Falhou',
  REFUNDED: 'Reembolsado', CHARGEBACK: 'Chargeback',
};
const TIER_COLORS: Record<DonorTier, { bg: string; text: string; label: string }> = {
  SUPPORTER:   { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', label: 'Apoiador' },
  CONTRIBUTOR: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'Contribuidor' },
  CHAMPION:    { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', label: 'Campeão' },
  PATRON:      { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Patrono' },
  BENEFACTOR:  { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Benfeitor' },
};
const METHOD_ICONS: Record<string, string> = {
  PIX: '⚡', CREDIT_CARD: '💳', DEBIT_CARD: '🏧', BOLETO: '📄', BANK_TRANSFER: '🏦', CRYPTO: '🪙',
};
const PALETTE = ['#16a34a', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'white', borderRadius: 16, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.06)', ...style
  }}>
    {children}
  </div>
);

const Badge: React.FC<{ bg: string; text: string; label: string }> = ({ bg, text, label }) => (
  <span style={{ background: bg, color: text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
    {label}
  </span>
);

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
    <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const SectionTitle: React.FC<{ icon: string; title: string; subtitle?: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: '#6b7280' }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

// ── TAB NAVIGATION ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'donations' | 'donors' | 'banking' | 'goals';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Visão Geral', icon: '📊' },
  { id: 'donations', label: 'Doações', icon: '💰' },
  { id: 'donors', label: 'Doadores', icon: '👥' },
  { id: 'banking', label: 'APIs Bancárias', icon: '🏦' },
  { id: 'goals', label: 'Metas', icon: '🎯' },
];

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════════
const OverviewTab: React.FC<{ summary: FinancialSummary }> = ({ summary }) => {
  const kpis = [
    { label: 'Total Captado (12m)', value: fmt(summary.totalReceived12m), delta: '+18%', deltaUp: true, icon: '💰', color: '#16a34a' },
    { label: 'Últimos 30 dias', value: fmt(summary.totalReceived30d), delta: '+12%', deltaUp: true, icon: '📅', color: '#3b82f6' },
    { label: 'Recorrente Mensal', value: fmt(summary.recurrentMonthly), delta: '+5%', deltaUp: true, icon: '🔄', color: '#a855f7' },
    { label: 'Ticket Médio', value: fmt(summary.averageDonation), delta: '-2%', deltaUp: false, icon: '📈', color: '#f59e0b' },
    { label: 'Total de Doadores', value: summary.donorCount, delta: `+${summary.newDonors30d} este mês`, deltaUp: true, icon: '👥', color: '#06b6d4' },
    { label: 'Aguardando Confirmação', value: fmt(summary.pendingAmount), delta: 'Pendente', deltaUp: false, icon: '⏳', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {kpis.map(k => (
          <Card key={k.label}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>{k.value}</div>
                <div style={{ fontSize: 12, color: k.deltaUp ? '#16a34a' : '#ef4444', fontWeight: 600, marginTop: 4 }}>{k.delta}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{k.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Meta Anual */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>🎯 Meta Anual 2025</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Progresso de captação — {summary.goalProgress.toFixed(1)}% concluído</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>{fmt(summary.totalReceived)}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>de {fmt(summary.goalAmount)}</div>
          </div>
        </div>
        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg,#16a34a,#4ade80)',
            width: `${summary.goalProgress}%`,
            transition: 'width 1s ease',
            boxShadow: '0 0 12px rgba(22,163,74,0.4)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Projeção próximo mês: {fmt(summary.projectedNextMonth)}</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Faltam: {fmt(summary.goalAmount - summary.totalReceived)}</span>
        </div>
      </Card>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Monthly Chart */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 16, color: '#111827' }}>📅 Captação Mensal (6m)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={summary.monthlyBreakdown}>
              <defs>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRecurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => fmtFull(v)} />
              <Legend />
              <Area type="monotone" dataKey="received" name="Total" stroke="#16a34a" fill="url(#colorReceived)" strokeWidth={2} />
              <Area type="monotone" dataKey="recurrent" name="Recorrente" stroke="#3b82f6" fill="url(#colorRecurrent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Method Pie */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 16, color: '#111827' }}>⚡ Distribuição por Método</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={summary.byMethod} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method, percent }) => `${METHOD_ICONS[method] ?? ''} ${(percent * 100).toFixed(0)}%`}>
                {summary.byMethod.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => fmtFull(v)} />
              <Legend formatter={(v) => METHOD_ICONS[v] + ' ' + v} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Campaigns */}
      <Card>
        <div style={{ fontWeight: 800, marginBottom: 16, color: '#111827' }}>🚀 Top Campanhas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {summary.topCampaigns.map((c, i) => {
            const max = summary.topCampaigns[0].amount;
            return (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>#{i + 1} {c.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{fmt(c.amount)} <span style={{ fontWeight: 400, color: '#6b7280' }}>({c.donors} doadores)</span></span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: PALETTE[i], width: `${(c.amount / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DONATIONS TAB
// ══════════════════════════════════════════════════════════════════════════════
const DonationsTab: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await FinancialService.getDonations({ search, status, method, page });
    setDonations(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [search, status, method, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle icon="💰" title="Gestão de Doações" subtitle={`${total} doações encontradas`}
          action={
            <button
              onClick={() => FinancialService.exportReport('CSV')}
              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ⬇️ Exportar CSV
            </button>
          }
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Buscar por nome, e-mail ou ID..."
            style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}
          />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
            <option value="">Todos status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={method} onChange={e => { setMethod(e.target.value); setPage(1); }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
            <option value="">Todos métodos</option>
            {['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'BANK_TRANSFER'].map(m =>
              <option key={m} value={m}>{METHOD_ICONS[m]} {m.replace('_', ' ')}</option>
            )}
          </select>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Doador', 'Valor', 'Método', 'Recorrência', 'Campanha', 'Status', 'Data', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={d.donor.avatarUrl} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{d.donor.isAnonymous ? '🔒 Anônimo' : d.donor.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{d.donor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800, color: d.status === 'CONFIRMED' ? '#16a34a' : '#111827' }}>{fmtFull(d.amount)}</td>
                      <td style={{ padding: '12px' }}><span style={{ fontSize: 16 }}>{METHOD_ICONS[d.method]}</span> <span style={{ color: '#374151' }}>{d.method.replace('_', ' ')}</span></td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{d.recurrence}</td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: 12 }}>{d.campaignName ?? '—'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: STATUS_COLORS[d.status] + '20', color: STATUS_COLORS[d.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: 12 }}>{fmtDate(d.createdAt)}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => setSelectedDonation(d)}
                          style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Página {page} de {totalPages} • {total} registros</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: page > 1 ? 'pointer' : 'not-allowed', background: 'white', fontWeight: 600, fontSize: 13 }}>
                  ← Anterior
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: page < totalPages ? 'pointer' : 'not-allowed', background: 'white', fontWeight: 600, fontSize: 13 }}>
                  Próxima →
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setSelectedDonation(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>📋 Detalhes da Doação</div>
              <button onClick={() => setSelectedDonation(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['ID', selectedDonation.id],
                ['Doador', selectedDonation.donor.isAnonymous ? '🔒 Anônimo' : selectedDonation.donor.name],
                ['E-mail', selectedDonation.donor.email],
                ['Valor', fmtFull(selectedDonation.amount)],
                ['Status', STATUS_LABELS[selectedDonation.status]],
                ['Método', `${METHOD_ICONS[selectedDonation.method]} ${selectedDonation.method}`],
                ['Recorrência', selectedDonation.recurrence],
                ['Campanha', selectedDonation.campaignName ?? '—'],
                ['Gateway', selectedDonation.gatewayName ?? '—'],
                ['ID Gateway', selectedDonation.gatewayId ?? '—'],
                ['Pago em', selectedDonation.paidAt ? fmtDateTime(selectedDonation.paidAt) : '—'],
                ['Criado em', fmtDateTime(selectedDonation.createdAt)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DONORS TAB
// ══════════════════════════════════════════════════════════════════════════════
const DonorsTab: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donorDonations, setDonorDonations] = useState<Donation[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await FinancialService.getDonors({ search, tier, category, page });
    setDonors(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [search, tier, category, page]);

  useEffect(() => { load(); }, [load]);

  const openDonor = async (donor: Donor) => {
    setSelectedDonor(donor);
    const donations = await FinancialService.getDonorDonations(donor.id);
    setDonorDonations(donations);
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle icon="👥" title="Doadores Cadastrados" subtitle={`${total} doadores identificados`} />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Buscar por nome ou e-mail..."
            style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }} />
          <select value={tier} onChange={e => { setTier(e.target.value); setPage(1); }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
            <option value="">Todos os níveis</option>
            {Object.entries(TIER_COLORS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
            <option value="">Todas categorias</option>
            <option value="INDIVIDUAL">Pessoa Física</option>
            <option value="CORPORATE">Empresa</option>
            <option value="FOUNDATION">Fundação</option>
            <option value="GOVERNMENT">Governo</option>
          </select>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {donors.map(d => (
                <div key={d.id} onClick={() => openDonor(d)}
                  style={{
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(22,163,74,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <img src={d.avatarUrl} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.isAnonymous ? '🔒 Anônimo' : d.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</div>
                    </div>
                    <Badge {...TIER_COLORS[d.tier]} label={TIER_COLORS[d.tier].label} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>TOTAL DOADO</div>
                      <div style={{ fontWeight: 800, color: '#16a34a', fontSize: 14 }}>{fmt(d.totalDonated)}</div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Nº DOAÇÕES</div>
                      <div style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>{d.donationCount}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {d.isRecurrent && <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>🔄 Recorrente</span>}
                    {d.category !== 'INDIVIDUAL' && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{d.category}</span>}
                    <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 10 }}>{d.city}/{d.state}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Página {page} de {totalPages} • {total} doadores</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: page > 1 ? 'pointer' : 'not-allowed', background: 'white', fontWeight: 600, fontSize: 13 }}>
                  ← Anterior
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: page < totalPages ? 'pointer' : 'not-allowed', background: 'white', fontWeight: 600, fontSize: 13 }}>
                  Próxima →
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Donor Detail Modal */}
      {selectedDonor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => { setSelectedDonor(null); setDonorDonations([]); }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={selectedDonor.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>{selectedDonor.isAnonymous ? '🔒 Anônimo' : selectedDonor.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Badge {...TIER_COLORS[selectedDonor.tier]} label={TIER_COLORS[selectedDonor.tier].label} />
                    <Badge bg="rgba(107,114,128,0.1)" text="#374151" label={selectedDonor.category} />
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelectedDonor(null); setDonorDonations([]); }}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Doado', value: fmt(selectedDonor.totalDonated), color: '#16a34a' },
                { label: 'Nº Doações', value: String(selectedDonor.donationCount), color: '#3b82f6' },
                { label: 'Desde', value: fmtDate(selectedDonor.firstDonationAt), color: '#a855f7' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f9fafb', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                ['E-mail', selectedDonor.email],
                ['Telefone', selectedDonor.phone ?? '—'],
                ['Documento', selectedDonor.document ?? '—'],
                ['Localização', `${selectedDonor.city ?? '—'}/${selectedDonor.state ?? '—'}`],
                ['Recorrente', selectedDonor.isRecurrent ? '✅ Sim' : '❌ Não'],
                ['Última doação', fmtDate(selectedDonor.lastDonationAt)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#111827', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 12 }}>💰 Histórico de Doações ({donorDonations.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {donorDonations.slice(0, 8).map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{fmtFull(d.amount)} <span style={{ color: '#6b7280', fontWeight: 400 }}>• {METHOD_ICONS[d.method]} {d.method.replace('_', ' ')}</span></div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDate(d.createdAt)} • {d.campaignName}</div>
                  </div>
                  <span style={{ background: STATUS_COLORS[d.status] + '20', color: STATUS_COLORS[d.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {STATUS_LABELS[d.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BANKING TAB
// ══════════════════════════════════════════════════════════════════════════════
const BankingTab: React.FC = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [connectForm, setConnectForm] = useState({ bankCode: '001', provider: 'OPEN_BANKING', apiKey: '' });
  const [connecting, setConnecting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [conns, txs] = await Promise.all([FinancialService.getBankConnections(), FinancialService.getTransactions()]);
      setConnections(conns);
      setTransactions(txs);
      setLoading(false);
    })();
  }, []);

  const handleSync = async (bankId: string) => {
    setSyncing(bankId);
    await FinancialService.syncBank(bankId);
    setSyncing(null);
    setConnections(prev => prev.map(c => c.id === bankId ? { ...c, lastSyncAt: new Date().toISOString() } : c));
  };

  const handleConnect = async () => {
    if (!connectForm.apiKey) return alert('Informe a chave da API');
    setConnecting(true);
    const newBank = await FinancialService.connectBank(connectForm);
    setConnections(prev => [...prev, newBank]);
    setConnecting(false);
    setShowConnect(false);
    setConnectForm({ bankCode: '001', provider: 'OPEN_BANKING', apiKey: '' });
  };

  const STATUS_BANK_COLORS: Record<string, string> = { CONNECTED: '#16a34a', DISCONNECTED: '#6b7280', ERROR: '#ef4444', PENDING: '#f59e0b' };
  const STATUS_BANK_LABELS: Record<string, string> = { CONNECTED: '✅ Conectado', DISCONNECTED: '⚫ Desconectado', ERROR: '🔴 Erro', PENDING: '🟡 Aguardando' };
  const filteredTxs = selectedBank ? transactions.filter(t => t.bankConnectionId === selectedBank) : transactions;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loading ? <Spinner /> : (
        <>
          {/* Connections Grid */}
          <Card>
            <SectionTitle icon="🏦" title="Conexões Bancárias" subtitle="Open Banking / APIs de Pagamento"
              action={
                <button onClick={() => setShowConnect(true)}
                  style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Conectar Banco
                </button>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {connections.map(b => (
                <div key={b.id} style={{
                  border: `2px solid ${selectedBank === b.id ? '#16a34a' : '#e5e7eb'}`,
                  borderRadius: 14, padding: 20, cursor: 'pointer',
                  background: selectedBank === b.id ? '#f0fdf4' : 'white',
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedBank(selectedBank === b.id ? null : b.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#111827', fontSize: 15 }}>🏦 {b.bankName}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Ag: {b.agency} • Cc: {b.accountNumber}</div>
                    </div>
                    <span style={{ background: STATUS_BANK_COLORS[b.status] + '20', color: STATUS_BANK_COLORS[b.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {STATUS_BANK_LABELS[b.status]}
                    </span>
                  </div>
                  {b.balance !== undefined && (
                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>SALDO ATUAL</div>
                      <div style={{ fontWeight: 900, fontSize: 20, color: '#15803d' }}>{fmtFull(b.balance)}</div>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
                    Provedor: <strong>{b.provider}</strong> • Última sinc: {b.lastSyncAt ? fmtDateTime(b.lastSyncAt) : '—'}
                  </div>
                  <button
                    disabled={syncing === b.id || b.status === 'ERROR'}
                    onClick={e => { e.stopPropagation(); handleSync(b.id); }}
                    style={{
                      width: '100%', background: syncing === b.id ? '#d1fae5' : '#16a34a', color: 'white',
                      border: 'none', borderRadius: 10, padding: '8px', fontWeight: 700, fontSize: 13,
                      cursor: syncing === b.id || b.status === 'ERROR' ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {syncing === b.id ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Transactions */}
          <Card>
            <SectionTitle icon="📋" title="Extrato de Transações" subtitle={`${filteredTxs.length} transações ${selectedBank ? '(filtrado por banco)' : ''}`} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Reconciliado'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.slice(0, 20).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 12 }}>{fmtDate(t.date)}</td>
                      <td style={{ padding: '10px 12px', color: '#111827', fontWeight: 600 }}>{t.description}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{t.category}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t.type}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: t.amount >= 0 ? '#16a34a' : '#ef4444' }}>
                        {t.amount >= 0 ? '+' : ''}{fmtFull(t.amount)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {t.isReconciled
                          ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✅ Sim</span>
                          : <span style={{ color: '#9ca3af' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Connect Modal */}
      {showConnect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowConnect(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#111827', marginBottom: 6 }}>🏦 Conectar Banco</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Integração via Open Banking / API Bancária</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Banco</label>
                <select value={connectForm.bankCode} onChange={e => setConnectForm(f => ({ ...f, bankCode: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}>
                  <option value="001">🏦 Banco do Brasil (001)</option>
                  <option value="341">🏦 Itaú Unibanco (341)</option>
                  <option value="237">🏦 Bradesco (237)</option>
                  <option value="033">🏦 Santander (033)</option>
                  <option value="104">🏦 Caixa Econômica (104)</option>
                  <option value="260">💜 Nubank (260)</option>
                  <option value="290">🔵 PagBank (290)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Provedor de Integração</label>
                <select value={connectForm.provider} onChange={e => setConnectForm(f => ({ ...f, provider: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, background: 'white' }}>
                  <option value="OPEN_BANKING">Open Banking Brasil (oficial)</option>
                  <option value="PLUGGY">Pluggy.ai</option>
                  <option value="BELVO">Belvo</option>
                  <option value="MANUAL">Manual (Importar extrato)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>API Key / Client Secret</label>
                <input type="password" value={connectForm.apiKey} onChange={e => setConnectForm(f => ({ ...f, apiKey: e.target.value }))}
                  placeholder="sk_live_..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>🔒 Chave criptografada com AES-256 antes de armazenar</p>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>📋 Como funciona</div>
                <ul style={{ fontSize: 12, color: '#166534', paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                  <li>Autenticação OAuth2 / Certificado ICP-Brasil</li>
                  <li>Sincronização automática de transações (webhooks)</li>
                  <li>Reconciliação automática com doações confirmadas</li>
                  <li>Alertas para pagamentos não reconciliados</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button onClick={() => setShowConnect(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleConnect} disabled={connecting}
                  style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: connecting ? '#86efac' : '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: connecting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {connecting ? '🔄 Conectando...' : '🏦 Estabelecer Conexão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GOALS TAB
// ══════════════════════════════════════════════════════════════════════════════
const GoalsTab: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FinancialService.getGoals().then(data => { setGoals(data); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle icon="🎯" title="Metas de Captação" subtitle="Acompanhamento de objetivos financeiros" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {goals.map((g, i) => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const remaining = g.targetAmount - g.currentAmount;
            const colors = [['#16a34a', '#4ade80'], ['#3b82f6', '#93c5fd'], ['#a855f7', '#d8b4fe']];
            const [c1, c2] = colors[i % colors.length];
            return (
              <Card key={g.id} style={{ borderTop: `4px solid ${c1}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{g.description}</div>}
                  </div>
                  <span style={{ background: g.isActive ? '#f0fdf4' : '#f3f4f6', color: g.isActive ? '#16a34a' : '#9ca3af', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {g.isActive ? '✅ Ativa' : '⏸ Inativa'}
                  </span>
                </div>

                {/* Progress Ring */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke={c1} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                        strokeLinecap="round" transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: c1 }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>CAPTADO</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: c1 }}>{fmt(g.currentAmount)}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Meta: {fmt(g.targetAmount)}</div>
                  </div>
                </div>

                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${c1},${c2})`, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#6b7280' }}>Faltam: <strong style={{ color: '#111827' }}>{fmt(remaining)}</strong></span>
                  {g.deadline && <span style={{ color: '#6b7280' }}>Prazo: <strong style={{ color: '#111827' }}>{fmtDate(g.deadline)}</strong></span>}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Summary Chart */}
      <Card>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 20 }}>📊 Comparativo de Metas</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={goals.map(g => ({ name: g.title, Meta: g.targetAmount, Captado: g.currentAmount }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => fmtFull(v)} />
            <Legend />
            <Bar dataKey="Meta" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Captado" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN FINANCIAL PAGE
// ══════════════════════════════════════════════════════════════════════════════
export const FinancialPage: React.FC<{ initialTab?: Tab }> = ({ initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Sync tab when navigating via sidebar links
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  useEffect(() => {
    FinancialService.getSummary().then(data => { setSummary(data); setSummaryLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: 0 }}>💵 Módulo Financeiro</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Gestão completa de doações, doadores e integrações bancárias</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'white', padding: 6, borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', transition: 'all 0.2s',
              background: activeTab === tab.id ? '#16a34a' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(22,163,74,0.35)' : 'none',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (summaryLoading ? <Spinner /> : <OverviewTab summary={summary!} />)}
      {activeTab === 'donations' && <DonationsTab />}
      {activeTab === 'donors' && <DonorsTab />}
      {activeTab === 'banking' && <BankingTab />}
      {activeTab === 'goals' && <GoalsTab />}
    </div>
  );
};
