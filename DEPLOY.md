# 🚀 Scripts de Deploy - CatálogoZap

## Scripts Disponíveis

### 1. `deploy.ps1` - Deploy com mensagem personalizada
```powershell
.\deploy.ps1 "sua mensagem de commit aqui"
```

**Exemplo:**
```powershell
.\deploy.ps1 "feat: adicionar nova funcionalidade de busca"
```

### 2. `quick-deploy.ps1` - Deploy rápido
```powershell
.\quick-deploy.ps1
```

Este script faz commit automático com timestamp.

## Como Usar

1. **Abra o PowerShell** na pasta do projeto
2. **Execute um dos scripts:**
   - Para deploy com mensagem: `.\deploy.ps1 "sua mensagem"`
   - Para deploy rápido: `.\quick-deploy.ps1`

## O que os Scripts Fazem

✅ Verificam se há mudanças para commitar  
✅ Adicionam todos os arquivos (`git add .`)  
✅ Fazem commit com a mensagem fornecida  
✅ Fazem push para o repositório  
✅ Mostram o link do site após o deploy  

## Exemplo de Uso

```powershell
# Deploy com mensagem personalizada
.\deploy.ps1 "fix: corrigir bug no modal de visualização"

# Deploy rápido (usa timestamp)
.\quick-deploy.ps1
```

## Resultado

Após o deploy bem-sucedido, você verá:
```
✅ Deploy concluído com sucesso!
🌐 Acesse: https://catalogozap.vercel.app
```

O Vercel fará o deploy automaticamente em alguns segundos! 