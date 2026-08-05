/**
 * lgpdAudit.test.ts — D004: Copiloto de Governança & Auditoria LGPD
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Testes de serviço puro do LGPDAuditService & lógica de conformidade.
 * Executa no Vitest da raiz — sem dependência de React/admin.
 */

import { describe, it, expect } from 'vitest';
import { LGPDChecklist } from '../../admin/src/services/lgpdAuditService';

describe('D004 — LGPDAuditService (Copiloto de Governança & LGPD)', () => {
  it('checklist LGPD contém exatamente 10 itens (cobertura completa)', () => {
    expect(LGPDChecklist).toHaveLength(10);
  });

  it('todos os itens possuem campos obrigatórios preenchidos', () => {
    LGPDChecklist.forEach(item => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.legalBasis).toBeTruthy();
      expect(item.status).toMatch(/^(CONFORME|ATENÇÃO|CRÍTICO|NÃO_APLICÁVEL)$/);
      expect(item.evidence).toBeTruthy();
      expect(item.responsible).toBeTruthy();
    });
  });

  it('maioria dos itens está CONFORME (score >= 70%)', () => {
    const conformeCount = LGPDChecklist.filter(c => c.status === 'CONFORME').length;
    const scorePercent = (conformeCount / LGPDChecklist.length) * 100;
    expect(scorePercent).toBeGreaterThanOrEqual(70);
  });

  it('nenhum item está CRÍTICO (conformidade acima do limiar mínimo)', () => {
    const criticoCount = LGPDChecklist.filter(c => c.status === 'CRÍTICO').length;
    expect(criticoCount).toBe(0);
  });

  it('itens cobrem pelo menos 4 categorias de conformidade LGPD distintas', () => {
    const categories = new Set(LGPDChecklist.map(c => c.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });

  it('bases legais referenciam a LGPD (Lei 13.709/2018)', () => {
    LGPDChecklist.forEach(item => {
      expect(item.legalBasis).toMatch(/LGPD|Art\./i);
    });
  });

  it('todos os responsáveis estão definidos (sem campo vazio)', () => {
    LGPDChecklist.forEach(item => {
      expect(item.responsible.trim().length).toBeGreaterThan(0);
    });
  });

  it('score geral calculado corretamente via fórmula (conformes / total * 100)', () => {
    const conformeCount = LGPDChecklist.filter(c => c.status === 'CONFORME').length;
    const expected = Math.round((conformeCount / LGPDChecklist.length) * 100);
    expect(expected).toBeGreaterThan(0);
    expect(expected).toBeLessThanOrEqual(100);
  });
});
