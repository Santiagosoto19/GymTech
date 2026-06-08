#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deteniendo contenedores anteriores..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "==> Construyendo imágenes con el código actual..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --pull

echo "==> Levantando stack en modo desarrollo..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo ""
echo "Listo. Abre: http://localhost:5173"
echo "API Gateway: http://localhost:8080"
echo ""
echo "Logs en vivo: docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
