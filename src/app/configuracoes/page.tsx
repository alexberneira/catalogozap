'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CopyLinkButton from '@/components/CopyLinkButton'
import { User } from '@/lib/supabaseClient'

export default function Configuracoes() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form fields
  const [username, setUsername] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const router = useRouter()

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
                  Seu catálogo: catalogozap.com/{username}
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          {/* Senha e Assinatura */}
          <div className="space-y-6">
            {/* Alterar Senha */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Alterar Senha</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            </div>

            {/* Assinatura */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assinatura</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status da Assinatura</p>
                    <p className="text-sm text-gray-600">
                      {user?.is_active ? 'Ativa (Premium)' : 'Inativa (Gratuito)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.is_active ? 'R$ 19/mês' : 'Grátis'}
                    </p>
                  </div>
                </div>

                {user?.is_active ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Para cancelar sua assinatura, entre em contato com o suporte
                    </p>
                    <Link
                      href="/upgrade"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Gerenciar Assinatura
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/upgrade"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center block"
                  >
                    Fazer Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Link Encurtado e QR Code */}
        {user && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Compartilhe seu catálogo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Use o link encurtado e QR Code para compartilhar seu catálogo nas redes sociais
              </p>
            </div>
            <div className="p-6">
              <CopyLinkButton username={user.username} />
            </div>
          </div>
        )}

        {/* Voltar ao Dashboard */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 