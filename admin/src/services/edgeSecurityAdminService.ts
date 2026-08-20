/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTITUTO SER MELHOR — EDGE SECURITY ADMIN SERVICE
 * Painel de Controle e Telemetria de Segurança de Borda (ISM-EDGE-SECURITY-SHIELD-001)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface EdgeMetricsSummary {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  rateLimitedRequests: number;
  botRequests: number;
  ddosMitigatedCount: number;
  wafViolationsCount: number;
  activeKillSwitch: boolean;
  topAttackRoutes: Array<{ route: string; count: number }>;
  topBlockedIps: Array<{ ip: string; count: number; reason: string }>;
}

export const EdgeSecurityAdminService = {
  async getMetricsSummary(): Promise<EdgeMetricsSummary> {
    return {
      totalRequests: 48290,
      allowedRequests: 47910,
      blockedRequests: 320,
      rateLimitedRequests: 45,
      botRequests: 15,
      ddosMitigatedCount: 0,
      wafViolationsCount: 18,
      activeKillSwitch: false,
      topAttackRoutes: [
        { route: '/auth/login', count: 182 },
        { route: '/api/v1/donations', count: 64 },
        { route: '/admin/settings', count: 42 }
      ],
      topBlockedIps: [
        { ip: '198.51.100.24', count: 98, reason: 'Brute Force / Credential Stuffing' },
        { ip: '203.0.113.88', count: 54, reason: 'WAF SQL Injection' },
        { ip: '192.0.2.14', count: 32, reason: 'Malicious Bot Scraper' }
      ]
    };
  }
};
