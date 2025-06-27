'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Registrar usuário no Supabase Auth com metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            whatsapp_number: whatsappNumber,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Aguardar um pouco para o trigger processar
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Criar conta gratuita
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                faça login se já tem uma conta
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário (para URL)
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="meu-catalogo"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Seu catálogo ficará em: catalogozap.com/{username}
                </p>
              </div>
              
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  Número do WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5511999999999"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Apenas números, sem espaços ou caracteres especiais
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta gratuita'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Política de Privacidade
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
} 