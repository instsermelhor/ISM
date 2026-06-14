import React, { useEffect, useState } from 'react';
import { AuditService } from '../services/api';
import type { AuditLog } from '../types';
import { Activity, Filter } from 'lucide-react';

const ACTION_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  CREATE:  { label: 'Criou', bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  UPDATE:  { label: 'Editou', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  DELETE:  { label: 'Removeu', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  PUBLISH: { label: 'Publicou', bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  ARCHIVE: { label: 'Arquivou', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  LOGIN:   { label: 'Login', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const LIMIT = 15;

  useEffect(() => {
    setLoading(true);
    AuditService.getLogs(page, LIMIT).then(({ data, total }) => {
      setLogs(data);
      setTotal(total);
    }).finally(() => setLoading(false));
  }, [page]);

  const filtered = filterAction === 'ALL' ? logs : logs.filter(l => l.action === filterAction);
  const totalPages = Math.ceil(total / LIMIT);

  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'agora mesmo';
    if (diff < 3600000) return `há ${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Log de Auditoria</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>Registro completo de todas as ações do sistema</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--gray-400)', background: 'var(--gray-50)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--gray-200)' }}>
          <Activity size={14} />
          <span>{total} entradas</span>
        </div>
      </div>

      {/* Action Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--gray-400)' }} />
        {(['ALL', ...Object.keys(ACTION_CONFIG)] as string[]).map(a => (
          <button key={a} onClick={() => setFilterAction(a)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            background: filterAction === a ? (a === 'ALL' ? 'var(--gray-900)' : ACTION_CONFIG[a]?.bg || 'var(--gray-100)') : 'transparent',
            color: filterAction === a ? (a === 'ALL' ? 'white' : ACTION_CONFIG[a]?.color || 'var(--gray-700)') : 'var(--gray-400)',
            borderColor: filterAction === a ? (a === 'ALL' ? 'var(--gray-900)' : ACTION_CONFIG[a]?.color + '40' || 'var(--gray-200)') : 'var(--gray-100)'
          }}>
            {a === 'ALL' ? 'Todos' : (ACTION_CONFIG[a]?.label || a)}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 28, height: 28, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%', margin: '0 auto' }} />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Descrição</th>
                <th>Entidade</th>
                <th>IP</th>
                <th>Quando</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const ac = ACTION_CONFIG[log.action] || { label: log.action, bg: '#f3f4f6', color: '#6b7280' };
                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={log.userAvatar} alt={log.userName} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>{log.userName.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: ac.bg, color: ac.color, padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {ac.label}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--gray-700)' }}>
                      {log.description}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--gray-500)', fontFamily: 'monospace', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 6 }}>
                        {log.entity}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{log.ipAddress || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{relTime(log.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--gray-100)' }}>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Página {page} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
