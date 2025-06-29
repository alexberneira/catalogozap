// Teste automatizado do fluxo completo de assinatura
// Este script testa: cadastro -> free -> assinatura -> premium -> reembolso -> free

const testCompleteSubscriptionFlow = async () => {
  console.log('🚀 Iniciando teste do fluxo completo de assinatura...\n')
  
  let testUser = null
  let subscriptionId = null
  let paymentIntentId = null
  
  try {
    // 1. CADASTRO DE USUÁRIO NOVO
    console.log('📝 1. Cadastrando usuário novo...')
    const timestamp = Date.now()
    const testEmail = `teste-${timestamp}@exemplo.com`
    const testUsername = `teste-${timestamp}`
    
    const signupResponse = await fetch('http://localhost:3002/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername
      })
    })

    if (!signupResponse.ok) {
      throw new Error(`Erro no cadastro: ${await signupResponse.text()}`)
    }

    const signupData = await signupResponse.json()
    testUser = signupData.user
    console.log(`✅ Usuário criado: ${testUser.email} (ID: ${testUser.id})`)

    // 2. VERIFICAR SE ESTÁ FREE
    console.log('\n🔍 2. Verificando se o plano está free...')
    const checkFreeResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      }
    })

    if (!checkFreeResponse.ok) {
      throw new Error(`Erro ao verificar assinatura: ${await checkFreeResponse.text()}`)
    }

    const checkFreeData = await checkFreeResponse.json()
    console.log(`📊 Status inicial: ${checkFreeData.status} (is_active: ${checkFreeData.is_active})`)
    
    if (checkFreeData.status !== 'free' || checkFreeData.is_active !== false) {
      throw new Error('❌ Usuário não está free inicialmente!')
    }
    console.log('✅ Usuário está free como esperado')

    // 3. CRIAR ASSINATURA
    console.log('\n💳 3. Criando assinatura...')
    const createSubscriptionResponse = await fetch('http://localhost:3002/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      },
      body: JSON.stringify({
        priceId: 'price_1QqXXXXXXXXXXXXX' // Substitua pelo seu price_id real
      })
    })

    if (!createSubscriptionResponse.ok) {
      throw new Error(`Erro ao criar assinatura: ${await createSubscriptionResponse.text()}`)
    }

    const subscriptionData = await createSubscriptionResponse.json()
    console.log(`✅ Checkout session criada: ${subscriptionData.sessionId}`)
    
    // Simular pagamento bem-sucedido (em produção, isso seria feito pelo Stripe)
    console.log('⚠️  Simulando pagamento bem-sucedido...')
    
    // Aguardar um pouco para o webhook processar
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. VERIFICAR SE ATIVOU COMO PREMIUM
    console.log('\n🔍 4. Verificando se ativou como premium...')
    const checkPremiumResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      }
    })

    if (!checkPremiumResponse.ok) {
      throw new Error(`Erro ao verificar assinatura: ${await checkPremiumResponse.text()}`)
    }

    const checkPremiumData = await checkPremiumResponse.json()
    console.log(`📊 Status após assinatura: ${checkPremiumData.status} (is_active: ${checkPremiumData.is_active})`)
    
    if (checkPremiumData.status !== 'active' || checkPremiumData.is_active !== true) {
      console.log('⚠️  Usuário não está premium ainda. Isso pode ser normal se o webhook ainda não processou.')
      console.log('🔄 Aguardando mais tempo para o webhook processar...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Verificar novamente
      const checkPremiumResponse2 = await fetch('http://localhost:3002/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.access_token}`
        }
      })

      const checkPremiumData2 = await checkPremiumResponse2.json()
      console.log(`📊 Status após aguardar: ${checkPremiumData2.status} (is_active: ${checkPremiumData2.is_active})`)
      
      if (checkPremiumData2.status !== 'active' || checkPremiumData2.is_active !== true) {
        throw new Error('❌ Usuário não ativou como premium após assinatura!')
      }
    }
    console.log('✅ Usuário está premium como esperado')

    // 5. SIMULAR REEMBOLSO
    console.log('\n💰 5. Simulando reembolso...')
    
    // Aqui você precisaria simular um reembolso no Stripe
    // Por enquanto, vamos apenas forçar o status como free para testar
    console.log('⚠️  Para testar reembolso, você precisa:')
    console.log('   1. Ir no painel do Stripe')
    console.log('   2. Encontrar a assinatura criada')
    console.log('   3. Fazer um reembolso')
    console.log('   4. Aguardar o webhook processar')
    console.log('   5. Verificar se voltou para free')
    
    // Aguardar input do usuário
    console.log('\n⏳ Aguardando você fazer o reembolso no Stripe...')
    console.log('   Pressione Enter quando tiver feito o reembolso...')
    
    // Em um ambiente real, você poderia usar readline para aguardar input
    // Por enquanto, vamos simular um delay
    await new Promise(resolve => setTimeout(resolve, 10000))

    // 6. VERIFICAR SE VOLTOU PARA FREE
    console.log('\n🔍 6. Verificando se voltou para free...')
    const checkFreeAgainResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.access_token}`
      }
    })

    if (!checkFreeAgainResponse.ok) {
      throw new Error(`Erro ao verificar assinatura: ${await checkFreeAgainResponse.text()}`)
    }

    const checkFreeAgainData = await checkFreeAgainResponse.json()
    console.log(`📊 Status após reembolso: ${checkFreeAgainData.status} (is_active: ${checkFreeAgainData.is_active})`)
    
    if (checkFreeAgainData.status !== 'free' || checkFreeAgainData.is_active !== false) {
      console.log('⚠️  Usuário ainda não voltou para free. Aguardando webhook...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Verificar novamente
      const checkFreeAgainResponse2 = await fetch('http://localhost:3002/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signupData.access_token}`
        }
      })

      const checkFreeAgainData2 = await checkFreeAgainResponse2.json()
      console.log(`📊 Status final: ${checkFreeAgainData2.status} (is_active: ${checkFreeAgainData2.is_active})`)
      
      if (checkFreeAgainData2.status !== 'free' || checkFreeAgainData2.is_active !== false) {
        throw new Error('❌ Usuário não voltou para free após reembolso!')
      }
    }
    console.log('✅ Usuário voltou para free como esperado')

    // RESULTADO FINAL
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log('✅ Fluxo completo funcionando:')
    console.log('   - Cadastro ✅')
    console.log('   - Status inicial free ✅')
    console.log('   - Assinatura criada ✅')
    console.log('   - Status premium ativado ✅')
    console.log('   - Reembolso processado ✅')
    console.log('   - Status final free ✅')

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    console.log('\n🔧 Para debugar:')
    console.log('   - Verifique os logs do servidor')
    console.log('   - Verifique os logs do webhook')
    console.log('   - Verifique o painel do Stripe')
    
    if (testUser) {
      console.log(`\n🧹 Limpeza: usuário de teste criado: ${testUser.email}`)
      console.log('   Você pode deletar manualmente no Supabase se necessário')
    }
  }
}

// Executar o teste
testCompleteSubscriptionFlow() 