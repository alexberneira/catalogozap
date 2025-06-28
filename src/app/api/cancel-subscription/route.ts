import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import stripe from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user || error) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se tem assinatura ativa
    if (!userData.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      )
    }

    try {
      // Cancelar assinatura no Stripe (no final do período atual)
      const subscription = await stripe.subscriptions.update(
        userData.stripe_subscription_id,
        {
          cancel_at_period_end: true
        }
      ) as any

      console.log('✅ Assinatura cancelada para usuário:', user.id)
      console.log('📅 Cancelamento efetivo em:', new Date(subscription.current_period_end * 1000))

      return NextResponse.json({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        cancel_at_period_end: true,
        current_period_end: new Date(subscription.current_period_end * 1000),
        details: 'Sua assinatura será cancelada no final do período atual. Você continuará com acesso ilimitado até essa data.'
      })

    } catch (stripeError) {
      console.error('❌ Erro ao cancelar assinatura no Stripe:', stripeError)
      return NextResponse.json(
        { error: 'Erro ao cancelar assinatura no Stripe' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro na API de cancelamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 