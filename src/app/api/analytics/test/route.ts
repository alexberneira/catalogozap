import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test API chamada')
    
    // Teste 1: Conexão básica
    console.log('🔍 Teste 1: Conexão básica...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.log('❌ Erro na conexão básica:', testError)
      return NextResponse.json({ 
        error: 'Erro de conexão com banco',
        details: testError 
      }, { status: 500 })
    }

    console.log('✅ Conexão básica OK')

    // Teste 2: Buscar usuário específico
    console.log('🔍 Teste 2: Buscar usuário meuca...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('username', 'meuca')
      .single()

    if (userError) {
      console.log('❌ Erro ao buscar usuário:', userError)
      return NextResponse.json({ 
        error: 'Erro ao buscar usuário',
        details: userError 
      }, { status: 500 })
    }

    console.log('✅ Usuário encontrado:', userData)

    // Teste 3: Verificar tabelas de analytics
    console.log('🔍 Teste 3: Verificar tabelas de analytics...')
    const { data: catalogViews, error: cvError } = await supabase
      .from('catalog_views')
      .select('count')
      .limit(1)

    if (cvError) {
      console.log('❌ Erro ao verificar catalog_views:', cvError)
      return NextResponse.json({ 
        error: 'Tabela catalog_views não encontrada',
        details: cvError 
      }, { status: 500 })
    }

    console.log('✅ Tabela catalog_views OK')

    const { data: whatsappClicks, error: wcError } = await supabase
      .from('whatsapp_clicks')
      .select('count')
      .limit(1)

    if (wcError) {
      console.log('❌ Erro ao verificar whatsapp_clicks:', wcError)
      return NextResponse.json({ 
        error: 'Tabela whatsapp_clicks não encontrada',
        details: wcError 
      }, { status: 500 })
    }

    console.log('✅ Tabela whatsapp_clicks OK')

    // Teste 4: Tentar inserir dados de teste
    console.log('🔍 Teste 4: Inserir dados de teste...')
    const { data: insertData, error: insertError } = await supabase
      .from('catalog_views')
      .insert({
        user_id: userData.id,
        username: userData.username,
        ip_address: '127.0.0.1',
        user_agent: 'Test API',
        referrer: 'test',
      })
      .select()

    if (insertError) {
      console.log('❌ Erro ao inserir dados de teste:', insertError)
      return NextResponse.json({ 
        error: 'Erro ao inserir dados de teste',
        details: insertError 
      }, { status: 500 })
    }

    console.log('✅ Dados de teste inseridos:', insertData)

    return NextResponse.json({ 
      success: true,
      message: 'Todos os testes passaram!',
      user: userData,
      test_insert: insertData
    })

  } catch (error) {
    console.error('❌ Erro na API de teste:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error 
    }, { status: 500 })
  }
} 