import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RotateCcw, TrendingUp, Hash, Layers } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { ImpactMetricsService, type ImpactMetricData } from '../services/impactMetricsService';

export const ImpactMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    ImpactMetricsService.getOrSeed().then(data => {
      setMetrics(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ImpactMetricsService.saveAll(metrics);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Erro ao salvar métricas:', e);
      alert('Erro ao salvar métricas de impacto.');
    } finally {
      setSaving(false);
    }
  };

  const updateMetric = (index: number, field: keyof ImpactMetricData, value: any) => {
    setMetrics(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addMetric = () => {
    setMetrics(prev => [
      ...prev,
      {
        order: prev.length + 1,
        value: '100',
        prefix: '',
        suffix: '+',
        label: 'Nova Métrica',
        sublabel: 'Descrição curta',
        iconKey: 'users',
        color: '#16a34a',
        decimals: 0,
      },
    ]);
  };

  const removeMetric = async (index: number) => {
    const item = metrics[index];
    if (item.id) {
      await ImpactMetricsService.delete(item.id);
    }
    setMetrics(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Carregando métricas...</div>;
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <SaveBar isDirty={true} isSaving={saving} saved={saved} onSave={handleSave} />

      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp color="#16a34a" size={28} /> Métricas de Impacto Social
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie os contadores animados de impacto que aparecem na seção principal do site público.
          </p>
        </div>
        <button
          onClick={addMetric}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', background: '#16a34a', color: 'white',
            fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Adicionar Métrica
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {metrics.map((m, idx) => (
          <div key={m.id || idx} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f3f4f6', pb: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#374151' }}>Métrica #{idx + 1}</span>
              <button
                onClick={() => removeMetric(idx)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>PREFIXO</label>
                <input
                  type="text"
                  value={m.prefix || ''}
                  onChange={e => updateMetric(idx, 'prefix', e.target.value)}
                  placeholder="ex: R$"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>VALOR NUMÉRICO</label>
                <input
                  type="text"
                  value={m.value || ''}
                  onChange={e => updateMetric(idx, 'value', e.target.value)}
                  placeholder="ex: 32000"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>SUFIXO</label>
                <input
                  type="text"
                  value={m.suffix || ''}
                  onChange={e => updateMetric(idx, 'suffix', e.target.value)}
                  placeholder="ex: + ou %"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>COR ACCENT</label>
                <input
                  type="color"
                  value={m.color || '#16a34a'}
                  onChange={e => updateMetric(idx, 'color', e.target.value)}
                  style={{ width: '100%', height: 38, padding: 2, borderRadius: 8, border: '1px solid #d1d5db', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>TÍTULO (LABEL)</label>
                <input
                  type="text"
                  value={m.label || ''}
                  onChange={e => updateMetric(idx, 'label', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', mb: 4 }}>SUBTÍTULO (DESCRIÇÃO)</label>
                <input
                  type="text"
                  value={m.sublabel || ''}
                  onChange={e => updateMetric(idx, 'sublabel', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
