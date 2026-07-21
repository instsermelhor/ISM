/**
 * CMSVersionHistory — Componente de Histórico de Versões
 * ───────────────────────────────────────────────────────
 * Exibe o histórico de versões de um módulo CMS e permite rollback.
 * Integrado em todos os editores de módulo via sidebar.
 */

import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { CMSVersionService, type CMSModuleId, type CMSVersion } from '../../services/cmsVersions';

interface Props {
  moduleId: CMSModuleId;
  onRestore?: (content: Record<string, unknown>) => void;
}

export const CMSVersionHistory: React.FC<Props> = ({ moduleId, onRestore }) => {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<CMSVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    CMSVersionService.getHistory(moduleId, 10)
      .then(setVersions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, moduleId]);

  const handleRestore = (v: CMSVersion) => {
    if (!confirm(`Restaurar conteúdo da versão v${v.version}? As alterações não salvas serão perdidas.`)) return;
    onRestore?.(v.content);
  };

  const formatDate = (ts: unknown) => {
    if (!ts) return '—';
    const d = (ts as any).toDate ? (ts as any).toDate() : new Date(ts as string);
    return d.toLocaleString('pt-BR');
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toggle Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: '#f9fafb', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: '#374151',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={15} color="#6b7280" /> Histórico de Versões
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {/* History List */}
      {open && (
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Carregando histórico...
            </div>
          ) : versions.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Nenhuma versão salva ainda.
            </div>
          ) : (
            versions.map(v => (
              <div
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', borderTop: '1px solid #f3f4f6',
                  background: v.status === 'PUBLISHED' ? '#f0fdf4' : 'white',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                    v{v.version}
                    <span style={{
                      background: `${CMSVersionService.statusColor(v.status)}20`,
                      color: CMSVersionService.statusColor(v.status),
                      border: `1px solid ${CMSVersionService.statusColor(v.status)}40`,
                      borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                    }}>
                      {CMSVersionService.statusLabel(v.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    {formatDate(v.createdAt)} · {v.comment}
                  </div>
                </div>
                {onRestore && v.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => handleRestore(v)}
                    title="Restaurar esta versão"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, background: 'none',
                      border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px',
                      fontSize: 11, fontWeight: 700, color: '#6b7280', cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={12} /> Restaurar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
