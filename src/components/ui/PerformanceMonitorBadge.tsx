/**
 * PerformanceMonitorBadge.tsx — F002: Indicador de Performance Core Web Vitals
 * ─────────────────────────────────────────────────────────────────────────────
 * Painel compacto exibindo métricas de LCP, INP e CLS em tempo real.
 * O usuário pode fechar o badge clicando no ×; a preferência é persistida
 * em localStorage e o badge não reaparece na mesma sessão de navegação.
 */

import React, { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { WebVitalsService, type CWVReportSnapshot } from '../../services/webVitalsService';

const DISMISSED_KEY = 'ism_cwv_badge_dismissed';

export const PerformanceMonitorBadge: React.FC = () => {
  const [snapshot, setSnapshot] = useState<CWVReportSnapshot | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // U-005: Exibir apenas em desenvolvimento ou com ?debug=true na URL
    const isDev = import.meta.env.DEV;
    const isDebugQuery = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    if (!isDev && !isDebugQuery) {
      setDismissed(true);
      return;
    }

    // Verifica se o usuário já fechou o badge anteriormente
    const alreadyDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
    if (alreadyDismissed) {
      setDismissed(true);
      return;
    }
    WebVitalsService.initPerformanceObservers();
    setSnapshot(WebVitalsService.getSnapshot());
  }, []);


  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch { /* ignore */ }
  };

  if (dismissed || !snapshot) return null;

  const isGood = snapshot.overallRating === 'GOOD';

  return (
    <div
      role="status"
      aria-label="Métricas de Desempenho Core Web Vitals"
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9980,
        background: isGood ? 'rgba(5, 46, 22, 0.92)' : 'rgba(30, 41, 59, 0.92)',
        backdropFilter: 'blur(8px)', color: 'white', borderRadius: 16,
        padding: '10px 14px', border: `1px solid ${isGood ? '#166534' : '#334155'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 11,
      }}
    >
      {/* Ícone + Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Zap size={14} color={isGood ? '#4ade80' : '#fbbf24'} />
        <span style={{ fontWeight: 800, color: isGood ? '#4ade80' : '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          CWV {snapshot.overallRating}
        </span>
      </div>

      {/* Métricas */}
      <div style={{ display: 'flex', gap: 10, borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 10 }}>
        <div>
          <span style={{ color: '#86efac' }}>LCP:</span>{' '}
          <strong style={{ color: 'white', fontFamily: 'monospace' }}>{(snapshot.lcp.value / 1000).toFixed(2)}s</strong>
        </div>
        <div>
          <span style={{ color: '#86efac' }}>INP:</span>{' '}
          <strong style={{ color: 'white', fontFamily: 'monospace' }}>{snapshot.inp.value}ms</strong>
        </div>
        <div>
          <span style={{ color: '#86efac' }}>CLS:</span>{' '}
          <strong style={{ color: 'white', fontFamily: 'monospace' }}>{snapshot.cls.value}</strong>
        </div>
      </div>

      {/* Botão × para fechar */}
      <button
        onClick={handleDismiss}
        title="Fechar indicador de performance"
        aria-label="Fechar indicador de performance"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: 'none',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.75)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          padding: 0,
          marginLeft: 2,
          transition: 'background 0.15s, color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
        }}
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
};
