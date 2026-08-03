import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, BookOpen, Layers } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { PillarsService, type PillarData } from '../services/pillarsService';

export const PillarsEditorPage: React.FC = () => {
  const [pillars, setPillars] = useState<PillarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    PillarsService.getOrSeed().then(data => {
      setPillars(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await PillarsService.saveAll(pillars);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Erro ao salvar pilares:', e);
      alert('Erro ao salvar pilares.');
    } finally {
      setSaving(false);
    }
  };

  const updatePillar = (index: number, field: keyof PillarData, value: any) => {
    setPillars(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addPillar = () => {
    setPillars(prev => [
      ...prev,
      {
        order: prev.length + 1,
        key: `pillar-${Date.now()}`,
        label: 'Novo Pilar',
        headline: 'Título chamativo do pilar',
        description: 'Descrição resumida',
        longDescription: 'Descrição detalhada do pilar',
        iconKey: 'book-open',
        color: '#1E3A8A',
        colorLight: '#dbeafe',
        kpis: [],
        programs: [],
        ctaHref: '#programs',
      },
    ]);
  };

  const removePillar = async (index: number) => {
    const item = pillars[index];
    if (item.id) {
      await PillarsService.delete(item.id);
    }
    setPillars(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Carregando pilares...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <SaveBar isDirty={true} isSaving={saving} saved={saved} onSave={handleSave} />

      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers color="#1E3A8A" size={28} /> Pilares Institucionais
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie os 4 pilares de atuação (Educação, Social, Meio Ambiente, Cultura) exibidos no site.
          </p>
        </div>
        <button
          onClick={addPillar}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', background: '#16a34a', color: 'white',
            fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Adicionar Pilar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {pillars.map((p, idx) => (
          <div key={p.id || idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f3f4f6', pb: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
                Pilar {idx + 1}: {p.label}
              </span>
              <button
                onClick={() => removePillar(idx)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>NOME DO PILAR</label>
                <input
                  type="text"
                  value={p.label || ''}
                  onChange={e => updatePillar(idx, 'label', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>HEADLINE / TÍTULO PRINCIPAL</label>
                <input
                  type="text"
                  value={p.headline || ''}
                  onChange={e => updatePillar(idx, 'headline', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>COR PRINCIPAL</label>
                <input
                  type="color"
                  value={p.color || '#1E3A8A'}
                  onChange={e => updatePillar(idx, 'color', e.target.value)}
                  style={{ width: '100%', height: 38, padding: 2, borderRadius: 8, border: '1px solid #d1d5db', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>RESUMO (SEÇÃO INICIAL)</label>
              <textarea
                value={p.description || ''}
                onChange={e => updatePillar(idx, 'description', e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>DESCRIÇÃO COMPLETA (ABA DETALHADA)</label>
              <textarea
                value={p.longDescription || ''}
                onChange={e => updatePillar(idx, 'longDescription', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
