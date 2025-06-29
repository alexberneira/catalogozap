console.log('🔍 TESTE DETALHADO DO WEBHOOK');
console.log('================================');

console.log('\n📋 Passos para investigar o problema:');
console.log('1. Execute o script SQL "investigar-problema.sql" no seu banco');
console.log('2. Verifique se há usuários com stripe_customer_id');
console.log('3. Envie um evento de teste pelo Stripe Dashboard');
console.log('4. Verifique os logs da Vercel para ver os logs detalhados');

console.log('\n🔍 Possíveis causas do problema:');
console.log('- Usuário não tem stripe_customer_id salvo no banco');
console.log('- Customer_id no banco não corresponde ao da charge');
console.log('- Usuário foi criado manualmente (sem pagamento)');
console.log('- Webhook de checkout.session.completed não funcionou');

console.log('\n📊 Dados do evento que você recebeu:');
console.log('- Charge ID: ch_3RfKdFB4EKN98BCo0YqKfdSm');
console.log('- Payment Intent: pi_3RfKdFB4EKN98BCo0oPb3yjY');
console.log('- Customer ID: (será obtido da charge)');

console.log('\n🔍 O que o webhook faz agora:');
console.log('1. Busca a charge pelo charge_id');
console.log('2. Obtém o customer_id da charge');
console.log('3. Busca usuário pelo customer_id');
console.log('4. Se encontrar, desativa o usuário');
console.log('5. Se não encontrar, mostra todos os usuários com customer_id');

console.log('\n📝 Logs esperados na Vercel:');
console.log('🔔 WEBHOOK RECEBIDO - Iniciando processamento...');
console.log('🔍 Charge encontrada: { id, customer, payment_intent }');
console.log('🔍 Buscando usuário por customer_id: [customer_id]');
console.log('✅ Usuário encontrado por customer_id: [user_id] [email]');
console.log('✅ Usuário desativado por reembolso atualizado: [user_id] [email]');

console.log('\n⚠️ Se não encontrar o usuário:');
console.log('⚠️ Nenhum usuário encontrado com customer_id: [customer_id]');
console.log('🔍 Todos os usuários com customer_id no sistema: [lista]');

console.log('\n🚀 Próximos passos:');
console.log('1. Execute o SQL e me envie os resultados');
console.log('2. Envie um evento de teste pelo Stripe');
console.log('3. Me envie os logs da Vercel');
console.log('4. Vamos identificar e corrigir o problema!'); 