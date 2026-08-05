/**
 * atuacaoMap.test.ts — G001: Testes Unitários do Serviço de Mapa de Atuação
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: busca, filtragem por pilar, estatísticas agregadas e ordenação.
 */

import { describe, it, expect } from 'vitest';
import { AtuacaoMapService, MUNICIPALITIES } from './atuacaoMapService';

describe('G001 — AtuacaoMapService (Mapa de Atuação Nacional)', () => {

  describe('getAll()', () => {
    it('retorna todos os 12 municípios cadastrados', () => {
      const all = AtuacaoMapService.getAll();
      expect(all.length).toBe(12);
      expect(all.length).toBe(MUNICIPALITIES.length);
    });

    it('cada município possui coordenadas SVG e pilar primário válido', () => {
      const all = AtuacaoMapService.getAll();
      all.forEach((m) => {
        expect(m.id).toBeTruthy();
        expect(m.name).toBeTruthy();
        expect(m.stateAbbr).toHaveLength(2);
        expect(m.svgX).toBeGreaterThan(0);
        expect(m.svgY).toBeGreaterThan(0);
        expect(['SOCIAL', 'AMBIENTAL', 'EDUCACAO', 'CULTURAL']).toContain(m.primaryPillar);
        expect(m.sroi).toBeGreaterThan(0);
        expect(m.beneficiaries).toBeGreaterThan(0);
      });
    });
  });

  describe('filterByPillar()', () => {
    it('retorna todos quando o pilar é ALL', () => {
      const res = AtuacaoMapService.filterByPillar('ALL');
      expect(res.length).toBe(12);
    });

    it('filtra apenas municípios que contêm o pilar AMBIENTAL', () => {
      const res = AtuacaoMapService.filterByPillar('AMBIENTAL');
      expect(res.length).toBeGreaterThan(0);
      res.forEach((m) => {
        expect(m.pillars).toContain('AMBIENTAL');
      });
    });

    it('filtra apenas municípios que contêm o pilar CULTURAL', () => {
      const res = AtuacaoMapService.filterByPillar('CULTURAL');
      expect(res.length).toBeGreaterThan(0);
      res.forEach((m) => {
        expect(m.pillars).toContain('CULTURAL');
      });
    });
  });

  describe('filterByRegion()', () => {
    it('filtra municípios da região SUDESTE', () => {
      const res = AtuacaoMapService.filterByRegion('SUDESTE');
      expect(res.length).toBeGreaterThan(0);
      res.forEach((m) => {
        expect(m.region).toBe('SUDESTE');
      });
    });

    it('filtra municípios da região NORTE', () => {
      const res = AtuacaoMapService.filterByRegion('NORTE');
      expect(res.length).toBe(2); // Manaus e Belém
    });
  });

  describe('search()', () => {
    it('busca município por nome (ex: Manaus)', () => {
      const res = AtuacaoMapService.search('Manaus');
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Manaus');
    });

    it('busca município por sigla de estado (ex: SP)', () => {
      const res = AtuacaoMapService.search('SP');
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('São Paulo');
    });

    it('retorna array vazio quando nenhum município corresponde', () => {
      const res = AtuacaoMapService.search('CidadeInexistente999');
      expect(res.length).toBe(0);
    });
  });

  describe('getStats()', () => {
    it('calcula estatísticas agregadas corretamente', () => {
      const stats = AtuacaoMapService.getStats();
      expect(stats.totalMunicipalities).toBe(12);
      expect(stats.totalStates).toBe(12);
      expect(stats.regions).toBe(5);
      expect(stats.totalBeneficiaries).toBeGreaterThan(50000);
      expect(stats.totalProjects).toBeGreaterThan(50);
      expect(stats.avgSROI).toBeGreaterThan(3.5);
    });
  });

  describe('getTopByBeneficiaries()', () => {
    it('retorna os top 5 municípios ordenados por beneficiários em ordem decrescente', () => {
      const top = AtuacaoMapService.getTopByBeneficiaries(5);
      expect(top.length).toBe(5);
      for (let i = 0; i < top.length - 1; i++) {
        expect(top[i].beneficiaries).toBeGreaterThanOrEqual(top[i + 1].beneficiaries);
      }
    });
  });
});
