import React, { useEffect, useState } from 'react';
import { LeadsService } from '../services/api';
import type { ContactLead, LeadStatus } from '../types';
import { Mail, Phone, MessageSquare, Archive, CheckCircle, Eye, Search } from 'lucide-react';

const STATUS_CONFIG: Record<LeadStatus, { label: string; badge: string; next?: LeadStatus }> = {
  NEW: { label: 'Novo', badge: 'badge badge-red', next: 'READ' },
  READ: { label: 'Lido', badge: 'badge badge-yellow', next: 'REPLIED' },
  REPLIED: { label: 'Respondido', badge: 'badge badge-green' },
  ARCHIVED: { label: 'Arquivado', badge: 'badge badge-gray' },
};

const SOURCE_MAP: Record<string, string> = {
  'contact-form': 'Formulário',
  'partner-form': 'Parceria',
  'donation': 'Doação',
};

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<ContactLead | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    LeadsService.getAll().then(setLeads).finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.subject || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await LeadsService.updateStatus(id, status);
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    await LeadsService.updateStatus(selected.id, selected.status, notes);
    setLeads(leads.map(l => l.id === selected.id ? { ...l, notes } : l));
    setSaving(false);
  };

  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 3600000) return `há ${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
    return `há ${Math.floor(diff / 86400000)}d`;
  };

  const newCount = leads.filter(l => l.status === 'NEW').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 20, height: 'calc(100vh - 100px)' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Leads & Contatos</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>
              {newCount > 0 && <><span style={{ color: '#ef4444', fontWeight: 700 }}>{newCount} novos</span> · </>}
              {leads.length} total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {(['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.15s',
              background: filterStatus === s ? 'var(--gray-900)' : 'transparent',
              color: filterStatus === s ? 'white' : 'var(--gray-500)',
              borderColor: filterStatus === s ? 'var(--gray-900)' : 'var(--gray-200)'
            }}>
              {s === 'ALL' ? `Todos (${leads.length})` : `${STATUS_CONFIG[s as LeadStatus].label} (${leads.filter(l => l.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="card" style={{ padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
          <input placeholder="Buscar por nome, e-mail ou assunto..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: 'var(--font-sans)', background: 'transparent' }}
          />
        </div>

        {/* Lead List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="animate-spin" style={{ width: 28, height: 28, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%', margin: '0 auto' }} /></div>
            : filtered.map(lead => (
              <div
                key={lead.id}
                onClick={() => { setSelected(lead); setNotes(lead.notes || ''); }}
                className="card"
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  border: selected?.id === lead.id ? '1px solid var(--brand-500)' : undefined,
                  boxShadow: selected?.id === lead.id ? '0 0 0 3px rgba(34,197,94,0.1)' : undefined,
                  transition: 'all 0.15s',
                  display: 'flex', gap: 12, alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: lead.status === 'NEW' ? '#fef2f2' : 'var(--gray-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: lead.status === 'NEW' ? '#ef4444' : 'var(--gray-500)', fontWeight: 800, fontSize: 14
                }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>{lead.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{lead.email}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={STATUS_CONFIG[lead.status].badge}>{STATUS_CONFIG[lead.status].label}</span>
                      <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{relTime(lead.createdAt)}</span>
                    </div>
                  </div>
                  {lead.subject && <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4, fontStyle: 'italic' }}>"{lead.subject}"</p>}
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span className="badge badge-blue" style={{ fontSize: 9 }}>{SOURCE_MAP[lead.source] || lead.source}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right panel: Detail */}
      <div style={{ width: 380, flexShrink: 0 }}>
        {selected ? (
          <div className="card animate-scale-in" style={{ padding: 24, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Contact Info */}
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-700)', fontWeight: 900, fontSize: 18, border: '1px solid var(--brand-100)' }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>{selected.name}</h3>
                  <span className={STATUS_CONFIG[selected.status].badge}>{STATUS_CONFIG[selected.status].label}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Mail size={13} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: 'var(--brand-600)', textDecoration: 'none' }}>{selected.email}</a>
                </div>
                {selected.phone && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Phone size={13} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{selected.phone}</span>
                  </div>
                )}
                {selected.subject && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <MessageSquare size={13} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--gray-700)', fontStyle: 'italic' }}>{selected.subject}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: 16, border: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 8 }}>Mensagem</p>
              <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.7 }}>{selected.message}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {STATUS_CONFIG[selected.status].next && (
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleStatusChange(selected.id, STATUS_CONFIG[selected.status].next!)}>
                  <CheckCircle size={14} />
                  Marcar como {STATUS_CONFIG[STATUS_CONFIG[selected.status].next!].label}
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(selected.id, 'ARCHIVED')}>
                <Archive size={14} /> Arquivar
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="input-label" style={{ marginBottom: 8 }}>Notas Internas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Adicione notas de acompanhamento..."
                rows={4}
                className="input"
                style={{ resize: 'vertical' }}
              />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={handleSaveNotes} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Notas'}
              </button>
            </div>

            <div style={{ fontSize: 10, color: 'var(--gray-300)', borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
              Recebido: {new Date(selected.createdAt).toLocaleString('pt-BR')} · Fonte: {SOURCE_MAP[selected.source] || selected.source}
            </div>
          </div>
        ) : (
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--gray-300)' }}>
            <Eye size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Selecione um lead</p>
            <p style={{ fontSize: 12, textAlign: 'center', maxWidth: 200 }}>Clique em um lead à esquerda para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};
