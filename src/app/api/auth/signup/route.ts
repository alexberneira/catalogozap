import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, whatsapp_number } = await request.json()

    console.log('🔍 API Signup chamada')
    console.log('📧 Email:', email)
    console.log('👤 Username:', username)

    // 0. Verificar se email já existe
    const { data: existingEmail, error: emailCheckError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      console.log('⚠️ Email já existe:', existingEmail.email)
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // 0.1. Verificar se username já existe
    const { data: existingUsername, error: usernameCheckError } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      console.log('⚠️ Username já existe:', existingUsername.username)
      return NextResponse.json(
        { error: 'Este nome de usuário já está em uso' },
        { status: 400 }
      )
    }

    // 1. Criar usuário no auth.users usando service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        username,
        whatsapp_number
      }
    })

    if (authError) {
      console.error('❌ Erro no Auth Admin:', authError)
      return NextResponse.json(
        { error: `Erro no cadastro: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('❌ Usuário não foi criado')
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      )
    }

    console.log('✅ Usuário criado no Auth:', authData.user.id)

    // 2. AGUARDAR o trigger criar automaticamente o perfil na tabela users
    // O trigger on_auth_user_created vai fazer isso automaticamente
    
    // 3. Verificar se o perfil foi criado (aguardar um pouco)
    let attempts = 0
    let userProfile = null
    
    while (attempts < 5) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (profile) {
        userProfile = profile
        console.log('✅ Perfil criado automaticamente pelo trigger')
        break
      }
      
      console.log(`⏳ Aguardando trigger criar perfil... tentativa ${attempts + 1}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar 1 segundo
      attempts++
    }

    if (!userProfile) {
      console.error('❌ Perfil não foi criado pelo trigger')
      // Remover usuário do auth.users se o trigger falhou
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário' },
        { status: 500 }
      )
    }

    // 4. Atualizar o perfil com os dados adicionais (username, whatsapp_number)
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        username,
        whatsapp_number,
        is_active: true
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      // Não remover o usuário, pois o perfil básico foi criado
    }

    console.log('✅ Perfil atualizado com sucesso')

    // 5. Retornar sucesso
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        whatsapp_number
      },
      message: 'Usuário criado com sucesso!'
    })

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 