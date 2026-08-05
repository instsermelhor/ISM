/**
 * partnersService.test.ts — E002: Portal de Parceiros & Co-benefícios ESG
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para a Calculadora de Co-benefícios ESG e Validação de Propostas.
 */

import { describe, it, expect } from 'vitest';

/** Lógica pura da calculadora de co-benefícios ESG */
function calculateESGMetrics(corporateInvestment: number) {
  const sroiRatio = 4.83;
  const socialReturn = corporateInvestment * sroiRatio;
  const beneficiaries = Math.round(corporateInvestment / 125);
  const co2OffsetTrees = Math.round(corporateInvestment / 25);
  const odsGoals = ['ODS 1', 'ODS 4', 'ODS 8', 'ODS 10', 'ODS 13'];

  return {
    socialReturn,
    beneficiaries,
    co2OffsetTrees,
    odsGoals,
    sroiRatio,
  };
}

describe('E002 — Portal de Parceiros & Calculadora de Co-benefícios ESG', () => {

  describe('Calculadora de Co-benefícios ESG', () => {
    it('calcula retorno social correto usando SROI R$ 4,83x para aporte de R$ 100.000', () => {
      const res = calculateESGMetrics(100000);

      expect(res.socialReturn).toBe(483000); // 100k * 4.83
      expect(res.sroiRatio).toBe(4.83);
    });

    it('estima quantidade proporcional de beneficiários diretos impactados', () => {
      const res50k = calculateESGMetrics(50000);
      const res200k = calculateESGMetrics(200000);

      expect(res50k.beneficiaries).toBe(400); // 50000 / 125
      expect(res200k.beneficiaries).toBe(1600); // 200000 / 125
      expect(res200k.beneficiaries).toBeGreaterThan(res50k.beneficiaries);
    });

    it('calcula estimativa de arvores/CO2 para relatorios corporativos', () => {
      const res100k = calculateESGMetrics(100000);
      expect(res100k.co2OffsetTrees).toBe(4000); // 100000 / 25
    });

    it('inclui alinhamento explicito com 5 ODS da ONU', () => {
      const res = calculateESGMetrics(100000);
      expect(res.odsGoals).toHaveLength(5);
      expect(res.odsGoals).toContain('ODS 4'); // Educação de qualidade
      expect(res.odsGoals).toContain('ODS 13'); // Ação contra mudança global do clima
    });
  });

  describe('Níveis e Classificação de Parceiros Corporativos', () => {
    it('filtra parceiros corretamente por tier (MASTER, OURO, PRATA)', () => {
      const partners = [
        { id: '1', name: 'Bradesco', tier: 'MASTER' },
        { id: '2', name: 'Natura', tier: 'MASTER' },
        { id: '3', name: 'Itaú', tier: 'OURO' },
        { id: '4', name: 'Suzano', tier: 'PRATA' },
      ];

      const masters = partners.filter(p => p.tier === 'MASTER');
      const ouros = partners.filter(p => p.tier === 'OURO');

      expect(masters).toHaveLength(2);
      expect(ouros).toHaveLength(1);
      expect(ouros[0].name).toBe('Itaú');
    });
  });
});
