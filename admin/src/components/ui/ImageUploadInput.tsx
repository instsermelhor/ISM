/**
 * ImageUploadInput
 * ─────────────────
 * Campo reutilizável de imagem que permite:
 *   • Digitar/colar uma URL manualmente
 *   • Fazer upload de um arquivo local (via Firebase Storage ou Base64 fallback)
 *   • Arrastar e soltar (drag-and-drop) uma imagem diretamente na zona de upload
 *   • Visualizar o preview da imagem atual
 *   • Limpar a imagem com um clique
 */

import React, { useRef, useState, useCallback } from 'react';
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
  const [isDragOver, setIsDragOver] = useState(false);

  const iS: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1px solid #e5e7eb', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    flex: 1,
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem (JPG, PNG, WebP, SVG…)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máx: 10 MB');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch {
      setError('Falha no upload. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [folder, onChange]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
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

      {/* Tab — Upload com Drag-and-Drop */}
      {tab === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
            style={{
              width: '100%', padding: '20px 16px', borderRadius: 10,
              border: `2px dashed ${isDragOver ? '#16a34a' : uploading ? '#d1d5db' : '#d1d5db'}`,
              background: isDragOver ? '#f0fdf4' : uploading ? '#f9fafb' : 'white',
              cursor: uploading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 6,
              transition: 'all 0.15s',
              transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
              boxSizing: 'border-box',
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={22} color="#16a34a" style={{ animation: 'spin .7s linear infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Enviando…</span>
              </>
            ) : isDragOver ? (
              <>
                <Upload size={22} color="#16a34a" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Solte para fazer upload</span>
              </>
            ) : (
              <>
                <Upload size={20} color="#6b7280" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                  Arraste uma imagem aqui ou <span style={{ color: '#2563eb', textDecoration: 'underline' }}>clique para selecionar</span>
                </span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>JPG, PNG, WebP, SVG · Máx. 10 MB</span>
              </>
            )}
          </div>
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
          {/* Overlay com URL + botão remover */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {value.startsWith('data:') ? '📷 Imagem local (Base64)' : value}
            </span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              title="Remover imagem"
              style={{ background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0 }}
            >
              ✕ Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
