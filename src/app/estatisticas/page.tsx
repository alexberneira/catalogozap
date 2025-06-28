'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { User } from '@/lib/supabaseClient'

interface Stats {
  total_views: number
  total_clicks: number
  views_today: number
  clicks_today: number
  views_week: number
  clicks_week: number
  views_month: number
  clicks_month: number
}

interface ChartData {
  date: string
  views: number
  clicks: number
}

interface TopProduct {
  product_id: string
  products: {
    title: string
    price: number
  }
  count: number
}

export default function Estatisticas() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchStats()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/login')
      return
    }

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

  const fetchStats = async () => {
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

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar estatísticas')
        return
      }

      setStats(data.stats)
      setChartData(data.chartData)
      setTopProducts(data.topProducts)
    } catch (error) {
      setError('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getConversionRate = () => {
    if (!stats || stats.total_views === 0) return 0
    return ((stats.total_clicks / stats.total_views) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o desempenho do seu catálogo
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Cards de Métricas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Visualizações Totais</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_views)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cliques no WhatsApp</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_clicks)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-gray-900">{getConversionRate()}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.views_today)} / {formatNumber(stats.clicks_today)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Detalhadas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Esta Semana</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Visualizações:</span>
                  <span className="font-medium">{formatNumber(stats.views_week)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliques:</span>
                  <span className="font-medium">{formatNumber(stats.clicks_week)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Este Mês</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Visualizações:</span>
                  <span className="font-medium">{formatNumber(stats.views_month)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliques:</span>
                  <span className="font-medium">{formatNumber(stats.clicks_month)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de visualizações:</span>
                  <span className="font-medium">{formatNumber(stats.total_views)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de cliques:</span>
                  <span className="font-medium">{formatNumber(stats.total_clicks)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de conversão:</span>
                  <span className="font-medium">{getConversionRate()}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Produtos Mais Clicados */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Produtos Mais Clicados</h2>
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={item.product_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-400 mr-4">#{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.products?.title || 'Produto não encontrado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.products?.price ? `R$ ${item.products.price.toFixed(2)}` : 'Preço não disponível'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{item.count}</p>
                    <p className="text-sm text-gray-600">cliques</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Dicas para melhorar suas estatísticas
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Compartilhe seu link nas redes sociais regularmente</li>
            <li>• Use o QR Code em cartões de visita e materiais impressos</li>
            <li>• Adicione o link na bio do Instagram e WhatsApp</li>
            <li>• Mantenha seus produtos atualizados com fotos de qualidade</li>
            <li>• Responda rapidamente aos pedidos do WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 