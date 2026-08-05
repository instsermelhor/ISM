/**
 * PerformanceMonitorBadge.tsx — F002: Indicador de Performance Core Web Vitals
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Painel compacto exibindo métricas de LCP, INP e CLS em tempo real com selo de aprovação GOOD.
 */

import React, { useState, useEffect } from 'react';
import { Gauge, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { WebVitalsService, type CWVReportSnapshot } from '../../services/webVitalsService';

export const PerformanceMonitorBadge: React.FC = () => {
  const [snapshot, setSnapshot] = useState<CWVReportSnapshot | null>(null);

  useEffect(() => {
    WebVitalsService.initPerformanceObservers();
    setSnapshot(WebVitalsService.getSnapshot());
  }, []);

  if (!snapshot) return null;

  const isGood = snapshot.overallRating === 'GOOD';

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9980,
        background: isGood ? 'rgba(5, 46, 22, 0.92)' : 'rgba(30, 41, 59, 0.92)',
        backdropFilter: 'blur(8px)', color: 'white', borderRadius: 16,
        padding: '10px 16px', border: `1px solid ${isGood ? '#166534' : '#334155'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex', alignItems: 'center', gap: 12, fontSize: 11,
      }}
      title="Métricas de Desempenho Core Web Vitals (CWV)"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Zap size={14} color={isGood ? '#4ade80' : '#fbbf24'} />
        <span style={{ fontWeight: 800, color: isGood ? '#4ade80' : '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          CWV {snapshot.overallRating}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
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
    </div>
  );
};
