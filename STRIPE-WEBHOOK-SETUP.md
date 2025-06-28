# Configuração de Webhooks do Stripe

## Visão Geral

O sistema CatálogoZap usa webhooks do Stripe para controlar automaticamente o status das assinaturas dos usuários. Quando um pagamento falha ou uma assinatura é cancelada, o usuário é automaticamente desativado.

## Eventos Configurados

### 1. `checkout.session.completed`
- **Quando**: Usuário completa o pagamento inicial
- **Ação**: Ativa a assinatura do usuário (`is_active = true`)
- **Status**: ✅ Implementado

### 2. `invoice.payment_succeeded`
- **Quando**: Pagamento recorrente é processado com sucesso
- **Ação**: Reativa a assinatura do usuário (`is_active = true`)
- **Status**: ✅ Implementado

### 3. `invoice.payment_failed`
- **Quando**: Pagamento recorrente falha
- **Ação**: Desativa a assinatura do usuário (`is_active = false`)
- **Status**: ✅ Implementado

### 4. `customer.subscription.updated`
- **Quando**: Status da assinatura muda (ativo, cancelado, etc.)
- **Ação**: Atualiza o status baseado no status da assinatura
- **Status**: ✅ Implementado

### 5. `customer.subscription.deleted`
- **Quando**: Assinatura é cancelada
- **Ação**: Desativa a assinatura e remove o `subscription_id`
- **Status**: ✅ Implementado

### 6. `customer.subscription.trial_will_end`
- **Quando**: Período de teste vai terminar
- **Ação**: Log para envio de email de aviso
- **Status**: ✅ Implementado

### 7. `invoice.upcoming`
- **Quando**: Próxima fatura está chegando
- **Ação**: Log para envio de email de lembrete
- **Status**: ✅ Implementado

## Como Configurar

### 1. Acesse o Dashboard do Stripe
- Vá para https://dashboard.stripe.com/webhooks

### 2. Crie um novo webhook
- Clique em "Add endpoint"
- URL: `https://seu-dominio.vercel.app/api/webhook`
- Eventos a selecionar:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
  - `invoice.upcoming`

### 3. Configure a variável de ambiente
- Adicione `STRIPE_WEBHOOK_SECRET` no seu arquivo `.env.local` e no Vercel
- O secret pode ser encontrado na página do webhook no Stripe

## Fluxo de Controle de Pagamentos

### Usuário Gratuito (Sem Assinatura)
- Limite: 3 produtos
- Status: `is_active = false`
- `stripe_subscription_id = null`

### Usuário Pago (Assinatura Ativa)
- Limite: Produtos ilimitados
- Status: `is_active = true`
- `stripe_subscription_id = sub_xxx`

### Falha no Pagamento
1. Stripe tenta cobrar o pagamento
2. Se falha, envia evento `invoice.payment_failed`
3. Webhook recebe o evento
4. Sistema desativa o usuário (`is_active = false`)
5. Usuário volta ao limite de 3 produtos

### Cancelamento de Assinatura
1. Usuário cancela no Stripe
2. Stripe envia evento `customer.subscription.deleted`
3. Webhook recebe o evento
4. Sistema desativa o usuário e remove `subscription_id`
5. Usuário volta ao plano gratuito

## Verificação Manual

### API de Verificação
- Endpoint: `POST /api/check-subscription`
- Função: Verifica status da assinatura no Stripe e corrige inconsistências
- Uso: Botão "Verificar Status" na página de configurações

### Logs
- Todos os eventos do webhook são logados no console
- Use `vercel logs` para ver os logs em produção

## Testando os Webhooks

### Ambiente Local
1. Use o Stripe CLI para testar webhooks localmente:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

2. Em outro terminal, simule eventos:
```bash
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

### Produção
- Os webhooks funcionam automaticamente em produção
- Monitore os logs no Vercel para verificar se estão funcionando

## Troubleshooting

### Webhook não está funcionando
1. Verifique se a URL está correta
2. Confirme se o `STRIPE_WEBHOOK_SECRET` está configurado
3. Verifique os logs no Vercel
4. Teste com o Stripe CLI

### Usuário não foi desativado após falha no pagamento
1. Verifique se o webhook está recebendo os eventos
2. Use a API de verificação manual
3. Confirme se o `subscription_id` está correto no banco

### Logs de erro
- Todos os erros são logados com emojis para facilitar identificação
- Use `vercel logs --follow` para monitorar em tempo real 