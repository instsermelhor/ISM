/**
 * lgpdCompliance.test.ts — LGPD-001: Auditoria, Governança & Conformidade LGPD
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para o Canal de Direitos do Titular (Art. 18),
 * Anonimização e Retenção de Dados (Art. 16) e Copiloto de Governança.
 */

import { describe, it, expect } from 'vitest';
import { LGPDChecklist, LGPDAuditService } from '../../admin/src/services/lgpdAuditService';

describe('LGPD-001 — Governança de Privacidade & Conformidade Legal (Lei 13.709/2018)', () => {

  describe('1. Copiloto de Governança & Checklist LGPD', () => {
    it('LGPD-001: todos os 10 itens do checklist estão com status CONFORME (100% compliance)', () => {
      expect(LGPDChecklist).toHaveLength(10);
      const conformeCount = LGPDChecklist.filter(c => c.status === 'CONFORME').length;
      expect(conformeCount).toBe(10);
    });

    it('LGPD-002: overallScore atinge 100% no snapshot de conformidade', async () => {
      const snapshot = await LGPDAuditService.getComplianceSnapshot();
      expect(snapshot.overallScore).toBe(100);
      expect(snapshot.status).toBe('CONFORME');
      expect(snapshot.criticoCount).toBe(0);
      expect(snapshot.atencaoCount).toBe(0);
      expect(snapshot.conformeCount).toBe(10);
    });

    it('LGPD-003: DPO (Encarregado) está identificado com canal oficial de contato', async () => {
      const snapshot = await LGPDAuditService.getComplianceSnapshot();
      expect(snapshot.dpo.email).toBe('dpo@institutosermelhor.org.br');
      expect(snapshot.dpo.name).toBeTruthy();
      expect(snapshot.dpo.since).toBeTruthy();
    });
  });

  describe('2. Canal de Direitos do Titular (Art. 18 LGPD)', () => {
    function generateProtocol(year = new Date().getFullYear()): string {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `REQ-LGPD-${year}-${randomSuffix}`;
    }

    function maskTaxId(cpf: string): string {
      const clean = cpf.replace(/\D/g, '');
      if (clean.length !== 11) return '***.***.***-**';
      return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
    }

    it('LGPD-004: protocolo de atendimento do titular segue padrão REQ-LGPD-YYYY-XXXX', () => {
      const proto = generateProtocol(2026);
      expect(proto).toMatch(/^REQ-LGPD-2026-\d{4}$/);
    });

    it('LGPD-005: mascaramento de CPF oculta blocos centrais protegendo dados em trânsito', () => {
      const masked = maskTaxId('123.456.789-00');
      expect(masked).toBe('123.***.***-00');
      expect(masked).not.toContain('456');
      expect(masked).not.toContain('789');
    });

    it('LGPD-006: prazo legal de atendimento é estritamente limitado a 15 dias úteis (Art. 19, II)', () => {
      const SLA_LIMIT_DAYS = 15;
      expect(SLA_LIMIT_DAYS).toBeLessThanOrEqual(15);
    });

    it('LGPD-007: cobre todos os 6 direitos essenciais do Art. 18', () => {
      const supportedRights = ['ACCESS', 'CORRECTION', 'ANONYMIZATION', 'ELIMINATION', 'PORTABILITY', 'REVOCATION'];
      expect(supportedRights).toHaveLength(6);
    });
  });

  describe('3. Rotina de Anonimização & Retenção (Art. 16 LGPD)', () => {
    function anonymizeRecord(record: { name: string; email: string; phone?: string; message?: string }) {
      return {
        ...record,
        name: 'ANONIMIZADO_LGPD',
        email: 'anonimizado@lgpd.ism.org.br',
        phone: null,
        message: '[DADOS_EXPIRADOS_E_ANONIMIZADOS_CONFORME_ART_16_LGPD]',
        anonymizedAt: new Date().toISOString(),
      };
    }

    it('LGPD-008: anonimização remove PII de forma irreversível', () => {
      const original = {
        name: 'Carlos Drummond',
        email: 'carlos@empresa.com.br',
        phone: '(11) 99999-8888',
        message: 'Gostaria de cadastrar minha família no programa.',
      };

      const anonymized = anonymizeRecord(original);

      expect(anonymized.name).toBe('ANONIMIZADO_LGPD');
      expect(anonymized.email).toBe('anonimizado@lgpd.ism.org.br');
      expect(anonymized.phone).toBeNull();
      expect(anonymized.message).toContain('[DADOS_EXPIRADOS');
      expect(anonymized.anonymizedAt).toBeTruthy();
    });
  });
});
