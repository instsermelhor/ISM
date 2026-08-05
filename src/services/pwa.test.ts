/**
 * pwa.test.ts — F001: Testes de PWA & Suporte Offline Avançado
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para a infraestrutura PWA e manifesto do Instituto Ser Melhor.
 */

import { describe, it, expect } from 'vitest';
import { PWARegisterService } from './pwaRegisterService';
import manifest from '../../public/manifest.json';

describe('F001 — PWA & Suporte Offline Avançado', () => {

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
      const sizes = manifest.icons.map(i => i.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
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
  });
});
