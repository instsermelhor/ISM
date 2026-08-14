import React, { useEffect, useState, useMemo } from 'react';
import type { DetailedHealthCheck, SystemErrorItem } from '../types';
import { HealthServiceReal } from '../services/healthService';
import { 
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Server, 
  Layers, HardDrive, Globe, Loader2, Sparkles, Cpu, Search, Filter, 
  Download, Copy, Check, Eye, X, Activity, ShieldAlert, Clock, Bug
} from 'lucide-react';
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
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(0);

  // Filtros de Erros
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedError, setSelectedError] = useState<SystemErrorItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado do Firestore / integração com o site
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; collections: { name: string; label: string; count: number }[] } | null>(null);
  const [seedState, setSeedState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [seedResult, setSeedResult] = useState<{ seeded: string[]; skipped: string[] } | null>(null);

  const fetchAll = async () => {
    const [data, status, errors] = await Promise.all([
      HealthServiceReal.getRealtimeHealth(),
      FirestoreService.getDbStatus().catch(() => null),
      HealthServiceReal.getRecentErrors(50),
    ]);
    setHealth(data);
    setDbStatus(status);
    setSystemErrors(errors);
    setLastUpdated(new Date());
  };

  useEffect(() => { 
    fetchAll().finally(() => setLoading(false)); 
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshSecs <= 0) return;
    const interval = setInterval(() => {
      fetchAll();
    }, autoRefreshSecs * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSecs]);

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
      const status = await FirestoreService.getDbStatus().catch(() => null);
      if (status) setDbStatus(status);
    } catch (err) {
      console.error('[Seed] Erro:', err);
      setSeedState('error');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportErrorsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemErrors, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry-errors-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredErrors = useMemo(() => {
    return systemErrors.filter(err => {
      const q = searchQuery.toLowerCase();
      const matchesQuery = !q || 
        err.message.toLowerCase().includes(q) || 
        err.route.toLowerCase().includes(q) || 
        err.source.toLowerCase().includes(q) || 
        (err.correlationId && err.correlationId.toLowerCase().includes(q));

      const matchesSource = sourceFilter === 'ALL' || err.source === sourceFilter;
      
      let matchesStatus = true;
      if (statusFilter === '5XX') matchesStatus = err.statusCode >= 500;
      else if (statusFilter === '4XX') matchesStatus = err.statusCode >= 400 && err.statusCode < 500;

      return matchesQuery && matchesSource && matchesStatus;
    });
  }, [systemErrors, searchQuery, sourceFilter, statusFilter]);

  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    systemErrors.forEach(e => s.add(e.source));
    return Array.from(s);
  }, [systemErrors]);

  const errorStats = useMemo(() => {
    const total = systemErrors.length;
    const critical5xx = systemErrors.filter(e => e.statusCode >= 500).length;
    const warning4xx = systemErrors.filter(e => e.statusCode >= 400 && e.statusCode < 500).length;
    const frontendCount = systemErrors.filter(e => e.source.includes('Frontend') || e.source.includes('Promise')).length;
    return { total, critical5xx, warning4xx, frontendCount };
  }, [systemErrors]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header com Atualização e Auto-Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Health Check & Observabilidade</h1>
            <span style={{ 
              background: 'rgba(37,99,235,0.1)', 
              color: '#2563eb', 
              fontSize: 11, 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Activity size={12} />
              OBS-001 Enterprise
            </span>
          </div>
          <p style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 2 }}>
            Atualizado às: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Auto Refresh Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-500)' }}>
            <Clock size={14} />
            <span>Auto:</span>
            <select 
              value={autoRefreshSecs} 
              onChange={(e) => setAutoRefreshSecs(Number(e.target.value))}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--gray-200)',
                background: 'white',
                fontWeight: 600,
                color: autoRefreshSecs > 0 ? '#2563eb' : 'var(--gray-700)'
              }}
            >
              <option value={0}>Desativado</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </div>

          <button className="btn btn-ghost" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
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

          {/* Telemetria de Erros Recentes do Sistema com Tracing Distribuído */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bug size={18} style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)' }}>Telemetria de Erros & Tracing Distribuído (Ao Vivo)</h3>
                </div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                  Rastreamento distribuído com Correlation IDs e higienização automática de PII
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  className="btn btn-ghost" 
                  onClick={exportErrorsJSON} 
                  disabled={systemErrors.length === 0}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  <Download size={13} />
                  Exportar JSON
                </button>
              </div>
            </div>

            {/* Error Metrics Pills */}
            <div style={{ padding: '12px 20px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)' }}>
                <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{errorStats.total}</span> total
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626' }}>
                <span style={{ fontWeight: 800 }}>{errorStats.critical5xx}</span> críticas (5xx)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d97706' }}>
                <span style={{ fontWeight: 800 }}>{errorStats.warning4xx}</span> alertas (4xx)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2563eb' }}>
                <span style={{ fontWeight: 800 }}>{errorStats.frontendCount}</span> frontend runtime
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input 
                  type="text"
                  placeholder="Buscar por mensagem, rota ou Correlation ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 8,
                    border: '1px solid var(--gray-200)',
                    fontSize: 12,
                  }}
                />
              </div>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--gray-200)',
                  fontSize: 12,
                  background: 'white'
                }}
              >
                <option value="ALL">Todas as Origens</option>
                {uniqueSources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Status Code Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--gray-200)',
                  fontSize: 12,
                  background: 'white'
                }}
              >
                <option value="ALL">Todos os Códigos</option>
                <option value="5XX">Apenas 5xx (Crítico)</option>
                <option value="4XX">Apenas 4xx (Alerta)</option>
              </select>
            </div>

            {/* Table or Empty State */}
            {filteredErrors.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <CheckCircle size={32} style={{ color: '#16a34a', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>
                  {systemErrors.length === 0 ? 'Nenhum erro registrado' : 'Nenhum erro corresponde aos filtros aplicados'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                  {systemErrors.length === 0 ? 'O sistema está operando com 100% de estabilidade.' : 'Tente alterar os termos de busca ou limpar os filtros.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Quando</th>
                      <th style={{ width: 130 }}>Origem</th>
                      <th style={{ width: 140 }}>Correlation ID</th>
                      <th style={{ width: 120 }}>Rota</th>
                      <th style={{ width: 80 }}>Status</th>
                      <th>Mensagem Sanitizada</th>
                      <th style={{ width: 60, textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredErrors.map((e) => (
                      <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedError(e)}>
                        <td style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {e.timestamp}
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 700, 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            background: 'var(--gray-100)', 
                            color: 'var(--gray-700)' 
                          }}>
                            {e.source}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563eb' }}>
                          {e.correlationId ? (
                            <span 
                              title="Clique para copiar Correlation ID" 
                              onClick={(evt) => { 
                                evt.stopPropagation(); 
                                handleCopy(e.correlationId!, `corr-${e.id}`); 
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                            >
                              {e.correlationId.length > 18 ? `${e.correlationId.slice(0, 15)}...` : e.correlationId}
                              {copiedId === `corr-${e.id}` ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-300)' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-700)' }}>{e.route}</td>
                        <td>
                          <span style={{
                            background: e.statusCode >= 500 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: e.statusCode >= 500 ? '#dc2626' : '#d97706',
                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800
                          }}>
                            {e.statusCode}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--gray-800)', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.message}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: 4 }} 
                            onClick={(evt) => { evt.stopPropagation(); setSelectedError(e); }}
                            title="Ver detalhes e Stack Trace"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal de Detalhes do Erro com Stack Trace e Correlation ID */}
          {selectedError && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20
            }} onClick={() => setSelectedError(null)}>
              <div 
                className="card" 
                style={{ maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{
                      background: selectedError.statusCode >= 500 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: selectedError.statusCode >= 500 ? '#dc2626' : '#d97706',
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800
                    }}>
                      HTTP {selectedError.statusCode}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--gray-900)', marginTop: 8 }}>
                      {selectedError.source}
                    </h3>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setSelectedError(null)} style={{ padding: 6 }}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 10, background: 'var(--gray-50)', borderRadius: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Timestamp</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)', marginTop: 2 }}>{selectedError.timestamp}</p>
                  </div>
                  <div style={{ padding: 10, background: 'var(--gray-50)', borderRadius: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Rota</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)', marginTop: 2, fontFamily: 'monospace' }}>{selectedError.route}</p>
                  </div>
                </div>

                {/* Correlation ID Detail */}
                <div style={{ padding: 12, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Correlation ID (Tracing Distribuído)</p>
                      <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-800)', marginTop: 2 }}>
                        {selectedError.correlationId || 'Não propagado'}
                      </p>
                    </div>
                    {selectedError.correlationId && (
                      <button 
                        className="btn btn-ghost" 
                        style={{ fontSize: 11, padding: '4px 8px' }}
                        onClick={() => handleCopy(selectedError.correlationId!, 'modal-corr')}
                      >
                        {copiedId === 'modal-corr' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        Copiar ID
                      </button>
                    )}
                  </div>
                </div>

                {/* Mensagem Sanitizada */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Mensagem Sanitizada (LGPD Compliant)</p>
                  <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 12, color: 'var(--gray-800)', whiteSpace: 'pre-wrap' }}>
                    {selectedError.message}
                  </div>
                </div>

                {/* Stack Trace */}
                {selectedError.stack && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Stack Trace Sanitizado</p>
                      <button 
                        className="btn btn-ghost" 
                        style={{ fontSize: 11, padding: '2px 6px' }}
                        onClick={() => handleCopy(selectedError.stack!, 'modal-stack')}
                      >
                        {copiedId === 'modal-stack' ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                        Copiar Stack
                      </button>
                    </div>
                    <pre style={{ 
                      padding: 12, 
                      background: '#1e293b', 
                      color: '#f8fafc', 
                      borderRadius: 8, 
                      fontSize: 11, 
                      lineHeight: 1.5,
                      overflowX: 'auto',
                      maxHeight: 200
                    }}>
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
