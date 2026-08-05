/**
 * volunteer.test.ts — G003: Testes Unitários do Sistema de Voluntários
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: catálogo de vagas, login, cadastro de voluntário, lançamento de horas e certificado.
 */

import { describe, it, expect } from 'vitest';
import { VolunteerService, RegisterVolunteerPayload } from './volunteerService';

describe('G003 — VolunteerService (Programa de Voluntariado & Horas Registradas)', () => {
  describe('getOpportunities()', () => {
    it('retorna todas as oportunidades de voluntariado cadastradas', () => {
      const opps = VolunteerService.getOpportunities('ALL');
      expect(opps.length).toBeGreaterThanOrEqual(5);
    });

    it('filtra vagas por área de atuação (ex: EDUCACAO)', () => {
      const eduOpps = VolunteerService.getOpportunities('EDUCACAO');
      expect(eduOpps.length).toBeGreaterThan(0);
      eduOpps.forEach((op) => {
        expect(op.area).toBe('EDUCACAO');
      });
    });
  });

  describe('login()', () => {
    it('autentica voluntário cadastrado por e-mail ou número de registro', async () => {
      const profile = await VolunteerService.login('voluntario@exemplo.com');
      expect(profile.name).toBe('Ana Beatriz Souza');
      expect(profile.registrationNumber).toBe('ISM-VOL-2026-0014');
      expect(profile.totalHoursApproved).toBe(42);
    });

    it('lança erro para voluntário não encontrado', async () => {
      await expect(VolunteerService.login('inexistente@exemplo.com')).rejects.toThrow(
        'Voluntário não encontrado'
      );
    });
  });

  describe('registerVolunteer()', () => {
    it('cadastra novo voluntário com sucesso', async () => {
      const payload: RegisterVolunteerPayload = {
        name: 'Fernando Guimarães',
        email: 'fernando.vol@exemplo.com',
        phone: '(11) 91111-2222',
        cpf: '111.222.333-44',
        areasOfInterest: ['MEIO_AMBIENTE', 'SAUDE_BEM_ESTAR'],
      };

      const newProfile = await VolunteerService.registerVolunteer(payload);

      expect(newProfile.name).toBe('Fernando Guimarães');
      expect(newProfile.totalHoursApproved).toBe(0);
      expect(newProfile.registrationNumber).toMatch(/^ISM-VOL-2026-\d+$/);
    });

    it('rejeita e-mail duplicado', async () => {
      const duplicatePayload: RegisterVolunteerPayload = {
        name: 'Duplicado',
        email: 'voluntario@exemplo.com',
        phone: '(11) 90000-0000',
        cpf: '000.000.000-00',
        areasOfInterest: ['EDUCACAO'],
      };

      await expect(VolunteerService.registerVolunteer(duplicatePayload)).rejects.toThrow(
        'Este e-mail já está cadastrado'
      );
    });
  });

  describe('logHours() e generateCertificateData()', () => {
    it('registra novas horas de voluntariado com status PENDENTE', async () => {
      const log = await VolunteerService.logHours(
        'voluntario@exemplo.com',
        'Educador de Reforço Escolar',
        '2026-08-05',
        5,
        'Oficina de gramática aplicada'
      );

      expect(log.status).toBe('PENDENTE');
      expect(log.hoursSpent).toBe(5);
    });

    it('gera dados válidos para emissão de Certificado de Voluntariado', async () => {
      const profile = await VolunteerService.login('voluntario@exemplo.com');
      const cert = VolunteerService.generateCertificateData(profile);

      expect(cert.recipientName).toBe('Ana Beatriz Souza');
      expect(cert.totalHours).toBe(42);
      expect(cert.organizationName).toBe('Instituto Ser Melhor');
      expect(cert.authenticityUrl).toContain('ISM-VOL-2026-0014');
    });
  });
});
