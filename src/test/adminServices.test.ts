import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialService } from '../../admin/src/services/financial';
import { LGPDAuditService } from '../../admin/src/services/lgpdAuditService';
import { BlogService } from '../../admin/src/services/blogService';

// Mocks do Firestore e FirestoreService para testes isolados sem banco
vi.mock('../../admin/src/lib/firebase', () => ({
  db: {},
  auth: { currentUser: null },
}));

vi.mock('../../admin/src/services/firestore', () => ({
  FirestoreService: {
    getDonations: vi.fn(async () => []),
    getLeads: vi.fn(async () => []),
    getDbStatus: vi.fn(async () => ({ connected: true, collections: [] })),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(async () => ({ docs: [], empty: true })),
  getDoc: vi.fn(async () => ({ exists: () => false, data: () => null })),
  setDoc: vi.fn(async () => {}),
  updateDoc: vi.fn(async () => {}),
  deleteDoc: vi.fn(async () => {}),
  query: vi.fn((...args: any[]) => args[0]),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => new Date()),
}));

describe('Suíte de Testes Unitários dos Serviços de Administração (Fase 11 — TEST-001)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. FinancialService ──────────────────────────────────────────────────
  describe('FinancialService', () => {
    it('Teste 01: FinancialService expõe métodos estáticos esperados', () => {
      expect(FinancialService.getSummary).toBeDefined();
      expect(FinancialService.getDonations).toBeDefined();
      expect(FinancialService.getDonors).toBeDefined();
    });

    it('Teste 02: getSummary() retorna objeto de resumo financeiro válido', async () => {
      const summary = await FinancialService.getSummary();
      expect(summary).toBeDefined();
      expect(summary.totalReceived).toBeGreaterThanOrEqual(0);
      expect(typeof summary.donorCount).toBe('number');
      expect(summary.byMethod).toBeDefined();
    });

    it('Teste 03: getDonations() busca lista paginada de doações', async () => {
      const result = await FinancialService.getDonations();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  // ── 2. LGPDAuditService ──────────────────────────────────────────────────
  describe('LGPDAuditService', () => {
    it('Teste 04: LGPDAuditService expõe método getComplianceSnapshot', () => {
      expect(LGPDAuditService.getComplianceSnapshot).toBeDefined();
    });

    it('Teste 05: getComplianceSnapshot() gera snapshot de conformidade com score e lista de checagens', async () => {
      const snapshot = await LGPDAuditService.getComplianceSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.overallScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(snapshot.checks)).toBe(true);
      expect(Array.isArray(snapshot.recentLogs)).toBe(true);
      expect(snapshot.dpo).toHaveProperty('email');
    });

    it('Teste 06: getComplianceSnapshot() contém informações do DPO e logs imutáveis', async () => {
      const snapshot = await LGPDAuditService.getComplianceSnapshot();
      expect(snapshot.dpo.email).toContain('dpo@');
      expect(snapshot.recentLogs.length).toBeGreaterThan(0);
      expect(snapshot.recentLogs[0]).toHaveProperty('hash');
    });
  });

  // ── 3. BlogService ───────────────────────────────────────────────────────
  describe('BlogService', () => {
    it('Teste 07: BlogService expõe métodos CRUD para gerenciamento do blog', () => {
      expect(BlogService.getAll).toBeDefined();
      expect(BlogService.getPublished).toBeDefined();
      expect(BlogService.getBySlug).toBeDefined();
    });

    it('Teste 08: getPublished() retorna apenas posts com status PUBLISHED / isPublished=true', async () => {
      const publishedPosts = await BlogService.getPublished();
      expect(Array.isArray(publishedPosts)).toBe(true);
      publishedPosts.forEach(post => {
        expect(post.isPublished ?? (post.status === 'PUBLISHED')).toBe(true);
      });
    });
  });
});
