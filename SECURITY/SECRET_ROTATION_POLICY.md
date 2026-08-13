# SECRET MANAGEMENT & CREDENTIAL SECURITY
## Instituto Ser Melhor — Política Oficial de Rotação e Governança de Segredos
**Código: SEC-SECRET-001 | Versão: 1.0.0 | Vigência: 2026-08-13**

---

> [!IMPORTANT]
> **REGRA ZERO**: Nenhum segredo pertence ao código-fonte. Secretos comprometidos devem ser revogados imediatamente — remover do código não invalida um segredo que foi versionado.

---

## 1. Inventário de Segredos Operacionais

| ID | Segredo | Sistema | Ambiente | Secret Store | Prazo de Rotação | Último Rotation | Próximo Rotation | Responsável |
|---|---|---|---|---|---|---|---|---|
| S-001 | `STRIPE_SECRET_KEY` | Stripe Payments | All | Firebase Secret Manager | 90 dias | — | — | DevOps |
| S-002 | `OPENAI_API_KEY` | OpenAI API | All | Firebase Secret Manager | 90 dias | — | — | DevOps |
| S-003 | `SMTP_PASSWORD` | Gmail SMTP | All | Firebase Secret Manager | 180 dias | — | — | Infra |
| S-004 | `SMTP_USER` | Gmail SMTP | All | Firebase Secret Manager | — | — | — | Infra |
| S-005 | `WEBHOOK_SECRET` | Stripe Webhooks | All | Firebase Secret Manager | 90 dias | — | — | DevOps |
| S-006 | `VITE_FIREBASE_API_KEY` | Firebase Web | Frontend | `.env.local` (não commitado) | — | — | — | *Pública por design* |

---

## 2. Classificação de Criticidade

| Segredo | Criticidade | Justificativa |
|---|---|---|
| `STRIPE_SECRET_KEY` | 🔴 CRÍTICO | Acesso direto a transações financeiras e estornos |
| `OPENAI_API_KEY` | 🔴 CRÍTICO | Custo operacional e potencial de abuso de API |
| `SMTP_PASSWORD` | 🟠 ALTO | Controle de envio de e-mails institucionais |
| `WEBHOOK_SECRET` | 🟠 ALTO | Validação da autenticidade de eventos Stripe |
| `SMTP_USER` | 🟡 MÉDIO | Exposição limitada sem a senha correspondente |
| Firebase Web API Key | 🟢 BAIXO | Pública por design — segurança via Security Rules |

---

## 3. Procedimento de Rotação

### Rotação Normal (Proativa — por prazo)

```
IDENTIDADE RESPONSÁVEL
  ↓
Acessa o painel do serviço (Stripe / OpenAI / Google)
  ↓
Gera nova chave com MESMO escopo (Least Privilege)
  ↓
Atualiza no Firebase Secret Manager:
  firebase functions:secrets:set NOME_DO_SECRET
  ↓
Deploy das Cloud Functions com o novo secret:
  firebase deploy --only functions
  ↓
Valida funcionamento em Staging
  ↓
Revoga a chave antiga no painel do serviço
  ↓
Atualiza a coluna "Último Rotation" neste documento
  ↓
Monitora logs por 24h para erros de autenticação
```

### Rotação de Emergência (Reativa — comprometimento suspeito)

```
DETECTAR comprometimento (alert de uso anômalo / segredo no código)
  ↓
REVOGAR a chave antiga IMEDIATAMENTE no painel do serviço
  ↓
Gerar nova chave
  ↓
Atualizar Firebase Secret Manager
  ↓
Deploy emergencial das Cloud Functions
  ↓
Investigar causa raiz (auditoria de logs, Git history)
  ↓
Reportar incidente ao responsável de segurança
  ↓
Documentar Post-Mortem
```

---

## 4. Firebase Secret Manager — Comandos de Gestão

```bash
# Listar secrets configurados
firebase functions:secrets:list

# Definir ou rotacionar um secret
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set SMTP_PASSWORD
firebase functions:secrets:set WEBHOOK_SECRET

# Verificar versões de um secret
firebase functions:secrets:get STRIPE_SECRET_KEY

# Destruir uma versão antiga (após confirmar que a nova está em produção)
firebase functions:secrets:destroy STRIPE_SECRET_KEY@v1
```

---

## 5. Acesso Mínimo por Identidade (Least Privilege)

| Credencial | Escopo Permitido | Escopo Proibido |
|---|---|---|
| `STRIPE_SECRET_KEY` | `PaymentIntents`, `Customers`, `Charges` leitura/criação | `Products` write, `Payouts`, admin |
| `OPENAI_API_KEY` | Modelo específico (`gpt-4o-mini`) | Fine-tuning, billing, admin |
| `SMTP_PASSWORD` | Envio de e-mails via conta ISM | Acesso a Gmail inbox, regras |
| `WEBHOOK_SECRET` | Validação HMAC de eventos | Nenhuma operação adicional |

---

## 6. Detecção e Monitoramento

- **Gitleaks no CI/CD**: Bloqueia deploy se detectar segredo no histórico ou código.
- **Pre-commit Hook**: Bloqueia commit local com `gitleaks protect --staged`.
- **Secret Redaction**: `logStructured()` redige automaticamente campos sensíveis nos logs GCP.
- **Firebase Security Rules**: Protegem dados mesmo se credentials forem comprometidas.
- **GCP Cloud Audit Logs**: Monitorar chamadas anômalas às APIs com credentials de produção.

---

## 7. Contato de Segurança

| Papel | Contato |
|---|---|
| Responsável Técnico de Segurança | Equipe de Desenvolvimento ISM |
| Incidente Crítico | Revogar a chave imediatamente e notificar a diretoria |
| Dúvidas sobre esta política | Criar issue no repositório com label `security` |

---

## 8. Auditoria e Conformidade

Esta política é revisada semestralmente e sempre que:
- Um segredo for comprometido ou suspeito de comprometimento.
- Novos serviços externos forem integrados à plataforma.
- Houver mudança no time com acesso a credentials de produção.

**Última revisão:** 2026-08-13  
**Próxima revisão:** 2027-02-13
