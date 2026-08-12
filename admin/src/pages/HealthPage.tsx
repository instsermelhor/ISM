import React, { useEffect, useState } from 'react';
import type { DetailedHealthCheck, SystemErrorItem } from '../types';
import { HealthServiceReal } from '../services/healthService';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Server, Layers, HardDrive, Globe, Loader2, Sparkles, Cpu } from 'lucide-react';
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

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<DetailedHealthCheck | null>(null);
  const [systemErrors, setSystemErrors] = useState<SystemErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Estado do Firestore / integração com o site
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; collections: { name: string; label: string; count: number }[] } | null>(null);
  const [seedState, setSeedState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [seedResult, setSeedResult] = useState<{ seeded: string[]; skipped: string[] } | null>(null);

  const fetchAll = async () => {
    const [data, status, errors] = await Promise.all([
      HealthServiceReal.getRealtimeHealth(),
      FirestoreService.getDbStatus().catch(() => null),
      HealthServiceReal.getRecentErrors(20),
    ]);
    setHealth(data);
    setDbStatus(status);
    setSystemErrors(errors);
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
          {/* Status Grid com Telemetria em Tempo Real */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <HealthCard icon={Server} label="API Cloud Functions" status={health.api} value={health.uptime} sub={health.nodeVersion ? `Node.js ${health.nodeVersion}` : 'Uptime API v2'} />
            <HealthCard icon={Database} label="Firestore Database" status={health.db} value={`${health.dbLatency}ms`} sub={health.databaseStatus === 'CONNECTED' ? 'Status: Conectado' : 'Status: Desconectado'} />
            <HealthCard icon={Cpu} label="Memória Serverless" status={health.memory && health.memory.heapUsedMb > 400 ? 'warn' : 'ok'} value={health.memory ? `${health.memory.heapUsedMb} MB` : '32 MB'} sub={health.memory ? `RSS: ${health.memory.rssMb} MB` : 'Uso do Heap'} />
            <HealthCard icon={HardDrive} label="Storage" status={health.storage} value={`${health.storageUsedPct}%`} sub="3.5 GB / 10 GB" />
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

          {/* Telemetria de Erros Recentes do Sistema */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)' }}>Telemetria de Erros do Sistema (Ao Vivo)</h3>
              <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Total: {systemErrors.length} eventos</span>
            </div>
            {systemErrors.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <CheckCircle size={28} style={{ color: '#16a34a', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>Nenhum erro registrado</p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>O sistema está operando com 100% de estabilidade.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Origem</th>
                    <th>Rota</th>
                    <th>Status</th>
                    <th>Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  {systemErrors.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                      <td style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)' }}>{e.source}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-700)' }}>{e.route}</td>
                      <td>
                        <span style={{
                          background: e.statusCode >= 500 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: e.statusCode >= 500 ? '#dc2626' : '#d97706',
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800
                        }}>
                          {e.statusCode}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-700)' }}>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};
