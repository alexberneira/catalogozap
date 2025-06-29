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

    console.log('🔍 Verificando assinatura para usuário:', user.id)

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.log('❌ Erro ao buscar usuário:', userError)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('📋 Dados do usuário:', {
      id: userData.id,
      email: userData.email,
      stripe_subscription_id: userData.stripe_subscription_id,
      stripe_customer_id: userData.stripe_customer_id,
      is_active: userData.is_active
    })

    // PRIMEIRA VERIFICAÇÃO: Se is_active é false no banco, retornar free imediatamente
    if (userData.is_active === false) {
      console.log('❌ Usuário marcado como inativo no banco - retornando free')
      return NextResponse.json({
        status: 'free',
        is_active: false,
        subscription_id: userData.stripe_subscription_id,
        current_period_end: null,
        cancel_at_period_end: false,
        message: 'Usuário sem assinatura ativa'
      })
    }

    // SEGUNDA VERIFICAÇÃO: Se não tem subscription_id nem customer_id, é free
    if (!userData.stripe_subscription_id && (!userData.stripe_customer_id || userData.stripe_customer_id === '')) {
      console.log('❌ Usuário não tem subscription_id nem customer_id - é usuário free')
      return NextResponse.json({
        status: 'free',
        is_active: false,
        subscription_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        message: 'Usuário sem assinatura ativa'
      })
    }

    // TERCEIRA VERIFICAÇÃO: Se tem subscription_id, verificar no Stripe
    if (userData.stripe_subscription_id) {
      console.log('🔍 Verificando assinatura no Stripe:', userData.stripe_subscription_id)
      
      try {
        const subscription = await stripe.subscriptions.retrieve(
          userData.stripe_subscription_id
        ) as any

        console.log('📊 Dados da assinatura no Stripe:', {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end
        })

        const isActive = subscription.status === 'active'
        
        console.log('✅ Status da assinatura:', isActive ? 'ATIVA' : 'INATIVA')
        
        // Atualizar status no banco se necessário
        if (userData.is_active !== isActive) {
          console.log('🔄 Atualizando is_active no banco de:', userData.is_active, 'para:', isActive)
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
        console.error('❌ Erro ao verificar assinatura no Stripe:', stripeError)
        
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
    }

    // QUARTA VERIFICAÇÃO: Se tem customer_id mas não subscription_id, buscar no Stripe
    if (userData.stripe_customer_id && userData.stripe_customer_id !== '') {
      console.log('🔍 Buscando assinaturas ativas no Stripe para o usuário')
      
      try {
        // Buscar assinaturas ativas do usuário no Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: 'active',
          limit: 1
        })

        if (subscriptions.data.length > 0) {
          const activeSubscription = subscriptions.data[0] as any
          console.log('✅ Encontrada assinatura ativa no Stripe:', activeSubscription.id)
          
          // Atualizar o banco com os dados da assinatura
          await supabase
            .from('users')
            .update({ 
              stripe_subscription_id: activeSubscription.id,
              is_active: true 
            })
            .eq('id', user.id)

          return NextResponse.json({
            status: activeSubscription.status,
            is_active: true,
            subscription_id: activeSubscription.id,
            current_period_end: activeSubscription.current_period_end ? new Date(activeSubscription.current_period_end * 1000) : null,
            cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
            message: getStatusMessage(activeSubscription.status, activeSubscription.cancel_at_period_end || false)
          })
        } else {
          console.log('❌ Nenhuma assinatura ativa encontrada no Stripe')
          
          // Se não encontrou assinatura ativa, desativar usuário
          await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', user.id)
          
          return NextResponse.json({
            status: 'free',
            is_active: false,
            subscription_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
            message: 'Usuário sem assinatura ativa'
          })
        }
      } catch (stripeError) {
        console.error('❌ Erro ao buscar assinaturas no Stripe:', stripeError)
        
        // Em caso de erro, desativar usuário por segurança
        await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', user.id)
        
        return NextResponse.json({
          status: 'free',
          is_active: false,
          subscription_id: null,
          current_period_end: null,
          cancel_at_period_end: false,
          message: 'Usuário sem assinatura ativa'
        })
      }
    }

    // FALLBACK: Se chegou até aqui, é free
    console.log('❌ Fallback: usuário é free')
    return NextResponse.json({
      status: 'free',
      is_active: false,
      subscription_id: null,
      current_period_end: null,
      cancel_at_period_end: false,
      message: 'Usuário sem assinatura ativa'
    })

  } catch (error) {
    console.error('❌ Erro na verificação de assinatura:', error)
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