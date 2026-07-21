import React, { useState, useEffect, useCallback } from 'react';
import {
  Kanban, Plus, Flag, AlertTriangle, Minus, GripVertical,
  CheckCircle2, Clock, ShieldCheck, FileCheck2, Activity,
  Search, Filter, Layers, User, ArrowRight
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  BpmWorkflowEnterpriseService,
  type BpmTask,
  type TaskStage,
  type TaskPriority
} from '../services/bpmWorkflowEnterprise';
import { CMSVersionService } from '../services/cmsVersions';
import { useCMSAutosave } from '../hooks/useCMSAutosave';
import { CMSAutosaveBanner } from '../components/cms/CMSAutosaveBanner';
import { CMSVersionHistory } from '../components/cms/CMSVersionHistory';

type Tab = 'kanban' | 'bpmn' | 'aprovacoes' | 'analytics';

const STAGES: { id: TaskStage; label: string; color: string; bg: string }[] = [
  { id: 'IDEA', label: '💡 Demanda / Ideia', color: '#6b7280', bg: '#f9fafb' },
  { id: 'WRITING', label: '✏️ Mapeamento', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'REVIEW', label: '🔍 Revisão Compliance', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'APPROVED', label: '✅ Aprovado', color: '#8b5cf6', bg: '#faf5ff' },
  { id: 'PUBLISHED', label: '🚀 Concluído / Ativo', color: '#16a34a', bg: '#f0fdf4' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { icon: React.ElementType; color: string; label: string }> = {
  0: { icon: Minus, color: '#9ca3af', label: 'Baixa' },
  1: { icon: AlertTriangle, color: '#f59e0b', label: 'Média' },
  2: { icon: Flag, color: '#ef4444', label: 'Alta' },
};

export const PipelinePage: React.FC = () => {
  const [tasks, setTasks] = useState<BpmTask[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('kanban');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  // Autosave
  const autosave = useCMSAutosave('pipeline', tasks);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let list = await BpmWorkflowEnterpriseService.getTasks();
      if (!list.length) {
        await BpmWorkflowEnterpriseService.seedDefaults();
        list = await BpmWorkflowEnterpriseService.getTasks();
      }
      setTasks(list);
    } catch (e) {
      console.error('[PipelinePage] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const t of tasks) {
        await BpmWorkflowEnterpriseService.saveTask(t);
      }
      await CMSVersionService.saveDraft('pipeline', { tasks } as unknown as Record<string, unknown>, 'admin', 'Atualização Kanban BPM');
      autosave.clearSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[PipelinePage] Save error:', e);
      alert('Erro ao salvar tarefas do Kanban.');
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (stage: TaskStage) => {
    if (!dragging) return;
    await BpmWorkflowEnterpriseService.moveTaskStage(dragging, stage);
    setTasks(tasks.map(t => t.id === dragging ? { ...t, stage } : t));
    setDragging(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'kanban', label: 'Kanban Operacional Enterprise', icon: Kanban },
    { id: 'bpmn', label: 'Diagrama & Processos BPMN 2.0', icon: Layers },
    { id: 'aprovacoes', label: 'Central de Aprovações', icon: ShieldCheck },
    { id: 'analytics', label: 'Process Analytics & SLA', icon: Activity },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando motor de workflow BPM...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="BPM & Workflow Enterprise" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Kanban size={26} color="#8b5cf6" /> Gestão de Processos, BPMN & Workflow Enterprise
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Orquestração operacional, quadros Kanban com SLA, matriz de aprovação e governança de processos
          </p>
        </div>
      </div>

      {autosave.restoreAvailable && (
        <CMSAutosaveBanner
          savedAt={autosave.savedAt()}
          onRestore={() => { const d = autosave.restore(); if (d && (d as any).tasks) setTasks((d as any).tasks); }}
          onDiscard={autosave.clearSaved}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e5e7eb', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none',
              borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: activeTab === t.id ? '#8b5cf6' : 'transparent',
              color: activeTab === t.id ? 'white' : '#6b7280', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Kanban Operacional */}
      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))', gap: 14, overflowX: 'auto' }}>
          {STAGES.map(stage => {
            const stageTasks = tasks.filter(t => t.stage === stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
                style={{ background: stage.bg, border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, minHeight: 450 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: stage.color }}>{stage.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: 'white', padding: '2px 8px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    {stageTasks.length}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {stageTasks.map(t => {
                    const PIcon = PRIORITY_CONFIG[t.priority].icon;
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={() => setDragging(t.id || null)}
                        style={{
                          background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'grab'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>
                            {t.code || 'TASK'}
                          </span>
                          <PIcon size={14} color={PRIORITY_CONFIG[t.priority].color} title={`Prioridade: ${PRIORITY_CONFIG[t.priority].label}`} />
                        </div>

                        <strong style={{ fontSize: 13, color: '#111827', display: 'block', lineHeight: 1.4, marginBottom: 8 }}>{t.title}</strong>

                        {t.assignedTo && (
                          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={12} /> {t.assignedTo}
                          </div>
                        )}

                        {/* Checklist progress */}
                        {t.checklist && t.checklist.length > 0 && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>
                            Checklist: {t.checklist.filter(c => c.completed).length}/{t.checklist.length} concluído
                          </div>
                        )}

                        {/* SLA Indicator */}
                        {t.dueDate && (
                          <div style={{
                            fontSize: 10, fontWeight: 700,
                            color: t.slaStatus === 'EXPIRED' ? '#dc2626' : t.slaStatus === 'WARNING' ? '#d97706' : '#16a34a',
                            display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            <Clock size={11} /> SLA: {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {stageTasks.length === 0 && <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: 20 }}>Arraste uma tarefa para este estágio</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Central de Aprovações */}
      {activeTab === 'aprovacoes' && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <ShieldCheck size={22} color="#8b5cf6" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Central de Aprovações & Assinaturas Pendentes</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#6b7280' }}>Alçada de diretoria para tarefas de alto impacto financeiro ou contratual</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {tasks.filter(t => t.requiresApproval).map(t => (
              <div key={t.id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 14, color: '#111827' }}>{t.title}</strong>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Departamento: {t.department} | Solicitado por: {t.assignedTo}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Aprovar Assinatura
                  </button>
                  <button style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version History Sidebar/Footer */}
      <div style={{ marginTop: 32 }}>
        <CMSVersionHistory moduleId="pipeline" onRestore={() => loadData()} />
      </div>
    </div>
  );
};
