/**
 * paymentService.test.ts — E001: Testes de Captação Avançada, PIX EMV & Recibos Oficiais
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para a Engine de Pagamentos do Instituto Ser Melhor.
 */

import { describe, it, expect } from 'vitest';
import { PixGeneratorService, crc16 } from './pixGeneratorService';
import { ReceiptGeneratorService } from './receiptGeneratorService';

describe('E001 — Engine de Captação Avançada & PIX EMV Bacen', () => {

  describe('PixGeneratorService (Payload EMV QRCPS-MPM)', () => {
    it('crc16 calcula checksum hex de 4 dígitos', () => {
      const checksum = crc16('00020126580014br.gov.bcb.pix0114090404400001475204000053039865802BR5920INSTITUTO SER MELHOR6009SAO PAULO62070503ISM6304');
      expect(checksum).toHaveLength(4);
      expect(checksum).toMatch(/^[0-9A-F]{4}$/);
    });

    it('generatePayload constrói string EMV válida com chave CNPJ ISM', () => {
      const payload = PixGeneratorService.generatePayload({ valor: 150.00 });

      expect(payload).toContain('000201'); // Format indicator
      expect(payload).toContain('br.gov.bcb.pix'); // GUI Bacen
      expect(payload).toContain('09040440000147'); // CNPJ ISM limpo
      expect(payload).toContain('5303986'); // BRL
      expect(payload).toContain('5406150.00'); // Amount 150.00
      expect(payload).toContain('BR'); // Country
      expect(payload).toContain('INSTITUTO SER MELHOR'); // Merchant
      expect(payload).toContain('SAO PAULO'); // City
      expect(payload.slice(-4)).toMatch(/^[0-9A-F]{4}$/); // CRC16 at the end
    });

    it('generatePayload suporta valor dinâmico arbitrário', () => {
      const payload10 = PixGeneratorService.generatePayload({ valor: 10.00 });
      const payload500 = PixGeneratorService.generatePayload({ valor: 500.50 });

      expect(payload10).toContain('540510.00');
      expect(payload500).toContain('5406500.50');
    });
  });

  describe('ReceiptGeneratorService (Recibos Oficiais de Doação)', () => {
    it('buildReceiptData calcula valor social gerado via multiplicador SROI R$ 4,83x', () => {
      const receipt = ReceiptGeneratorService.buildReceiptData({
        transactionId: 'TXN-TEST-123',
        donorName: 'Maria Silva',
        donorEmail: 'maria@email.com',
        donorTaxId: '123.456.789-00',
        amount: 200,
        frequency: 'Mensal',
        pillar: 'Educação',
        paymentMethod: 'PIX Instantâneo',
      });

      expect(receipt.receiptId).toContain('REC-');
      expect(receipt.transactionId).toBe('TXN-TEST-123');
      expect(receipt.amount).toBe(200);
      expect(receipt.sroiRatio).toBe(4.83);
      expect(receipt.socialValueGenerated).toBe(200 * 4.83); // R$ 966,00
      expect(receipt.donorName).toBe('Maria Silva');
      expect(receipt.pillar).toBe('Educação');
    });

    it('trata taxId ausente atribuindo "Não informado"', () => {
      const receipt = ReceiptGeneratorService.buildReceiptData({
        transactionId: 'TXN-TEST-456',
        donorName: 'João Santos',
        donorEmail: 'joao@email.com',
        amount: 50,
        frequency: 'Única',
        pillar: 'Geral',
        paymentMethod: 'Cartão de Crédito',
      });

      expect(receipt.donorTaxId).toBe('Não informado');
    });
  });
});
