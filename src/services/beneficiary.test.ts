/**
 * beneficiary.test.ts — G002: Testes Unitários do Portal do Beneficiário
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: autenticação por CPF, cadastro de nova família, solicitação de benefícios
 * e cálculos de renda per capita.
 */

import { describe, it, expect } from 'vitest';
import { BeneficiaryService, RegisterFamilyPayload } from './beneficiaryService';

describe('G002 — BeneficiaryService (Portal do Beneficiário & Cadastro Familiar)', () => {
  describe('login()', () => {
    it('autentica beneficiário cadastrado por CPF (formato numérico ou formatado)', async () => {
      const profile = await BeneficiaryService.login('123.456.789-00');
      expect(profile.responsibleName).toBe('Maria das Graças Silva');
      expect(profile.protocolNumber).toBe('ISM-FAM-2026-0104');
      expect(profile.status).toBe('ACTIVE');
    });

    it('autentica beneficiário cadastrado por número de protocolo', async () => {
      const profile = await BeneficiaryService.login('ISM-FAM-2026-0104');
      expect(profile.responsibleName).toBe('Maria das Graças Silva');
    });

    it('lança erro para CPF não encontrado', async () => {
      await expect(BeneficiaryService.login('99999999999')).rejects.toThrow(
        'Cadastro não encontrado'
      );
    });
  });

  describe('registerFamily()', () => {
    it('realiza novo cadastro familiar e calcula renda per capita', async () => {
      const payload: RegisterFamilyPayload = {
        responsibleName: 'Carlos Eduardo Oliveira',
        cpf: '987.654.321-11',
        nis: '109.87654.32-1',
        phone: '(11) 97777-6666',
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        familyMembers: [
          { name: 'Luciana Oliveira', age: 35, relationship: 'Cônjuge' },
          { name: 'Pedro Oliveira', age: 6, relationship: 'Filho(a)', isStudent: true },
        ],
        monthlyIncome: 1500.0, // 3 pessoas (Carlos + 2 dependentes) -> 500 per capita
      };

      const newProfile = await BeneficiaryService.registerFamily(payload);

      expect(newProfile.responsibleName).toBe('Carlos Eduardo Oliveira');
      expect(newProfile.familyMembersCount).toBe(3);
      expect(newProfile.monthlyIncomePerCapita).toBe(500.0);
      expect(newProfile.status).toBe('UNDER_REVIEW');
      expect(newProfile.protocolNumber).toMatch(/^ISM-FAM-2026-\d{4}$/);
    });

    it('rejeita CPF inválido com menos de 11 dígitos', async () => {
      const invalidPayload: any = {
        responsibleName: 'Teste',
        cpf: '123',
        familyMembers: [],
        monthlyIncome: 1000,
      };

      await expect(BeneficiaryService.registerFamily(invalidPayload)).rejects.toThrow(
        'CPF inválido'
      );
    });
  });

  describe('requestBenefit()', () => {
    it('cria novo agendamento de benefício para beneficiário autenticado', async () => {
      const appointment = await BeneficiaryService.requestBenefit(
        '12345678900',
        'CESTA_ALIMENTAR',
        '2026-08-20',
        '10:00'
      );

      expect(appointment.title).toBe('Retirada de Cesta Nutricional');
      expect(appointment.status).toBe('AGENDADO');
      expect(appointment.date).toBe('2026-08-20');
      expect(appointment.time).toBe('10:00');
    });
  });
});
