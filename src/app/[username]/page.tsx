import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/supabaseClient'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default async function CatalogPage({ params }: PageProps) {
  const { username } = await params

  // Buscar usuário pelo username
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Buscar produtos do usuário
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('Erro ao buscar produtos:', productsError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.username}
            </h1>
            <p className="text-gray-600">
              Catálogo criado com CatálogoZap
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!products || products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Nenhum produto disponível
            </h3>
            <p className="mt-2 text-gray-600">
              Este catálogo ainda não possui produtos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={user.whatsapp_number}
                username={user.username}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Criado com{' '}
              <a 
                href="https://catalogozap.com" 
                className="text-blue-600 hover:text-blue-500 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                CatálogoZap
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 