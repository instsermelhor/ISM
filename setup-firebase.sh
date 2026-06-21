#!/usr/bin/env bash
# =============================================================================
# setup-firebase.sh — Configuração completa do Firebase para o ISM
# Uso: bash setup-firebase.sh
# =============================================================================
set -e

PROJECT_ID="ismbd-27e84"
ADMIN_SITE_ID="ismbd-27e84-admin"
DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║   ISM — Configuração Firebase + Deploy Automático            ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Firebase CLI ───────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/7] Verificando Firebase CLI...${NC}"
FIREBASE_VERSION=$(npx firebase-tools@latest --version 2>/dev/null || echo "não encontrado")
echo -e "${GREEN}✓ Firebase CLI ${FIREBASE_VERSION}${NC}"

# ── 2. Login ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/7] Autenticando no Firebase...${NC}"
echo "  → O navegador será aberto. Use a conta associada ao projeto ${PROJECT_ID}."
echo ""
npx firebase-tools@latest login --reauth 2>&1 || {
  echo -e "${RED}Erro no login. Tente manualmente: npx firebase-tools@latest login${NC}"
  exit 1
}
echo -e "${GREEN}✓ Autenticado${NC}"

# ── 3. Seleciona projeto ──────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/7] Selecionando projeto ${PROJECT_ID}...${NC}"
cd "$DIR"
npx firebase-tools@latest use "$PROJECT_ID"
echo -e "${GREEN}✓ Projeto ativo: ${PROJECT_ID}${NC}"

# ── 4. Cria Web App se não existir e obtém credenciais ────────────────────────
echo ""
echo -e "${YELLOW}[4/7] Obtendo credenciais do Firebase Web SDK...${NC}"

RAW_CONFIG=$(npx firebase-tools@latest apps:sdkconfig WEB --project "$PROJECT_ID" 2>/dev/null || true)

if [ -z "$RAW_CONFIG" ] || ! echo "$RAW_CONFIG" | grep -q "apiKey"; then
  echo "  → Nenhum Web App encontrado. Criando \"ISM Web\"..."
  npx firebase-tools@latest apps:create WEB "ISM Web" --project "$PROJECT_ID" 2>/dev/null || true
  sleep 4
  RAW_CONFIG=$(npx firebase-tools@latest apps:sdkconfig WEB --project "$PROJECT_ID" 2>/dev/null || true)
fi

# Extrai campos do JSON de configuração (compatível com bash puro + python3)
extract() {
  echo "$RAW_CONFIG" | python3 -c "
import sys, re
text = sys.stdin.read()
m = re.search(r'\"$1\":\s*\"([^\"]+)\"', text)
print(m.group(1) if m else '')
" 2>/dev/null
}

API_KEY=$(extract "apiKey")
AUTH_DOMAIN=$(extract "authDomain")
PROJECT_ID_VAL=$(extract "projectId")
STORAGE_BUCKET=$(extract "storageBucket")
MESSAGING_SENDER_ID=$(extract "messagingSenderId")
APP_ID=$(extract "appId")

# Fallbacks
[ -z "$AUTH_DOMAIN" ]        && AUTH_DOMAIN="${PROJECT_ID}.firebaseapp.com"
[ -z "$PROJECT_ID_VAL" ]     && PROJECT_ID_VAL="$PROJECT_ID"
[ -z "$STORAGE_BUCKET" ]     && STORAGE_BUCKET="${PROJECT_ID}.firebasestorage.app"

if [ -z "$API_KEY" ]; then
  echo ""
  echo -e "${RED}${BOLD}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}${BOLD}║  Não foi possível obter as credenciais automaticamente.       ║${NC}"
  echo -e "${RED}${BOLD}║                                                               ║${NC}"
  echo -e "${RED}${BOLD}║  Faça manualmente:                                            ║${NC}"
  echo -e "${RED}${BOLD}║  1. https://console.firebase.google.com/project/              ║${NC}"
  echo -e "${RED}${BOLD}║     ${PROJECT_ID}/settings/general                 ║${NC}"
  echo -e "${RED}${BOLD}║  2. "Seus aplicativos" → app Web → Configuração do SDK       ║${NC}"
  echo -e "${RED}${BOLD}║  3. Preencha src/.env.local e admin/.env.local               ║${NC}"
  echo -e "${RED}${BOLD}╚═══════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Credenciais obtidas:${NC}"
echo "    API Key:            ${API_KEY:0:12}••••"
echo "    Project ID:         ${PROJECT_ID_VAL}"
echo "    Messaging Sender:   ${MESSAGING_SENDER_ID}"
echo "    App ID:             ${APP_ID:0:20}••••"

# ── 5. Grava .env.local ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/7] Gravando .env.local em src/ e admin/...${NC}"

write_env() {
  local DEST="$1"
  cat > "$DEST" << ENVEOF
# Gerado automaticamente por setup-firebase.sh em $(date)
VITE_FIREBASE_API_KEY=${API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${PROJECT_ID_VAL}
VITE_FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${APP_ID}
ENVEOF
  echo -e "  ${GREEN}✓${NC} $DEST"
}

write_env "$DIR/src/.env.local"
write_env "$DIR/admin/.env.local"

# ── 6. Build ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/7] Build de produção...${NC}"

echo "  → Buildando site público..."
cd "$DIR"
npm run build 2>&1 | tail -5
echo -e "  ${GREEN}✓ dist/ gerado${NC}"

echo "  → Buildando painel admin..."
cd "$DIR/admin"
npm run build 2>&1 | tail -5
echo -e "  ${GREEN}✓ admin/dist/ gerado${NC}"

# ── 7. Deploy ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[7/7] Deploy no Firebase...${NC}"
cd "$DIR"

echo "  → Publicando regras Firestore..."
npx firebase-tools@latest deploy --only firestore:rules --project "$PROJECT_ID"
echo -e "  ${GREEN}✓ Regras Firestore publicadas${NC}"

echo "  → Publicando Hosting (site público + admin)..."
npx firebase-tools@latest deploy --only hosting --project "$PROJECT_ID" 2>&1 || {
  echo ""
  echo -e "${YELLOW}⚠ O site admin '${ADMIN_SITE_ID}' pode não existir ainda.${NC}"
  echo "  Criando site admin no Firebase Hosting..."
  npx firebase-tools@latest hosting:sites:create "$ADMIN_SITE_ID" --project "$PROJECT_ID" 2>/dev/null || true
  echo "  Tentando deploy novamente..."
  npx firebase-tools@latest deploy --only hosting --project "$PROJECT_ID"
}

echo -e "  ${GREEN}✓ Hosting publicado${NC}"

# ── Resumo ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║  ✅  ISM está ONLINE!                                        ║${NC}"
echo -e "${GREEN}${BOLD}║                                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  🌐 Site público:                                            ║${NC}"
echo -e "${GREEN}${BOLD}║     https://${PROJECT_ID}.web.app                   ║${NC}"
echo -e "${GREEN}${BOLD}║                                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  🔧 Painel Admin:                                            ║${NC}"
echo -e "${GREEN}${BOLD}║     https://${ADMIN_SITE_ID}.web.app           ║${NC}"
echo -e "${GREEN}${BOLD}║                                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  📋 Formulários → Firestore:                                ║${NC}"
echo -e "${GREEN}${BOLD}║     partner_applications / donations / leads                ║${NC}"
echo -e "${GREEN}${BOLD}║                                                              ║${NC}"
echo -e "${GREEN}${BOLD}║  ⚙️  Admin → Configurações → Banco de Dados                  ║${NC}"
echo -e "${GREEN}${BOLD}║     Status de conexão em tempo real + auto-sync 30s         ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
