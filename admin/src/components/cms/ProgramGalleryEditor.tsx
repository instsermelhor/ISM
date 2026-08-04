/**
 * ProgramGalleryEditor
 * ─────────────────────
 * Gerenciador de galeria de imagens para programas no Painel Administrativo.
 * Suporta: upload múltiplo, reordenação drag-and-drop, legenda, ALT, imagem principal.
 */
import React, { useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../services/upload';

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  order: number;
}

interface Props {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  folder?: string;
}

export const ProgramGalleryEditor: React.FC<Props> = ({
  images,
  onChange,
  folder = 'programs/gallery',
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleFiles = async (files: FileList) => {
    setUploadError(null);
    setUploading(true);
    try {
      const uploads = Array.from(files).slice(0, 10);
      const results = await Promise.all(
        uploads.map(async (file) => {
          if (!file.type.startsWith('image/')) throw new Error(`${file.name} não é uma imagem válida.`);
          if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} excede 10 MB.`);
          const url = await uploadImage(file, folder);
          return {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url,
            caption: '',
            alt: '',
            order: images.length + 1,
          } as GalleryImage;
        })
      );
      const updated = [...images, ...results].map((img, i) => ({ ...img, order: i + 1 }));
      onChange(updated);
    } catch (err: any) {
      setUploadError(err.message || 'Falha no upload.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrlAdd = () => {
    const url = prompt('Cole a URL da imagem (https://...)');
    if (!url || !url.startsWith('https://')) {
      alert('URL inválida. Deve começar com https://');
      return;
    }
    const img: GalleryImage = {
      id: `img-url-${Date.now()}`,
      url,
      caption: '',
      alt: '',
      order: images.length + 1,
    };
    onChange([...images, img]);
  };

  const handleRemove = (id: string) => {
    onChange(images.filter(i => i.id !== id).map((img, idx) => ({ ...img, order: idx + 1 })));
  };

  const handleUpdate = (id: string, patch: Partial<GalleryImage>) => {
    onChange(images.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleSetMain = (id: string) => {
    // Move a imagem para order=0.5 (será order 1 após reordenação)
    const reordered = [
      ...images.filter(i => i.id === id),
      ...images.filter(i => i.id !== id),
    ].map((img, idx) => ({ ...img, order: idx + 1 }));
    onChange(reordered);
  };

  // Drag handlers
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) { setDragOver(null); setDragIdx(null); return; }
    const copy = [...sorted];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    onChange(copy.map((img, i) => ({ ...img, order: i + 1 })));
    setDragIdx(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOver(null); };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Upload Area */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: uploading ? '#f3f4f6' : '#16a34a', color: uploading ? '#9ca3af' : 'white',
            border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700,
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', width: 14, height: 14, border: '2px solid #d1d5db', borderTopColor: '#6b7280', borderRadius: '50%' }} />
              Enviando...
            </span>
          ) : (
            <><Upload size={14} /> Upload de Imagens</>  
          )}
        </button>
        <button
          type="button"
          onClick={handleUrlAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', color: '#374151', border: '1px solid #e5e7eb',
            borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <ImageIcon size={14} /> Adicionar por URL
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          multiple
          style={{ display: 'none' }}
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626' }}>
          {uploadError}
        </div>
      )}

      {/* Image List */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13, border: '2px dashed #e5e7eb', borderRadius: 12 }}>
          Nenhuma imagem na galeria. Faça upload ou adicione por URL.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {sorted.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={e => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: dragOver === idx ? '#eff6ff' : '#f9fafb',
                border: `2px solid ${dragOver === idx ? '#2563eb' : '#e5e7eb'}`,
                borderRadius: 10, padding: 10, transition: 'all 0.15s',
              }}
            >
              {/* Drag handle */}
              <span style={{ cursor: 'grab', color: '#9ca3af', flexShrink: 0 }} title="Arraste para reordenar">
                <GripVertical size={14} />
              </span>

              {/* Preview */}
              <img
                src={img.url}
                alt={img.alt || `Imagem ${idx + 1}`}
                style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', flexShrink: 0 }}
              />

              {/* Fields */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <input
                  type="text"
                  value={img.alt || ''}
                  onChange={e => handleUpdate(img.id, { alt: e.target.value })}
                  placeholder="Texto alternativo (ALT) *"
                  style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid ${!img.alt ? '#fca5a5' : '#e5e7eb'}`, fontSize: 11, color: '#111827' }}
                />
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={e => handleUpdate(img.id, { caption: e.target.value })}
                  placeholder="Legenda (opcional)"
                  style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 11, color: '#111827' }}
                />
              </div>

              {/* Badge ordem */}
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, flexShrink: 0 }}>#{img.order}</span>

              {/* Ações */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleSetMain(img.id)}
                  title={idx === 0 ? 'Esta é a imagem principal' : 'Definir como imagem principal'}
                  style={{
                    padding: '4px 6px', borderRadius: 6, border: '1px solid',
                    borderColor: idx === 0 ? '#fbbf24' : '#e5e7eb',
                    background: idx === 0 ? '#fef3c7' : 'white', cursor: 'pointer',
                  }}
                >
                  <Star size={12} color={idx === 0 ? '#d97706' : '#9ca3af'} fill={idx === 0 ? '#d97706' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  title="Remover imagem"
                  style={{ padding: '4px 6px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer' }}
                >
                  <X size={12} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>
        Formatos: JPG, PNG, WEBP, SVG • Máx: 10 MB por imagem • Arraste para reordenar • ★ = imagem principal
      </p>
    </div>
  );
};
