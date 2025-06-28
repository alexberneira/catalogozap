'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CopyLinkButton from '@/components/CopyLinkButton'
import { User } from '@/lib/supabaseClient'
import { useHost } from '@/hooks/useHost'

export default function Configuracoes() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { baseUrl } = useHost()
  
  // Form fields
  const [username, setUsername] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(false)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [reactivatingSubscription, setReactivatingSubscription] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/login')
      return
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError) {
      setError('Erro ao carregar dados do usuário')
      return
    }

    setUser(userData)
    setUsername(userData.username)
    setWhatsappNumber(userData.whatsapp_number)
    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username,
          whatsapp_number: whatsappNumber,
        })
        .eq('id', user?.id)

      if (updateError) {
        setError('Erro ao atualizar perfil')
        return
      }

      setSuccess('Perfil atualizado com sucesso!')
      setUser(prev => prev ? { ...prev, username, whatsapp_number: whatsappNumber } : null)
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError('Erro ao alterar senha')
        return
      }

      setSuccess('Senha alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const checkSubscription = async () => {
    setCheckingSubscription(true)
    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setSubscription(data)
      
      // Atualizar dados do usuário
      await checkUser()
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
    } finally {
      setCheckingSubscription(false)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso ilimitado até o final do período atual.')) {
      return
    }

    setCancelingSubscription(true)
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        await checkSubscription() // Atualizar dados da assinatura
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao cancelar assinatura' })
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      setMessage({ type: 'error', text: 'Erro ao cancelar assinatura' })
    } finally {
      setCancelingSubscription(false)
    }
  }

  const reactivateSubscription = async () => {
    setReactivatingSubscription(true)
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        await checkSubscription() // Atualizar dados da assinatura
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao reativar assinatura' })
      }
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error)
      setMessage({ type: 'error', text: 'Erro ao reativar assinatura' })
    } finally {
      setReactivatingSubscription(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'past_due':
        return 'text-yellow-600'
      case 'canceled':
      case 'unpaid':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm">{message.text}</p>
            <button 
              onClick={() => setMessage(null)}
              className="mt-2 text-xs underline"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Perfil */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Perfil</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="meu-catalogo"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Seu catálogo: {baseUrl}/{username}
                </p>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5511999999999"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Apenas números, sem espaços ou caracteres especiais
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>

          {/* Alterar Senha */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alterar Senha</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {saving ? 'Alterando...' : 'Alterar senha'}
              </button>
            </form>
          </div>

          {/* Assinatura */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assinatura</h2>
            {subscription ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className={`mt-1 text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.message}
                  </p>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {subscription.cancel_at_period_end ? 'Cancelamento efetivo' : 'Próxima cobrança'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                )}
                {subscription.cancel_at_period_end && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Sua assinatura será cancelada no final do período atual
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                    <button
                      onClick={cancelSubscription}
                      disabled={cancelingSubscription}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelingSubscription ? 'Cancelando...' : 'Cancelar Assinatura'}
                    </button>
                  )}
                  
                  {subscription.cancel_at_period_end && (
                    <button
                      onClick={reactivateSubscription}
                      disabled={reactivatingSubscription}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {reactivatingSubscription ? 'Reativando...' : 'Reativar Assinatura'}
                    </button>
                  )}
                  
                  <button
                    onClick={checkSubscription}
                    disabled={checkingSubscription}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {checkingSubscription ? 'Verificando...' : 'Verificar Status'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={checkSubscription}
                  disabled={checkingSubscription}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {checkingSubscription ? 'Verificando...' : 'Verificar Assinatura'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Link do Catálogo */}
        {user?.username && (
          <div className="mt-8">
            <CopyLinkButton username={user.username} />
          </div>
        )}
      </div>
    </div>
  )
} 