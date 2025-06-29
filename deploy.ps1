# Script para automatizar deploy do CatálogoZap
# Uso: .\deploy.ps1 "sua mensagem de commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🚀 Iniciando deploy do CatálogoZap..." -ForegroundColor Green

# Verificar se há mudanças para commitar
$status = git status --porcelain
if (-not $status) {
    Write-Host "❌ Nenhuma mudança detectada para commitar" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Adicionando arquivos..." -ForegroundColor Blue
git add .

Write-Host "💾 Fazendo commit..." -ForegroundColor Blue
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Fazendo push..." -ForegroundColor Blue
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://catalogozap.vercel.app" -ForegroundColor Cyan 
