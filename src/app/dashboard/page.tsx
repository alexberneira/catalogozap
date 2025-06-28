'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CopyLinkButton from '@/components/CopyLinkButton'
import { User, Product } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [quickStats, setQuickStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchProducts()
    fetchQuickStats()
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
  }

  const fetchProducts = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) return

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      setError('Erro ao carregar produtos')
      return
    }

    setProducts(productsData || [])
    setLoading(false)
  }

  const fetchQuickStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch('/api/analytics/stats', {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      const data = await response.json()
      
      if (response.ok && data.stats) {
        setQuickStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas rápidas:', error)
    }
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/editar-produto/${productId}`)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    setDeletingProduct(productId)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao deletar produto')
        return
      }

      // Remover produto da lista
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setDeletingProduct(null)
    }
  }

  const canAddMoreProducts = () => {
    if (!user) return false
    return user.is_active || products.length < 3
  }

  const getProductLimitText = () => {
    if (user?.is_active) {
      return 'Plano Premium - Produtos ilimitados'
    }
    return `${products.length}/3 produtos (plano gratuito)`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
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
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus produtos e configurações
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Status do plano</p>
              <p className="text-lg font-semibold text-gray-900">
                {getProductLimitText()}
              </p>
            </div>
          </div>
          
          {user && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Seu catálogo</p>
                <p className="text-lg font-semibold text-blue-900">
                  catalogozap.com/{user.username}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">WhatsApp</p>
                <p className="text-lg font-semibold text-green-900">
                  {user.whatsapp_number}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Produtos</p>
                <p className="text-lg font-semibold text-purple-900">
                  {products.length} cadastrados
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {quickStats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Estatísticas Rápidas</h2>
              <Link
                href="/estatisticas"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Ver detalhes →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(quickStats.total_views)}</p>
                <p className="text-sm text-gray-600">Visualizações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(quickStats.total_clicks)}</p>
                <p className="text-sm text-gray-600">Cliques WhatsApp</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {quickStats.total_views > 0 ? ((quickStats.total_clicks / quickStats.total_views) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-sm text-gray-600">Taxa Conversão</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(quickStats.views_today)}</p>
                <p className="text-sm text-gray-600">Visualizações Hoje</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Seus Produtos</h2>
              
              {canAddMoreProducts() ? (
                <Link
                  href="/cadastro-produto"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Adicionar Produto
                </Link>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Limite de produtos atingido
                  </p>
                  <Link
                    href="/upgrade"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Fazer Upgrade
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando seu primeiro produto.
                </p>
                {canAddMoreProducts() && (
                  <div className="mt-6">
                    <Link
                      href="/cadastro-produto"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Adicionar Produto
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-medium text-gray-900 mb-1">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-semibold text-green-600 mb-3">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProduct(product.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProduct === product.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingProduct === product.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Link Encurtado e QR Code Section */}
        {user && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Compartilhe seu catálogo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Use o link encurtado e QR Code para compartilhar seu catálogo
              </p>
            </div>
            <div className="p-6">
              <CopyLinkButton username={user.username} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 