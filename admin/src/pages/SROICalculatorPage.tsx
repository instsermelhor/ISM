/**
 * SROICalculatorPage.tsx — C003: Calculadora SROI Automatizada (Admin)
 * ─────────────────────────────────────────────────────────────────────
 * Editor completo para configurar a razão SROI por pilar de atuação.
 * Sincroniza com Firestore: sroi_config/main
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Save, RefreshCw, BookOpen, Users, Leaf, Palette,
  BarChart2, Info, CheckCircle, AlertCircle, Download
} from 'lucide-react';
import { SaveBar } from '../components/ui/SaveBar';
import {
  SROIService, calcularSROI,
  type SROIConfig, type SROIPilar,
  SROI_SEED,
} from '../services/sroiService';

const PILAR_ICONS: Record<string, React.ElementType> = {
  educacao: BookOpen,
  social: Users,
  meio_ambiente: Leaf,
  cultura: Palette,
};

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const fmtRatio = (v: number) => v.toFixed(2).replace('.', ',');

export const SROICalculatorPage: React.FC = () => {
  const [config, setConfig] = useState<SROIConfig>(SROI_SEED);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SROIService.getOrSeed();
      setConfig(data);
    } catch (e) {
      console.error('[SROICalculatorPage] load error:', e);
      setConfig(SROI_SEED);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await SROIService.save(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('[SROICalculatorPage] save error:', e);
      setError('Erro ao salvar configuração SROI.');
    } finally {
      setSaving(false);
    }
  };

  const updatePilar = (idx: number, field: keyof SROIPilar, value: any) => {
    setConfig(prev => {
      const pilares = [...prev.pilares];
      pilares[idx] = { ...pilares[idx], [field]: field === 'investimento' || field === 'retornoSocial' ? Number(value) : value };
      return { ...prev, pilares };
    });
  };

  const { ratio, totalInvestimento, totalRetorno } = calcularSROI(config);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        Carregando configuração SROI...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} title="Calculadora SROI — Social Return on Investment" />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrendingUp size={26} color="#16a34a" />
          Calculadora SROI Automatizada
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Configure o retorno social por pilar. A razão SROI é calculada automaticamente e exibida no site e no Portal de Transparência.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: 13 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* SROI RATIO HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(74,222,128,0.07)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            ⚡ Razão SROI Calculada Automaticamente
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: '#4ade80', fontFamily: 'monospace' }}>
            R$ {fmtRatio(ratio)}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#bbf7d0', marginTop: 8 }}>
            de retorno social para cada R$ 1,00 investido
          </div>
          <div style={{ fontSize: 12, color: '#6ee7b7', marginTop: 4 }}>
            Metodologia SROI · {config.anoReferencia} · {config.periodoMeses} meses · {config.organizacaoAuditora}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Investido', value: fmt(totalInvestimento), color: '#86efac' },
            { label: 'Retorno Social', value: fmt(totalRetorno), color: '#4ade80' },
            { label: 'Pilares', value: `${config.pilares.length}`, color: '#a7f3d0' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 22px', minWidth: 140, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadados */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={15} color="#6b7280" /> Parâmetros da Metodologia
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Ano de Referência', field: 'anoReferencia', type: 'number', value: config.anoReferencia },
            { label: 'Período (meses)', field: 'periodoMeses', type: 'number', value: config.periodoMeses },
            { label: 'Data de Publicação', field: 'publicadoEm', type: 'date', value: config.publicadoEm || '' },
            { label: 'Organização Auditora', field: 'organizacaoAuditora', type: 'text', value: config.organizacaoAuditora },
          ].map(f => (
            <div key={f.field}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
              <input
                type={f.type}
                value={f.value as any}
                onChange={e => setConfig(prev => ({ ...prev, [f.field]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nota Metodológica (exibida no site)</label>
          <textarea
            value={config.notaMetodologica || ''}
            onChange={e => setConfig(prev => ({ ...prev, notaMetodologica: e.target.value }))}
            rows={3}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Pilares */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: '#111827', margin: 0 }}>Investimento por Pilar de Atuação</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 18, marginBottom: 32 }}>
        {config.pilares.map((pilar, idx) => {
          const Icon = PILAR_ICONS[pilar.id] || TrendingUp;
          const pilarRatio = pilar.investimento > 0 ? pilar.retornoSocial / pilar.investimento : 0;
          const totalInv = config.pilares.reduce((a, p) => a + p.investimento, 0);
          const pct = totalInv > 0 ? Math.round((pilar.investimento / totalInv) * 100) : 0;

          return (
            <div key={pilar.id} style={{
              background: 'white', border: `1px solid ${pilar.color}30`,
              borderRadius: 16, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              borderLeft: `4px solid ${pilar.color}`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${pilar.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} style={{ color: pilar.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>{pilar.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>SROI: R$ {fmtRatio(pilarRatio)} · {pct}% do investimento total</div>
                </div>
              </div>

              {/* Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Investimento (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={pilar.investimento}
                    onChange={e => updatePilar(idx, 'investimento', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{fmt(pilar.investimento)}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Retorno Social (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={pilar.retornoSocial}
                    onChange={e => updatePilar(idx, 'retornoSocial', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 700, boxSizing: 'border-box', color: '#15803d' }}
                  />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{fmt(pilar.retornoSocial)}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, pilarRatio * 20)}%`, height: '100%', background: pilar.color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  <span>0</span>
                  <span style={{ color: pilar.color, fontWeight: 700 }}>SROI {fmtRatio(pilarRatio)}x</span>
                </div>
              </div>

              {/* ODS tags */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>ODS Alinhados</label>
                <input
                  type="text"
                  value={(pilar.ods || []).join(', ')}
                  onChange={e => updatePilar(idx, 'ods', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="ex: ODS 4, ODS 8"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }}
                />
              </div>

              {/* Metodologia */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Descrição da Metodologia</label>
                <textarea
                  value={pilar.metodologia}
                  onChange={e => updatePilar(idx, 'metodologia', e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo / Tabela final */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart2 size={16} color="#6b7280" /> Resumo Consolidado SROI
          </h3>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Atualizado em tempo real</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Pilar', 'Investimento', 'Retorno Social', 'Razão SROI', 'ODS'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.pilares.map(p => {
              const Icon = PILAR_ICONS[p.id] || TrendingUp;
              const r = p.investimento > 0 ? p.retornoSocial / p.investimento : 0;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} style={{ color: p.color }} />
                      <span style={{ fontWeight: 700, color: '#111827' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151', fontFamily: 'monospace' }}>{fmt(p.investimento)}</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(p.retornoSocial)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: `${p.color}15`, color: p.color, padding: '3px 10px', borderRadius: 20, fontWeight: 800, fontSize: 12 }}>
                      R$ {fmtRatio(r)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 11 }}>{(p.ods || []).join(' · ')}</td>
                </tr>
              );
            })}
            {/* Total */}
            <tr style={{ background: '#f0fdf4' }}>
              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#15803d' }}>TOTAL</td>
              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#111827', fontFamily: 'monospace' }}>{fmt(totalInvestimento)}</td>
              <td style={{ padding: '12px 14px', fontWeight: 900, color: '#15803d', fontFamily: 'monospace' }}>{fmt(totalRetorno)}</td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{ background: '#16a34a', color: 'white', padding: '4px 14px', borderRadius: 20, fontWeight: 900, fontSize: 14 }}>
                  R$ {fmtRatio(ratio)}
                </span>
              </td>
              <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>Metodologia SROI</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: '#16a34a', color: 'white',
            fontWeight: 800, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Configuração SROI'}
        </button>
      </div>
    </div>
  );
};
