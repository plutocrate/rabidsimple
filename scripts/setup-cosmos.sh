#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-cosmos.sh — Clone and set up a local Cosmos Keyboards instance
# Run this from the project root: bash scripts/setup-cosmos.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

COSMOS_DIR="cosmos-keyboards"
COSMOS_REPO="https://github.com/rianadon/Cosmos-Keyboards.git"
COSMOS_PORT=5174
ENV_KEY="VITE_COSMOS_LOCAL_URL"
ENV_FILE=".env"
ENV_VALUE="http://localhost:${COSMOS_PORT}"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Cosmos Keyboards — Local Setup       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check if already set up ───────────────────────────────────────────────────
if [ -d "$COSMOS_DIR" ] && [ -f "$COSMOS_DIR/package.json" ]; then
  echo -e "${YELLOW}⚠  Cosmos is already set up at ./${COSMOS_DIR}${NC}"
  echo ""
  echo "  To start it:   cd ${COSMOS_DIR} && npm run dev"
  echo "  To update it:  cd ${COSMOS_DIR} && git pull && npm install"
  echo ""
  exit 0
fi

# ── Check dependencies ────────────────────────────────────────────────────────
echo -e "Checking dependencies…"

if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ git is not installed. Please install git first.${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ git${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Install from https://nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "  ${GREEN}✓ node ${NODE_VER}${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed.${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ npm${NC}"
echo ""

# ── Clone ─────────────────────────────────────────────────────────────────────
echo -e "Cloning Cosmos Keyboards…"
git clone --depth 1 "$COSMOS_REPO" "$COSMOS_DIR"
echo -e "${GREEN}✓ Cloned${NC}"
echo ""

# ── Install ───────────────────────────────────────────────────────────────────
echo -e "Installing dependencies (this may take a minute)…"
cd "$COSMOS_DIR"
npm install
cd ..
echo -e "${GREEN}✓ Installed${NC}"
echo ""

# ── Update .env ───────────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  if grep -q "^${ENV_KEY}=" "$ENV_FILE"; then
    # Update existing line
    sed -i.bak "s|^${ENV_KEY}=.*|${ENV_KEY}=${ENV_VALUE}|" "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    echo -e "${GREEN}✓ Updated ${ENV_KEY} in ${ENV_FILE}${NC}"
  else
    echo "" >> "$ENV_FILE"
    echo "# Cosmos Keyboards local dev server" >> "$ENV_FILE"
    echo "${ENV_KEY}=${ENV_VALUE}" >> "$ENV_FILE"
    echo -e "${GREEN}✓ Added ${ENV_KEY} to ${ENV_FILE}${NC}"
  fi
else
  echo "# Cosmos Keyboards local dev server" > "$ENV_FILE"
  echo "${ENV_KEY}=${ENV_VALUE}" >> "$ENV_FILE"
  echo -e "${YELLOW}⚠  Created new ${ENV_FILE} — make sure to fill in your Firebase values too${NC}"
fi
echo ""

# ── Done ──────────────────────────────────────────────────────────────────────
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete! ✓                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Start Cosmos:  cd cosmos-keyboards && npm run dev"
echo "  It will run on: ${ENV_VALUE}"
echo ""
echo "  Then in your RABID app:"
echo "  - Go to /dashboard/keyboard-models"  
echo "  - Create a new config with URL: ${ENV_VALUE}/cosmos/"
echo "  - Design your keyboard and paste the share URL"
echo ""
