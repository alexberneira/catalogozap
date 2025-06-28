'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Product, User } from '@/lib/supabaseClient'
import { useHost } from '@/hooks/useHost'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { baseUrl } = useHost()
  
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
      console.error('Erro ao buscar usuário:', userError)
      return
    }

    setUser(userData)

    // Buscar produtos do usuário
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
    } else {
      setProducts(productsData || [])
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Bem-vindo de volta, {user?.email}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                href="/cadastro-produto"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                + Adicionar Produto
              </Link>
              <Link
                href="/estatisticas"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                📊 Estatísticas
              </Link>
            </div>
          </div>
        </div>

        {/* Link do Catálogo */}
        {user?.username && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seu Catálogo</h2>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Link do seu catálogo:</p>
                <p className="text-lg font-medium text-blue-600 break-all">
                  {baseUrl}/{user.username}
                </p>
              </div>
              <Link
                href={`/${user.username}`}
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
              >
                Ver Catálogo
              </Link>
            </div>
          </div>
        )}

        {/* Status do Plano */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Seu Plano</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${user?.is_active ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {user?.is_active ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.is_active ? 'Plano Premium' : 'Plano Gratuito'}
                </h3>
                <p className="text-sm text-gray-600">
                  {user?.is_active 
                    ? 'Produtos ilimitados • R$19/mês' 
                    : `${products.length}/3 produtos • Grátis`
                  }
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              {user?.is_active ? (
                <div className="text-sm text-gray-600">
                  <p>Assinatura ativa</p>
                  <p className="text-green-600 font-medium">✓ Premium</p>
                </div>
              ) : (
                <Link
                  href="/upgrade"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Fazer Upgrade
                </Link>
              )}
            </div>
          </div>
          
          {/* Informações adicionais do plano */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Produtos cadastrados:</p>
                <p className="font-medium">{products.length} {user?.is_active ? '(ilimitado)' : ''}</p>
              </div>
              <div>
                <p className="text-gray-600">Status da conta:</p>
                <p className="font-medium">{user?.is_active ? 'Ativa' : 'Gratuita'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Seus Produtos ({products.length})
              </h2>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhum produto cadastrado
              </h3>
              <p className="mt-2 text-gray-600">
                Comece adicionando seu primeiro produto para criar seu catálogo.
              </p>
              <div className="mt-6">
                <Link
                  href="/cadastro-produto"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Adicionar Primeiro Produto
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
                  <div key={product.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={product.image_url}
                            alt={product.title}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-medium text-gray-900 mb-1">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...` 
                              : product.description
                            }
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                            <span className="text-gray-900 font-medium">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-gray-500">
                              {new Date(product.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          href={`/editar-produto/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              const { error } = await supabase
                                .from('products')
                                .delete()
                                .eq('id', product.id)
                              
                              if (!error) {
                                setProducts(products.filter(p => p.id !== product.id))
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Botão Adicionar Produto */}
              <div className="px-6 py-4 border-t border-gray-200">
                <Link
                  href="/cadastro-produto"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  + Adicionar Produto
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 