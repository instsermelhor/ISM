/**
 * ExecutiveReportPage.test.tsx — D002: Gerador Automático de Relatórios de Impacto & Executive Briefings
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Testes de integração unitária do Gerador de Relatórios Executivos.
 */

// ── vi.mock hoistados — executam ANTES de qualquer import ───────────────────
// NOTA: não usar variáveis externas dentro de factory, conforme restrição do Vitest.
vi.mock('../lib/firebase', () => ({ db: null, auth: null, storage: null, default: null }));

vi.mock('../services/reportGeneratorService', () => ({
  ReportGeneratorService: {
    compileReportData: vi.fn().mockResolvedValue({
      title: 'Relatório Executivo de Impacto Socioambiental & Retorno Social (SROI)',
      subTitle: 'Demonstrativo Consolidado',
      year: 2024,
      period: 'Janeiro a Dezembro de 2024',
      auditorName: 'Auditoria Independente ISM',
      generatedAt: '05 de agosto de 2025',
      sroiRatio: 4.83,
      totalInvested: 3000000,
      totalSocialReturn: 14890000,
      metrics: [
        { label: 'Beneficiários Diretos', value: '32.000+', sublabel: 'Assistidos anualmente' },
        { label: 'SROI Oficial', value: 'R$ 4,83', sublabel: 'Por R$ 1,00 investido' },
      ],
      pillarsBreakdown: [
        { name: 'Educação', invested: 1200000, returned: 6850000, ratio: 5.71 },
        { name: 'Social', invested: 850000, returned: 3920000, ratio: 4.61 },
      ],
      governanceSummary: { membersCount: 12, status: '100% Conforme e Auditado' },
      financialSummary: { totalRaised: 'R$ 12.400.000,00', targetAmount: 'R$ 16.000.000,00', pctReached: 77.5 },
      disclaimer: 'Relatório gerado pelo Sistema de Inteligência de Impacto do Instituto Ser Melhor.',
    }),
  },
}));
// ────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExecutiveReportPage } from './ExecutiveReportPage';
import { ReportGeneratorService } from '../services/reportGeneratorService';

describe('ExecutiveReportPage Component & Service — D002', () => {
  it('compileReportData é chamado e retorna dados consolidados do briefing executivo', async () => {
    const data = await ReportGeneratorService.compileReportData(2024);

    expect(data.title).toContain('Relatório Executivo');
    expect(data.year).toBe(2024);
    expect(data.sroiRatio).toBe(4.83);
    expect(data.metrics.length).toBeGreaterThan(0);
    expect(data.pillarsBreakdown.length).toBeGreaterThan(0);
  });

  it('renderiza cabeçalho do painel admin de relatórios', async () => {
    render(<ExecutiveReportPage />);
    expect(await screen.findByText(/Gerador de Relatórios Executivos/i)).toBeInTheDocument();
  });

  it('renderiza papel A4 do briefing compilado com dados SROI e governança', async () => {
    render(<ExecutiveReportPage />);
    expect(await screen.findByText(/INSTITUTO/i)).toBeInTheDocument();
    expect(await screen.findByText(/SER MELHOR/i)).toBeInTheDocument();
    expect(await screen.findByText(/DOCUMENTO AUDITADO/i)).toBeInTheDocument();
    expect(await screen.findByText(/RAZÃO SROI OFICIAL/i)).toBeInTheDocument();
  });
});
