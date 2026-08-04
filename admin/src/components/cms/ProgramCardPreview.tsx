/**
 * ProgramCardPreview
 * ───────────────────
 * Preview miniaturizado do card de programa como ele aparecerá no site público.
 * Exibe estado compacto e expandido lado a lado.
 */
import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface PreviewData {
  title: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  iconEmoji?: string;
  isFeatured?: boolean;
  thematicArea?: string;
  category?: string;
  auraProjectUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface Props {
  data: PreviewData;
}

export const ProgramCardPreview: React.FC<Props> = ({ data: p }) => {
  const [expanded, setExpanded] = useState(false);
  const hasAura = Boolean(p.auraProjectUrl || p.ctaLabel?.toLowerCase().includes('aura'));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Eye size={14} color="#6b7280" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Pré-visualização do Card</span>
      </div>

      <div
        style={{
          maxWidth: 320, border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.07)', background: '#f8fafc', fontFamily: 'inherit',
        }}
      >
        {/* Imagem */}
        <div style={{ height: 140, background: p.imageUrl ? '#e5e7eb' : '#1e293b', position: 'relative', overflow: 'hidden' }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.imageAlt || p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
              {p.iconEmoji || '🎯'}
            </div>
          )}
          {p.isFeatured && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(37,99,235,0.85)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
              Destaque
            </div>
          )}
        </div>

        {/* Corpo */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(p.thematicArea || p.category) && (
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {p.thematicArea || p.category}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>{p.title || 'Título do Programa'}</div>

          {expanded && p.description && (
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{p.description}</div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                flex: 1, padding: '8px 0', background: '#1e293b', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              {expanded ? 'Mostrar Menos' : 'Saiba Mais'}
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            {hasAura && !expanded && (
              <button
                style={{
                  flex: 1, padding: '8px 0', background: '#2563eb', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Conhecer o AURA <ExternalLink size={9} />
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>* Preview aproximado — o card real usa animações e responsividade completas</p>
    </div>
  );
};
