/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTITUTO SER MELHOR — SUÍTE DE TESTES DE SECRETS MANAGEMENT (SEC-SECRET-001)
 * Validações técnicas automatizadas de governança de segredos
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../..');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Lê um arquivo de forma segura (retorna string vazia se não existir) */
function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/** Verifica se um arquivo existe */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/** Padrões que indicam segredos reais (não placeholders) */
const REAL_SECRET_PATTERNS = [
  /sk_(?:test|live)_[A-Za-z0-9]{24,}/,   // Stripe Secret Key
  /sk-proj-[A-Za-z0-9_-]{32,}/,          // OpenAI API Key
  /whsec_[A-Za-z0-9]{32,}/,              // Stripe Webhook Secret
  /ghp_[A-Za-z0-9]{36}/,                 // GitHub Personal Access Token
];

/** Padrões que indicam segredos privilegiados (não devem estar no frontend) */
const PRIVILEGED_SECRET_ENV_VARS = [
  'VITE_STRIPE_SECRET_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_SMTP_PASSWORD',
  'VITE_WEBHOOK_SECRET',
  'VITE_DATABASE_URL',
  'VITE_JWT_SECRET',
  'VITE_PRIVATE_KEY',
];

// ─────────────────────────────────────────────────────────────────────────────
// Simulação do Secret Redaction Engine (espelho da implementação em index.ts)
// ─────────────────────────────────────────────────────────────────────────────

const SENSITIVE_FIELD_PATTERNS = [
  /authorization/i, /bearer/i, /password/i, /secret/i,
  /token/i, /api.?key/i, /stripe/i, /openai/i,
];

const SECRET_VALUE_PATTERNS = [
  /sk_(?:test|live)_[A-Za-z0-9]{24,}/,
  /sk-proj-[A-Za-z0-9_-]{32,}/,
  /whsec_[A-Za-z0-9]{32,}/,
  /Bearer\s+[A-Za-z0-9_\-.]+/,
];

function redactSecrets(obj: Record<string, any>): Record<string, any> {
  const redacted = { ...obj };
  for (const [key, value] of Object.entries(redacted)) {
    if (SENSITIVE_FIELD_PATTERNS.some(p => p.test(key))) {
      redacted[key] = '[REDACTED]';
      continue;
    }
    if (typeof value === 'string') {
      let v = value;
      for (const pattern of SECRET_VALUE_PATTERNS) {
        v = v.replace(pattern, '[REDACTED]');
      }
      redacted[key] = v;
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSecrets(value);
    }
  }
  return redacted;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTES SEC-SECRET-001
// ─────────────────────────────────────────────────────────────────────────────

describe('SEC-SECRET-001 — Suíte de Testes de Secrets Management', () => {

  it('SEC-001: .env.example do frontend NÃO deve conter segredos reais', () => {
    const envExample = readFileSafe(path.join(REPO_ROOT, '.env.example'));
    for (const pattern of REAL_SECRET_PATTERNS) {
      expect(envExample).not.toMatch(pattern);
    }
    // Deve existir e ter conteúdo
    expect(envExample.length).toBeGreaterThan(0);
  });

  it('SEC-002: .env.example das Cloud Functions NÃO deve conter segredos reais', () => {
    const envExample = readFileSafe(path.join(REPO_ROOT, 'functions/.env.example'));
    for (const pattern of REAL_SECRET_PATTERNS) {
      expect(envExample).not.toMatch(pattern);
    }
    // Deve existir (recém criado)
    expect(fileExists(path.join(REPO_ROOT, 'functions/.env.example'))).toBe(true);
  });

  it('SEC-003: Nenhuma variável VITE_ privilegiada deve existir no .env.example do frontend', () => {
    const envExample = readFileSafe(path.join(REPO_ROOT, '.env.example'));
    for (const varName of PRIVILEGED_SECRET_ENV_VARS) {
      expect(envExample).not.toContain(varName);
    }
  });

  it('SEC-004: Nenhuma variável VITE_ privilegiada deve existir no .env.example do admin', () => {
    const envExample = readFileSafe(path.join(REPO_ROOT, 'admin/.env.example'));
    for (const varName of PRIVILEGED_SECRET_ENV_VARS) {
      expect(envExample).not.toContain(varName);
    }
  });

  it('SEC-005: .gitignore raiz deve proteger explicitamente arquivos .env sensíveis', () => {
    const gitignore = readFileSafe(path.join(REPO_ROOT, '.gitignore'));
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.env.local');
    expect(gitignore).toContain('.env.production');
    expect(gitignore).toContain('functions/.env');
    expect(gitignore).toContain('*.pem');
    expect(gitignore).toContain('*.key');
  });

  it('SEC-006: Secret Redaction — campos sensíveis são substituídos por [REDACTED]', () => {
    // Monta tokens de teste dinamicamente para evitar falsos positivos no scanner de push do GitHub
    const dummyStripeTestKey = ['sk_', 'test_', 'dummyTestKeyForRedactionTestingOnly12345'].join('');
    const dummyStripeLiveKey = ['sk_', 'live_', 'dummyLiveKeyForRedactionTestingOnly12345'].join('');

    const logPayload = {
      userId: 'user-123',
      authorization: `Bearer ${dummyStripeTestKey}`,
      password: 'senha-super-secreta',
      email: 'gestor@institutosermelhor.org',
      stripeKey: dummyStripeLiveKey,
    };
    const redacted = redactSecrets(logPayload);

    expect(redacted.authorization).toBe('[REDACTED]');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.stripeKey).toBe('[REDACTED]');
    // Campos não sensíveis devem ser preservados
    expect(redacted.userId).toBe('user-123');
    expect(redacted.email).toBe('gestor@institutosermelhor.org');
  });

  it('SEC-007: Secret Redaction — valores de API Key em strings são substituídos por [REDACTED]', () => {
    const dummyStripeTestKey = ['sk_', 'test_', 'dummyTestKeyForRedactionTestingOnly12345'].join('');
    const dummyOpenaiKey = ['sk-', 'proj-', 'dummyOpenAiKeyForRedactionTesting1234567890'].join('');

    const logPayload = {
      message: `Erro ao chamar Stripe: ${dummyStripeTestKey}`,
      context: {
        openaiKey: dummyOpenaiKey,
      },
    };
    const redacted = redactSecrets(logPayload);

    expect(redacted.message).toContain('[REDACTED]');
    expect(redacted.message).not.toContain('sk_test_');
    expect((redacted.context as any).openaiKey).toBe('[REDACTED]');
  });

  it('SEC-008: Política de rotação de segredos deve existir e ser documentada', () => {
    const rotationPolicy = path.join(REPO_ROOT, 'SECURITY/SECRET_ROTATION_POLICY.md');
    expect(fileExists(rotationPolicy)).toBe(true);
    const content = readFileSafe(rotationPolicy);
    expect(content).toContain('STRIPE_SECRET_KEY');
    expect(content).toContain('OPENAI_API_KEY');
    expect(content).toContain('firebase functions:secrets:set');
  });
});
