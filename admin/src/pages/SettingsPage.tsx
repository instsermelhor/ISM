import React, { useEffect, useState } from 'react';
import { SettingsService } from '../services/api';
import type { SiteSetting } from '../types';
import { Save, Globe, Search, Palette, Share2 } from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';

const GROUP_CONFIG = {
  general: { label: 'Configurações Gerais', Icon: Globe, color: '#3b82f6' },
  seo:     { label: 'SEO & Analytics', Icon: Search, color: '#8b5cf6' },
  social:  { label: 'Redes Sociais', Icon: Share2, color: '#f59e0b' },
  design:  { label: 'Design System', Icon: Palette, color: '#ec4899' },
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState<keyof typeof GROUP_CONFIG>('general');

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const saveStatus: 'idle' | 'saving' | 'saved' = saving ? 'saving' : saved ? 'saved' : 'idle';

  useEffect(() => {
    SettingsService.getAll().then(s => {
      setSettings(s);
      const vals: Record<string, string> = {};
      s.forEach(setting => { vals[setting.key] = setting.value; });
      setValues(vals);
      setSavedValues(vals);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Salva TODAS as configurações, não apenas o grupo ativo
    await Promise.all(settings.map(s => SettingsService.update(s.key, values[s.key] || '')));
    setSavedValues({ ...values });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const handleDiscard = () => {
    if (!confirm('Descartar todas as alterações não salvas?')) return;
    setValues({ ...savedValues });
  };

  const grouped = settings.filter(s => s.group === activeGroup);

  const FieldInput = ({ setting }: { setting: SiteSetting }) => {
    const value = values[setting.key] || '';
    const onChange = (v: string) => setValues({ ...values, [setting.key]: v });

    if (setting.type === 'color') {
      return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: 48, height: 40, border: '1px solid var(--gray-200)', borderRadius: 8, padding: 4, cursor: 'pointer', background: 'white' }}
          />
          <input
            type="text"
            className="input"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: 120, fontFamily: 'monospace', fontSize: 13 }}
            placeholder="#000000"
          />
          <div style={{ width: 40, height: 40, borderRadius: 8, background: value, border: '1px solid var(--gray-200)', flexShrink: 0 }} />
        </div>
      );
    }

    if (setting.type === 'textarea') {
      return (
        <textarea
          className="input"
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ resize: 'vertical' }}
        />
      );
    }

    return (
      <input
        type={setting.type === 'url' ? 'url' : 'text'}
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={setting.type === 'url' ? 'https://' : ''}
      />
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Configurações do Site</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>Gerencie o Design System e SEO global</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: 130, justifyContent: 'center' }}
        >
          {saved ? (
            <><span>✓</span> Salvo!</>
          ) : (
            <><Save size={15} /> {saving ? 'Salvando...' : 'Salvar Alterações'}</>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar de grupos */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div className="card" style={{ overflow: 'hidden', padding: 8 }}>
            {(Object.keys(GROUP_CONFIG) as (keyof typeof GROUP_CONFIG)[]).map(g => {
              const { label, Icon, color } = GROUP_CONFIG[g];
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isActive ? `${color}12` : 'transparent',
                    color: isActive ? color : 'var(--gray-500)',
                    marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
                    fontFamily: 'var(--font-sans)', fontWeight: isActive ? 700 : 500, fontSize: 13
                  }}
                >
                  <Icon size={16} />
                  {label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 28 }}>
            {(() => { const g = GROUP_CONFIG[activeGroup]; return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.color }}>
                  <g.Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>{g.label}</h3>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{grouped.length} configurações</p>
                </div>
              </div>
            );})()}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 60, background: 'var(--gray-100)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {grouped.map(setting => (
                  <div key={setting.key}>
                    <label className="input-label">{setting.label}</label>
                    <FieldInput setting={setting} />
                    <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 5, fontFamily: 'monospace' }}>
                      key: {setting.key}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Barra flutuante de salvamento ── */}
      <SaveBar
        isDirty={isDirty}
        saveStatus={saveStatus}
        onSave={handleSave}
        onDiscard={handleDiscard}
        message="Configurações do site possuem alterações não salvas"
      />
    </div>
  );
};
