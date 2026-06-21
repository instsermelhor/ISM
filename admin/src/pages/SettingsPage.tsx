import React, { useEffect, useState, useCallback } from 'react';
import { SettingsService } from '../services/api';
import { FirestoreService, type DbStatus } from '../services/firestore';
import type { SiteSetting } from '../types';
import {
  Save, Globe, Search, Palette, Share2,
  Database, RefreshCw, CheckCircle2, XCircle,
  Wifi, WifiOff, Clock, Hash, AlertTriangle,
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';

type SettingsTab = 'general' | 'seo' | 'social' | 'design' | 'database';

const GROUP_CONFIG: Record<Exclude<SettingsTab, 'database'>, { label: string; Icon: React.ElementType; color: string }> = {
  general: { label: 'Configurações Gerais', Icon: Globe, color: '#3b82f6' },
  seo:     { label: 'SEO & Analytics', Icon: Search, color: '#8b5cf6' },
  social:  { label: 'Redes Sociais', Icon: Share2, color: '#f59e0b' },
  design:  { label: 'Design System', Icon: Palette, color: '#ec4899' },
};

// ── Database Panel ─────────────────────────────────────────────────────────

function formatTime(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function DatabasePanel() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await FirestoreService.getDbStatus();
      setStatus(s);
      setError(null);
    } catch (err) {
      setError('Não foi possível conectar ao Firestore. Verifique as credenciais no .env.local.');
      setStatus(prev => prev ? { ...prev, connected: false } : null);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    fetchStatus().finally(() => setLoading(false));
  }, [fetchStatus]);

  // Sincronização automática a cada 30s
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [autoSync, fetchStatus]);

  const handleSyncNow = async () => {
    setSyncing(true);
    await fetchStatus();
    setSyncing(false);
  };

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'ismbd-27e84';
  const maskedKey = import.meta.env.VITE_FIREBASE_API_KEY
    ? `${String(import.meta.env.VITE_FIREBASE_API_KEY).slice(0, 8)}••••••••`
    : '(não configurada)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Status Card ─────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderLeft: `4px solid ${status?.connected ? '#22c55e' : '#ef4444'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: status?.connected ? '#dcfce7' : '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <RefreshCw size={22} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
            ) : status?.connected ? (
              <Wifi size={22} style={{ color: '#16a34a' }} />
            ) : (
              <WifiOff size={22} style={{ color: '#dc2626' }} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>
                Firebase Firestore
              </span>
              {!loading && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 100,
                    background: status?.connected ? '#dcfce7' : '#fee2e2',
                    color: status?.connected ? '#15803d' : '#dc2626',
                  }}
                >
                  {status?.connected ? (
                    <><CheckCircle2 size={10} /> Online</>
                  ) : (
                    <><XCircle size={10} /> Offline</>
                  )}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              Projeto: <strong style={{ color: 'var(--gray-700)', fontFamily: 'monospace' }}>{projectId}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Auto-sync toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-500)' }}>
            <span>Auto-sync</span>
            <button
              onClick={() => setAutoSync(v => !v)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                background: autoSync ? '#22c55e' : 'var(--gray-200)',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: autoSync ? 20 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          {/* Sync now button */}
          <button
            className="btn"
            onClick={handleSyncNow}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '8px 16px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 8,
              background: 'white',
              cursor: syncing ? 'not-allowed' : 'pointer',
              color: 'var(--gray-700)',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      </div>

      {/* ── Erro ───────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            color: '#dc2626',
            fontSize: 13,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Erro de Conexão</strong>
            <p style={{ margin: '4px 0 0', opacity: 0.85 }}>{error}</p>
          </div>
        </div>
      )}

      {/* ── Collections Grid ─────────────────────────────────────── */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Coleções — Formulários Sincronizados
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {(status?.collections ?? [
            { name: 'partner_applications', label: 'Candidaturas de Parceria', count: 0, lastSync: null },
            { name: 'donations', label: 'Doações', count: 0, lastSync: null },
            { name: 'leads', label: 'Leads de Contato', count: 0, lastSync: null },
          ]).map(col => (
            <div
              key={col.name}
              className="card"
              style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--brand-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Hash size={14} style={{ color: 'var(--brand-600)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {col.name}
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.2 }}>
                    {col.label}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {loading ? (
                  <div style={{ width: 60, height: 28, borderRadius: 6, background: 'var(--gray-100)', animation: 'pulse 1.5s infinite' }} />
                ) : (
                  <>
                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-600)', lineHeight: 1 }}>
                      {col.count.toLocaleString('pt-BR')}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>registros</span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-400)' }}>
                <Clock size={10} />
                <span>Sync: {formatTime(col.lastSync)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Último sync global ────────────────────────────────────── */}
      {status?.lastSync && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-400)', justifyContent: 'flex-end' }}>
          <Clock size={12} />
          <span>Última sincronização: <strong style={{ color: 'var(--gray-600)' }}>{formatTime(status.lastSync)}</strong></span>
          {autoSync && <span style={{ color: '#22c55e', fontWeight: 600 }}>• Auto-sync ativo (30s)</span>}
        </div>
      )}

      {/* ── Credenciais (mascaradas) ──────────────────────────────── */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={14} />
          Configuração do Projeto Firebase
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Project ID', value: projectId },
            { label: 'API Key', value: maskedKey },
            { label: 'Coleções ativas', value: 'partner_applications, donations, leads' },
            { label: 'Sincronização', value: autoSync ? 'Automática (tempo real)' : 'Manual' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                gap: 12,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-100)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, minWidth: 140 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: 'var(--gray-700)', fontFamily: 'monospace', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 14, lineHeight: 1.5 }}>
          ⚙️ Credenciais gerenciadas via <code style={{ background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> — nunca expostas no código-fonte.
          Para alterar o projeto, edite <code style={{ background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 4 }}>VITE_FIREBASE_PROJECT_ID</code> no arquivo de ambiente.
        </p>
      </div>
    </div>
  );
}

// ── Settings Page Principal ────────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState<SettingsTab>('general');

  const isDirty = activeGroup !== 'database' && JSON.stringify(values) !== JSON.stringify(savedValues);
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

  // Tabs config (settings + database)
  const allTabs: { key: SettingsTab; label: string; Icon: React.ElementType; color: string }[] = [
    ...Object.entries(GROUP_CONFIG).map(([k, v]) => ({ key: k as SettingsTab, ...v })),
    { key: 'database', label: 'Banco de Dados', Icon: Database, color: '#10b981' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Configurações do Site</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>
            Gerencie o Design System, SEO e integração com banco de dados
          </p>
        </div>
        {activeGroup !== 'database' && (
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
        )}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div className="card" style={{ overflow: 'hidden', padding: 8 }}>
            {allTabs.map(({ key, label, Icon, color }) => {
              const isActive = activeGroup === key;
              const isDb = key === 'database';
              return (
                <button
                  key={key}
                  onClick={() => setActiveGroup(key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? `${color}12` : 'transparent',
                    color: isActive ? color : 'var(--gray-500)',
                    marginBottom: isDb ? 0 : 2,
                    marginTop: isDb ? 6 : 0,
                    borderTop: isDb ? '1px solid var(--gray-100)' : 'none',
                    paddingTop: isDb ? 14 : 10,
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                  }}
                >
                  <Icon size={16} />
                  {label.split(' ')[0]}{isDb ? ' de Dados' : ''}
                  {isDb && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 100,
                        background: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {activeGroup === 'database' ? (
            <DatabasePanel />
          ) : (
            <div className="card" style={{ padding: 28 }}>
              {(() => {
                const g = GROUP_CONFIG[activeGroup as Exclude<SettingsTab, 'database'>];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--gray-100)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.color }}>
                      <g.Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)' }}>{g.label}</h3>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{grouped.length} configurações</p>
                    </div>
                  </div>
                );
              })()}

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 60, background: 'var(--gray-100)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
                  ))}
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
          )}
        </div>
      </div>

      {/* Floating save bar — only for non-database tabs */}
      {activeGroup !== 'database' && (
        <SaveBar
          isDirty={isDirty}
          saveStatus={saveStatus}
          onSave={handleSave}
          onDiscard={handleDiscard}
          message="Configurações do site possuem alterações não salvas"
        />
      )}
    </div>
  );
};
