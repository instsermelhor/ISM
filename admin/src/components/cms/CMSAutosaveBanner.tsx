/**
 * CMSAutosaveBanner — Banner de Autosave para Editores CMS
 * ──────────────────────────────────────────────────────────
 * Exibe notificação quando há um rascunho salvo localmente,
 * permitindo ao editor restaurar ou descartar.
 */

import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface Props {
  savedAt: string | null;
  onRestore: () => void;
  onDiscard: () => void;
}

export const CMSAutosaveBanner: React.FC<Props> = ({ savedAt, onRestore, onDiscard }) => {
  if (!savedAt) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={18} color="#d97706" />
        <div>
          <strong style={{ fontSize: 13, color: '#92400e' }}>Rascunho Automático Encontrado</strong>
          <div style={{ fontSize: 11, color: '#a16207' }}>
            Salvo em {savedAt} — Deseja restaurar as alterações não publicadas?
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onRestore}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#d97706', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <RotateCcw size={13} /> Restaurar Rascunho
        </button>
        <button
          onClick={onDiscard}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'white', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <X size={13} /> Descartar
        </button>
      </div>
    </div>
  );
};
