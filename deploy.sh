#!/usr/bin/env bash
# ============================================================
# Dev Creation — EC2 Deployment & Update Script
# Usage:
#   ./deploy.sh            # Standard build and restart
#   ./deploy.sh --seed     # Deploy and run database seed
#   ./deploy.sh --no-pull  # Deploy without pulling from git
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RUN_SEED=false
DO_PULL=true

for arg in "$@"; do
  case $arg in
    --seed)
      RUN_SEED=true
      shift
      ;;
    --no-pull)
      DO_PULL=false
      shift
      ;;
  esac
done

echo "============================================================"
echo "  🚀 Deploying Dev Creation on AWS EC2"
echo "============================================================"

# Ensure .env.production exists
if [ ! -f .env.production ]; then
  if [ -f .env.production.example ]; then
    echo "⚠️  .env.production not found. Creating from .env.production.example..."
    cp .env.production.example .env.production
    echo "❗ Please review and edit .env.production before going to production!"
  else
    echo "❌ Error: Neither .env.production nor .env.production.example found!"
    exit 1
  fi
fi

# Pull latest git changes if requested and git is available
if [ "$DO_PULL" = true ] && [ -d .git ]; then
  echo "==> Pulling latest changes from Git..."
  git pull origin main || git pull origin master || echo "⚠️ Git pull failed or skipped, continuing with local files..."
fi

echo "==> Building and starting production containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Waiting for services to become healthy..."
sleep 5

# Check container status
docker compose -f docker-compose.prod.yml ps

# Optional database seed
if [ "$RUN_SEED" = true ]; then
  echo "==> Running database seed (categories, products, super admin)..."
  sleep 5
  docker compose -f docker-compose.prod.yml exec -T backend npm run seed:prod
  echo "✅ Database seed completed successfully."
fi

# Prune old dangling docker images to preserve EC2 disk space
echo "==> Pruning dangling docker images..."
docker image prune -f

echo "============================================================"
echo "  ✅ Dev Creation is LIVE on EC2!"
echo "============================================================"
echo "Access endpoints:"
echo "  🛍️ Storefront:   http://<YOUR-EC2-PUBLIC-IP>"
echo "  👑 Admin Panel:  http://<YOUR-EC2-PUBLIC-IP>:3001"
echo "  🔌 API Endpoint: http://<YOUR-EC2-PUBLIC-IP>/api/health"
echo "============================================================"
