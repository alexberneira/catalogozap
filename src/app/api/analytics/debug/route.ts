import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API chamada')
    
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de acesso necessário' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    console.log('✅ Usuário autenticado:', user.id)

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('👤 Dados do usuário:', userData)

    // Verificar todos os dados nas tabelas
    const { data: allViews, error: allViewsError } = await supabase
      .from('catalog_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: allClicks, error: allClicksError } = await supabase
      .from('whatsapp_clicks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Verificar dados específicos do usuário
    const { data: userViews, error: userViewsError } = await supabase
      .from('catalog_views')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: userClicks, error: userClicksError } = await supabase
      .from('whatsapp_clicks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Contar totais
    const { count: totalViews, error: totalViewsError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })

    const { count: totalClicks, error: totalClicksError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })

    const { count: userTotalViews, error: userTotalViewsError } = await supabase
      .from('catalog_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: userTotalClicks, error: userTotalClicksError } = await supabase
      .from('whatsapp_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      user: userData,
      totals: {
        all_views: totalViews || 0,
        all_clicks: totalClicks || 0,
        user_views: userTotalViews || 0,
        user_clicks: userTotalClicks || 0
      },
      errors: {
        all_views_error: allViewsError,
        user_views_error: userViewsError,
        all_clicks_error: allClicksError,
        user_clicks_error: userClicksError,
        total_views_error: totalViewsError,
        total_clicks_error: totalClicksError,
        user_total_views_error: userTotalViewsError,
        user_total_clicks_error: userTotalClicksError
      },
      recent_data: {
        all_views: allViews || [],
        user_views: userViews || [],
        all_clicks: allClicks || [],
        user_clicks: userClicks || []
      }
    })
  } catch (error) {
    console.error('❌ Erro na API de debug:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 