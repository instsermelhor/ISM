/**
 * PillarBadge.tsx
 * Reusable color-coded badge for ISM's 4 institutional pillars.
 */
import React from 'react';

export type PillarKey = 'education' | 'social' | 'environment' | 'culture';

interface PillarConfig {
  label:  string;
  color:  string;   // text color
  bg:     string;   // background tint
  border: string;   // border color
  dot:    string;   // dot color
}

const PILLAR_CONFIG: Record<PillarKey, PillarConfig> = {
  education: {
    label:  'Educação',
    color:  '#1E3A8A',
    bg:     'rgba(30,58,138,0.12)',
    border: 'rgba(30,58,138,0.25)',
    dot:    '#3b82f6',
  },
  social: {
    label:  'Social',
    color:  '#D97706',
    bg:     'rgba(217,119,6,0.12)',
    border: 'rgba(217,119,6,0.25)',
    dot:    '#f59e0b',
  },
  environment: {
    label:  'Meio Ambiente',
    color:  '#15803D',
    bg:     'rgba(21,128,61,0.12)',
    border: 'rgba(21,128,61,0.25)',
    dot:    '#22c55e',
  },
  culture: {
    label:  'Cultura',
    color:  '#C2410C',
    bg:     'rgba(194,65,12,0.12)',
    border: 'rgba(194,65,12,0.25)',
    dot:    '#f97316',
  },
};

interface PillarBadgeProps {
  pillar: PillarKey;
  size?: 'sm' | 'md';
  className?: string;
}

export const PillarBadge: React.FC<PillarBadgeProps> = ({
  pillar,
  size = 'md',
  className = '',
}) => {
  const cfg = PILLAR_CONFIG[pillar];
  const padCls = size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${padCls} ${className}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span
        className="rounded-full shrink-0"
        style={{ width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6, background: cfg.dot }}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
};

export { PILLAR_CONFIG };
