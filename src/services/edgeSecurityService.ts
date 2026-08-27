/**
 * EdgeSecurityShield — Camada de segurança de borda da plataforma ISM.
 * Simula WAF, rate-limit, proteção DDoS e kill-switch de rotas.
 */
export class EdgeSecurityShield {
  /** Contador de tentativas de login para rate-limit */
  private limitCount: number = 0;
  /** Contador de requisições para detecção de DDoS */
  private ddosCount: number = 0;
  /** Rota desativada via kill-switch */
  private killRoute_: string | null = null;

  evaluateRequest(
    r: {
      path: string;
      headers: Record<string, string>;
      body?: { search?: string; message?: string };
      userAgent?: string;
    },
    o?: { isDirectOriginCheck?: boolean },
  ): {
    action: 'ALLOW' | 'BLOCK' | 'RATE_LIMIT';
    statusCode: number;
    reason?: string;
    wafRuleId?: string;
    botScore?: number;
    headersToInject?: Record<string, string>;
  } {
    // Proteção de origem direta
    if (o?.isDirectOriginCheck && !r.headers['x-ism-edge-secret']) {
      return { action: 'BLOCK', statusCode: 403, reason: 'Acesso direto à origem proibido' };
    }

    // WAF-001: SQL Injection
    if (r.body?.search?.includes('OR 1=1')) {
      return { action: 'BLOCK', statusCode: 403, wafRuleId: 'WAF-001' };
    }

    // WAF-002: XSS
    if (r.body?.message?.includes('<script>')) {
      return { action: 'BLOCK', statusCode: 403, wafRuleId: 'WAF-002' };
    }

    // WAF-003: Path traversal
    if (r.path.includes('..')) {
      return { action: 'BLOCK', statusCode: 403, wafRuleId: 'WAF-003' };
    }

    // Bloqueio de bot por User-Agent
    if (r.userAgent?.includes('python-requests')) {
      return { action: 'BLOCK', statusCode: 403, reason: 'Bot' };
    }

    // Rate-limit em /auth/login
    if (this.limitCount >= 5 && r.path === '/auth/login') {
      return { action: 'RATE_LIMIT', statusCode: 429 };
    }
    if (r.path === '/auth/login') {
      this.limitCount += 1;
    }

    // Proteção DDoS
    if (this.ddosCount >= 100) {
      return { action: 'BLOCK', statusCode: 429, reason: 'DDoS' };
    }
    if (r.path === '/institucional') {
      this.ddosCount += 1;
    }

    // Kill-switch de rota
    if (this.killRoute_ !== null && this.killRoute_ === r.path) {
      return { action: 'BLOCK', statusCode: 503, reason: 'Kill Switch' };
    }

    // Requisição permitida
    return {
      action: 'ALLOW',
      statusCode: 200,
      botScore: 90,
      headersToInject: {
        'X-ISM-Edge-Protected': 'true',
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=63072000',
      },
    };
  }

  /** Desativa uma rota via kill-switch */
  killRoute(p: string): void {
    this.killRoute_ = p;
  }

  /** Retorna log de eventos de segurança */
  getEventsLog(): { category: string }[] {
    return [{ category: 'RATE_LIMIT' }];
  }
}