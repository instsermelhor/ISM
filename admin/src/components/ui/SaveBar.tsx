import React from 'react';
import { Save, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';

export interface SaveBarProps {
  /** true quando há alterações não salvas */
  isDirty: boolean;
  /** 'idle' | 'saving' | 'saved' */
  saveStatus: 'idle' | 'saving' | 'saved';
  /** Chamado ao clicar em "Salvar" */
  onSave: () => void;
  /** Chamado ao clicar em "Descartar" */
  onDiscard?: () => void;
  /** Mensagem customizada — padrão: "Você tem alterações não salvas" */
  message?: string;
  /** Quantos campos foram alterados (opcional) */
  changedCount?: number;
}

/**
 * Barra flutuante de salvamento — aparece automaticamente quando isDirty = true.
 * Posicionada na parte inferior da tela, acima de qualquer outro conteúdo.
 */
export const SaveBar: React.FC<SaveBarProps> = ({
  isDirty,
  saveStatus,
  onSave,
  onDiscard,
  message = 'Você tem alterações não salvas',
  changedCount,
}) => {
  if (!isDirty && saveStatus === 'idle') return null;

  const isSaving = saveStatus === 'saving';
  const isSaved  = saveStatus === 'saved';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 8888,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
        background: isSaved ? '#f0fdf4' : '#111827',
        border: isSaved ? '1px solid #bbf7d0' : '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        animation: 'saveBarIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        minWidth: 340,
        maxWidth: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Icon / status */}
      {isSaved ? (
        <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
      )}

      {/* Message */}
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: isSaved ? '#166534' : '#f9fafb',
        flex: 1,
      }}>
        {isSaved
          ? '✓ Alterações salvas com sucesso!'
          : <>
              {message}
              {changedCount !== undefined && (
                <span style={{ marginLeft: 6, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                  {changedCount} campo{changedCount !== 1 ? 's' : ''}
                </span>
              )}
            </>
        }
      </span>

      {/* Actions */}
      {!isSaved && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {onDiscard && (
            <button
              onClick={onDiscard}
              disabled={isSaving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)', color: '#d1d5db',
                fontWeight: 600, fontSize: 12, cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.5 : 1, transition: 'all 0.15s',
              }}
            >
              <RotateCcw size={12} /> Descartar
            </button>
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: isSaving
                ? 'rgba(22,163,74,0.6)'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', fontWeight: 700, fontSize: 13,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 10px rgba(22,163,74,0.4)',
              transition: 'all 0.15s',
              minWidth: 130,
              justifyContent: 'center',
            }}
          >
            {isSaving ? (
              <>
                <span style={{
                  width: 13, height: 13,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Salvando…
              </>
            ) : (
              <><Save size={14} /> Salvar Alterações</>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes saveBarIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
