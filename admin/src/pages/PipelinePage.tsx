import React, { useEffect, useState } from 'react';
import { PipelineService } from '../services/api';
import type { PipelineCard, PipelineStage } from '../types';
import { Plus, Flag, AlertTriangle, Minus, GripVertical } from 'lucide-react';

const STAGES: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id: 'IDEA', label: '💡 Ideia', color: '#6b7280', bg: '#f9fafb' },
  { id: 'WRITING', label: '✏️ Escrita', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'REVIEW', label: '🔍 Revisão', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'APPROVED', label: '✅ Aprovado', color: '#8b5cf6', bg: '#faf5ff' },
  { id: 'PUBLISHED', label: '🚀 Publicado', color: '#16a34a', bg: '#f0fdf4' },
];

const PRIORITY_CONFIG: Record<0 | 1 | 2, { icon: React.ElementType; color: string; label: string }> = {
  0: { icon: Minus, color: '#9ca3af', label: 'Baixa' },
  1: { icon: AlertTriangle, color: '#f59e0b', label: 'Média' },
  2: { icon: Flag, color: '#ef4444', label: 'Alta' },
};

export const PipelinePage: React.FC = () => {
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PipelineStage | null>(null);
  const [showAdd, setShowAdd] = useState<PipelineStage | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    PipelineService.getAll().then(setCards).finally(() => setLoading(false));
  }, []);

  const byStage = (stage: PipelineStage) => cards.filter(c => c.stage === stage);

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };
  const handleDrop = async (stage: PipelineStage) => {
    if (!dragging) return;
    await PipelineService.move(dragging, stage);
    setCards(cards.map(c => c.id === dragging ? { ...c, stage } : c));
    setDragging(null);
    setDragOver(null);
  };

  const handleAddCard = async (stage: PipelineStage) => {
    if (!newTitle.trim()) return;
    const c = await PipelineService.create({ title: newTitle.trim(), stage, priority: 0 });
    setCards([...cards, c]);
    setNewTitle('');
    setShowAdd(null);
  };

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Pipeline de Conteúdo</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>{cards.length} cards no total · Arraste para mover entre estágios</p>
      </div>

      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        {STAGES.map(stage => {
          const stageCards = byStage(stage.id);
          const isOver = dragOver === stage.id;

          return (
            <div
              key={stage.id}
              style={{ width: 260, flexShrink: 0 }}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.id); }}
              onDrop={() => handleDrop(stage.id)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', marginBottom: 10,
                background: isOver ? `${stage.color}15` : stage.bg,
                borderRadius: 12, border: `1px solid ${isOver ? stage.color + '40' : 'transparent'}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: stage.color }}>{stage.label}</span>
                  <span style={{
                    background: stage.color + '20', color: stage.color,
                    borderRadius: 20, padding: '0 7px', fontSize: 11, fontWeight: 800
                  }}>
                    {stageCards.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAdd(showAdd === stage.id ? null : stage.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: stage.color, padding: 2, borderRadius: 6 }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add card input */}
              {showAdd === stage.id && (
                <div className="card animate-scale-in" style={{ padding: 12, marginBottom: 10 }}>
                  <input
                    autoFocus
                    className="input"
                    placeholder="Título do card..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddCard(stage.id);
                      if (e.key === 'Escape') { setShowAdd(null); setNewTitle(''); }
                    }}
                    style={{ marginBottom: 8, fontSize: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAddCard(stage.id)}>Adicionar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(null); setNewTitle(''); }}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                {stageCards.map(card => {
                  const prio = PRIORITY_CONFIG[card.priority];
                  const PrioIcon = prio.icon;
                  const isDragging = dragging === card.id;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className="card"
                      style={{
                        padding: '14px', cursor: 'grab',
                        opacity: isDragging ? 0.4 : 1,
                        transform: isDragging ? 'rotate(2deg)' : 'none',
                        transition: 'opacity 0.15s, transform 0.15s',
                        borderLeft: `3px solid ${stage.color}50`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.4, flex: 1 }}>
                          {card.title}
                        </p>
                        <GripVertical size={14} style={{ color: 'var(--gray-300)', flexShrink: 0, marginTop: 1 }} />
                      </div>

                      {card.description && (
                        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, lineHeight: 1.5 }}>
                          {card.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <PrioIcon size={12} style={{ color: prio.color }} />
                          <span style={{ fontSize: 10, color: prio.color, fontWeight: 700 }}>{prio.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {card.assignee && (
                            <div style={{
                              width: 22, height: 22, borderRadius: 6,
                              background: 'var(--brand-100)', color: 'var(--brand-700)',
                              fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {card.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          {card.dueDate && (
                            <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600 }}>
                              {formatDate(card.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageCards.length === 0 && (
                  <div style={{
                    border: `2px dashed ${isOver ? stage.color + '60' : 'var(--gray-200)'}`,
                    borderRadius: 12, padding: '20px', textAlign: 'center',
                    color: isOver ? stage.color : 'var(--gray-300)',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
                  }}>
                    {isOver ? 'Soltar aqui' : 'Vazio'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
