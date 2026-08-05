/**
 * recurringDonation.test.ts — E003: Gestão de Doações Recorrentes & Assinaturas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para o Serviço de Doações Recorrentes do Instituto Ser Melhor.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecurringDonationService } from './recurringDonationService';

describe('E003 — RecurringDonationService (Gestão de Assinaturas & Recorrência)', () => {

  it('cria nova assinatura mensal ativa com ID único', async () => {
    const sub = await RecurringDonationService.createSubscription({
      donorName: 'Ana Souza',
      donorEmail: 'ana.souza@teste.com',
      amount: 150,
      frequency: 'MONTHLY',
      pillar: 'Educação',
      paymentMethod: 'CREDIT_CARD',
    });

    expect(sub.id).toContain('sub-ism-');
    expect(sub.donorEmail).toBe('ana.souza@teste.com');
    expect(sub.amount).toBe(150);
    expect(sub.status).toBe('ACTIVE');
    expect(sub.billingCount).toBe(1);
  });

  it('atualiza o valor mensal da assinatura (upgrade/downgrade)', async () => {
    const sub = await RecurringDonationService.createSubscription({
      donorName: 'Carlos Lima',
      donorEmail: 'carlos@teste.com',
      amount: 50,
      frequency: 'MONTHLY',
      pillar: 'Social',
      paymentMethod: 'CREDIT_CARD',
    });

    const updated = await RecurringDonationService.updateAmount(sub.id, 120);
    expect(updated).toBe(true);

    const subs = await RecurringDonationService.getSubscriptionsByEmail('carlos@teste.com');
    expect(subs[0].amount).toBe(120);
  });

  it('pausa e reativa a assinatura com sucesso', async () => {
    const sub = await RecurringDonationService.createSubscription({
      donorName: 'Fernanda Rocha',
      donorEmail: 'fernanda@teste.com',
      amount: 80,
      frequency: 'MONTHLY',
      pillar: 'Meio Ambiente',
      paymentMethod: 'PIX_RECURRING',
    });

    // Pausar
    const paused = await RecurringDonationService.pauseSubscription(sub.id);
    expect(paused).toBe(true);
    let subs = await RecurringDonationService.getSubscriptionsByEmail('fernanda@teste.com');
    expect(subs[0].status).toBe('PAUSED');

    // Reativar
    const resumed = await RecurringDonationService.resumeSubscription(sub.id);
    expect(resumed).toBe(true);
    subs = await RecurringDonationService.getSubscriptionsByEmail('fernanda@teste.com');
    expect(subs[0].status).toBe('ACTIVE');
  });

  it('cancela a assinatura alterando status para CANCELLED', async () => {
    const sub = await RecurringDonationService.createSubscription({
      donorName: 'Roberto Alves',
      donorEmail: 'roberto@teste.com',
      amount: 200,
      frequency: 'MONTHLY',
      pillar: 'Cultura',
      paymentMethod: 'CREDIT_CARD',
    });

    const cancelled = await RecurringDonationService.cancelSubscription(sub.id);
    expect(cancelled).toBe(true);

    const subs = await RecurringDonationService.getSubscriptionsByEmail('roberto@teste.com');
    expect(subs[0].status).toBe('CANCELLED');
  });

  it('retorna histórico de cobranças associadas com recibos', async () => {
    const subs = await RecurringDonationService.getSubscriptionsByEmail('doador@exemplo.com.br');
    if (subs.length > 0) {
      const history = await RecurringDonationService.getSubscriptionHistory(subs[0].id);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].receiptId).toContain('REC-');
      expect(history[0].amount).toBeGreaterThan(0);
    }
  });
});
