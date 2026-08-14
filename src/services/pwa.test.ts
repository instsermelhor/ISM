/**
 * pwa.test.ts — PWA-001: Testes de PWA & Suporte Offline Avançado
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para a infraestrutura PWA, manifesto e fila offline do Instituto Ser Melhor.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PWARegisterService } from './pwaRegisterService';
import { OfflineQueueService } from './offlineQueueService';
import manifest from '../../public/manifest.json';

describe('PWA-001 — Progressive Web App & Suporte Offline Avançado', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Web App Manifest (manifest.json)', () => {
    it('contém nome oficial e nome curto corretos', () => {
      expect(manifest.name).toContain('Instituto Ser Melhor');
      expect(manifest.short_name).toBe('Ser Melhor');
    });

    it('está configurado com modo standalone e cores da marca (#16a34a)', () => {
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#16a34a');
      expect(manifest.background_color).toBe('#ffffff');
      expect(manifest.lang).toBe('pt-BR');
    });

    it('inclui ícones obrigatórios (192x192 e 512x512 maskable)', () => {
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
      const sizes = manifest.icons.map((i) => i.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
    });

    it('define shortcuts institucionais (Doação, Projetos, Transparência)', () => {
      expect(manifest.shortcuts).toBeDefined();
      expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);
      const urls = manifest.shortcuts.map((s) => s.url);
      expect(urls).toContain('/#donate');
      expect(urls).toContain('/#programs');
      expect(urls).toContain('/#transparency');
    });
  });

  describe('PWARegisterService', () => {
    it('isStandalone retorna boolean sem lançar exceção', () => {
      const standalone = PWARegisterService.isStandalone();
      expect(typeof standalone).toBe('boolean');
    });

    it('promptInstall retorna false quando não há prompt adiado', async () => {
      const result = await PWARegisterService.promptInstall();
      expect(result).toBe(false);
    });

    it('isInstallPromptAvailable retorna boolean de disponibilidade', () => {
      const available = PWARegisterService.isInstallPromptAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('OfflineQueueService (IndexedDB & Fallback)', () => {
    it('PWA-001: Enfileira submissão offline e gera ID único com timestamp', async () => {
      const payload = { name: 'João Silva', email: 'joao@example.com', message: 'Quero ajudar' };
      const sub = await OfflineQueueService.enqueue('LEAD', '/api/v2/leads', payload);

      expect(sub.id).toBeDefined();
      expect(sub.id).toMatch(/^sub_/);
      expect(sub.type).toBe('LEAD');
      expect(sub.endpoint).toBe('/api/v2/leads');
      expect(sub.payload).toEqual(payload);
      expect(sub.timestamp).toBeDefined();
      expect(sub.attempts).toBe(0);
    });

    it('PWA-002: getCount reflete itens inseridos na fila', async () => {
      const initialCount = await OfflineQueueService.getCount();
      await OfflineQueueService.enqueue('VOLUNTEER', '/api/v2/volunteers', { role: 'Educador' });
      const newCount = await OfflineQueueService.getCount();
      expect(newCount).toBe(initialCount + 1);
    });

    it('PWA-003: getAll retorna array com todas as submissões pendentes', async () => {
      const all = await OfflineQueueService.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    it('PWA-004: remove remove submissão pelo ID e decrementa contagem', async () => {
      const sub = await OfflineQueueService.enqueue('CONTACT', '/api/v2/contact', { text: 'Olá' });
      const countBefore = await OfflineQueueService.getCount();
      await OfflineQueueService.remove(sub.id);
      const countAfter = await OfflineQueueService.getCount();
      expect(countAfter).toBe(countBefore - 1);
    });

    it('PWA-005: subscribe notifica assinantes quando a contagem muda', async () => {
      let notifiedCount = -1;
      const unsubscribe = OfflineQueueService.subscribe((count) => {
        notifiedCount = count;
      });

      const sub = await OfflineQueueService.enqueue('LGPD_DSR', '/api/v2/lgpd/requests', { type: 'ACCESS' });
      expect(notifiedCount).toBeGreaterThanOrEqual(1);

      await OfflineQueueService.remove(sub.id);
      unsubscribe();
    });

    it('PWA-006: flushQueue processa submissões com sucesso quando fetch responde 200', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      // Limpa qualquer item anterior
      const existing = await OfflineQueueService.getAll();
      for (const item of existing) {
        await OfflineQueueService.remove(item.id);
      }

      await OfflineQueueService.enqueue('LEAD', '/api/v2/leads', { name: 'Teste' });
      const result = await OfflineQueueService.flushQueue();

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);

      const remaining = await OfflineQueueService.getCount();
      expect(remaining).toBe(0);
    });
  });
});
