#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Instituto Ser Melhor — Setup de Ambiente de Desenvolvimento
# SEC-SECRET-001 — Instalação de Pre-commit Hook de Secret Scanning
# ─────────────────────────────────────────────────────────────────────────────
# USO: ./scripts/setup-dev.sh
# Execute uma vez após clonar o repositório para ativar as proteções locais.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="${REPO_ROOT}/.git/hooks"
PRE_COMMIT_HOOK="${HOOKS_DIR}/pre-commit"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Instituto Ser Melhor — Dev Environment Setup (SEC-SECRET-001)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# ── 1. Verificar se Gitleaks está instalado ───────────────────────────────────
if ! command -v gitleaks &> /dev/null; then
  echo "⚠️  Gitleaks não encontrado. Instalando via Homebrew..."
  if command -v brew &> /dev/null; then
    brew install gitleaks
  else
    echo "❌ Homebrew não disponível. Instale o Gitleaks manualmente:"
    echo "   https://github.com/gitleaks/gitleaks#installing"
    echo "   ou: curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/main/scripts/install.sh | sh -s -- -b /usr/local/bin"
    exit 1
  fi
fi

GITLEAKS_VERSION=$(gitleaks version 2>&1 | head -1)
echo "✅ Gitleaks encontrado: ${GITLEAKS_VERSION}"

# ── 2. Garantir que o diretório .git/hooks existe ────────────────────────────
mkdir -p "${HOOKS_DIR}"

# ── 3. Instalar pre-commit hook ───────────────────────────────────────────────
cat > "${PRE_COMMIT_HOOK}" << 'HOOK_SCRIPT'
#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pre-commit Hook — Secret Scanning (Gitleaks)
# SEC-SECRET-001 — Instituto Ser Melhor
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

echo ""
echo "🔒 [SEC-SECRET-001] Executando Secret Scanning pre-commit (Gitleaks)..."

REPO_ROOT="$(git rev-parse --show-toplevel)"
CONFIG_FILE="${REPO_ROOT}/.gitleaks.toml"

# Executar Gitleaks apenas nos arquivos staged
if [ -f "${CONFIG_FILE}" ]; then
  gitleaks protect --staged --config="${CONFIG_FILE}" --verbose 2>&1
else
  gitleaks protect --staged --verbose 2>&1
fi

EXIT_CODE=$?

if [ "${EXIT_CODE}" -ne 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║  🚨 COMMIT BLOQUEADO — SECRET DETECTADO (SEC-SECRET-001)        ║"
  echo "║                                                                   ║"
  echo "║  Um ou mais segredos foram detectados nos arquivos staged.       ║"
  echo "║                                                                   ║"
  echo "║  AÇÕES NECESSÁRIAS:                                              ║"
  echo "║  1. Remover o segredo do arquivo                                 ║"
  echo "║  2. Usar variável de ambiente: process.env.NOME_DA_VARIAVEL      ║"
  echo "║  3. Adicionar o valor real ao arquivo .env local (não commitado) ║"
  echo "║  4. Se já commitado: REVOGAR o segredo imediatamente             ║"
  echo "║     (remover do arquivo não é suficiente — o histórico persiste) ║"
  echo "║                                                                   ║"
  echo "║  Contato de segurança: segurança@institutosermelhor.org          ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi

echo "✅ [SEC-SECRET-001] Nenhum segredo detectado. Commit autorizado."
echo ""
exit 0
HOOK_SCRIPT

chmod +x "${PRE_COMMIT_HOOK}"

echo "✅ Pre-commit hook instalado em: ${PRE_COMMIT_HOOK}"
echo ""

# ── 4. Verificar .env files não rastreados ────────────────────────────────────
echo "🔍 Verificando arquivos .env locais..."

TRACKED_ENVS=$(git -C "${REPO_ROOT}" ls-files | grep -E "(\.env$|\.env\.|\.env\.local)" 2>/dev/null || true)
if [ -n "${TRACKED_ENVS}" ]; then
  echo ""
  echo "⚠️  ATENÇÃO: Os seguintes arquivos .env estão rastreados pelo Git:"
  echo "${TRACKED_ENVS}"
  echo ""
  echo "   Estes arquivos devem ser removidos do rastreamento com:"
  echo "   git rm --cached <arquivo>"
  echo "   E adicionados ao .gitignore."
else
  echo "✅ Nenhum arquivo .env está rastreado pelo Git."
fi

echo ""

# ── 5. Executar scan inicial do repositório ───────────────────────────────────
echo "🔍 Executando scan forense inicial do repositório..."
echo ""

if [ -f "${REPO_ROOT}/.gitleaks.toml" ]; then
  gitleaks detect \
    --source="${REPO_ROOT}" \
    --config="${REPO_ROOT}/.gitleaks.toml" \
    --log-level=warn \
    --verbose \
    --no-git 2>&1 || true
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  ✅ Setup concluído!"
echo ""
echo "  Pre-commit hook ativo: todo commit será escaneado antes de"
echo "  ser aceito pelo Git local."
echo ""
echo "  Para testar manualmente: gitleaks protect --staged --verbose"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
