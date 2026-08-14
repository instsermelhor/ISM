/**
 * securityHardening.test.ts — SEC-002: Testes de Hardening de Segurança & CSP Estrito
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Validações automatizadas de conformidade OWASP Top 10 e PCI-DSS para cabeçalhos HTTP,
 * políticas de Content Security Policy (CSP) e configurações de hosting.
 */

import { describe, it, expect } from 'vitest';
import firebaseConfig from '../../firebase.json';
import * as fs from 'fs';
import * as path from 'path';

describe('SEC-002 — Hardening de Segurança Enterprise & CSP', () => {
  const hostingConfigs = firebaseConfig.hosting;
  const siteConfig = hostingConfigs.find((h: any) => h.site === 'ismbd-27e84');
  const adminConfig = hostingConfigs.find((h: any) => h.site === 'ismbd-27e84-admin');

  describe('Headers de Segurança Global (Site Institucional)', () => {
    const globalHeaders = siteConfig?.headers?.find((h: any) => h.source === '**')?.headers || [];
    const getHeader = (key: string) => globalHeaders.find((h: any) => h.key.toLowerCase() === key.toLowerCase())?.value;

    it('SEC-001: HSTS está configurado com 2 anos (63072000s), includeSubDomains e preload', () => {
      const hsts = getHeader('Strict-Transport-Security');
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age=63072000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });

    it('SEC-002: X-Content-Type-Options está configurado como nosniff', () => {
      const nosniff = getHeader('X-Content-Type-Options');
      expect(nosniff).toBe('nosniff');
    });

    it('SEC-003: X-Frame-Options está configurado como DENY para prevenir clickjacking', () => {
      const xfo = getHeader('X-Frame-Options');
      expect(xfo).toBe('DENY');
    });

    it('SEC-004: Referrer-Policy está restrito a strict-origin-when-cross-origin', () => {
      const ref = getHeader('Referrer-Policy');
      expect(ref).toBe('strict-origin-when-cross-origin');
    });

    it('SEC-005: Permissions-Policy restringe hardware desnecessário (câmera, microfone, geolocalização)', () => {
      const perm = getHeader('Permissions-Policy');
      expect(perm).toBeDefined();
      expect(perm).toContain('camera=()');
      expect(perm).toContain('microphone=()');
      expect(perm).toContain('geolocation=()');
    });

    it('SEC-006: COOP e CORP estão configurados para isolamento de contexto', () => {
      const coop = getHeader('Cross-Origin-Opener-Policy');
      const corp = getHeader('Cross-Origin-Resource-Policy');
      expect(coop).toBe('same-origin-allow-popups');
      expect(corp).toBe('same-site');
    });
  });

  describe('Content Security Policy (CSP — Site Institucional)', () => {
    const globalHeaders = siteConfig?.headers?.find((h: any) => h.source === '**')?.headers || [];
    const csp = globalHeaders.find((h: any) => h.key === 'Content-Security-Policy')?.value || '';

    it('SEC-007: CSP define default-src como self (Princípio de Menor Privilégio)', () => {
      expect(csp).toContain("default-src 'self'");
    });

    it('SEC-008: CSP proíbe unsafe-eval em script-src', () => {
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('SEC-009: CSP define object-src como none para prevenir injeção de plugins', () => {
      expect(csp).toContain("object-src 'none'");
    });

    it('SEC-010: CSP define frame-ancestors como none contra clickjacking', () => {
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('SEC-011: CSP restringe base-uri a self', () => {
      expect(csp).toContain("base-uri 'self'");
    });

    it('SEC-012: CSP inclui upgrade-insecure-requests para forçar HTTPS', () => {
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('SEC-013: CSP autoriza domínios seguros de pagamento (Stripe) em script-src e frame-src', () => {
      expect(csp).toContain('https://js.stripe.com');
      expect(csp).toContain('https://hooks.stripe.com');
    });
  });

  describe('Headers de Segurança (Painel Administrativo)', () => {
    const adminHeaders = adminConfig?.headers?.find((h: any) => h.source === '**')?.headers || [];
    const getAdminHeader = (key: string) => adminHeaders.find((h: any) => h.key.toLowerCase() === key.toLowerCase())?.value;
    const adminCsp = adminHeaders.find((h: any) => h.key === 'Content-Security-Policy')?.value || '';

    it('SEC-014: Admin possui COOP same-origin estrito e CORP same-origin', () => {
      expect(getAdminHeader('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(getAdminHeader('Cross-Origin-Resource-Policy')).toBe('same-origin');
    });

    it('SEC-015: Admin CSP proíbe iframes externos (frame-src none)', () => {
      expect(adminCsp).toContain("frame-src 'none'");
      expect(adminCsp).toContain("frame-ancestors 'none'");
    });
  });

  describe('HTML Meta Security Tags', () => {
    it('SEC-016: admin/index.html contém diretiva noindex, nofollow para privacidade', () => {
      const adminHtmlPath = path.resolve(__dirname, '../../admin/index.html');
      const content = fs.readFileSync(adminHtmlPath, 'utf-8');
      expect(content).toContain('name="robots"');
      expect(content).toContain('noindex, nofollow');
    });

    it('SEC-017: index.html possui viewport-fit=cover e meta charset UTF-8', () => {
      const rootHtmlPath = path.resolve(__dirname, '../../index.html');
      const content = fs.readFileSync(rootHtmlPath, 'utf-8');
      expect(content).toContain('charset="UTF-8"');
      expect(content).toContain('viewport-fit=cover');
    });
  });
});
