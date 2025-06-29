'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestCadastro() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState('')

  const testAuthSignUp = async () => {
    setLoading(true)
    setStep('Testando criação no Supabase Auth...')
    setError('')
    setResult(null)

    try {
      const testEmail = `teste-${Date.now()}@exemplo.com`
      const testPassword = '123456'

      console.log('🔍 Testando Auth SignUp...')
      console.log('📧 Email:', testEmail)
      console.log('🔑 Password:', testPassword)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      console.log('📋 Resultado Auth:', { authData, authError })

      if (authError) {
        setError(`❌ Erro no Auth: ${authError.message}`)
        setResult({ authData, authError })
        return
      }

      if (!authData.user) {
        setError('❌ Usuário não foi criado no Auth')
        setResult({ authData, authError })
        return
      }

      setResult({ authData, authError })
      setStep('✅ Usuário criado no Auth com sucesso!')
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Testar inserção na tabela users
      await testUsersInsert(authData.user.id, authData.user.email || '')

    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      setError(`❌ Erro inesperado: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testUsersInsert = async (userId: string, userEmail: string) => {
    setStep('Testando inserção na tabela users...')
    
    try {
      const testUsername = `teste-${Date.now()}`
      const testWhatsapp = '5511999999999'

      console.log('🔍 Testando inserção na tabela users...')
      console.log('🆔 User ID:', userId)
      console.log('📧 Email:', userEmail)
      console.log('👤 Username:', testUsername)

      const insertData = {
        id: userId,
        email: userEmail,
        username: testUsername,
        whatsapp_number: testWhatsapp,
        is_active: true,
        created_at: new Date().toISOString()
      }

      console.log('📊 Dados para inserção:', insertData)

      const { data: insertResult, error: insertError } = await supabase
        .from('users')
        .insert([insertData])

      console.log('📋 Resultado inserção:', { insertResult, insertError })

      if (insertError) {
        setError(`❌ Erro na inserção: ${insertError.message}`)
        setResult((prev: any) => ({ ...prev, insertResult, insertError }))
        return
      }

      setResult((prev: any) => ({ ...prev, insertResult, insertError }))
      setStep('✅ Usuário inserido na tabela users com sucesso!')

      // Verificar se foi realmente inserido
      await testUsersSelect(userId)

    } catch (error) {
      console.error('❌ Erro na inserção:', error)
      setError(`❌ Erro na inserção: ${error}`)
    }
  }

  const testUsersSelect = async (userId: string) => {
    setStep('Verificando se o usuário foi inserido...')
    
    try {
      console.log('🔍 Verificando inserção...')
      console.log('🆔 User ID:', userId)

      const { data: selectResult, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📋 Resultado select:', { selectResult, selectError })

      if (selectError) {
        setError(`❌ Erro ao verificar: ${selectError.message}`)
        setResult((prev: any) => ({ ...prev, selectResult, selectError }))
        return
      }

      setResult((prev: any) => ({ ...prev, selectResult, selectError }))
      setStep('✅ Usuário encontrado na tabela! Teste completo!')

    } catch (error) {
      console.error('❌ Erro na verificação:', error)
      setError(`❌ Erro na verificação: ${error}`)
    }
  }

  const testDatabaseStructure = async () => {
    setLoading(true)
    setStep('Analisando estrutura do banco...')
    setError('')
    setResult(null)

    try {
      // Testar se conseguimos acessar a tabela
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      console.log('📋 Teste de acesso à tabela:', { tableData, tableError })

      // Testar estrutura da tabela (sem usar RPC por enquanto)
      const { data: structureData, error: structureError } = await supabase
        .from('users')
        .select('*')
        .limit(0)

      console.log('📋 Estrutura da tabela:', { structureData, structureError })

      setResult({ tableData, tableError, structureData, structureError })
      setStep('✅ Análise da estrutura concluída!')

    } catch (error) {
      console.error('❌ Erro na análise:', error)
      setError(`❌ Erro na análise: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearTestData = async () => {
    if (!result?.authData?.user?.id) {
      setError('❌ Nenhum usuário de teste para limpar')
      return
    }

    setLoading(true)
    setStep('Limpando dados de teste...')

    try {
      const userId = result.authData.user.id

      // Remover da tabela users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      console.log('🗑️ Resultado da limpeza:', { deleteError })

      if (deleteError) {
        setError(`❌ Erro ao limpar: ${deleteError.message}`)
        return
      }

      setStep('✅ Dados de teste removidos!')
      setResult(null)
      setError('')

    } catch (error) {
      console.error('❌ Erro na limpeza:', error)
      setError(`❌ Erro na limpeza: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Teste de Cadastro - Investigação
          </h1>
          <p className="text-gray-600 mb-6">
            Esta página testa o processo de cadastro passo a passo para identificar onde está o problema.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testDatabaseStructure}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              🔍 Analisar Estrutura do Banco
            </button>

            <button
              onClick={testAuthSignUp}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              🧪 Testar Cadastro Completo
            </button>

            {result?.authData?.user?.id && (
              <button
                onClick={clearTestData}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                🗑️ Limpar Dados de Teste
              </button>
            )}
          </div>

          {step && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {step}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📋 Resultados dos Testes
              </h3>
              <pre className="text-sm text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 Informações do Banco
          </h2>
          <div className="text-sm text-gray-600">
            <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
            <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 