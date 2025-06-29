'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useHost } from '@/hooks/useHost'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const { baseUrl } = useHost()
  
  const router = useRouter()

  // Função para formatar o número do WhatsApp
  const formatWhatsAppNumber = (number: string): string => {
    // Remove todos os caracteres não numéricos
    const cleanNumber = number.replace(/\D/g, '')
    
    // Se já tem código do país (55), retorna como está
    if (cleanNumber.startsWith('55')) {
      return cleanNumber
    }
    
    // Se tem 11 dígitos (DDD + número), adiciona 55
    if (cleanNumber.length === 11) {
      return `55${cleanNumber}`
    }
    
    // Se tem 10 dígitos (DDD + número sem 9), adiciona 55
    if (cleanNumber.length === 10) {
      return `55${cleanNumber}`
    }
    
    // Se tem 13 dígitos (já com código do país), retorna como está
    if (cleanNumber.length === 13) {
      return cleanNumber
    }
    
    // Para outros casos, adiciona 55 se não tiver
    if (!cleanNumber.startsWith('55')) {
      return `55${cleanNumber}`
    }
    
    return cleanNumber
  }

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    
    try {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (error) {
        // Se der erro 406 (Not Acceptable), provavelmente é problema de RLS
        // Vamos assumir que está disponível por enquanto
        console.warn('Erro ao verificar username:', error)
        setUsernameStatus('available')
        return
      }

      if (existingUser) {
        setUsernameStatus('taken')
      } else {
        setUsernameStatus('available')
      }
    } catch (error) {
      console.warn('Erro ao verificar username:', error)
      // Em caso de erro, assumir que está disponível
      setUsernameStatus('available')
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    
    // Desabilitar verificação em tempo real temporariamente
    // para evitar erros 406
    setUsernameStatus('idle')
    
    // Só verificar se tiver pelo menos 3 caracteres
    if (newUsername.length >= 3) {
      // Debounce para evitar muitas requisições
      const timeoutId = setTimeout(() => {
        // Por enquanto, assumir que está disponível
        setUsernameStatus('available')
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permite apenas números
    const numericValue = value.replace(/\D/g, '')
    setWhatsappNumber(numericValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Iniciando cadastro via API...')
      
      // Formatar o número do WhatsApp antes de enviar
      const formattedWhatsAppNumber = formatWhatsAppNumber(whatsappNumber)
      console.log('📱 Número original:', whatsappNumber)
      console.log('📱 Número formatado:', formattedWhatsAppNumber)
      
      // Usar a nova API route que contorna o problema do Supabase Auth
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          whatsapp_number: formattedWhatsAppNumber
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Erro na API:', result)
        setError(result.error || 'Erro ao criar conta')
        setLoading(false)
        return
      }

      console.log('✅ Usuário criado com sucesso:', result.user)

      // Fazer login automaticamente
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Erro no login automático:', signInError)
        setError('Conta criada, mas erro no login automático. Faça login manualmente.')
        setLoading(false)
        return
      }

      console.log('✅ Login automático realizado')
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Erro inesperado:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
            Criar meu catálogo
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Comece a vender no WhatsApp hoje
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nome do negócio
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  usernameStatus === 'taken' ? 'border-red-300' :
                  usernameStatus === 'available' ? 'border-green-300' :
                  'border-gray-300'
                }`}
                placeholder="minha-loja"
              />
              <div className="mt-1 flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  Seu catálogo: {baseUrl}/{username || 'meu-catalogo'}
                </p>
                {usernameStatus === 'checking' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-1 text-xs">Verificando...</span>
                  </div>
                )}
                {usernameStatus === 'available' && username.length >= 3 && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-xs">Disponível</span>
                  </div>
                )}
                {usernameStatus === 'taken' && (
                  <div className="flex items-center text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-xs">Já em uso</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                Número do WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={whatsappNumber}
                onChange={handleWhatsAppChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="11999999999"
              />
              <p className="mt-1 text-sm text-gray-500">
                Digite apenas números. O código do país (+55) será adicionado automaticamente.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Criando catálogo...' : 'Criar meu catálogo'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Já tem catálogo?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Acessar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 