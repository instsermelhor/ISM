/**
 * campaignGoals.test.ts — E004: Painel Público de Metas e Termômetro de Captação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para o Serviço de Metas de Captação e Termômetro.
 */

import { describe, it, expect } from 'vitest';
import { CampaignGoalsService } from './campaignGoalsService';

describe('E004 — CampaignGoalsService (Metas & Termômetro de Captação)', () => {

  it('calculateProgressPct calcula percentual de progresso correto', () => {
    expect(CampaignGoalsService.calculateProgressPct(3850000, 5000000)).toBe(77);
    expect(CampaignGoalsService.calculateProgressPct(2580000, 2500000)).toBe(103.2); // Superou 100%
    expect(CampaignGoalsService.calculateProgressPct(0, 5000000)).toBe(0);
    expect(CampaignGoalsService.calculateProgressPct(100, 0)).toBe(0);
  });

  it('calculateDaysRemaining retorna dias restantes não-negativos', () => {
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString();
    const pastDate = new Date(Date.now() - 10 * 86400000).toISOString();

    expect(CampaignGoalsService.calculateDaysRemaining(futureDate)).toBeGreaterThanOrEqual(9);
    expect(CampaignGoalsService.calculateDaysRemaining(pastDate)).toBe(0);
  });

  it('getCampaigns retorna lista de campanhas com todos os campos estruturados', async () => {
    const campaigns = await CampaignGoalsService.getCampaigns();

    expect(campaigns.length).toBeGreaterThan(0);
    campaigns.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.pillar).toMatch(/^(Educação|Social|Meio Ambiente|Cultura|Geral)$/);
      expect(c.targetAmount).toBeGreaterThan(0);
      expect(c.raisedAmount).toBeGreaterThanOrEqual(0);
      expect(c.donorsCount).toBeGreaterThanOrEqual(0);
      expect(c.status).toMatch(/^(ACTIVE|COMPLETED|PAUSED)$/);
    });
  });

  it('identifica campanhas concluídas que atingiram 100%+ da meta', async () => {
    const campaigns = await CampaignGoalsService.getCampaigns();
    const completed = campaigns.filter(c => c.status === 'COMPLETED' || c.raisedAmount >= c.targetAmount);

    expect(completed.length).toBeGreaterThan(0);
    completed.forEach(c => {
      const pct = CampaignGoalsService.calculateProgressPct(c.raisedAmount, c.targetAmount);
      expect(pct).toBeGreaterThanOrEqual(100);
    });
  });
});
