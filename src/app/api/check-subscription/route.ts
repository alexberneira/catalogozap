import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import stripe from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Token não enviado' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (!user || error) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
    }

    // Se tem subscription_id, verificar no Stripe
    if (userData.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id)
        
        if (subscription.status === 'active') {
          // Atualizar is_active para true se a assinatura está ativa
          if (!userData.is_active) {
            await supabase
              .from('users')
              .update({ is_active: true })
              .eq('id', user.id)
            
            console.log('Status da assinatura corrigido para usuário:', user.id)
          }
          
          return NextResponse.json({
            is_active: true,
            subscription_status: subscription.status,
            message: 'Assinatura ativa confirmada'
          })
        } else {
          // Se a assinatura não está ativa, desativar usuário
          await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', user.id)
          
          return NextResponse.json({
            is_active: false,
            subscription_status: subscription.status,
            message: 'Assinatura inativa'
          })
        }
      } catch (stripeError) {
        console.error('Erro ao verificar assinatura no Stripe:', stripeError)
        return NextResponse.json({
          is_active: userData.is_active,
          subscription_status: 'error',
          message: 'Erro ao verificar assinatura no Stripe'
        })
      }
    }

    // Se não tem subscription_id, retornar status atual
    return NextResponse.json({
      is_active: userData.is_active,
      subscription_status: 'none',
      message: 'Nenhuma assinatura encontrada'
    })

  } catch (error) {
    console.error('Erro na API de verificação de assinatura:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 