import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Track View API chamada')
    
    // Verificar se conseguimos fazer o parse do JSON
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('❌ Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }
    
    const { username } = body
    console.log('👤 Username recebido:', username)

    if (!username) {
      console.log('❌ Username não fornecido')
      return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 })
    }

    // Testar conexão com Supabase
    console.log('🔍 Testando conexão com Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.log('❌ Erro na conexão com Supabase:', testError)
      return NextResponse.json({ error: 'Erro de conexão com banco' }, { status: 500 })
    }

    console.log('✅ Conexão com Supabase OK')

    // Buscar o user_id pelo username
    console.log('🔍 Buscando usuário:', username)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single()

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
      ip_address: ip,
      user_agent: userAgent.substring(0, 50) + '...',
      referrer
    })

    // Verificar se a tabela catalog_views existe
    console.log('🔍 Verificando tabela catalog_views...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('catalog_views')
      .select('id')
      .limit(1)

    if (tableError) {
      console.log('❌ Erro ao verificar tabela catalog_views:', tableError)
      return NextResponse.json({ error: 'Tabela não encontrada' }, { status: 500 })
    }

    console.log('✅ Tabela catalog_views OK')

    // Registrar a visualização
    const { data: insertData, error: insertError } = await supabase
      .from('catalog_views')
      .insert({
        user_id: userData.id,
        username: userData.username,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
      })
      .select()

    console.log('💾 Dados inseridos:', insertData)
    console.log('❌ Erro na inserção:', insertError)

    if (insertError) {
      console.error('Erro ao registrar visualização:', insertError)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    console.log('✅ Visualização registrada com sucesso')
    return NextResponse.json({ success: true, data: insertData })
  } catch (error) {
    console.error('❌ Erro na API de tracking:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 