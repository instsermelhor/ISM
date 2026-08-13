/**
 * donorAndVolunteerPortals.test.ts — Fase 14 / PORTAL-005
 * Suíte de Testes dos Portais de Voluntariado, Doadores e Emissão de IRPF
 */

import { describe, it, expect } from 'vitest';
import { VolunteerService, VOLUNTEER_OPPORTUNITIES } from '../services/volunteerService';
import { ReceiptGeneratorService } from '../services/receiptGeneratorService';
import { RecurringDonationService } from '../services/recurringDonationService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. TESTES DO PROGRAMA & PORTAL DO VOLUNTARIADO
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 14 — VolunteerService (Portal do Voluntário)', () => {

  describe('Vitrine de Oportunidades', () => {
    it('deve listar todas as oportunidades quando área for ALL', () => {
      const opps = VolunteerService.getOpportunities('ALL');
      expect(opps.length).toBe(VOLUNTEER_OPPORTUNITIES.length);
      expect(opps.length).toBeGreaterThan(0);
    });

    it('deve filtrar oportunidades por área temática', () => {
      const eduOpps = VolunteerService.getOpportunities('EDUCACAO');
      expect(eduOpps.every(o => o.area === 'EDUCACAO')).toBe(true);
      expect(eduOpps.length).toBeGreaterThan(0);

      const envOpps = VolunteerService.getOpportunities('MEIO_AMBIENTE');
      expect(envOpps.every(o => o.area === 'MEIO_AMBIENTE')).toBe(true);
    });
  });

  describe('Cadastro e Autenticação de Voluntários', () => {
    it('deve cadastrar novo voluntário com número de registro e QR Token gerados', async () => {
      const email = `novo.voluntario.${Date.now()}@ism.org`;
      const profile = await VolunteerService.registerVolunteer({
        name: 'Mariana Silva',
        email,
        phone: '(11) 98765-4321',
        cpf: '123.456.789-00',
        areasOfInterest: ['EDUCACAO', 'TECNOLOGIA'],
      });

      expect(profile).toBeDefined();
      expect(profile.name).toBe('Mariana Silva');
      expect(profile.registrationNumber).toMatch(/^ISM-VOL-2026-/);
      expect(profile.qrToken).toContain('CERT-');
      expect(profile.totalHoursApproved).toBe(0);
      expect(profile.totalHoursPending).toBe(0);
    });

    it('deve rejeitar cadastro com e-mail duplicado', async () => {
      const duplicateEmail = 'voluntario@exemplo.com';
      await expect(
        VolunteerService.registerVolunteer({
          name: 'Duplicado',
          email: duplicateEmail,
          phone: '(11) 99999-9999',
          cpf: '000.000.000-00',
          areasOfInterest: ['MEIO_AMBIENTE'],
        })
      ).rejects.toThrow(/já está cadastrado/i);
    });

    it('deve autenticar voluntário existente e retornar perfil com logs de atividade', async () => {
      const profile = await VolunteerService.login('voluntario@exemplo.com');
      expect(profile).toBeDefined();
      expect(profile.email).toBe('voluntario@exemplo.com');
      expect(profile.totalHoursApproved).toBeGreaterThan(0);
      expect(Array.isArray(profile.activityLogs)).toBe(true);
    });
  });

  describe('Lançamento de Horas e Certificado Digital', () => {
    it('deve lançar novas horas com status PENDENTE e atualizar total pendente', async () => {
      const email = 'voluntario@exemplo.com';
      const initialProfile = await VolunteerService.login(email);
      const prevPending = initialProfile.totalHoursPending;

      const log = await VolunteerService.logHours(
        email,
        'Oficina de Alfabetização Digital',
        '2026-08-10',
        5,
        'Monitoria para 15 jovens.'
      );

      expect(log).toBeDefined();
      expect(log.status).toBe('PENDENTE');
      expect(log.hoursSpent).toBe(5);

      const updatedProfile = await VolunteerService.login(email);
      expect(updatedProfile.totalHoursPending).toBe(prevPending + 5);
    });

    it('deve gerar dados formatados do Certificado de Voluntariado', async () => {
      const profile = await VolunteerService.login('voluntario@exemplo.com');
      const cert = VolunteerService.generateCertificateData(profile);

      expect(cert.title).toBe('CERTIFICADO DE RECONHECIMENTO DE VOLUNTARIADO');
      expect(cert.recipientName).toBe(profile.name);
      expect(cert.totalHours).toBe(profile.totalHoursApproved);
      expect(cert.organizationName).toBe('Instituto Ser Melhor');
      expect(cert.cnpj).toBe('09.040.440/0001-47');
      expect(cert.qrToken).toBe(profile.qrToken);
      expect(cert.authenticityUrl).toContain(profile.qrToken);
    });

    it('deve verificar a autenticidade do certificado via QR Token', async () => {
      const profile = await VolunteerService.login('voluntario@exemplo.com');
      const verification = await VolunteerService.verifyCertificate(profile.qrToken);

      expect(verification.valid).toBe(true);
      expect(verification.volunteerName).toBe(profile.name);
      expect(verification.message).toContain('Certificado Autêntico');
    });

    it('deve rejeitar QR Token inválido ou não cadastrado', async () => {
      const verification = await VolunteerService.verifyCertificate('TOKEN_FALSO_123');
      expect(verification.valid).toBe(false);
      expect(verification.message).toContain('não encontrado');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TESTES DE RECIBOS E INFORME ANUAL DE IRPF (PORTAL DO DOADOR)
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 14 — ReceiptGeneratorService (Recibos & IRPF)', () => {

  it('deve gerar Recibo Individual com cálculo de SROI (R$ 4,83)', () => {
    const receipt = ReceiptGeneratorService.buildReceiptData({
      transactionId: 'TXN-998877',
      donorName: 'Carlos Drummond',
      donorEmail: 'carlos@exemplo.com',
      donorTaxId: '111.222.333-44',
      amount: 200,
      frequency: 'Mensal',
      pillar: 'Educação',
      paymentMethod: 'PIX',
    });

    expect(receipt.receiptId).toMatch(/^REC-/);
    expect(receipt.amount).toBe(200);
    expect(receipt.sroiRatio).toBe(4.83);
    expect(receipt.socialValueGenerated).toBe(200 * 4.83); // R$ 966,00
  });

  it('deve gerar Declaração Anual Consolidada para IRPF com demonstrativo mensal e hash', () => {
    const statement = ReceiptGeneratorService.buildAnnualTaxStatement({
      donorName: 'Ana Nery',
      donorEmail: 'ana.nery@exemplo.com',
      donorTaxId: '987.654.321-00',
      taxYear: 2025,
      donations: [
        { date: '2025-01-15', amount: 150 },
        { date: '2025-02-15', amount: 150 },
        { date: '2025-03-15', amount: 150 },
        { date: '2025-04-15', amount: 150 },
      ],
    });

    expect(statement.statementId).toMatch(/^IRPF-2025-/);
    expect(statement.taxYear).toBe(2025);
    expect(statement.donorName).toBe('Ana Nery');
    expect(statement.organizationCnpj).toBe('09.040.440/0001-47');
    expect(statement.totalDonated).toBe(600);
    expect(statement.totalSroiGenerated).toBe(600 * 4.83);
    expect(statement.donationsCount).toBe(4);
    expect(statement.digitalSignatureHash).toMatch(/^SHA256-/);
    expect(statement.monthlyBreakdown.length).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. TESTES DO SERVIÇO DE DOAÇÃO RECORRENTE
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 14 — RecurringDonationService (Gestão de Assinaturas)', () => {

  it('deve buscar assinaturas ativas por e-mail e permitir atualizar valor', async () => {
    const subs = await RecurringDonationService.getSubscriptionsByEmail('doador@exemplo.com');
    expect(subs.length).toBeGreaterThan(0);

    const sub = subs[0];
    const ok = await RecurringDonationService.updateAmount(sub.id, 250);
    expect(ok).toBe(true);
  });

  it('deve pausar, reativar e cancelar assinatura', async () => {
    const subs = await RecurringDonationService.getSubscriptionsByEmail('doador@exemplo.com');
    const sub = subs[0];

    const paused = await RecurringDonationService.pauseSubscription(sub.id);
    expect(paused).toBe(true);

    const resumed = await RecurringDonationService.resumeSubscription(sub.id);
    expect(resumed).toBe(true);

    const cancelled = await RecurringDonationService.cancelSubscription(sub.id);
    expect(cancelled).toBe(true);
  });

  it('deve retornar histórico de cobranças da assinatura', async () => {
    const subs = await RecurringDonationService.getSubscriptionsByEmail('doador@exemplo.com');
    const sub = subs[0];
    const history = await RecurringDonationService.getSubscriptionHistory(sub.id);

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty('receiptId');
    expect(history[0]).toHaveProperty('amount');
  });
});
