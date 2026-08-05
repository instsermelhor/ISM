/**
 * GovernanceEditorPage — Editor Visual de Instâncias de Governança
 * ────────────────────────────────────────────────────────────────
 * Gerencia a coleção `governance_instances` no Firestore.
 * Suporta edição de keyAttributes (array de objetos) inline.
 *
 * B003 — Série B de Recuperação — Instituto Ser Melhor
 */
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Shield, GripVertical, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  InstitutionalFirestoreService,
  type GovernanceInstanceData,
} from '../services/institutional';

const SEED_GOVERNANCE: Omit<GovernanceInstanceData, 'id'>[] = [
  {
    title: 'Assembleia Geral de Associados', order: 1,
    summary: 'Órgão máximo de deliberação institucional, responsável pelas decisões estratégicas e pela eleição dos demais órgãos de governança.',
    keyAttributes: [
      { attributeText: 'Aprova as demonstrações financeiras anuais auditadas por auditoria independente.' },
      { attributeText: 'Elege e destitui membros dos Conselhos Deliberativo e Fiscal.' },
      { attributeText: 'Delibera alterações estatutárias por quórum qualificado (2/3 dos associados).' },
    ],
  },
  {
    title: 'Conselho Deliberativo', order: 2,
    summary: 'Órgão de supervisão e controle estratégico, responsável pela fiscalização da gestão executiva e pela aprovação de políticas institucionais.',
    keyAttributes: [
      { attributeText: 'Independência funcional: membros sem vínculos com a gestão executiva.' },
      { attributeText: 'Aprova políticas de gestão de riscos e compliance.' },
      { attributeText: 'Avalia anualmente o desempenho da Diretoria Executiva com base em indicadores de impacto.' },
    ],
  },
  {
    title: 'Conselho Fiscal', order: 3,
    summary: 'Órgão independente de fiscalização econômico-financeira, responsável pela emissão de pareceres sobre as demonstrações contábeis.',
    keyAttributes: [
      { attributeText: 'Emite parecer sobre as Demonstrações Financeiras auditadas.' },
      { attributeText: 'Reporta diretamente à Assembleia Geral, assegurando independência.' },
      { attributeText: 'Fiscaliza a aderência aos padrões contábeis e às normas legais aplicáveis.' },
    ],
  },
  {
    title: 'Diretoria Executiva', order: 4,
    summary: 'Responsável pela gestão estratégica e operacional, pela execução orçamentária e pela entrega dos resultados institucionais.',
    keyAttributes: [
      { attributeText: 'Executa o planejamento estratégico aprovado pelo Conselho Deliberativo.' },
      { attributeText: 'Administra o patrimônio institucional com responsabilidade e transparência.' },
      { attributeText: 'Presta contas periodicamente aos órgãos de governança e aos financiadores.' },
    ],
  },
  {
    title: 'Conselho Consultivo', order: 5,
    summary: 'Órgão de caráter consultivo formado por especialistas nacionais e internacionais que contribuem com orientação técnica e estratégica.',
    keyAttributes: [
      { attributeText: 'Fornece orientação técnica especializada em áreas estratégicas de atuação.' },
      { attributeText: 'Natureza estritamente consultiva, sem poder deliberativo.' },
      { attributeText: 'Contribui para o alinhamento da atuação do Instituto com padrões internacionais.' },
    ],
  },
];

export const GovernanceEditorPage: React.FC = () => {
  const [instances, setInstances] = useState<GovernanceInstanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await InstitutionalFirestoreService.getGovernanceInstances();
      setInstances(data);
      // Default: expand all
      const exp: Record<number, boolean> = {};
      data.forEach((_, i) => { exp[i] = true; });
      setExpanded(exp);
    } catch (e) {
      console.error('Erro ao carregar instâncias de governança:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        instances.map((inst, idx) =>
          InstitutionalFirestoreService.saveGovernanceInstance({ ...inst, order: idx + 1 })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load();
    } catch (e) {
      console.error('Erro ao salvar governança:', e);
      alert('Erro ao salvar instâncias de governança.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Isso irá popular as Instâncias de Governança com os dados oficiais do ISM. Continuar?')) return;
    setSeeding(true);
    try {
      await Promise.all(
        SEED_GOVERNANCE.map(g =>
          InstitutionalFirestoreService.saveGovernanceInstance(g as GovernanceInstanceData)
        )
      );
      await load();
    } catch (e) {
      console.error('Erro no seed:', e);
      alert('Erro ao aplicar seed de governança.');
    } finally {
      setSeeding(false);
    }
  };

  const update = (index: number, field: keyof GovernanceInstanceData, value: unknown) => {
    setInstances(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateAttribute = (instIdx: number, attrIdx: number, text: string) => {
    setInstances(prev => {
      const copy = [...prev];
      const attrs = [...(copy[instIdx].keyAttributes || [])];
      attrs[attrIdx] = { attributeText: text };
      copy[instIdx] = { ...copy[instIdx], keyAttributes: attrs };
      return copy;
    });
  };

  const addAttribute = (instIdx: number) => {
    setInstances(prev => {
      const copy = [...prev];
      const attrs = [...(copy[instIdx].keyAttributes || []), { attributeText: 'Novo atributo de governança.' }];
      copy[instIdx] = { ...copy[instIdx], keyAttributes: attrs };
      return copy;
    });
  };

  const removeAttribute = (instIdx: number, attrIdx: number) => {
    setInstances(prev => {
      const copy = [...prev];
      const attrs = copy[instIdx].keyAttributes.filter((_, i) => i !== attrIdx);
      copy[instIdx] = { ...copy[instIdx], keyAttributes: attrs };
      return copy;
    });
  };

  const addInstance = () => {
    setInstances(prev => [
      ...prev,
      {
        title: 'Nova Instância de Governança',
        order: prev.length + 1,
        summary: 'Descreva o papel e responsabilidades deste órgão.',
        keyAttributes: [{ attributeText: 'Atributo principal desta instância.' }],
      },
    ]);
    setExpanded(prev => ({ ...prev, [instances.length]: true }));
  };

  const removeInstance = async (index: number) => {
    const item = instances[index];
    if (item.id && confirm(`Remover "${item.title}"? Esta ação é irreversível.`)) {
      await InstitutionalFirestoreService.deleteGovernanceInstance(item.id);
    }
    setInstances(prev => prev.filter((_, i) => i !== index));
  };

  const toggleExpanded = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
        <Shield size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
        Carregando instâncias de governança...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <SaveBar isDirty={true} isSaving={saving} saved={saved} onSave={handleSave} />

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield color="#1e3a8a" size={26} /> Instâncias de Governança
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie os órgãos de governança exibidos na seção "Governança" do site · Coleção:{' '}
            <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>governance_instances</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {instances.length === 0 && (
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
              <RefreshCw size={14} />
              {seeding ? 'Aplicando...' : 'Seed Oficial ISM'}
            </button>
          )}
          <button
            onClick={addInstance}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#16a34a', color: 'white',
              fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            }}
          >
            <Plus size={15} /> Adicionar Instância
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

      {/* Empty state */}
      {instances.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid #3b82f6', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Shield size={20} color="#1d4ed8" />
          <div>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: 14 }}>Coleção vazia</div>
            <div style={{ color: '#2563eb', fontSize: 13 }}>
              Clique em "Seed Oficial ISM" para popular com os 5 órgãos de governança do Instituto, ou adicione manualmente.
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {instances.map((inst, idx) => (
          <div
            key={inst.id || idx}
            style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
              overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderLeft: '4px solid #1e3a8a',
            }}
          >
            {/* Collapsible header */}
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', cursor: 'pointer', background: expanded[idx] ? '#f8fafc' : 'white',
                borderBottom: expanded[idx] ? '1px solid #f3f4f6' : 'none',
              }}
              onClick={() => toggleExpanded(idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GripVertical size={15} color="#d1d5db" />
                <span style={{
                  background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: 11,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Órgão #{inst.order || idx + 1}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{inst.title}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  · {inst.keyAttributes?.length || 0} atributo{inst.keyAttributes?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={e => { e.stopPropagation(); removeInstance(idx); }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                  title="Remover instância"
                >
                  <Trash2 size={14} />
                </button>
                {expanded[idx] ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
              </div>
            </div>

            {/* Expandable body */}
            {expanded[idx] && (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>NOME DO ÓRGÃO</label>
                  <input
                    type="text"
                    value={inst.title}
                    onChange={e => update(idx, 'title', e.target.value)}
                    placeholder="Ex: Conselho Deliberativo"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>DESCRIÇÃO / SUMÁRIO</label>
                  <textarea
                    value={inst.summary}
                    onChange={e => update(idx, 'summary', e.target.value)}
                    rows={3}
                    placeholder="Descreva o papel e as responsabilidades deste órgão..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                {/* Key Attributes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={labelStyle}>ATRIBUTOS-CHAVE (keyAttributes)</label>
                    <button
                      onClick={() => addAttribute(idx)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '5px 12px', background: '#e0f2fe', color: '#0369a1',
                        fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      <Plus size={12} /> Adicionar Atributo
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(inst.keyAttributes || []).map((attr, attrIdx) => (
                      <div key={attrIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#1e3a8a', color: 'white', fontWeight: 800, fontSize: 11,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 8,
                        }}>
                          {attrIdx + 1}
                        </div>
                        <textarea
                          value={attr.attributeText}
                          onChange={e => updateAttribute(idx, attrIdx, e.target.value)}
                          rows={2}
                          placeholder="Descreva o atributo-chave desta instância..."
                          style={{ ...inputStyle, resize: 'vertical', flex: 1, lineHeight: 1.5 }}
                        />
                        <button
                          onClick={() => removeAttribute(idx, attrIdx)}
                          style={{
                            background: 'transparent', border: 'none', color: '#ef4444',
                            cursor: 'pointer', padding: 6, marginTop: 6, borderRadius: 6,
                          }}
                          title="Remover atributo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer save */}
      {instances.length > 0 && (
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
            <Save size={16} /> {saving ? 'Salvando...' : `Salvar ${instances.length} instância${instances.length !== 1 ? 's' : ''}`}
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
