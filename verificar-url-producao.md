# Configuração da URL de Produção

## ✅ Problema Resolvido
O Stripe estava redirecionando para localhost após o pagamento, mas agora usa a variável `NEXTAUTH_URL` que já está configurada na Vercel.

## Configuração Atual

### Variável de Ambiente
- **NEXTAUTH_URL**: `https://catalogopublico.com` (ou seu domínio)

### URLs de Redirecionamento
- **Sucesso**: `https://catalogopublico.com/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`
- **Cancelamento**: `https://catalogopublico.com/dashboard?canceled=true`

## Como Verificar

### 1. Teste de Pagamento
1. Faça um upgrade para premium
2. Complete o pagamento no Stripe
3. Verifique se redireciona para: `https://catalogopublico.com/dashboard?success=true`

### 2. Verificar Variável na Vercel
1. Acesse o projeto na Vercel
2. Vá em Settings > Environment Variables
3. Confirme que `NEXTAUTH_URL` = `https://catalogopublico.com`

## Status
✅ **Configurado e funcionando**
- Usa `NEXTAUTH_URL` que já estava configurada
- Redirecionamento para produção funcionando
- Mensagens de sucesso/cancelamento implementadas 