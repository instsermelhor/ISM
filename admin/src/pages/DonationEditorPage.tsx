import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, Save, RotateCcw, CheckCircle } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import { InstitutionalFirestoreService } from '../services/institutional';
import type { DonationSectionData } from '../services/institutional';

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: 24,
    marginBottom: 20,
    ...style
  }}>
    {children}
  </div>
);

const DEFAULT_DATA: DonationSectionData = {
  badge: 'Contribua com o Instituto',
  title: 'Como Apoiar Nossa Causa',
  subtitle: 'Sua contribuição impulsiona projetos socioambientais transformadores em todo o país.',
  pixKey: 'apoio@institutosermelhor.org.br',
  bankName: 'Cora Sociedade de Crédito',
  benefits: [
    'Acesso a relatórios de impacto semestrais',
    'Sua marca no mural de apoiadores do Instituto',
    'Dedução fiscal para pessoas jurídicas'
  ],
  videoUrl: ''
};

export const DonationEditorPage: React.FC = () => {
  const [data, setData] = useState<DonationSectionData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    InstitutionalFirestoreService.getDonationSection().then(res => {
      if (res) {
        setData(res);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof DonationSectionData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    handleChange('benefits', [...data.benefits, newBenefit.trim()]);
    setNewBenefit('');
  };

  const handleRemoveBenefit = (index: number) => {
    handleChange('benefits', data.benefits.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await InstitutionalFirestoreService.saveDonationSection(data);
      setIsDirty(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('idle');
      alert('Erro ao salvar no Firestore. Verifique sua conexão.');
    }
  };

  const handleReset = () => {
    if (!confirm('Deseja descartar as alterações não salvas?')) return;
    setLoading(true);
    InstitutionalFirestoreService.getDonationSection().then(res => {
      setData(res || DEFAULT_DATA);
      setIsDirty(false);
      setLoading(false);
    });
  };

  const iS: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const lblS: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#374151',
    display: 'block',
    marginBottom: 6
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={26} color="#dc2626" fill="#dc2626" /> Editor — Seção de Doação
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            Customize a chamada para ação de doação, chave Pix, dados bancários e vantagens dos doadores
            {isDirty && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>● Não salvo</span>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} disabled={!isDirty}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontWeight: 700, fontSize: 13, cursor: !isDirty ? 'not-allowed' : 'pointer', color: '#374151', opacity: !isDirty ? 0.5 : 1 }}>
            <RotateCcw size={14} /> Descartar
          </button>
          <button onClick={handleSave} disabled={!isDirty || saveStatus === 'saving'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 13, cursor: !isDirty ? 'not-allowed' : 'pointer', opacity: !isDirty ? 0.5 : 1, boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? <><CheckCircle size={14} /> Publicado!</> : <><Save size={14} /> Publicar</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
        {/* Left Column: Form */}
        <div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 18 }}>✍️ Textos e Informações de Doação</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lblS}>Badge (Etiqueta superior)</label>
                <input value={data.badge} onChange={e => handleChange('badge', e.target.value)} style={iS} placeholder="Ex: Contribua com o Instituto" />
              </div>
              <div>
                <label style={lblS}>Título Principal</label>
                <input value={data.title} onChange={e => handleChange('title', e.target.value)} style={{ ...iS, fontWeight: 700 }} placeholder="Ex: Como Apoiar Nossa Causa" />
              </div>
              <div>
                <label style={lblS}>Subtítulo / Descrição</label>
                <textarea value={data.subtitle} onChange={e => handleChange('subtitle', e.target.value)} style={{ ...iS, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }} placeholder="Digite um texto explicativo motivacional para a doação..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lblS}>Chave Pix</label>
                  <input value={data.pixKey} onChange={e => handleChange('pixKey', e.target.value)} style={iS} placeholder="Ex: pix@instituto.org" />
                </div>
                <div>
                  <label style={lblS}>Banco Vinculado</label>
                  <input value={data.bankName} onChange={e => handleChange('bankName', e.target.value)} style={iS} placeholder="Ex: Cora Bank" />
                </div>
              </div>
              <div>
                <label style={lblS}>Link do Vídeo de Fundo (Opcional)</label>
                <input value={data.videoUrl || ''} onChange={e => handleChange('videoUrl', e.target.value)} style={iS} placeholder="Ex: https://www.youtube.com/watch?v=..." />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Benefits Checklist */}
        <div>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 16 }}>🌟 Vantagens e Transparência (Checklist)</div>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>Liste os benefícios ou garantias de transparência que os doadores terão ao apoiar.</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddBenefit()} placeholder="Nova vantagem..." style={{ ...iS, flex: 1 }} />
              <button onClick={handleAddBenefit} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '0 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.benefits.map((b, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: '#374151', paddingRight: 8 }}>{b}</span>
                  <button onClick={() => handleRemoveBenefit(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {data.benefits.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>Nenhuma vantagem listada.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <SaveBar
        isDirty={isDirty}
        saveStatus={saveStatus === 'saved' ? 'saved' : saveStatus === 'saving' ? 'saving' : 'idle'}
        onSave={handleSave}
        onDiscard={handleReset}
        message="Seção de Doação possui alterações não salvas"
      />
    </div>
  );
};
