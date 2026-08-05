/**
 * ValuesEditorPage — Editor Visual de Valores Institucionais
 * ──────────────────────────────────────────────────────────
 * Gerencia a coleção `value_blocks` no Firestore.
 * Utiliza InstitutionalFirestoreService (já existente e testado).
 *
 * B003 — Série B de Recuperação — Instituto Ser Melhor
 */
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Star, GripVertical, RefreshCw } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  InstitutionalFirestoreService,
  type ValueBlockData,
} from '../services/institutional';

// Ícones disponíveis (espelha o site principal)
const ICON_OPTIONS = [
  'star', 'shield', 'zap', 'infinity', 'heart', 'globe', 'award',
  'book-open', 'users', 'target', 'compass', 'flag', 'lightbulb',
  'hand-heart', 'leaf', 'scale', 'handshake', 'eye',
];

const SEED_VALUES: Omit<ValueBlockData, 'id'>[] = [
  { name: 'Excelência com Integridade', iconIdentifier: 'star', description: 'Buscamos a melhoria contínua com rigor técnico, responsabilidade institucional e compromisso permanente com a qualidade de nossas ações e a dignidade das pessoas que atendemos.', order: 1 },
  { name: 'Transparência e Prestação de Contas', iconIdentifier: 'shield', description: 'Operamos com abertura e clareza em todos os processos, tornando públicas nossas decisões, contas e resultados de forma acessível, compreensível e auditável.', order: 2 },
  { name: 'Protagonismo Comunitário', iconIdentifier: 'zap', description: 'Reconhecemos as comunidades como protagonistas de seu próprio desenvolvimento, apoiando processos de fortalecimento de capacidades, autonomia e participação ativa.', order: 3 },
  { name: 'Compromisso de Longo Prazo', iconIdentifier: 'infinity', description: 'Nossa atuação é orientada para impactos duradouros e estruturais, construindo legados que fortalecem gerações presentes e futuras.', order: 4 },
];

export const ValuesEditorPage: React.FC = () => {
  const [values, setValues] = useState<ValueBlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await InstitutionalFirestoreService.getValueBlocks();
      setValues(data);
    } catch (e) {
      console.error('Erro ao carregar valores:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        values.map((v, idx) =>
          InstitutionalFirestoreService.saveValueBlock({ ...v, order: idx + 1 })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load();
    } catch (e) {
      console.error('Erro ao salvar valores:', e);
      alert('Erro ao salvar valores institucionais.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Isso irá popular os Valores com os dados oficiais do ISM. Continuar?')) return;
    setSeeding(true);
    try {
      await Promise.all(
        SEED_VALUES.map(v => InstitutionalFirestoreService.saveValueBlock(v as ValueBlockData))
      );
      await load();
    } catch (e) {
      console.error('Erro no seed:', e);
      alert('Erro ao aplicar seed de valores.');
    } finally {
      setSeeding(false);
    }
  };

  const update = (index: number, field: keyof ValueBlockData, value: unknown) => {
    setValues(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addValue = () => {
    setValues(prev => [
      ...prev,
      {
        name: 'Novo Valor',
        iconIdentifier: 'star',
        description: 'Descreva o valor institucional aqui.',
        order: prev.length + 1,
      },
    ]);
  };

  const removeValue = async (index: number) => {
    const item = values[index];
    if (item.id && confirm(`Remover "${item.name}"? Esta ação é irreversível.`)) {
      await InstitutionalFirestoreService.deleteValueBlock(item.id);
    }
    setValues(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
        <Star size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
        Carregando valores institucionais...
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
            <Star color="#f59e0b" size={26} fill="#f59e0b" /> Valores Institucionais
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie os valores exibidos na seção "Nossos Valores" do site · Coleção:{' '}
            <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>value_blocks</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {values.length === 0 && (
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
              {seeding ? 'Aplicando Seed...' : 'Seed Oficial ISM'}
            </button>
          )}
          <button
            onClick={addValue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#16a34a', color: 'white',
              fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            }}
          >
            <Plus size={15} /> Adicionar Valor
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

      {/* Info banner */}
      {values.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '1px solid #f59e0b', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Star size={20} color="#b45309" fill="#b45309" />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>Coleção vazia</div>
            <div style={{ color: '#b45309', fontSize: 13 }}>
              Clique em "Seed Oficial ISM" para popular com os 4 valores institucionais oficiais, ou adicione manualmente.
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {values.map((v, idx) => (
          <div
            key={v.id || idx}
            style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
              padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderLeft: '4px solid #f59e0b',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GripVertical size={16} color="#d1d5db" style={{ cursor: 'grab' }} />
                <span style={{
                  background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 11,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Valor #{idx + 1}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{v.name}</span>
              </div>
              <button
                onClick={() => removeValue(idx)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                title="Remover valor"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>NOME DO VALOR</label>
                <input
                  type="text"
                  value={v.name}
                  onChange={e => update(idx, 'name', e.target.value)}
                  placeholder="Ex: Excelência com Integridade"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>IDENTIFICADOR DO ÍCONE</label>
                <select
                  value={v.iconIdentifier}
                  onChange={e => update(idx, 'iconIdentifier', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>DESCRIÇÃO DO VALOR</label>
              <textarea
                value={v.description}
                onChange={e => update(idx, 'description', e.target.value)}
                rows={3}
                placeholder="Descreva em detalhes o que este valor significa para o Instituto..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                {v.description.length} caracteres
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer save */}
      {values.length > 0 && (
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
            <Save size={16} /> {saving ? 'Salvando...' : `Salvar ${values.length} valor${values.length !== 1 ? 'es' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Shared styles ──────────────────────────────────────────────────────────────

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
