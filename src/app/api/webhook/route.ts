import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import stripe from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura não fornecida' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Erro ao verificar assinatura do webhook:', error)
    return NextResponse.json(
      { error: 'Assinatura inválida' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        // Atualizar usuário com subscription_id e is_active = true
        await supabase
          .from('users')
          .update({
            stripe_subscription_id: session.subscription,
            is_active: true,
          })
          .eq('id', session.metadata.user_id)
        
        console.log('Assinatura ativada para usuário:', session.metadata.user_id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        // Buscar usuário pelo subscription_id
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (user) {
          // Desativar usuário se pagamento falhou
          await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', user.id)
          
          console.log('Usuário desativado por falha no pagamento:', user.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Buscar usuário pelo subscription_id
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (user) {
          // Desativar usuário se assinatura foi cancelada
          await supabase
            .from('users')
            .update({ 
              is_active: false,
              stripe_subscription_id: null 
            })
            .eq('id', user.id)
          
          console.log('Usuário desativado por cancelamento:', user.id)
        }
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 