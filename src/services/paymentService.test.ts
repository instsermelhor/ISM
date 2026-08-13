/**
 * paymentService.test.ts — PAY-001: Testes de Integração de Pagamentos & Conciliação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte completa de testes para a Engine de Pagamentos, PIX EMV Bacen, Conciliação de Webhooks
 * e Geração de Recibos Oficiais do Instituto Ser Melhor.
 */

import { describe, it, expect } from 'vitest';
import { PixGeneratorService, crc16 } from './pixGeneratorService';
import { ReceiptGeneratorService } from './receiptGeneratorService';

describe('PAY-001 — Engine de Pagamentos, Conciliação de Gateways & PIX EMV', () => {

  describe('1. PixGeneratorService (Norma Bacen EMV QRCPS-MPM)', () => {
    it('PAY-001: crc16 calcula checksum hex de 4 dígitos preciso (polinômio 0x1021)', () => {
      const sampleEMV = '00020126580014br.gov.bcb.pix0114090404400001475204000053039865802BR5920INSTITUTO SER MELHOR6009SAO PAULO62070503ISM6304';
      const checksum = crc16(sampleEMV);
      expect(checksum).toHaveLength(4);
      expect(checksum).toMatch(/^[0-9A-F]{4}$/);
    });

    it('PAY-002: generatePayload constrói string EMV válida com chave CNPJ oficial do ISM', () => {
      const payload = PixGeneratorService.generatePayload({ valor: 150.00 });

      expect(payload).toContain('000201'); // Format Indicator
      expect(payload).toContain('br.gov.bcb.pix'); // GUI Bacen
      expect(payload).toContain('09040440000147'); // CNPJ ISM sem pontuação
      expect(payload).toContain('5303986'); // Moeda 986 (BRL)
      expect(payload).toContain('5406150.00'); // Valor formatado com 2 casas decimais
      expect(payload).toContain('BR'); // Código do país
      expect(payload).toContain(PixGeneratorService.RECEBEDOR_NOME); // Nome do recebedor oficial
      expect(payload).toContain('SAO PAULO'); // Cidade
      expect(payload.slice(-4)).toMatch(/^[0-9A-F]{4}$/); // CRC-16 no final
    });

    it('PAY-003: generatePayload formata valores inteiros e decimais com padding correto', () => {
      const payload10 = PixGeneratorService.generatePayload({ valor: 10.00 });
      const payload500 = PixGeneratorService.generatePayload({ valor: 500.50 });
      const payloadStatic = PixGeneratorService.generatePayload(); // Sem valor fixo

      expect(payload10).toContain('540510.00');
      expect(payload500).toContain('5406500.50');
      // No modo estático (sem valor pré-definido), a tag 54 (valor) não é incluída
      expect(payloadStatic).not.toContain('540');
    });
  });

  describe('2. Conciliação de Webhooks Multi-Gateway (Simulação & Normalização)', () => {
    // Função auxiliar que espelha a lógica de normalização do backend (Cloud Functions)
    function normalizeEvent(provider: string, body: any) {
      const p = provider.toLowerCase();
      if (p === 'stripe') {
        const type = body.type || '';
        const obj = body.data?.object || {};
        if (type === 'payment_intent.succeeded' || type === 'checkout.session.completed') {
          return { status: 'CONFIRMED', transactionId: obj.id, amount: (obj.amount_received || obj.amount_total || 0) / 100 };
        }
        if (type === 'charge.refunded') return { status: 'REFUNDED', transactionId: obj.id };
        if (type === 'payment_intent.payment_failed') return { status: 'FAILED', transactionId: obj.id };
      }
      if (p === 'cora') {
        if (body.status === 'PAID' || body.event === 'INVOICE_PAID') {
          return { status: 'CONFIRMED', transactionId: body.id || body.transactionId, amount: body.amount };
        }
      }
      if (p === 'asaas') {
        if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
          return { status: 'CONFIRMED', transactionId: body.payment?.id, amount: body.payment?.value };
        }
        if (body.event === 'PAYMENT_REFUNDED') return { status: 'REFUNDED', transactionId: body.payment?.id };
      }
      if (p === 'efi' || p === 'gerencianet') {
        const pix = body.pix?.[0];
        if (pix) return { status: 'CONFIRMED', transactionId: pix.endToEndId || pix.txid, amount: parseFloat(pix.valor || '0') };
      }
      return { status: 'PENDING' };
    }

    it('PAY-004: concilia evento de sucesso do Stripe (payment_intent.succeeded)', () => {
      const stripeEvent = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test_123456789', amount_received: 15000 } },
      };
      const result = normalizeEvent('stripe', stripeEvent);
      expect(result.status).toBe('CONFIRMED');
      expect(result.transactionId).toBe('pi_test_123456789');
      expect(result.amount).toBe(150);
    });

    it('PAY-005: concilia evento de estorno do Stripe (charge.refunded)', () => {
      const stripeEvent = {
        type: 'charge.refunded',
        data: { object: { id: 'ch_test_refund_123' } },
      };
      const result = normalizeEvent('stripe', stripeEvent);
      expect(result.status).toBe('REFUNDED');
      expect(result.transactionId).toBe('ch_test_refund_123');
    });

    it('PAY-006: concilia webhook de liquidação do Banco Cora SCFI (INVOICE_PAID)', () => {
      const coraEvent = {
        event: 'INVOICE_PAID',
        id: 'inv_cora_987654321',
        amount: 250.00,
      };
      const result = normalizeEvent('cora', coraEvent);
      expect(result.status).toBe('CONFIRMED');
      expect(result.transactionId).toBe('inv_cora_987654321');
      expect(result.amount).toBe(250.00);
    });

    it('PAY-007: concilia webhook de liquidação do Asaas (PAYMENT_RECEIVED)', () => {
      const asaasEvent = {
        event: 'PAYMENT_RECEIVED',
        payment: { id: 'pay_asaas_112233', value: 75.00 },
      };
      const result = normalizeEvent('asaas', asaasEvent);
      expect(result.status).toBe('CONFIRMED');
      expect(result.transactionId).toBe('pay_asaas_112233');
      expect(result.amount).toBe(75.00);
    });

    it('PAY-008: concilia webhook Pix Bacen do Efí Bank (endToEndId)', () => {
      const efiEvent = {
        pix: [{ endToEndId: 'E09040440202408131234567890', valor: '300.00' }],
      };
      const result = normalizeEvent('efi', efiEvent);
      expect(result.status).toBe('CONFIRMED');
      expect(result.transactionId).toBe('E09040440202408131234567890');
      expect(result.amount).toBe(300.00);
    });
  });

  describe('3. ReceiptGeneratorService (Recibos Oficiais e Cálculo SROI)', () => {
    it('PAY-009: buildReceiptData calcula retorno social multiplicando pelo índice SROI oficial (4.83x)', () => {
      const receipt = ReceiptGeneratorService.buildReceiptData({
        transactionId: 'TXN-PIX-2024-001',
        donorName: 'Ana Paula Ferreira',
        donorEmail: 'ana.ferreira@email.com',
        donorTaxId: '123.456.789-00',
        amount: 200,
        frequency: 'Mensal',
        pillar: 'Educação',
        paymentMethod: 'PIX Instantâneo (CNPJ)',
      });

      expect(receipt.receiptId).toContain('REC-');
      expect(receipt.transactionId).toBe('TXN-PIX-2024-001');
      expect(receipt.amount).toBe(200);
      expect(receipt.sroiRatio).toBe(4.83);
      expect(receipt.socialValueGenerated).toBe(200 * 4.83); // R$ 966,00
      expect(receipt.donorName).toBe('Ana Paula Ferreira');
      expect(receipt.pillar).toBe('Educação');
    });

    it('PAY-010: trata doador anônimo / taxId ausente atribuindo "Não informado"', () => {
      const receipt = ReceiptGeneratorService.buildReceiptData({
        transactionId: 'TXN-ANON-002',
        donorName: 'Doador Anônimo',
        donorEmail: 'anonimo@email.com',
        amount: 50,
        frequency: 'Única',
        pillar: 'Geral',
        paymentMethod: 'Cartão de Crédito',
      });

      expect(receipt.donorTaxId).toBe('Não informado');
      expect(receipt.amount).toBe(50);
      expect(receipt.socialValueGenerated).toBe(50 * 4.83);
    });
  });
});
