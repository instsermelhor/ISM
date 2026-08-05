/**
 * TimelineEditorPage — Editor Visual de Marcos Históricos
 * ────────────────────────────────────────────────────────
 * Gerencia a coleção `timeline_milestones` no Firestore.
 * Ordenação cronológica por ano (year field).
 *
 * B003 — Série B de Recuperação — Instituto Ser Melhor
 */
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock, RefreshCw, GripVertical } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  InstitutionalFirestoreService,
  type TimelineMilestoneData,
} from '../services/institutional';

const SEED_TIMELINE: Omit<TimelineMilestoneData, 'id'>[] = [
  { year: 2007, title: 'Fundação Conceitual', impactDescription: 'Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro.' },
  { year: 2012, title: 'A Associação a Serviço da Sociedade', impactDescription: 'A Associação amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade, promovendo a distribuição de cestas básicas, leite e oferecendo transporte comunitário.' },
  { year: 2015, title: 'Vila Margarida e a Educação', impactDescription: 'É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica por meio de projetos educacionais.' },
  { year: 2017, title: 'A Educação como Foco', impactDescription: 'Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural.' },
  { year: 2022, title: 'O Surgimento do Instituto Ser Melhor', impactDescription: 'A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano e à inovação social.' },
  { year: 2023, title: 'Consolidação dos Valores Institucionais', impactDescription: 'Os princípios, valores e diretrizes institucionais são revisados. O Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas, alinhando suas ações aos 17 ODS.' },
  { year: 2024, title: 'Reconhecimento Internacional', impactDescription: 'O Instituto recebe o Global Excellence Award (GEA). A Metodologia M-IS passa a ser reconhecida como referência internacional. Implementação da metodologia SROI com índice de 1:4,83.' },
  { year: 2025, title: 'Criação do Fundo Perpétuo', impactDescription: 'É criado o Fundo Perpétuo (F-P), assegurando a sustentabilidade financeira e 100% das doações destinadas aos programas finalísticos.' },
];

export const TimelineEditorPage: React.FC = () => {
  const [milestones, setMilestones] = useState<TimelineMilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await InstitutionalFirestoreService.getTimelineMilestones();
      setMilestones(data);
    } catch (e) {
      console.error('Erro ao carregar marcos históricos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        milestones.map(m => InstitutionalFirestoreService.saveTimelineMilestone(m))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load();
    } catch (e) {
      console.error('Erro ao salvar marcos:', e);
      alert('Erro ao salvar marcos históricos.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Isso irá popular a Linha do Tempo com os 8 marcos oficiais do ISM. Continuar?')) return;
    setSeeding(true);
    try {
      await Promise.all(
        SEED_TIMELINE.map(m =>
          InstitutionalFirestoreService.saveTimelineMilestone(m as TimelineMilestoneData)
        )
      );
      await load();
    } catch (e) {
      console.error('Erro no seed:', e);
      alert('Erro ao aplicar seed de linha do tempo.');
    } finally {
      setSeeding(false);
    }
  };

  const update = (index: number, field: keyof TimelineMilestoneData, value: unknown) => {
    setMilestones(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addMilestone = () => {
    const currentYear = new Date().getFullYear();
    setMilestones(prev => [
      ...prev,
      { year: currentYear, title: 'Novo Marco Histórico', impactDescription: 'Descreva o impacto e a relevância deste marco para a história do Instituto.' },
    ]);
  };

  const removeMilestone = async (index: number) => {
    const item = milestones[index];
    if (item.id && confirm(`Remover o marco de ${item.year}: "${item.title}"? Esta ação é irreversível.`)) {
      await InstitutionalFirestoreService.deleteTimelineMilestone(item.id);
    }
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  // Sort by year for display
  const sortedMilestones = [...milestones].sort((a, b) => a.year - b.year);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
        <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
        Carregando marcos históricos...
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
            <Clock color="#16a34a" size={26} /> Linha do Tempo — Marcos Históricos
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
            Gerencie os marcos exibidos na seção "Nossa História" do site · Coleção:{' '}
            <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>timeline_milestones</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {milestones.length === 0 && (
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
            onClick={addMilestone}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', background: '#16a34a', color: 'white',
              fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            }}
          >
            <Plus size={15} /> Adicionar Marco
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
      {milestones.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1px solid #16a34a', borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Clock size={20} color="#15803d" />
          <div>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Coleção vazia</div>
            <div style={{ color: '#16a34a', fontSize: 13 }}>
              Clique em "Seed Oficial ISM" para popular com os 8 marcos históricos oficiais do Instituto (2007–2025), ou adicione manualmente.
            </div>
          </div>
        </div>
      )}

      {/* Timeline visual */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        {sortedMilestones.length > 1 && (
          <div style={{
            position: 'absolute', left: 38, top: 0, bottom: 0,
            width: 2, background: 'linear-gradient(180deg, #16a34a, #3b82f6)',
            borderRadius: 2, opacity: 0.3,
          }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedMilestones.map((m, idx) => {
            // Find real index in unsorted array for updates
            const realIdx = milestones.indexOf(m);
            return (
              <div key={m.id || idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Year badge */}
                <div style={{
                  width: 76, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <div style={{
                    width: 76, height: 36, borderRadius: 20,
                    background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 15, color: 'white',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                    zIndex: 1,
                  }}>
                    {m.year}
                  </div>
                </div>

                {/* Card */}
                <div style={{
                  flex: 1, background: 'white', border: '1px solid #e5e7eb',
                  borderRadius: 14, padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  borderLeft: '3px solid #16a34a',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GripVertical size={14} color="#d1d5db" />
                      <span style={{
                        background: '#f0fdf4', color: '#15803d', fontWeight: 800, fontSize: 11,
                        padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        Marco #{idx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMilestone(realIdx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                      title="Remover marco"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>ANO</label>
                      <input
                        type="number"
                        min={1900}
                        max={2100}
                        value={m.year}
                        onChange={e => update(realIdx, 'year', parseInt(e.target.value) || m.year)}
                        style={{ ...inputStyle, fontWeight: 900, fontSize: 16, textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>TÍTULO DO MARCO</label>
                      <input
                        type="text"
                        value={m.title}
                        onChange={e => update(realIdx, 'title', e.target.value)}
                        placeholder="Ex: Fundação Conceitual"
                        style={{ ...inputStyle, fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>DESCRIÇÃO DO IMPACTO</label>
                    <textarea
                      value={m.impactDescription}
                      onChange={e => update(realIdx, 'impactDescription', e.target.value)}
                      rows={3}
                      placeholder="Descreva o impacto e a relevância histórica deste marco para o Instituto..."
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    />
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                      {m.impactDescription.length} caracteres
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer save */}
      {milestones.length > 0 && (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', background: 'linear-gradient(135deg, #15803d, #16a34a)',
              color: 'white', fontWeight: 800, borderRadius: 12, border: 'none',
              cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} /> {saving ? 'Salvando...' : `Salvar ${milestones.length} marco${milestones.length !== 1 ? 's' : ''}`}
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
