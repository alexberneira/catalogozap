// Teste direto da API de verificação de assinatura
// Execute este script para verificar se a API está retornando o status correto

const testCheckSubscription = async () => {
  try {
    console.log('🔍 Testando API de verificação de assinatura...')
    
    // Primeiro, vamos fazer login para obter o token
    const loginResponse = await fetch('http://localhost:3002/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@teste.com',
        username: 'alexbern'
      })
    })

    if (!loginResponse.ok) {
      console.log('❌ Erro no login:', await loginResponse.text())
      return
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login realizado:', loginData)

    // Agora vamos testar a verificação de assinatura
    const checkResponse = await fetch('http://localhost:3002/api/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.access_token}`
      }
    })

    if (!checkResponse.ok) {
      console.log('❌ Erro na verificação:', await checkResponse.text())
      return
    }

    const checkData = await checkResponse.json()
    console.log('📊 Resultado da verificação:', JSON.stringify(checkData, null, 2))

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar o teste
testCheckSubscription() 