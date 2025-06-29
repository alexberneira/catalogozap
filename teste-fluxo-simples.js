// Teste simplificado do fluxo de assinatura
// Execute com: node teste-fluxo-simples.js

const fetch = require('node-fetch'); // Você pode precisar instalar: npm install node-fetch

const testSubscriptionFlow = async () => {
  console.log('🚀 Teste do fluxo de assinatura\n');
  
  try {
    // 1. CADASTRO
    console.log('📝 1. Cadastrando usuário...');
    const timestamp = Date.now();
    const testEmail = `teste-${timestamp}@exemplo.com`;
    const testUsername = `teste-${timestamp}`;
    
    const signupResponse = await fetch('http://localhost:3002/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, username: testUsername })
    });

    if (!signupResponse.ok) {
      throw new Error(`Erro no cadastro: ${await signupResponse.text()}`);
    }

    const signupData = await signupResponse.json();
    console.log(`✅ Usuário criado: ${testEmail}`);

    // 2. VERIFICAR STATUS INICIAL (DEVE SER FREE)
    console.log('\n🔍 2. Verificando status inicial...');
    const checkInitialResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      }
    });

    const initialStatus = await checkInitialResponse.json();
    console.log(`📊 Status inicial: ${initialStatus.status} (ativo: ${initialStatus.is_active})`);
    
    if (initialStatus.status !== 'free') {
      throw new Error('❌ Usuário deveria estar free inicialmente!');
    }
    console.log('✅ Status inicial correto (free)');

    // 3. CRIAR CHECKOUT SESSION
    console.log('\n💳 3. Criando checkout session...');
    const checkoutResponse = await fetch('http://localhost:3002/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      },
      body: JSON.stringify({
        priceId: 'price_1QqQw8Jv6v6v6v' // <- SEU PRICE_ID REAL AQUI
      })
    });

    if (!checkoutResponse.ok) {
      throw new Error(`Erro ao criar checkout: ${await checkoutResponse.text()}`);
    }

    const checkoutData = await checkoutResponse.json();
    console.log(`✅ Checkout criado: ${checkoutData.sessionId}`);
    console.log(`🔗 URL do checkout: ${checkoutData.url}`);

    // 4. INSTRUÇÕES PARA TESTE MANUAL
    console.log('\n📋 4. INSTRUÇÕES PARA TESTE MANUAL:');
    console.log('   a) Acesse a URL do checkout acima');
    console.log('   b) Complete o pagamento com cartão de teste');
    console.log('   c) Aguarde o webhook processar (5-10 segundos)');
    console.log('   d) Execute o próximo script para verificar se virou premium');
    console.log('   e) No Stripe, faça um reembolso');
    console.log('   f) Execute o script final para verificar se voltou para free');

    console.log('\n⏳ Aguardando 10 segundos para você começar o teste...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. VERIFICAR STATUS APÓS PAGAMENTO
    console.log('\n🔍 5. Verificando status após pagamento...');
    const checkAfterPaymentResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      }
    });

    const afterPaymentStatus = await checkAfterPaymentResponse.json();
    console.log(`📊 Status após pagamento: ${afterPaymentStatus.status} (ativo: ${afterPaymentStatus.is_active})`);
    
    if (afterPaymentStatus.status === 'active') {
      console.log('✅ Usuário virou premium!');
    } else {
      console.log('⚠️  Usuário ainda não virou premium. Pode ser que:');
      console.log('   - O pagamento ainda não foi processado');
      console.log('   - O webhook ainda não foi chamado');
      console.log('   - Houve algum erro no processamento');
    }

    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('📧 Email do usuário de teste:', testEmail);
    console.log('🆔 ID do usuário:', signupData.user.id);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
};

// Executar o teste
testSubscriptionFlow(); 