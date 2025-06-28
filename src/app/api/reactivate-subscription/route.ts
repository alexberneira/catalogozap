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

    // Verificar se tem assinatura
    if (!userData.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 400 }
      )
    }

    try {
      // Reativar assinatura no Stripe
      const subscription = await stripe.subscriptions.update(
        userData.stripe_subscription_id,
        {
          cancel_at_period_end: false
        }
      ) as any

      console.log('✅ Assinatura reativada para usuário:', user.id)

      return NextResponse.json({
        success: true,
        message: 'Assinatura reativada com sucesso',
        cancel_at_period_end: false,
        current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        details: 'Sua assinatura foi reativada e continuará normalmente.'
      })

    } catch (stripeError) {
      console.error('❌ Erro ao reativar assinatura no Stripe:', stripeError)
      return NextResponse.json(
        { error: 'Erro ao reativar assinatura no Stripe' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro na API de reativação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 