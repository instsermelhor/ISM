/**
 * AtuacaoMapSection.tsx — G001: Mapa Interativo de Atuação por Município e Pilar
 * ──────────────────────────────────────────────────────────────────────────────
 * Mapa SVG do Brasil com pins coloridos por pilar de impacto (Social, Ambiental,
 * Educação, Cultural). Filtros interativos, painel de detalhes e estatísticas.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Filter, X, ChevronRight, Users, Briefcase, TrendingUp, Calendar } from 'lucide-react';
import {
  AtuacaoMapService,
  PILLAR_CONFIG,
  MUNICIPALITIES,
  type Municipality,
  type ImpactPillar,
} from '../../services/atuacaoMapService';

// ── Outline SVG do Brasil (800×900 viewBox, projeção simplificada) ─────────────

const BRAZIL_OUTLINE = `
  M 80 58
  L 180 20 L 340 10 L 500 38 L 582 78 L 622 118 L 662 158
  L 702 218 L 732 278 L 762 320 L 788 388 L 800 450
  L 782 508 L 760 568 L 730 638 L 708 698 L 682 748
  L 652 788 L 612 828 L 562 862 L 502 886 L 450 896
  L 382 888 L 320 868 L 290 838 L 262 798 L 238 758
  L 212 718 L 192 678 L 170 628 L 142 578 L 112 518
  L 82 458 L 58 398 L 50 328 L 58 258 L 68 188
  L 76 118 Z
`.trim();

// ── Sub-componentes ───────────────────────────────────────────────────────────

type FilterPillar = ImpactPillar | 'ALL';

const FILTER_OPTIONS: { value: FilterPillar; label: string; color: string }[] = [
  { value: 'ALL',      label: 'Todos',     color: '#6b7280' },
  { value: 'SOCIAL',   label: 'Social',    color: PILLAR_CONFIG.SOCIAL.color },
  { value: 'AMBIENTAL',label: 'Ambiental', color: PILLAR_CONFIG.AMBIENTAL.color },
  { value: 'EDUCACAO', label: 'Educação',  color: PILLAR_CONFIG.EDUCACAO.color },
  { value: 'CULTURAL', label: 'Cultural',  color: PILLAR_CONFIG.CULTURAL.color },
];

// ── Componente Pin ────────────────────────────────────────────────────────────

interface PinProps {
  municipality: Municipality;
  isSelected: boolean;
  isFiltered: boolean;
  onClick: () => void;
}

const MapPin2: React.FC<PinProps> = ({ municipality, isSelected, isFiltered, onClick }) => {
  const cfg = PILLAR_CONFIG[municipality.primaryPillar];
  const opacity = isFiltered ? 1 : 0.2;

  return (
    <g
      transform={`translate(${municipality.svgX}, ${municipality.svgY})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`${municipality.name}, ${municipality.stateAbbr} — ${cfg.label}`}
    >
      {/* Pulso animado para o pin selecionado */}
      {isSelected && (
        <circle
          r={18}
          fill={cfg.color}
          opacity={0.25}
          style={{ animation: 'cwv-pulse 1.5s ease-in-out infinite' }}
        />
      )}
      {/* Círculo de fundo */}
      <circle
        r={isSelected ? 11 : 8}
        fill={cfg.color}
        opacity={opacity}
        stroke="white"
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ transition: 'all 0.2s' }}
      />
      {/* Ponto central */}
      <circle r={3} fill="white" opacity={opacity} />
    </g>
  );
};

// ── Painel de Detalhes ────────────────────────────────────────────────────────

interface DetailPanelProps {
  municipality: Municipality;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ municipality, onClose }) => {
  const cfg = PILLAR_CONFIG[municipality.primaryPillar];

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, width: 300,
      height: '100%', background: 'rgba(15,23,42,0.97)',
      backdropFilter: 'blur(16px)', borderLeft: `2px solid ${cfg.color}`,
      display: 'flex', flexDirection: 'column', zIndex: 10,
      animation: 'slideInRight 0.25s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: `linear-gradient(135deg, ${cfg.bgColor}, transparent)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: cfg.bgColor, border: `1px solid ${cfg.borderColor}`,
              borderRadius: 20, padding: '3px 10px', marginBottom: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
              <span style={{ color: cfg.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {cfg.label}
              </span>
            </div>
            <h3 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              {municipality.name}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '4px 0 0' }}>
              {municipality.state} · {municipality.region.replace('_', '-')}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: <Users size={14} />, label: 'Beneficiários', value: municipality.beneficiaries.toLocaleString('pt-BR') },
          { icon: <Briefcase size={14} />, label: 'Projetos', value: municipality.projects },
          { icon: <TrendingUp size={14} />, label: 'SROI', value: `${municipality.sroi}×` },
          { icon: <Calendar size={14} />, label: 'Desde', value: municipality.since },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 12,
            padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
              {item.icon}
              <span style={{ fontSize: 11 }}>{item.label}</span>
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pilares secundários */}
      {municipality.pillars.length > 1 && (
        <div style={{ padding: '0 20px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Pilares de Atuação
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {municipality.pillars.map((p) => {
              const c = PILLAR_CONFIG[p];
              return (
                <span key={p} style={{
                  background: c.bgColor, border: `1px solid ${c.borderColor}`,
                  color: c.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                }}>
                  {c.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Destaques */}
      <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Destaques
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {municipality.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ChevronRight size={14} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {h}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Componente Principal ──────────────────────────────────────────────────────

export const AtuacaoMapSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterPillar>('ALL');
  const [selected, setSelected] = useState<Municipality | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>(AtuacaoMapService.getAll());

  useEffect(() => {
    AtuacaoMapService.getAllAsync().then(setMunicipalities);
  }, []);

  const stats = useMemo(() => {
    const total = municipalities;
    return {
      totalMunicipalities: total.length,
      totalStates: new Set(total.map((m) => m.stateAbbr)).size,
      totalBeneficiaries: total.reduce((acc, m) => acc + m.beneficiaries, 0),
      totalProjects: total.reduce((acc, m) => acc + m.projects, 0),
      avgSROI: parseFloat(
        (total.reduce((acc, m) => acc + m.sroi, 0) / (total.length || 1)).toFixed(2)
      ),
      regions: [...new Set(total.map((m) => m.region))].length,
    };
  }, [municipalities]);

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return municipalities;
    return municipalities.filter((m) => m.pillars.includes(activeFilter));
  }, [municipalities, activeFilter]);

  const filteredIds = new Set(filtered.map((m) => m.id));

  const handlePinClick = (m: Municipality) => {
    setSelected((prev) => (prev?.id === m.id ? null : m));
  };


  return (
    <section
      id="mapa-atuacao"
      aria-labelledby="mapa-atuacao-title"
      style={{
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 60%, #0a0f1e 100%)',
        padding: '96px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoração de fundo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 24, padding: '6px 18px', marginBottom: 20,
          }}>
            <MapPin size={14} color="#22c55e" />
            <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Presença Nacional
            </span>
          </div>

          <h2 id="mapa-atuacao-title" style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
            color: 'white', margin: '0 0 16px',
            fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          }}>
            Onde atuamos no Brasil
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(15px, 2vw, 18px)',
            maxWidth: 580, margin: '0 auto',
            lineHeight: 1.7,
          }}>
            {stats.totalMunicipalities} municípios em {stats.totalStates} estados e {stats.regions} regiões.
            Clique em um pin para conhecer o trabalho local.
          </p>
        </div>

        {/* Estatísticas rápidas */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, marginBottom: 40, maxWidth: 800, margin: '0 auto 40px',
        }}>
          {[
            { label: 'Municípios', value: stats.totalMunicipalities, color: '#22c55e' },
            { label: 'Estados', value: stats.totalStates, color: '#3b82f6' },
            { label: 'Beneficiários', value: stats.totalBeneficiaries.toLocaleString('pt-BR'), color: '#f59e0b' },
            { label: 'Projetos Ativos', value: stats.totalProjects, color: '#a855f7' },
            { label: 'SROI Médio', value: `${stats.avgSROI}×`, color: '#ec4899' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '18px 20px', textAlign: 'center',
            }}>
              <div style={{ color: s.color, fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>
                {s.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filtros por pilar */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 40,
        }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setActiveFilter(opt.value);
                  setSelected(null);
                }}
                aria-pressed={isActive}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 20px', borderRadius: 24, cursor: 'pointer',
                  border: `1px solid ${isActive ? opt.color : 'rgba(255,255,255,0.12)'}`,
                  background: isActive ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                  color: isActive ? opt.color : 'rgba(255,255,255,0.6)',
                  fontWeight: 600, fontSize: 13,
                  transition: 'all 0.2s', fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {opt.value !== 'ALL' && (
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: opt.color }} />
                )}
                {opt.value === 'ALL' && <Filter size={13} />}
                {opt.label}
                {opt.value !== 'ALL' && (
                  <span style={{
                    background: isActive ? opt.color : 'rgba(255,255,255,0.15)',
                    color: isActive ? '#0f172a' : 'rgba(255,255,255,0.6)',
                    borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                  }}>
                    {AtuacaoMapService.filterByPillar(opt.value as ImpactPillar).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mapa SVG + Painel de Detalhes */}
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          overflow: 'hidden',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          <svg
            viewBox="0 0 800 900"
            style={{
              width: '100%',
              display: 'block',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
            }}
            aria-label="Mapa do Brasil com municípios de atuação do Instituto Ser Melhor"
          >
            <defs>
              <radialGradient id="map-bg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(34,197,94,0.06)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0)" />
              </radialGradient>
              <filter id="pin-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Fundo do mapa */}
            <rect width="800" height="900" fill="url(#map-bg)" />

            {/* Contorno do Brasil */}
            <path
              d={BRAZIL_OUTLINE}
              fill="rgba(34,197,94,0.05)"
              stroke="rgba(34,197,94,0.25)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Grade de coordenadas (decorativa) */}
            {[200, 400, 600].map((x) => (
              <line key={`vl-${x}`} x1={x} y1={0} x2={x} y2={900}
                stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}
            {[150, 300, 450, 600, 750].map((y) => (
              <line key={`hl-${y}`} x1={0} y1={y} x2={800} y2={y}
                stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}

            {/* Pins dos municípios */}
            <g filter="url(#pin-glow)">
              {municipalities.map((m) => (
                <MapPin2
                  key={m.id}
                  municipality={m}
                  isSelected={selected?.id === m.id}
                  isFiltered={filteredIds.has(m.id)}
                  onClick={() => handlePinClick(m)}
                />
              ))}
            </g>

            {/* Labels dos pins visíveis */}
            {municipalities.filter((m) => filteredIds.has(m.id)).map((m) => {
              const cfg = PILLAR_CONFIG[m.primaryPillar];
              const isSelected = selected?.id === m.id;
              return (
                <text
                  key={`label-${m.id}`}
                  x={m.svgX}
                  y={m.svgY - 16}
                  textAnchor="middle"
                  fill={isSelected ? cfg.color : 'rgba(255,255,255,0.7)'}
                  fontSize={isSelected ? 11 : 9}
                  fontWeight={isSelected ? 700 : 500}
                  fontFamily="Inter, system-ui, sans-serif"

                  style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
                >
                  {m.name}
                </text>
              );
            })}
          </svg>

          {/* Painel de detalhes do município */}
          {selected && (
            <DetailPanel municipality={selected} onClose={() => setSelected(null)} />
          )}
        </div>

        {/* Legenda */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center',
          flexWrap: 'wrap', marginTop: 28,
        }}>
          {Object.entries(PILLAR_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: cfg.color, boxShadow: `0 0 8px ${cfg.color}60`,
              }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{cfg.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Keyframes para animação do painel */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes cwv-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.25; }
          50%       { transform: scale(1.5); opacity: 0.08; }
        }
      `}</style>
    </section>
  );
};
