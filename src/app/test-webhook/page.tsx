'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestWebhook() {
  const [email, setEmail] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const checkUser = async () => {
    if (!email) {
      setError('Digite um email')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError) {
        setError('Usuário não encontrado')
        return
      }

      setUserData(user)
      setSuccess('Usuário encontrado!')
    } catch (error) {
      setError('Erro ao buscar usuário')
    } finally {
      setLoading(false)
    }
  }

  const forceUpdateStatus = async (isActive: boolean) => {
    if (!userData) {
      setError('Nenhum usuário selecionado')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userData.id)

      if (error) {
        setError('Erro ao atualizar status')
        return
      }

      setSuccess(`Status atualizado para: ${isActive ? 'Premium' : 'Free'}`)
      setUserData({ ...userData, is_active: isActive })
    } catch (error) {
      setError('Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  const testSubscriptionCheck = async () => {
    if (!userData) {
      setError('Nenhum usuário selecionado')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess(`Status da assinatura: ${data.message}`)
        console.log('Dados da assinatura:', data)
      } else {
        setError(`Erro: ${data.error}`)
      }
    } catch (error) {
      setError('Erro ao verificar assinatura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Teste de Webhook</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Buscar Usuário</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email do usuário"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={checkUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              {success}
            </div>
          )}
        </div>

        {userData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{userData.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className={`mt-1 text-sm font-medium ${
                  userData.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {userData.is_active ? 'Premium' : 'Free'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stripe Customer ID</label>
                <p className="mt-1 text-sm text-gray-900">{userData.stripe_customer_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stripe Subscription ID</label>
                <p className="mt-1 text-sm text-gray-900">{userData.stripe_subscription_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Criado em</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(userData.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => forceUpdateStatus(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Forçar Premium
              </button>
              <button
                onClick={() => forceUpdateStatus(false)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Forçar Free
              </button>
              <button
                onClick={testSubscriptionCheck}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Verificar Assinatura
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Instruções para Teste</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900">1. Teste Manual</h3>
              <p>Use os botões acima para forçar mudanças de status e verificar se o sistema responde corretamente.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Teste de Webhook</h3>
              <p>No Stripe Dashboard, envie um webhook de teste para o evento <code>customer.subscription.deleted</code> ou <code>charge.refunded</code>.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. Verificar Logs</h3>
              <p>Monitore o terminal do servidor para ver os logs do webhook sendo processado.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">4. Problemas Comuns</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Webhook não chega: Verificar URL e SSL</li>
                <li>Assinatura inválida: Verificar STRIPE_WEBHOOK_SECRET</li>
                <li>Usuário não encontrado: Verificar stripe_subscription_id</li>
                <li>RLS bloqueando: Verificar políticas do Supabase</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 