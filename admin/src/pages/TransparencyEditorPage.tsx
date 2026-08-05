/**
 * TransparencyEditorPage — Editor Visual do Portal da Transparência
 * ─────────────────────────────────────────────────────────────────
 * Gerencia documentos de transparência, prestação de contas e metas de eficiência.
 * Atualiza sincronicamente em tempo real:
 *   - `services_page/main` (lido pelo Portal de Transparência do site principal)
 *   - `institutional_page/main` (backup institucional)
 *
 * B006 — Série B de Recuperação — Instituto Ser Melhor
 */
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Upload, RefreshCw, ExternalLink, ShieldCheck, Percent } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { InstitutionalFirestoreService, type TransparencyDoc } from '../services/institutional';
import { uploadImage } from '../services/upload';

const DOCUMENT_TYPES = ['Financeiro', 'Impacto', 'Legal', 'Código de Conduta', 'Outro'];

const SEED_DOCUMENTS: TransparencyDoc[] = [
  { id: 1, documentName: 'Demonstrações Financeiras 2024 (Auditado - Big 4)', documentType: 'Financeiro', documentFile: '#', publicationDate: '2024-03-30', fileSize: '4.2 MB' },
  { id: 2, documentName: 'Relatório Anual de Impacto e Atividades', documentType: 'Impacto', documentFile: '#', publicationDate: '2024-03-15', fileSize: '15.4 MB' },
  { id: 3, documentName: 'Código de Conduta Ética e Integridade', documentType: 'Código de Conduta', documentFile: '#', publicationDate: '2023-01-10', fileSize: '1.5 MB' },
];

const DEFAULT_INTRO = 'Garantimos acesso público e auditado às nossas demonstrações financeiras e relatórios de impacto. Operamos com padrões de transparência institucional compatíveis com as exigências legais e as melhores práticas internacionais de prestação de contas.';

export const TransparencyEditorPage: React.FC = () => {
  const [intro, setIntro] = useState(DEFAULT_INTRO);
  const [efficiencyPct, setEfficiencyPct] = useState(90);
  const [documents, setDocuments] = useState<TransparencyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const pageData = await InstitutionalFirestoreService.getPage();
      if (pageData) {
        if (pageData.transparencyIntro) setIntro(pageData.transparencyIntro);
        if (pageData.transparencyDocuments?.length) {
          setDocuments(pageData.transparencyDocuments);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar transparência:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salva em ambos os locais do Firestore para sincronia total com o site
      await Promise.all([
        InstitutionalFirestoreService.saveServicesPage({
          transparencyIntro: intro,
          transparencyDocuments: documents,
          efficiencyPct,
        }),
        InstitutionalFirestoreService.savePage({
          transparencyIntro: intro,
          transparencyDocuments: documents,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Erro ao salvar transparência:', e);
      alert('Erro ao salvar dados de transparência.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Isso irá popular o Portal da Transparência com os documentos oficiais do ISM. Continuar?')) return;
    setSeeding(true);
    try {
      setDocuments(SEED_DOCUMENTS);
      setIntro(DEFAULT_INTRO);
      setEfficiencyPct(90);
      await Promise.all([
        InstitutionalFirestoreService.saveServicesPage({
          transparencyIntro: DEFAULT_INTRO,
          transparencyDocuments: SEED_DOCUMENTS,
          efficiencyPct: 90,
        }),
        InstitutionalFirestoreService.savePage({
          transparencyIntro: DEFAULT_INTRO,
          transparencyDocuments: SEED_DOCUMENTS,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Erro no seed:', e);
      alert('Erro ao aplicar seed.');
    } finally {
      setSeeding(false);
    }
  };

  const updateDocField = (index: number, field: keyof TransparencyDoc, value: unknown) => {
    setDocuments(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIdx(index);
    try {
      const url = await uploadImage(file, 'documents');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      
      setDocuments(prev => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          documentFile: url,
          fileSize: formattedSize,
        };
        return copy;
      });
    } catch (e) {
      console.error('Erro no upload de documento:', e);
      alert('Erro ao enviar o arquivo.');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addDocument = () => {
    const today = new Date().toISOString().split('T')[0];
    setDocuments(prev => [
      ...prev,
      {
        id: Date.now(),
        documentName: 'Novo Documento Oficial',
        documentType: 'Financeiro',
        documentFile: '#',
        publicationDate: today,
        fileSize: '1.0 MB',
      },
    ]);
  };

  const removeDocument = (index: number) => {
    const item = documents[index];
    if (confirm(`Remover "${item.documentName}"?`)) {
      setDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
        <FileText size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
        Carregando portal da transparência...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
      <SaveBar isDirty={true} isSaving={saving} saved={saved} onSave={handleSave} />

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText color="#2563eb" size={26} /> Portal da Transparência & Prestação de Contas
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie relatórios auditados, demonstrações financeiras e diretrizes do site · Coleção:{' '}
            <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>services_page / institutional_page</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {documents.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', background: '#7c3aed', color: 'white',
                fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, opacity: seeding ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Aplicando...' : 'Seed Oficial ISM'}
            </button>
          )}
          <button
            onClick={addDocument}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#16a34a', color: 'white',
              fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            }}
          >
            <Plus size={15} /> Adicionar Documento
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#1e3a8a', color: 'white',
              fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} /> {saving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      </div>

      {/* General Settings Box */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
        padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#2563eb" /> Configurações da Seção de Transparência
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
          <div>
            <label style={labelStyle}>TEXTO INTRODUTÓRIO DA TRANSPARÊNCIA</label>
            <textarea
              value={intro}
              onChange={e => setIntro(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Descreva o compromisso institucional com transparência e prestação de contas..."
            />
          </div>
          <div>
            <label style={labelStyle}>EFICIÊNCIA OPERACIONAL (%)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min={0}
                max={100}
                value={efficiencyPct}
                onChange={e => setEfficiencyPct(parseInt(e.target.value) || 0)}
                style={{ ...inputStyle, paddingRight: 36, fontWeight: 900, fontSize: 18 }}
              />
              <Percent size={16} color="#6b7280" style={{ position: 'absolute', right: 12, top: 12 }} />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, lineHeight: 1.4 }}>
              % de recursos aplicados diretamente nos programas socioambientais.
            </p>
          </div>
        </div>
      </div>

      {/* Empty state banner */}
      {documents.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid #3b82f6', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <FileText size={20} color="#1d4ed8" />
          <div>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: 14 }}>Nenhum documento cadastrado</div>
            <div style={{ color: '#2563eb', fontSize: 13 }}>
              Clique em "Seed Oficial ISM" para carregar os relatórios auditados de exemplo, ou clique em "Adicionar Documento".
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {documents.map((docItem, idx) => (
          <div
            key={docItem.id || idx}
            style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
              padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderLeft: '4px solid #2563eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{
                background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: 11,
                padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Documento #{idx + 1}
              </span>
              <button
                onClick={() => removeDocument(idx)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                title="Remover documento"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>NOME DO DOCUMENTO / RELATÓRIO</label>
                <input
                  type="text"
                  value={docItem.documentName}
                  onChange={e => updateDocField(idx, 'documentName', e.target.value)}
                  placeholder="Ex: Demonstrações Financeiras 2024"
                  style={{ ...inputStyle, fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={labelStyle}>CATEGORIA / TIPO</label>
                <select
                  value={docItem.documentType}
                  onChange={e => updateDocField(idx, 'documentType', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>DATA DE PUBLICAÇÃO</label>
                <input
                  type="date"
                  value={docItem.publicationDate || ''}
                  onChange={e => updateDocField(idx, 'publicationDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 12, alignItems: 'center' }}>
              <div>
                <label style={labelStyle}>URL DO ARQUIVO (PDF / DRIVE / STORAGE)</label>
                <input
                  type="text"
                  value={docItem.documentFile}
                  onChange={e => updateDocField(idx, 'documentFile', e.target.value)}
                  placeholder="https://..."
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={labelStyle}>TAMANHO</label>
                <input
                  type="text"
                  value={docItem.fileSize || ''}
                  onChange={e => updateDocField(idx, 'fileSize', e.target.value)}
                  placeholder="Ex: 4.2 MB"
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </div>
              <div style={{ paddingTop: 20, display: 'flex', gap: 8 }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', background: '#f3f4f6', color: '#374151',
                  fontWeight: 700, borderRadius: 8, border: '1px solid #d1d5db',
                  cursor: uploadingIdx === idx ? 'wait' : 'pointer', fontSize: 13,
                }}>
                  <Upload size={14} />
                  {uploadingIdx === idx ? 'Enviando...' : 'Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xlsx"
                    onChange={e => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])}
                    style={{ display: 'none' }}
                    disabled={uploadingIdx === idx}
                  />
                </label>

                {docItem.documentFile && docItem.documentFile !== '#' && (
                  <a
                    href={docItem.documentFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb',
                      border: '1px solid #bfdbfe',
                    }}
                    title="Abrir arquivo em nova aba"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer save */}
      {documents.length > 0 && (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: 'white', fontWeight: 800, borderRadius: 12, border: 'none',
              cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} /> {saving ? 'Salvando...' : `Salvar ${documents.length} documento${documents.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
  letterSpacing: '0.06em', display: 'block', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 14, color: '#111827',
  background: '#fafafa', boxSizing: 'border-box',
  fontFamily: 'inherit', outline: 'none',
};
