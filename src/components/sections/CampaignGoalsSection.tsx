/**
 * CampaignGoalsSection.tsx — E004: Painel Público de Metas e Termômetro de Captação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Seção interativa com termômetro dinâmico de arrecadação por campanha, indicadores
 * de progresso em tempo real e atalho direto para doação por pilar.
 */

import React, { useState, useEffect } from 'react';
import {
  Target, TrendingUp, Users, Calendar, Heart, Award,
  Sparkles, CheckCircle2, BookOpen, Leaf, Palette, ArrowRight
} from 'lucide-react';
import { CampaignGoalsService, type CampaignGoal } from '../../services/campaignGoalsService';

const fmtCurrency = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
    : `R$ ${v.toLocaleString('pt-BR')}`;

const PILLAR_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  'Educação':      { bg: '#eff6ff', text: '#1e40af', bar: 'linear-gradient(90deg, #2563eb, #60a5fa)' },
  'Social':        { bg: '#fffbeb', text: '#b45309', bar: 'linear-gradient(90deg, #d97706, #fbbf24)' },
  'Meio Ambiente': { bg: '#f0fdf4', text: '#15803d', bar: 'linear-gradient(90deg, #16a34a, #4ade80)' },
  'Cultura':       { bg: '#fdf4ff', text: '#7e22ce', bar: 'linear-gradient(90deg, #9333ea, #c084fc)' },
  'Geral':         { bg: '#f3f4f6', text: '#374151', bar: 'linear-gradient(90deg, #4b5563, #9ca3af)' },
};

export const CampaignGoalsSection: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignGoal[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string>('TODOS');

  useEffect(() => {
    CampaignGoalsService.getCampaigns().then(setCampaigns);
  }, []);

  const handleDonateClick = () => {
    const donateElem = document.getElementById('donate');
    if (donateElem) {
      donateElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredCampaigns = selectedPillar === 'TODOS'
    ? campaigns
    : campaigns.filter(c => c.pillar === selectedPillar);

  return (
    <section id="metas" style={{ padding: '80px 20px', background: 'white', color: '#111827', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 20, background: '#f0fdf4', border: '1px solid #bbf7d0',
            color: '#16a34a', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>
            <Target size={16} /> Metas &amp; Transparência em Tempo Real
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', margin: '0 0 12px 0' }}>
            Termômetro de Captação das Campanhas ISM
          </h2>
          <p style={{ fontSize: 15, color: '#4b5563', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Acompanhe a evolução do financiamento dos nossos projetos sociais e ambientais. Cada doação aproxima o Instituto do impacto pretendido.
          </p>
        </div>

        {/* Pillar Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {['TODOS', 'Educação', 'Social', 'Meio Ambiente', 'Cultura'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPillar(p)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '1px solid #e5e7eb', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                background: selectedPillar === p ? '#16a34a' : '#f9fafb',
                color: selectedPillar === p ? 'white' : '#374151',
                boxShadow: selectedPillar === p ? '0 4px 12px rgba(22,163,74,0.2)' : 'none',
              }}
            >
              {p === 'TODOS' ? 'Todas as Campanhas' : p}
            </button>
          ))}
        </div>

        {/* Campaign Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {filteredCampaigns.map(c => {
            const pct = CampaignGoalsService.calculateProgressPct(c.raisedAmount, c.targetAmount);
            const daysLeft = CampaignGoalsService.calculateDaysRemaining(c.endDate);
            const pColor = PILLAR_COLORS[c.pillar] || PILLAR_COLORS['Geral'];
            const isCompleted = c.status === 'COMPLETED' || pct >= 100;

            return (
              <div
                key={c.id}
                style={{
                  background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 20,
                  padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div>
                  {/* Badge & Pillar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                      background: pColor.bg, color: pColor.text, textTransform: 'uppercase',
                    }}>
                      {c.pillar}
                    </span>

                    {c.badgeLabel && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                        background: isCompleted ? '#f0fdf4' : '#fffbeb',
                        color: isCompleted ? '#16a34a' : '#b45309',
                        border: `1px solid ${isCompleted ? '#bbf7d0' : '#fde68a'}`,
                      }}>
                        {c.badgeLabel}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                    {c.description}
                  </p>

                  {/* Thermometer Progress Bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                        Captado: <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>{fmtCurrency(c.raisedAmount)}</strong>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: isCompleted ? '#16a34a' : '#2563eb' }}>
                        {pct}%
                      </span>
                    </div>

                    <div style={{ background: '#e5e7eb', borderRadius: 99, height: 12, overflow: 'hidden', position: 'relative' }}>
                      <div
                        style={{
                          background: pColor.bar, width: `${Math.min(100, pct)}%`, height: '100%',
                          borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 20 }}>
                    <span>Meta: <strong style={{ color: '#111827' }}>{fmtCurrency(c.targetAmount)}</strong></span>
                    <span>👥 <strong style={{ color: '#111827' }}>{c.donorsCount.toLocaleString('pt-BR')}</strong> doadores</span>
                    <span>⏳ {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Encerrada'}</span>
                  </div>
                </div>

                {/* Donate CTA */}
                <button
                  onClick={handleDonateClick}
                  style={{
                    width: '100%', padding: '12px 18px', borderRadius: 12, border: 'none',
                    background: isCompleted ? '#16a34a' : '#1e293b', color: 'white',
                    fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {isCompleted ? (
                    <> <CheckCircle2 size={16} /> Contribuir com Novas Metas </>
                  ) : (
                    <> <Heart size={16} fill="white" /> Doar para esta Meta <ArrowRight size={14} /> </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
