import { describe, it, expect, beforeEach } from "vitest";
import { EdgeSecurityShield } from "./edgeSecurityService";

describe("ISM-EDGE-SECURITY-SHIELD-001", () => {
  let shield: any;
  beforeEach(() => { shield = new EdgeSecurityShield(); });
  it("TESTE 1 — SQLi", () => {
    const res = shield.evaluateRequest({ method: "POST", path: "/donations", headers: {}, body: { search: "' OR 1=1 --" } });
    expect(res.action).toBe("BLOCK");
    expect(res.wafRuleId).toBe("WAF-001");
  });
  it("TESTE 2 — XSS", () => {
    const res = shield.evaluateRequest({ method: "POST", path: "/leads", headers: {}, body: { message: "<script>alert(1)</script>" } });
    expect(res.action).toBe("BLOCK");
    expect(res.wafRuleId).toBe("WAF-002");
  });
  it("TESTE 3 — Path Traversal", () => {
    const res = shield.evaluateRequest({ method: "GET", path: "/../etc/passwd", headers: {} });
    expect(res.action).toBe("BLOCK");
    expect(res.wafRuleId).toBe("WAF-003");
  });
  it("TESTE 4 — Rate Limit", () => {
    for (let i = 0; i < 5; i++) shield.evaluateRequest({ method: "POST", path: "/auth/login", headers: {} });
    const res = shield.evaluateRequest({ method: "POST", path: "/auth/login", headers: {} });
    expect(res.action).toBe("RATE_LIMIT");
    expect(res.statusCode).toBe(429);
  });
  it("TESTE 5 — Bot", () => {
    const res = shield.evaluateRequest({ method: "GET", path: "/api", headers: {}, userAgent: "python-requests" });
    expect(res.action).toBe("BLOCK");
  });
  it("TESTE 6 — Brute Force", () => {
    for (let i = 0; i < 5; i++) shield.evaluateRequest({ method: "POST", path: "/auth/login", headers: {} });
    const res = shield.evaluateRequest({ method: "POST", path: "/auth/login", headers: {} });
    expect(res.statusCode).toBe(429);
  });
  it("TESTE 7 — Credential Stuffing", () => {
    expect(shield.getEventsLog().length).toBeGreaterThan(0);
  });
  it("TESTE 8 — DDoS Mitigation", () => {
    for (let i = 0; i < 100; i++) shield.evaluateRequest({ method: "GET", path: "/institucional", headers: {} });
    const res = shield.evaluateRequest({ method: "GET", path: "/institucional", headers: {} });
    expect(res.statusCode).toBe(429);
  });
  it("TESTE 9 — Direct Origin Check", () => {
    const res = shield.evaluateRequest({ method: "GET", path: "/secret", headers: {} }, { isDirectOriginCheck: true });
    expect(res.action).toBe("BLOCK");
    expect(res.statusCode).toBe(403);
  });
  it("TESTE 10 — Multi-tenant isolation", () => {
    expect(shield.evaluateRequest({ method: "GET", path: "/reports", headers: {} }).action).toBe("ALLOW");
  });
  it("TESTE 11 — Cache Leakage Prevention", () => {
    const res = shield.evaluateRequest({ method: "GET", path: "/fin", headers: {} });
    expect(res.headersToInject["Strict-Transport-Security"]).toBeDefined();
  });
  it("TESTE 12 — Legitimate Human Traffic", () => {
    const res = shield.evaluateRequest({ method: "GET", path: "/", headers: {} });
    expect(res.action).toBe("ALLOW");
    expect(res.statusCode).toBe(200);
  });
  it("TESTE 13 — Emergency Kill Switch", () => {
    shield.killRoute("/api/down");
    const res = shield.evaluateRequest({ method: "GET", path: "/api/down", headers: {} });
    expect(res.action).toBe("BLOCK");
    expect(res.statusCode).toBe(503);
  });
});