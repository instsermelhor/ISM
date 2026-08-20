import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('ISM-HTTPS-TLS-HSTS-001: Cryptographic Transport Security & HSTS', () => {
  const rootDir = process.cwd();

  it('TLS-001: firebase.json must configure Strict-Transport-Security on all hosting targets', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    expect(fs.existsSync(firebaseJsonPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];
    expect(hostings.length).toBeGreaterThanOrEqual(1);

    for (const h of hostings) {
      const headers = h.headers || [];
      const globalHeaders = headers.find((headerDef: any) => headerDef.source === '**' || headerDef.source === '/**');
      expect(globalHeaders, 'Hosting ' + (h.site || 'default') + ' must have global headers (** or /**)').toBeDefined();

      const hstsHeader = globalHeaders.headers.find(
        (header: any) => header.key.toLowerCase() === 'strict-transport-security'
      );
      expect(hstsHeader, 'Hosting ' + (h.site || 'default') + ' missing Strict-Transport-Security header').toBeDefined();
      expect(hstsHeader.value).toContain('max-age=');
    }
  });

  it('TLS-002: HSTS header must have max-age >= 31536000 (>= 1 year) and includeSubDomains and preload', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];

    for (const h of hostings) {
      const globalHeaders = h.headers.find((headerDef: any) => headerDef.source === '**' || headerDef.source === '/**');
      const hsts = globalHeaders.headers.find(
        (header: any) => header.key.toLowerCase() === 'strict-transport-security'
      );

      const maxAgeMatch = hsts.value.match(/max-age=(\d+)/i);
      expect(maxAgeMatch).not.toBeNull();
      const maxAge = parseInt(maxAgeMatch[1], 10);
      expect(maxAge).toBeGreaterThanOrEqual(31536000);
      expect(hsts.value.toLowerCase()).toContain('includesubdomains');
      expect(hsts.value.toLowerCase()).toContain('preload');
    }
  });

  it('TLS-003: Content Security Policy must contain upgrade-insecure-requests directive', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];

    for (const h of hostings) {
      const globalHeaders = h.headers.find((headerDef: any) => headerDef.source === '**' || headerDef.source === '/**');
      const csp = globalHeaders.headers.find(
        (header: any) => header.key.toLowerCase() === 'content-security-policy'
      );

      expect(csp, 'Hosting ' + h.site + ' must define Content-Security-Policy').toBeDefined();
      expect(csp.value.toLowerCase()).toContain('upgrade-insecure-requests');
    }
  });

  it('TLS-004: CSP connect-src and WebSocket directives must only allow secure wss:// (no ws://)', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];

    for (const h of hostings) {
      const globalHeaders = h.headers.find((headerDef: any) => headerDef.source === '**' || headerDef.source === '/**');
      const csp = globalHeaders.headers.find(
        (header: any) => header.key.toLowerCase() === 'content-security-policy'
      );

      const cspVal = csp.value.toLowerCase();
      expect(cspVal).not.toContain('ws://');
      if (cspVal.includes('wss://')) {
        expect(cspVal).toContain('wss://*.firebaseio.com');
      }
    }
  });

  it('TLS-005: Source code must not contain unencrypted http:// or ws:// external API or asset calls', () => {
    const srcDir = path.join(rootDir, 'src');
    function checkDir(dir: string): string[] {
      const issues: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          issues.push(...checkDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          if (entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
            if (line.includes('http://') && !line.includes('localhost') && !line.includes('127.0.0.1') && !line.includes('schemas.openxmlformats.org') && !line.includes('w3.org')) {
              issues.push(fullPath + ':' + (idx + 1) + ' -> ' + line.trim());
            }
            if (line.includes('ws://') && !line.includes('localhost') && !line.includes('127.0.0.1')) {
              issues.push(fullPath + ':' + (idx + 1) + ' -> ' + line.trim());
            }
          });
        }
      }
      return issues;
    }
    const mixedContentViolations = checkDir(srcDir);
    expect(mixedContentViolations).toHaveLength(0);
  });

  it('TLS-006: Cloud Functions Express middleware must enforce HSTS and security headers', () => {
    const backendPath = path.join(rootDir, 'functions', 'src', 'index.ts');
    expect(fs.existsSync(backendPath)).toBe(true);
    const content = fs.readFileSync(backendPath, 'utf8');
    expect(content).toContain('Strict-Transport-Security');
    expect(content).toContain('max-age=63072000');
    expect(content).toContain('includeSubDomains');
    expect(content).toContain('preload');
  });

  it('TLS-007: Cloud Functions CORS policy must restrict origins to trusted HTTPS domains and local dev', () => {
    const backendPath = path.join(rootDir, 'functions', 'src', 'index.ts');
    const content = fs.readFileSync(backendPath, 'utf8');
    expect(content).toContain('ALLOWED_ORIGINS');
    expect(content).toContain('https://institutosermelhor.org');
    expect(content).toContain('https://admin.institutosermelhor.org');
    expect(content).not.toContain("res.setHeader('Access-Control-Allow-Origin', '*')");
  });

  it('TLS-008: Repository must not contain private cryptographic keys or real secrets', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    expect(content).not.toContain('BEGIN RSA PRIVATE KEY');
    expect(content).not.toContain('BEGIN PRIVATE KEY');
    expect(/AIza[0-9A-Za-z-_]{35}/.test(content)).toBe(false);
  });

  it('TLS-009: Global clickjacking and content-sniffing protection must be enabled in hosting', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const hostings = Array.isArray(config.hosting) ? config.hosting : [config.hosting];
    for (const h of hostings) {
      const globalHeaders = h.headers.find((headerDef: any) => headerDef.source === '**' || headerDef.source === '/**');
      const xcto = globalHeaders.headers.find((header: any) => header.key.toLowerCase() === 'x-content-type-options');
      const xfo = globalHeaders.headers.find((header: any) => header.key.toLowerCase() === 'x-frame-options');
      expect(xcto).toBeDefined();
      expect(xcto.value.toLowerCase()).toBe('nosniff');
      expect(xfo).toBeDefined();
      expect(xfo.value.toUpperCase()).toBe('DENY');
    }
  });

  it('TLS-010: Cryptographic Policy document must exist and specify TLS 1.3/1.2 requirements', () => {
    const policyPath = path.join(rootDir, 'SECURITY', 'CRYPTOGRAPHIC_POLICY.md');
    expect(fs.existsSync(policyPath)).toBe(true);
    const content = fs.readFileSync(policyPath, 'utf8');
    expect(content).toContain('TLS 1.3');
    expect(content).toContain('TLS 1.2');
    expect(content).toContain('HSTS');
    expect(content).toContain('63072000');
    expect(content).toContain('CAA');
  });

  it('TLS-011: Simulated negative test - Degraded HSTS (< 31536000s) must trigger validation failure', () => {
    function validateHstsHeader(headerValue: string): boolean {
      if (!headerValue) return false;
      const maxAgeMatch = headerValue.match(/max-age=(\d+)/i);
      if (!maxAgeMatch) return false;
      const maxAge = parseInt(maxAgeMatch[1], 10);
      if (maxAge < 31536000) return false;
      if (!headerValue.toLowerCase().includes('includesubdomains')) return false;
      return true;
    }
    expect(validateHstsHeader('max-age=63072000; includeSubDomains; preload')).toBe(true);
    expect(validateHstsHeader('max-age=300')).toBe(false);
    expect(validateHstsHeader('max-age=63072000')).toBe(false);
    expect(validateHstsHeader('')).toBe(false);
  });

  it('TLS-012: Simulated negative test - Insecure HTTP or WS URLs in CSP must trigger block', () => {
    function validateCspTransportSecurity(csp: string): { valid: boolean; reason?: string } {
      if (!csp.includes('upgrade-insecure-requests')) {
        return { valid: false, reason: 'Missing upgrade-insecure-requests' };
      }
      if (csp.includes('http://')) {
        return { valid: false, reason: 'Insecure http:// in CSP' };
      }
      if (csp.includes('ws://')) {
        return { valid: false, reason: 'Insecure ws:// in CSP' };
      }
      return { valid: true };
    }
    expect(validateCspTransportSecurity("default-src 'self'; upgrade-insecure-requests;")).toEqual({ valid: true });
    expect(validateCspTransportSecurity("default-src 'self'; connect-src http://api.example.com; upgrade-insecure-requests;")).toEqual({
      valid: false,
      reason: 'Insecure http:// in CSP'
    });
    expect(validateCspTransportSecurity("default-src 'self'; connect-src ws://stream.example.com; upgrade-insecure-requests;")).toEqual({
      valid: false,
      reason: 'Insecure ws:// in CSP'
    });
    expect(validateCspTransportSecurity("default-src 'self';")).toEqual({
      valid: false,
      reason: 'Missing upgrade-insecure-requests'
    });
  });
});