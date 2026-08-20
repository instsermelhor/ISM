# ISM Edge Security Shield — Arquitetura de Proteção de Borda

**Código:** ISM-EDGE-SECURITY-SHIELD-001
**Classificação:** Crítico — Edge Security & DevSecOps

---

## 1. Arquitetura Multicamada

```
INTERNET
   ↓
DNS & CDN Edge (Cloudflare / Firebase Edge)
   ↓
[CAMADA 1: DDoS Protection & Volumetric Filtering]
   ↓
[CAMADA 2: WAF Engine (Regras OWASP Top 10 + ISM Custom: SQLi, XSS, Path Traversal, SSRF)]
   ↓
[CAMADA 3: Bot Management & Challenge Engine (Bot Score 0-100 / Allowlist de Good Bots)]
   ↓
[CAMADA 4: IP Reputation & Brute-Force / Credential Stuffing Mitigation]
   ↓
[CAMADA 5: Multi-Tier Distributed Rate Limiting (Login, Password Reset, Admin, Upload, APIs)]
   ↓
[CAMADA 6: Origin Protection (Enforce de X-ISM-Edge-Secret)]
   ↓
ORIGIN / CLOUD FUNCTIONS / EXPRESS APPLICATION
   ↓
AUTHENTICATION & RBAC & RLS
   ↓
FIRESTORE DATABASE
```

---

## 2. Princípios de Blindagem do Origin

- **Zero Direct Access:** Nenhuma requisição direta é aceita pelo backend sem o token/segredo de borda (`X-ISM-Edge-Secret`).
- **Prevenção de Vazamento de Cache:** Rotas de API e áreas autenticadas são declaradas com `no-store, no-cache` para impedir cross-contamination entre tenants.
- **Emergency Kill Switch:** Rotas individuais sob ataque podem ser isoladas emergencialmente sem derrubar a aplicação global.
