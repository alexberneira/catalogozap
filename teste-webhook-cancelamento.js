const https = require('https');

// Dados do evento que você recebeu
const webhookData = {
  "id": "evt_3RfKdFB4EKN98BCo0JtJC1yG",
  "object": "event",
  "api_version": "2025-05-28.basil",
  "created": 1751201507,
  "data": {
    "object": {
      "id": "re_3RfKdFB4EKN98BCo0GP6ecuw",
      "object": "refund",
      "amount": 1900,
      "balance_transaction": "txn_3RfKdFB4EKN98BCo0NX3rRHV",
      "charge": "ch_3RfKdFB4EKN98BCo0YqKfdSm",
      "created": 1751201342,
      "currency": "brl",
      "destination_details": {
        "card": {
          "reference": "687903",
          "reference_status": "available",
          "reference_type": "system_trace_audit_number",
          "type": "reversal"
        },
        "type": "card"
      },
      "metadata": {},
      "payment_intent": "pi_3RfKdFB4EKN98BCo0oPb3yjY",
      "reason": "duplicate",
      "receipt_number": null,
      "source_transfer_reversal": null,
      "status": "succeeded",
      "transfer_reversal": null
    },
    "previous_attributes": {}
  },
  "livemode": true,
  "pending_webhooks": 1,
  "request": {
    "id": null,
    "idempotency_key": null
  },
  "type": "charge.refund.updated"
};

console.log('🔍 Dados do evento de reembolso:');
console.log('📍 Charge ID:', webhookData.data.object.charge);
console.log('📍 Payment Intent:', webhookData.data.object.payment_intent);
console.log('📍 Amount:', webhookData.data.object.amount);
console.log('📍 Status:', webhookData.data.object.status);
console.log('📍 Reason:', webhookData.data.object.reason);

console.log('\n📋 Para testar o webhook:');
console.log('1. Execute o script SQL "verificar-dados-webhook.sql" no seu banco');
console.log('2. Verifique se há usuários com stripe_customer_id');
console.log('3. Se houver, verifique se o customer_id corresponde ao da charge');
console.log('4. Envie um evento de teste pelo Stripe Dashboard');
console.log('5. Verifique os logs da Vercel para ver o processamento');

console.log('\n🔍 Informações importantes:');
console.log('- O webhook está funcionando (recebeu o evento)');
console.log('- O erro "0 rows" é esperado se não há usuário com esse payment_intent');
console.log('- O sistema agora tenta buscar pela charge para obter o customer_id');
console.log('- Se encontrar o customer_id, deve conseguir desativar o usuário'); 