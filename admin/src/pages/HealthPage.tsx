import React, { useEffect, useState } from 'react';
import { HealthService } from '../services/api';
import type { HealthCheck } from '../types';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Server, Layers, HardDrive, Globe, Loader2, Sparkles } from 'lucide-react';
import { InstitutionalFirestoreService } from '../services/institutional';
import { FirestoreService } from '../services/firestore';

const StatusIcon = ({ status }: { status: 'ok' | 'warn' | 'error' }) => {
  if (status === 'ok') return <CheckCircle size={20} style={{ color: '#16a34a' }} />;
  if (status === 'warn') return <AlertTriangle size={20} style={{ color: '#f59e0b' }} />;
  return <XCircle size={20} style={{ color: '#ef4444' }} />;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ok: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Operacional' },
  warn: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Atenção' },
  error: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Offline' },
};

const HealthCard = ({ icon: Icon, label, status, value, sub }: { icon: React.ElementType; label: string; status: 'ok' | 'warn' | 'error'; value: string; sub?: string }) => {
  const s = STATUS_STYLE[status];
  return (
    <div className="card animate-fade-in" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
          <Icon size={22} />
        </div>
        <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
          <StatusIcon status={status} />
          {s.label}
        </span>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
};

const StorageBar = ({ pct }: { pct: number }) => (
  <div style={{ marginTop: 8 }}>
    <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 10, transition: 'width 1s ease',
        width: `${pct}%`,
        background: pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#16a34a'
      }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>0 GB</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#16a34a' }}>{pct}%</span>
      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>10 GB</span>
    </div>
  </div>
);

const RECENT_ERRORS = [
  { time: '12 Jun 15:42', route: 'POST /api/uploads', code: 413, msg: 'Payload Too Large' },
  { time: '11 Jun 09:15', route: 'GET /api/analytics/sync', code: 504, msg: 'Timeout GA4' },
  { time: '10 Jun 21:30', route: 'POST /api/posts', code: 500, msg: 'Database Connection Reset' },
];

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Estado do Firestore / integração com o site
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; collections: { name: string; label: string; count: number }[] } | null>(null);
  const [seedState, setSeedState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [seedResult, setSeedResult] = useState<{ seeded: string[]; skipped: string[] } | null>(null);

  const fetchAll = async () => {
    const [data, status] = await Promise.all([
      HealthService.get(),
      FirestoreService.getDbStatus().catch(() => null),
    ]);
    setHealth(data);
    setDbStatus(status);
    setLastUpdated(new Date());
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleSeed = async (force = false) => {
    setSeedState('loading');
    setSeedResult(null);
    try {
      const result = await InstitutionalFirestoreService.seedInstitutionalData(force);
      setSeedResult(result);
      setSeedState('done');
      // Atualiza contagens
      const status = await FirestoreService.getDbStatus().catch(() => null);
      if (status) setDbStatus(status);
    } catch (err) {
      console.error('[Seed] Erro:', err);
      setSeedState('error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Health Check</h1>
          <p style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 2 }}>
            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {health && (
        <>
          {/* Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <HealthCard icon={Server} label="API Server" status={health.api} value={health.uptime} sub="Uptime (99 dias)" />
            <HealthCard icon={Database} label="PostgreSQL" status={health.db} value={`${health.dbLatency}ms`} sub="Latência média" />
            <HealthCard icon={Layers} label="Redis Cache" status={health.redis} value={`${health.redisLatency}ms`} sub="Latência média" />
            <HealthCard icon={HardDrive} label="Storage" status={health.storage} value={`${health.storageUsedPct}%`} sub="7.2 GB / 10 GB" />
          </div>

          {/* Storage Bar */}
          <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Uso de Armazenamento</h3>
            <StorageBar pct={health.storageUsedPct} />
            {health.storageUsedPct > 70 && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                <p style={{ fontSize: 12, color: '#92400e' }}>Storage acima de 70%. Considere remover arquivos não utilizados ou expandir o plano.</p>
              </div>
            )}
          </div>

          {/* Firestore Integration Panel */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 0, marginBottom: 16 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={18} style={{ color: 'var(--brand-600)' }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)' }}>Integração com Site Principal</h3>
                {dbStatus?.connected ? (
                  <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>CONECTADO</span>
                ) : (
                  <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>OFFLINE</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleSeed(false)}
                  disabled={seedState === 'loading'}
                  title="Inicializa apenas coleções vazias"
                >
                  {seedState === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Seed Inicial
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => { if (window.confirm('Isso vai sobrescrever todos os dados institucionais. Confirmar?')) handleSeed(true); }}
                  disabled={seedState === 'loading'}
                  style={{ color: 'var(--gray-400)' }}
                  title="Sobrescreve TODAS as coleções institucionais"
                >
                  Forçar Re-seed
                </button>
              </div>
            </div>

            {/* Coleções Firestore */}
            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Coleções Institucionais (editadas pelo admin, lidas pelo site)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {[
                  { name: 'institutional_page', label: 'Página Institucional' },
                  { name: 'value_blocks', label: 'Valores / Pilares' },
                  { name: 'governance_instances', label: 'Instâncias de Governança' },
                  { name: 'timeline_milestones', label: 'Marcos Históricos' },
                  { name: 'governance_members', label: 'Membros / Equipe' },
                ].map(col => {
                  const found = dbStatus?.collections.find(c => c.name === col.name);
                  return (
                    <div key={col.name} style={{
                      padding: '10px 14px', borderRadius: 10,
                      border: '1px solid var(--gray-200)', background: 'var(--gray-50)'
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-700)' }}>{col.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'monospace', marginTop: 2 }}>{col.name}</p>
                      {found !== undefined ? (
                        <span style={{
                          display: 'inline-block', marginTop: 6,
                          fontSize: 11, fontWeight: 800,
                          color: found.count > 0 ? '#16a34a' : '#f59e0b',
                          background: found.count > 0 ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)',
                          padding: '1px 7px', borderRadius: 20
                        }}>
                          {found.count} doc{found.count !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: 'var(--gray-300)' }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Seed result feedback */}
              {seedState === 'done' && seedResult && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>✅ Seed concluído</p>
                  {seedResult.seeded.length > 0 && <p style={{ fontSize: 11, color: '#16a34a' }}>Inicializadas: {seedResult.seeded.join(', ')}</p>}
                  {seedResult.skipped.length > 0 && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Ignoradas (já tinham dados): {seedResult.skipped.join(', ')}</p>}
                </div>
              )}
              {seedState === 'error' && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>❌ Erro ao executar seed. Verifique o console.</p>
                </div>
              )}

              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 14, lineHeight: 1.6 }}>
                <strong>"Seed Inicial"</strong> popula apenas coleções vazias.{' '}
                <strong>"Forçar Re-seed"</strong> sobrescreve tudo — use com cautela.
                O site principal lê automaticamente do Firestore quando conectado.
              </p>
            </div>
          </div>

          {/* Recent Errors */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)' }}>Erros Recentes do Sistema</h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Rota</th>
                  <th>Código</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ERRORS.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{e.time}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-700)' }}>{e.route}</td>
                    <td>
                      <span style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                        {e.code}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
