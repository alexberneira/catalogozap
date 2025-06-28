import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import stripe from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token não enviado' },
        { status: 401 }
      )
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
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

    // Se não tem subscription_id, retornar status gratuito
    if (!userData.stripe_subscription_id) {
      return NextResponse.json({
        status: 'free',
        is_active: false,
        subscription_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        message: 'Usuário sem assinatura ativa'
      })
    }

    // Verificar status da assinatura no Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(
        userData.stripe_subscription_id
      ) as any

      const isActive = subscription.status === 'active'
      
      // Atualizar status no banco se necessário
      if (userData.is_active !== isActive) {
        await supabase
          .from('users')
          .update({ is_active: isActive })
          .eq('id', user.id)
      }

      return NextResponse.json({
        status: subscription.status,
        is_active: isActive,
        subscription_id: subscription.id,
        current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        message: getStatusMessage(subscription.status, subscription.cancel_at_period_end || false)
      })

    } catch (stripeError) {
      console.error('Erro ao verificar assinatura no Stripe:', stripeError)
      
      // Se a assinatura não existe mais no Stripe, desativar usuário
      await supabase
        .from('users')
        .update({ 
          is_active: false,
          stripe_subscription_id: null 
        })
        .eq('id', user.id)

      return NextResponse.json({
        status: 'cancelled',
        is_active: false,
        subscription_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        message: 'Assinatura não encontrada no Stripe - usuário desativado'
      })
    }

  } catch (error) {
    console.error('Erro na verificação de assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getStatusMessage(status: string, cancelAtPeriodEnd: boolean): string {
  switch (status) {
    case 'active':
      return cancelAtPeriodEnd 
        ? 'Assinatura ativa até o final do período atual'
        : 'Assinatura ativa'
    case 'canceled':
      return 'Assinatura cancelada'
    case 'incomplete':
      return 'Assinatura incompleta - pagamento pendente'
    case 'incomplete_expired':
      return 'Assinatura expirada - pagamento não realizado'
    case 'past_due':
      return 'Pagamento em atraso'
    case 'trialing':
      return 'Período de teste ativo'
    case 'unpaid':
      return 'Pagamento não realizado'
    default:
      return `Status: ${status}`
  }
} 