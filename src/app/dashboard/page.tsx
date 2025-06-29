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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
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

  const openProductModal = (product: Product) => {
    console.log('Abrindo modal para produto:', product.title)
    setSelectedProduct(product)
    setShowModal(true)
  }

  const closeProductModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
  }

  const createWhatsAppMessage = (product: Product) => {
    const message = `Olá, quero o produto "${product.title}" que vi no seu catálogo CatálogoZap.`
    return encodeURIComponent(message)
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
                    ? 'Até 20 produtos • R$19/mês' 
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
                <p className="font-medium">{products.length} {user?.is_active ? '/20' : '/3'}</p>
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
                        <div 
                          className="h-16 w-16 flex-shrink-0 relative group cursor-pointer"
                          onClick={() => openProductModal(product)}
                          title="Clique para visualizar como aparece no catálogo"
                        >
                          <img
                            className="h-16 w-16 rounded-lg object-cover hover:opacity-80 transition-opacity"
                            src={product.image_url}
                            alt={product.title}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
                            <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
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
                        <button
                          onClick={() => openProductModal(product)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Visualizar
                        </button>
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
                {user?.is_active && products.length >= 20 ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Você atingiu o limite de 20 produtos do seu plano
                    </p>
                    <Link
                      href="/upgrade"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Fazer Upgrade
                    </Link>
                  </div>
                ) : !user?.is_active && products.length >= 3 ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Você atingiu o limite de 3 produtos do plano gratuito
                    </p>
                    <Link
                      href="/upgrade"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Fazer Upgrade
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/cadastro-produto"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    + Adicionar Produto
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Visualização do Produto */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Visualização do Produto
                </h3>
                <button
                  onClick={closeProductModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Card do Produto como aparece no catálogo */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedProduct.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {selectedProduct.description}
                  </p>
                  
                  <div className="w-full flex justify-center mb-2">
                    <span className="text-xl font-bold text-green-600 text-center">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  
                  <div className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium w-full text-center">
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.150-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>Pedir no WhatsApp</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Assim é como seu produto aparece no catálogo público
                </p>
                <button
                  onClick={closeProductModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
