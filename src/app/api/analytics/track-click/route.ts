import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Track Click API chamada')
    const { username, product_id } = await request.json()
    console.log('👤 Username recebido:', username)
    console.log('📦 Product ID recebido:', product_id)

    if (!username) {
      console.log('❌ Username não fornecido')
      return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 })
    }

    if (!product_id) {
      console.log('❌ Product ID não fornecido')
      return NextResponse.json({ error: 'Product ID é obrigatório' }, { status: 400 })
    }

    // Buscar o user_id pelo username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single()

    console.log('🔍 Buscando usuário:', username)
    console.log('📋 Dados do usuário:', userData)
    console.log('❌ Erro do usuário:', userError)

    if (userError || !userData) {
      console.log('❌ Usuário não encontrado')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    console.log('✅ Usuário encontrado:', userData.id)

    // Obter informações do cliente
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    console.log('📊 Dados para inserção:', {
      user_id: userData.id,
      username: userData.username,
      product_id,
      ip_address: ip,
      user_agent: userAgent.substring(0, 50) + '...',
      referrer
    })

    // Registrar o clique
    const { data: insertData, error: insertError } = await supabase
      .from('whatsapp_clicks')
      .insert({
        user_id: userData.id,
        username: userData.username,
        product_id,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
      })
      .select()

    console.log('💾 Dados inseridos:', insertData)
    console.log('❌ Erro na inserção:', insertError)

    if (insertError) {
      console.error('Erro ao registrar clique:', insertError)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    console.log('✅ Clique registrado com sucesso')
    return NextResponse.json({ success: true, data: insertData })
  } catch (error) {
    console.error('❌ Erro na API de tracking:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 