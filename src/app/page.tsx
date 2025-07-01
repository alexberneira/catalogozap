'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Usuário está logado, redirecionar para o dashboard
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Pare de perder vendas no WhatsApp
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
                Crie seu catálogo online grátis, compartilhe o link e receba pedidos direto no WhatsApp. Fácil, rápido e sem cartão de crédito.
              </p>
            </div>
          </div>
          
          {/* Prova social */}
          <div className="mb-4">
            <p className="text-base text-green-700 font-semibold">Mais de 3.000 catálogos criados</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center items-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Criar meu catálogo grátis
            </Link>
            <div className="text-xs text-gray-500 mt-2 sm:mt-0 text-center w-full sm:w-auto">
              Grátis até 3 produtos. Não precisa de cartão de crédito.
            </div>
            <Link
              href="/demo"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-200"
            >
              Ver exemplo de catálogo
            </Link>
          </div>
          {/* Passo a passo */}
          <div className="mb-12 flex flex-col items-center">
            <div className="bg-white rounded-xl shadow-lg px-6 py-4 inline-block">
              <ol className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center text-base text-slate-700 font-medium">
                <li><span className="font-bold text-blue-600">1.</span> Cadastre-se grátis</li>
                <li><span className="font-bold text-blue-600">2.</span> Adicione seus produtos</li>
                <li><span className="font-bold text-blue-600">3.</span> Compartilhe o link e receba pedidos no WhatsApp</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fácil de usar</h3>
            <p className="text-gray-600">
              Crie seu catálogo em minutos com nossa interface simples e intuitiva
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Integração WhatsApp</h3>
            <p className="text-gray-600">
              Botão direto para WhatsApp em cada produto. Venda mais fácil!
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rápido e responsivo</h3>
            <p className="text-gray-600">
              Seu catálogo funciona perfeitamente no celular e carrega instantaneamente
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
            Não perca mais vendas: comece agora mesmo!
          </h2>
          <p className="text-gray-600 mb-6">
            Em poucos minutos, seu catálogo estará online e pronto para receber pedidos. Muitos vendedores já estão vendendo mais com o Catálogo Público. O próximo pode ser você!
          </p>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
          >
            Criar meu catálogo grátis
          </Link>
          <div className="text-xs text-gray-500 mt-2">
            Grátis até 3 produtos. Não precisa de cartão de crédito.
          </div>
        </div>
      </main>
    </div>
  )
}
