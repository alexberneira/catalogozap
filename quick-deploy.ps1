# Script para deploy rápido do CatálogoZap
# Uso: .\quick-deploy.ps1

Write-Host "🚀 Deploy rápido do CatálogoZap..." -ForegroundColor Green

# Verificar se há mudanças
$status = git status --porcelain
if (-not $status) {
    Write-Host "❌ Nenhuma mudança detectada" -ForegroundColor Yellow
    exit 1
}

# Adicionar todos os arquivos
git add .

# Fazer commit com timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Update: $timestamp"

Write-Host "💾 Commit: $commitMessage" -ForegroundColor Blue
git commit -m $commitMessage

# Fazer push
Write-Host "🚀 Fazendo push..." -ForegroundColor Blue
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído!" -ForegroundColor Green
    Write-Host "🌐 https://catalogozap.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro no deploy" -ForegroundColor Red
} 