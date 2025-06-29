# Verificação do Webhook Stripe

## 1. Verificar se o webhook está configurado no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para **Developers** > **Webhooks**
3. Verifique se existe um webhook configurado para: `https://www.catalogopublico.com/api/webhook`

## 2. Verificar eventos configurados

O webhook deve estar configurado para receber os seguintes eventos:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`
- `charge.refund.updated`
- `customer.subscription.trial_will_end`
- `invoice.upcoming`

## 3. Verificar logs do webhook no Stripe

1. No Dashboard do Stripe, clique no webhook
2. Vá para a aba **Events**
3. Verifique se há eventos sendo enviados
4. Clique em um evento para ver os detalhes:
   - **Status**: Deve ser 200 (sucesso)
   - **Response**: Deve mostrar `{"received": true}`
   - **Request**: Deve mostrar os dados enviados

## 4. Testar webhook manualmente

1. No Dashboard do Stripe, clique no webhook
2. Clique em **Send test webhook**
3. Selecione um evento (ex: `charge.refund.updated`)
4. Clique em **Send test webhook**
5. Verifique se aparece nos logs da Vercel

## 5. Verificar variáveis de ambiente

Certifique-se de que a variável `STRIPE_WEBHOOK_SECRET` está configurada corretamente:
- No Dashboard do Stripe, clique no webhook
- Copie o **Signing secret**
- Configure na Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`

## 6. Verificar logs da Vercel

Se o webhook não aparece nos logs da Vercel, pode ser:
1. **Webhook não configurado no Stripe**
2. **URL incorreta**
3. **Secret incorreto**
4. **Eventos não configurados**
5. **Problema de rede**

## 7. Debug adicional

Para forçar um evento de teste:
1. Faça um reembolso no Stripe
2. Verifique se o evento `charge.refund.updated` é enviado
3. Verifique os logs da Vercel para ver se foi recebido

## 8. Comandos úteis

```bash
# Testar conectividade do webhook
node test-webhook-connection.js

# Verificar logs em tempo real (se estiver rodando localmente)
npm run dev
``` 