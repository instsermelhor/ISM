/**
 * goLiveHardening.test.ts — Fase 15 / HARDENING-004
 * Suíte de Testes de Hardening de Produção & Verificação de Go-Live
 * Valida integridade das configurações de segurança HTTP, CORS,
 * Rate Limit, CSP, HSTS, e integridade da estrutura de serviços críticos.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// 1. VALIDAÇÃO DO firebase.json — HEADERS HTTP & CSP
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 15 — Hardening: firebase.json — Cabeçalhos de Segurança HTTP', () => {

  const firebaseConfigPath = path.resolve(__dirname, '../../firebase.json');
  let firebaseConfig: any;

  it('firebase.json deve existir e ser JSON válido', () => {
    expect(fs.existsSync(firebaseConfigPath)).toBe(true);
    const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
    expect(() => { firebaseConfig = JSON.parse(raw); }).not.toThrow();
  });

  it('deve possuir configuração de hosting para o site institucional (ismbd-27e84)', () => {
    const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
    firebaseConfig = JSON.parse(raw);
    const institutionalSite = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84');
    expect(institutionalSite).toBeDefined();
  });

  it('deve possuir configuração de hosting para o painel administrativo (ismbd-27e84-admin)', () => {
    const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
    firebaseConfig = JSON.parse(raw);
    const adminSite = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84-admin');
    expect(adminSite).toBeDefined();
  });

  describe('Site Institucional — Headers de segurança', () => {
    let globalHeaders: Record<string, string> = {};

    it('deve ter bloco de headers global para source "**"', () => {
      const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
      firebaseConfig = JSON.parse(raw);
      const site = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84');
      const globalBlock = site?.headers?.find((b: any) => b.source === '**');
      expect(globalBlock).toBeDefined();
      globalHeaders = Object.fromEntries(globalBlock.headers.map((h: any) => [h.key.toLowerCase(), h.value]));
    });

    it('HSTS: max-age ≥ 63072000 com includeSubDomains e preload', () => {
      const hsts = globalHeaders['strict-transport-security'] ?? '';
      expect(hsts).toContain('max-age=63072000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });

    it('X-Content-Type-Options: deve ser "nosniff"', () => {
      expect(globalHeaders['x-content-type-options']).toBe('nosniff');
    });

    it('X-Frame-Options: deve ser "DENY"', () => {
      expect(globalHeaders['x-frame-options']).toBe('DENY');
    });

    it('Referrer-Policy: deve ser "strict-origin-when-cross-origin"', () => {
      expect(globalHeaders['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('Permissions-Policy: deve restringir câmera, microfone e geolocalização', () => {
      const pp = globalHeaders['permissions-policy'] ?? '';
      expect(pp).toContain('camera=()');
      expect(pp).toContain('microphone=()');
      expect(pp).toContain('geolocation=()');
    });

    it('CSP: deve conter frame-ancestors "none" (anti-clickjacking)', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('CSP: deve conter object-src "none" (bloqueia Flash/plugins)', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("object-src 'none'");
    });

    it('CSP: deve conter base-uri "self"', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("base-uri 'self'");
    });

    it('CSP: deve liberar scripts do Stripe (js.stripe.com)', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain('js.stripe.com');
    });

    it('CSP: deve liberar connect-src para api.stripe.com', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain('api.stripe.com');
    });

    it('CSP: deve conter upgrade-insecure-requests', () => {
      const csp = globalHeaders['content-security-policy'] ?? '';
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('deve ter política de cache imutável para /assets/**', () => {
      const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
      firebaseConfig = JSON.parse(raw);
      const site = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84');
      const assetsBlock = site?.headers?.find((b: any) => b.source === '/assets/**');
      expect(assetsBlock).toBeDefined();
      const cacheControl = assetsBlock.headers.find((h: any) => h.key === 'Cache-Control')?.value ?? '';
      expect(cacheControl).toContain('immutable');
      expect(cacheControl).toContain('max-age=31536000');
    });

    it('deve ter Cache-Control no-cache para /sw.js', () => {
      const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
      firebaseConfig = JSON.parse(raw);
      const site = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84');
      const swBlock = site?.headers?.find((b: any) => b.source === '/sw.js');
      expect(swBlock).toBeDefined();
      const cacheControl = swBlock.headers.find((h: any) => h.key === 'Cache-Control')?.value ?? '';
      expect(cacheControl).toContain('no-cache');
    });
  });

  describe('Painel Administrativo — Headers de segurança', () => {
    let adminHeaders: Record<string, string> = {};

    it('deve ter bloco de headers global para source "**" no painel admin', () => {
      const raw = fs.readFileSync(firebaseConfigPath, 'utf-8');
      firebaseConfig = JSON.parse(raw);
      const site = firebaseConfig.hosting?.find((h: any) => h.site === 'ismbd-27e84-admin');
      const globalBlock = site?.headers?.find((b: any) => b.source === '**');
      expect(globalBlock).toBeDefined();
      adminHeaders = Object.fromEntries(globalBlock.headers.map((h: any) => [h.key.toLowerCase(), h.value]));
    });

    it('Admin HSTS: max-age ≥ 63072000', () => {
      const hsts = adminHeaders['strict-transport-security'] ?? '';
      expect(hsts).toContain('max-age=63072000');
    });

    it('Admin CSP: frame-ancestors "none" — painel não pode ser embutido em iframe', () => {
      const csp = adminHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('Admin CSP: object-src "none"', () => {
      const csp = adminHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("object-src 'none'");
    });

    it('Admin CSP: frame-src "none" — painel não carrega iframes externos', () => {
      const csp = adminHeaders['content-security-policy'] ?? '';
      expect(csp).toContain("frame-src 'none'");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. VALIDAÇÃO DO functions/src/index.ts — MIDDLEWARE DE SEGURANÇA HTTP
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 15 — Hardening: functions/src/index.ts — Middleware de Segurança', () => {
  const functionsPath = path.resolve(__dirname, '../../functions/src/index.ts');
  let source: string;

  it('arquivo de functions deve existir', () => {
    expect(fs.existsSync(functionsPath)).toBe(true);
    source = fs.readFileSync(functionsPath, 'utf-8');
  });

  it('deve desabilitar o cabeçalho X-Powered-By (anti-fingerprinting)', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain("app.disable('x-powered-by')");
  });

  it('deve injetar cabeçalho Strict-Transport-Security via middleware', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('Strict-Transport-Security');
    expect(source).toContain('63072000');
  });

  it('deve injetar cabeçalho X-Content-Type-Options via middleware', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('X-Content-Type-Options');
    expect(source).toContain('nosniff');
  });

  it('deve injetar cabeçalho X-Frame-Options via middleware', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('X-Frame-Options');
    expect(source).toContain('DENY');
  });

  it('deve injetar Cache-Control no-store para respostas de API', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('Cache-Control');
    expect(source).toContain('no-store');
  });

  it('deve ter lista de ALLOWED_ORIGINS definida e restrita', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('ALLOWED_ORIGINS');
    expect(source).toContain('institutosermelhor.org');
    // localhost presente apenas para desenvolvimento
    expect(source).toContain('localhost');
  });

  it('deve ter middleware de Rate Limiting implementado', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('rateLimiterMiddleware');
    expect(source).toContain('rateLimitStore');
  });

  it('deve ter middleware de Idempotência implementado', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain('idempotencyMiddleware');
    expect(source).toContain('idempotencyStore');
  });

  it('deve ter limite de 1mb no body de requisições JSON', () => {
    source = source || fs.readFileSync(functionsPath, 'utf-8');
    expect(source).toContain("limit: '1mb'");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONFORMIDADE ESTRUTURAL DA PLATAFORMA
// ─────────────────────────────────────────────────────────────────────────────

describe('Fase 15 — Hardening: Conformidade Estrutural de Arquivos de Go-Live', () => {
  const root = path.resolve(__dirname, '../../');

  const requiredFiles = [
    'firebase.json',
    'firestore.rules',
    'public/sw.js',
    'public/manifest.json',
    'public/robots.txt',
    'public/sitemap.xml',
    'src/services/receiptGeneratorService.ts',
    'src/services/volunteerService.ts',
    'src/services/recurringDonationService.ts',
    'functions/src/index.ts',
  ];

  requiredFiles.forEach(file => {
    it(`arquivo crítico deve existir: ${file}`, () => {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    });
  });

  it('firestore.rules não deve conter regra "allow read, write: if true" (regra aberta proibida)', () => {
    const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf-8');
    expect(rules).not.toContain('allow read, write: if true');
  });

  it('robots.txt deve existir e não bloquear rastreamento completo', () => {
    const robotsPath = path.join(root, 'public/robots.txt');
    if (fs.existsSync(robotsPath)) {
      const content = fs.readFileSync(robotsPath, 'utf-8');
      // Não deve ter "Disallow: /" bloqueando tudo
      expect(content).not.toMatch(/^Disallow: \/\s*$/m);
      expect(content).toContain('Sitemap:');
    }
  });
});
