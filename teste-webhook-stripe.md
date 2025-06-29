# 🧪 Guia para Testar Webhooks do Stripe

## 📋 **1. Verificar configuração no Stripe Dashboard**

### Acesse: https://dashboard.stripe.com/webhooks

1. **Verifique se o endpoint está correto:**
   ```
   https://seu-dominio.com/api/webhook
   ```

2. **Confirme os eventos configurados:**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_refunded`

## 🧪 **2. Teste via Stripe Dashboard**

### **Passo a passo:**
1. Acesse o webhook no Stripe Dashboard
2. Clique em **"Send test webhook"**
3. Selecione o evento: `customer.subscription.updated`
4. Clique em **"Send test webhook"**
5. Verifique se retorna **200 OK**

## 🔍 **3. Verificar logs no Supabase**

### Execute este SQL no Supabase:
```sql
-- Verificar se os webhooks estão chegando
SELECT 
    event_type,
    created_at,
    data,
    processed
FROM stripe_webhooks 
ORDER BY created_at DESC
LIMIT 10;
```

## 📊 **4. Teste manual via cURL**

### **Teste de assinatura criada:**
```bash
curl -X POST https://seu-dominio.com/api/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{
    "type": "customer.subscription.created",
    "data": {
      "object": {
        "id": "sub_test123",
        "customer": "cus_test123",
        "status": "active",
        "current_period_end": 1735689600
      }
    }
  }'
```

## 🎯 **5. Teste prático com usuário real**

### **Cenário de teste:**
1. **Criar novo usuário** via `/register`
2. **Fazer upgrade** para premium
3. **Verificar se webhook atualiza o banco**
4. **Fazer reembolso** no Stripe
5. **Verificar se webhook cancela a assinatura**

## 📝 **6. Logs para monitorar**

### **No console do navegador:**
```javascript
// Verificar se a API está sendo chamada
fetch('/api/check-subscription', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(data => console.log('Status:', data));
```

### **No terminal do servidor:**
```
🔍 Webhook recebido: customer.subscription.updated
📊 Dados: { subscription_id: "sub_123", status: "active" }
✅ Usuário atualizado no banco
```

## ⚠️ **7. Problemas comuns**

### **Webhook não chega:**
- ❌ Domínio incorreto
- ❌ SSL não configurado
- ❌ Firewall bloqueando

### **Webhook chega mas falha:**
- ❌ Secret key incorreta
- ❌ Assinatura inválida
- ❌ Erro no código da API

### **Webhook chega mas não atualiza:**
- ❌ RLS policies bloqueando
- ❌ Trigger não funcionando
- ❌ Erro na lógica de negócio

## 🚀 **8. Comandos para testar localmente**

### **Usar ngrok para testar local:**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 3000

# Usar URL do ngrok no Stripe webhook
# https://abc123.ngrok.io/api/webhook
```

## 📞 **9. Suporte Stripe**

Se os testes falharem:
- 📧 Email: support@stripe.com
- 📞 Chat: https://support.stripe.com
- 📚 Docs: https://stripe.com/docs/webhooks 