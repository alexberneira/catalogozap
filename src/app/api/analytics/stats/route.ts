import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API de estatísticas chamada')
    
    // Verificar autenticação usando o header Authorization
    const authHeader = request.headers.get('authorization')
    console.log('📋 Auth header:', authHeader ? 'Presente' : 'Ausente')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não encontrado')
      return NextResponse.json({ error: 'Token de acesso necessário' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 Token extraído:', token.substring(0, 20) + '...')
    
    // Verificar o token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('❌ Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    console.log('✅ Usuário autenticado:', user.id)

    // Buscar dados do usuário para obter o username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.log('❌ Erro ao buscar usuário:', userError)
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('👤 Username encontrado:', userData.username)

    // Consultas diretas para estatísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    console.log('📊 Fazendo consultas...')

    // Total de visualizações
    const { count: totalViews, error: viewsError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('👁️ Total views:', totalViews, 'Erro:', viewsError)

    // Total de cliques
    const { count: totalClicks, error: clicksError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('🖱️ Total clicks:', totalClicks, 'Erro:', clicksError)

    // Visualizações hoje
    const { count: viewsToday, error: viewsTodayError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())

    // Cliques hoje
    const { count: clicksToday, error: clicksTodayError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())

    // Visualizações semana
    const { count: viewsWeek, error: viewsWeekError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString())

    // Cliques semana
    const { count: clicksWeek, error: clicksWeekError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString())

    // Visualizações mês
    const { count: viewsMonth, error: viewsMonthError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString())

    // Cliques mês
    const { count: clicksMonth, error: clicksMonthError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString())

    // Dados do gráfico (últimos 30 dias)
    const { data: chartData, error: chartError } = await supabase
      .from('catalog_views')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', monthAgo.toISOString())
      .order('created_at', { ascending: true })

    console.log('📈 Dados do gráfico:', chartData?.length || 0, 'registros')

    // Processar dados do gráfico
    const chartDataProcessed = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayViews = chartData?.filter(item => 
        item.created_at.startsWith(dateStr)
      ).length || 0

      chartDataProcessed.unshift({
        date: dateStr,
        views: dayViews,
        clicks: 0 // Simplificado por enquanto
      })
    }

    // Produtos mais clicados
    const { data: topProducts, error: productsError } = await supabase
      .from('whatsapp_clicks')
      .select(`
        product_id,
        products (
          id,
          title,
          price
        )
      `)
      .eq('user_id', user.id)

    // Contar cliques por produto
    const productCounts: { [key: string]: { count: number, product: any } } = {}
    topProducts?.forEach(click => {
      if (click.product_id && click.products) {
        if (!productCounts[click.product_id]) {
          productCounts[click.product_id] = { count: 0, product: click.products }
        }
        productCounts[click.product_id].count++
      }
    })

    const topProductsProcessed = Object.entries(productCounts)
      .sort(([,a], [,b]) => (b.count) - (a.count))
      .slice(0, 5)
      .map(([productId, data]) => ({
        product_id: productId,
        products: data.product,
        count: data.count
      }))

    const stats = {
      total_views: totalViews || 0,
      total_clicks: totalClicks || 0,
      views_today: viewsToday || 0,
      clicks_today: clicksToday || 0,
      views_week: viewsWeek || 0,
      clicks_week: clicksWeek || 0,
      views_month: viewsMonth || 0,
      clicks_month: clicksMonth || 0
    }

    console.log('📊 Estatísticas finais:', stats)

    return NextResponse.json({
      stats,
      chartData: chartDataProcessed,
      topProducts: topProductsProcessed
    })
  } catch (error) {
    console.error('❌ Erro na API de estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 