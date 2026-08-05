/**
 * ExecutiveReportPage.test.tsx — D002: Gerador Automático de Relatórios de Impacto & Executive Briefings
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Testes de integração unitária do Gerador de Relatórios Executivos.
 * O Firebase é mockado globalmente para evitar auth/invalid-api-key no jsdom.
 */

// ── Mocks globais antes dos imports ─────────────────────────────────────────
vi.mock('../lib/firebase', () => ({ db: null, auth: null, storage: null, default: null }));
vi.mock('../services/impactMetricsService', () => ({
  ImpactMetricsService: {
    getOrSeed: vi.fn().mockResolvedValue([
      { label: 'Beneficiários Diretos', value: '32.000+', sublabel: 'Assistidos anualmente', prefix: '', suffix: '' },
      { label: 'SROI Oficial', value: '4,83', sublabel: 'Por R$ 1,00 investido', prefix: 'R$ ', suffix: 'x' },
    ]),
  },
}));
vi.mock('../services/sroiService', () => ({
  SROIService: { getOrSeed: vi.fn().mockResolvedValue(null) },
  calcularSROI: vi.fn().mockReturnValue({ ratio: 4.83, totalInvestimento: 3000000, totalRetorno: 14890000 }),
  SROI_SEED: {
    pilares: [
      { name: 'Educação', investimento: 1200000, retornoSocial: 6850000 },
      { name: 'Social', investimento: 850000, retornoSocial: 3920000 },
    ],
    organizacaoAuditora: 'Auditoria Independente ISM',
    notaMetodologica: 'Relatório gerado pelo Sistema de Inteligência de Impacto.',
  },
}));
// ────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExecutiveReportPage } from './ExecutiveReportPage';
import { ReportGeneratorService } from '../services/reportGeneratorService';

describe('ExecutiveReportPage Component & Service — D002', () => {
  it('compileReportData retorna dados consolidados do briefing executivo', async () => {
    const data = await ReportGeneratorService.compileReportData(2024);

    expect(data.title).toContain('Relatório Executivo');
    expect(data.year).toBe(2024);
    expect(data.sroiRatio).toBeGreaterThan(0);
    expect(data.metrics.length).toBeGreaterThan(0);
    expect(data.pillarsBreakdown.length).toBeGreaterThan(0);
  });

  it('renderiza cabeçalho do relatório e papel A4 do briefing compilado', async () => {
    render(<ExecutiveReportPage />);

    expect(await screen.findByText(/Gerador de Relatórios Executivos/i)).toBeInTheDocument();
    expect(await screen.findByText(/INSTITUTO/i)).toBeInTheDocument();
    expect(await screen.findByText(/SER MELHOR/i)).toBeInTheDocument();
    expect(screen.getByText(/DOCUMENTO AUDITADO/i)).toBeInTheDocument();
  });
});
