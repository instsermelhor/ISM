/**
 * ImageUploadInput
 * ─────────────────
 * Campo reutilizável de imagem que permite:
 *   • Digitar/colar uma URL manualmente
 *   • Fazer upload de um arquivo local (via Firebase Storage ou Base64 fallback)
 *   • Visualizar o preview da imagem atual
 *   • Limpar a imagem com um clique
 */

import React, { useRef, useState } from 'react';
import { Upload, Link2, X, Loader2, ImageOff } from 'lucide-react';
import { uploadImage } from '../../services/upload';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  folder?: string;
  previewHeight?: number;
  placeholder?: string;
}

export const ImageUploadInput: React.FC<Props> = ({
  value,
  onChange,
  label,
  hint,
  folder = 'images',
  previewHeight = 140,
  placeholder = 'https://...',
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'url' | 'upload'>('url');

  const iS: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1px solid #e5e7eb', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    flex: 1,
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione um arquivo de imagem (JPG, PNG, WebP, SVG…)'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo muito grande. Máx: 10 MB'); return; }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch {
      setError('Falha no upload. Tente novamente.');
    } finally {
      setUploading(false);
      // Limpa o input de arquivo para permitir re-seleção do mesmo arquivo
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
          {hint && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}
        </label>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 3 }}>
        <button type="button" onClick={() => setTab('url')}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            background: tab === 'url' ? 'white' : 'transparent', color: tab === 'url' ? '#111827' : '#6b7280',
            boxShadow: tab === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Link2 size={11} /> URL
        </button>
        <button type="button" onClick={() => setTab('upload')}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            background: tab === 'upload' ? 'white' : 'transparent', color: tab === 'upload' ? '#111827' : '#6b7280',
            boxShadow: tab === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Upload size={11} /> Upload
        </button>
      </div>

      {/* Tab — URL */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={value}
            onChange={e => { setError(null); onChange(e.target.value); }}
            style={iS}
            placeholder={placeholder}
          />
          {value && (
            <button type="button" onClick={() => onChange('')}
              style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #fecdd3', background: '#fff1f2', cursor: 'pointer', flexShrink: 0 }}>
              <X size={13} color="#ef4444" />
            </button>
          )}
        </div>
      )}

      {/* Tab — Upload */}
      {tab === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px dashed #d1d5db', background: uploading ? '#f9fafb' : 'white',
              cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 12, fontWeight: 700, color: '#374151', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.borderColor = '#16a34a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db'; }}
          >
            {uploading
              ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> Enviando…</>
              : <><Upload size={14} /> Selecionar arquivo (JPG, PNG, WebP…)</>}
          </button>
          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>Máx. 10 MB · Enviado para Firebase Storage</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div style={{ padding: '7px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', height: previewHeight, objectFit: 'cover', display: 'block' }}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
              const next = (e.target as HTMLImageElement).nextSibling as HTMLElement | null;
              if (next) next.style.display = 'flex';
            }}
          />
          {/* Fallback quando a imagem falha */}
          <div style={{ display: 'none', width: '100%', height: previewHeight, background: '#f3f4f6', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, color: '#9ca3af' }}>
            <ImageOff size={24} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Imagem não disponível</span>
          </div>
          {/* Badge URL curta */}
          <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 6, padding: '3px 8px' }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {value.startsWith('data:') ? '📷 Imagem local (Base64)' : value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
