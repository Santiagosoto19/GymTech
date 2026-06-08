$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Deteniendo contenedores anteriores..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

Write-Host "==> Construyendo imágenes con el código actual..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --pull

Write-Host "==> Levantando stack en modo desarrollo..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

Write-Host ""
Write-Host "Listo. Abre: http://localhost:5173"
Write-Host "API Gateway: http://localhost:8080"
Write-Host ""
Write-Host "Logs en vivo: docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f"
