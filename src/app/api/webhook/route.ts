import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import stripe from '@/lib/stripe'

export async function POST(request: NextRequest) {
  console.log('🔔 WEBHOOK RECEBIDO - Iniciando processamento...')
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('📋 Headers recebidos:', {
    'stripe-signature': signature ? 'Presente' : 'Ausente',
    'content-type': request.headers.get('content-type'),
    'user-agent': request.headers.get('user-agent')
  })

  if (!signature) {
    console.log('❌ Erro: Assinatura não fornecida')
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
    console.log('✅ Assinatura do webhook verificada com sucesso')
  } catch (error) {
    console.error('❌ Erro ao verificar assinatura do webhook:', error)
    return NextResponse.json(
      { error: 'Assinatura inválida' },
      { status: 400 }
    )
  }

  console.log('🔔 Webhook processado:', {
    type: event.type,
    id: event.id,
    created: new Date(event.created * 1000).toISOString()
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        console.log('🛒 Checkout completado:', session.id)
        
        // Atualizar usuário com subscription_id e is_active = true
        const { error } = await supabase
          .from('users')
          .update({
            stripe_subscription_id: session.subscription,
            is_active: true,
          })
          .eq('id', session.metadata.user_id)
        
        if (error) {
          console.error('❌ Erro ao atualizar usuário:', error)
        } else {
          console.log('✅ Assinatura ativada para usuário:', session.metadata.user_id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        console.log('💳 Pagamento confirmado:', invoice.id)
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          // Reativar usuário se pagamento foi bem-sucedido
          const { error } = await supabase
            .from('users')
            .update({ is_active: true })
            .eq('id', user.id)
          
          if (error) {
            console.error('❌ Erro ao reativar usuário:', error)
          } else {
            console.log('✅ Pagamento confirmado - usuário reativado:', user.id)
          }
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', invoice.subscription)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        console.log('❌ Pagamento falhou:', invoice.id)
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          // Desativar usuário se pagamento falhou
          const { error } = await supabase
            .from('users')
            .update({ is_active: false })
            .eq('id', user.id)
          
          if (error) {
            console.error('❌ Erro ao desativar usuário:', error)
          } else {
            console.log('❌ Usuário desativado por falha no pagamento:', user.id)
            console.log('📧 Enviar email de notificação para:', user.email)
          }
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', invoice.subscription)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        console.log('🔄 Assinatura atualizada:', {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end
        })
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          // Atualizar status baseado no status da assinatura
          const isActive = subscription.status === 'active'
          const { error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', user.id)
          
          if (error) {
            console.error('❌ Erro ao atualizar status do usuário:', error)
          } else {
            console.log(`🔄 Status da assinatura atualizado para usuário ${user.id}: ${subscription.status} (is_active: ${isActive})`)
          }
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        console.log('❌ Assinatura cancelada:', subscription.id)
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          // Desativar usuário se assinatura foi cancelada
          const { error } = await supabase
            .from('users')
            .update({ 
              is_active: false,
              stripe_subscription_id: null 
            })
            .eq('id', user.id)
          
          if (error) {
            console.error('❌ Erro ao cancelar usuário:', error)
          } else {
            console.log('❌ Usuário desativado por cancelamento:', user.id)
            console.log('📧 Enviar email de cancelamento para:', user.email)
          }
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', subscription.id)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        console.log('💰 Reembolso processado:', {
          id: charge.id,
          amount: charge.amount,
          refunded: charge.refunded
        })
        
        // Buscar usuário pelo payment_intent
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', charge.payment_intent)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário por payment_intent:', userError)
          // Tentar buscar por customer_id
          const { data: userByCustomer, error: customerError } = await supabase
            .from('users')
            .select('*')
            .eq('stripe_customer_id', charge.customer)
            .single()

          if (customerError) {
            console.error('❌ Erro ao buscar usuário por customer_id:', customerError)
            break
          }

          if (userByCustomer) {
            const { error } = await supabase
              .from('users')
              .update({ 
                is_active: false,
                stripe_subscription_id: null 
              })
              .eq('id', userByCustomer.id)
            
            if (error) {
              console.error('❌ Erro ao desativar usuário por reembolso:', error)
            } else {
              console.log('❌ Usuário desativado por reembolso:', userByCustomer.id)
            }
          }
        } else if (user) {
          const { error } = await supabase
            .from('users')
            .update({ 
              is_active: false,
              stripe_subscription_id: null 
            })
            .eq('id', user.id)
          
          if (error) {
            console.error('❌ Erro ao desativar usuário por reembolso:', error)
          } else {
            console.log('❌ Usuário desativado por reembolso:', user.id)
          }
        }
        break
      }

      case 'charge.refund.updated': {
        const refund = event.data.object as any
        console.log('💰 Reembolso atualizado:', {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          reason: refund.reason,
          charge: refund.charge,
          payment_intent: refund.payment_intent
        })
        
        // Primeiro, tentar buscar a charge para obter o customer_id
        let customerId = null
        let chargeData = null
        
        if (refund.charge) {
          try {
            chargeData = await stripe.charges.retrieve(refund.charge)
            customerId = chargeData.customer
            console.log('🔍 Charge encontrada:', {
              id: chargeData.id,
              customer: customerId,
              payment_intent: chargeData.payment_intent
            })
          } catch (chargeError) {
            console.error('❌ Erro ao buscar charge:', chargeError)
          }
        }
        
        // Se temos customer_id, buscar usuário por ele
        if (customerId) {
          console.log('🔍 Buscando usuário por customer_id:', customerId)
          
          const { data: userByCustomer, error: customerError } = await supabase
            .from('users')
            .select('*')
            .eq('stripe_customer_id', customerId)
            .single()

          if (customerError) {
            console.error('❌ Erro ao buscar usuário por customer_id:', customerError)
            
            // Se não encontrou um único usuário, buscar todos com esse customer_id
            console.log('🔍 Buscando todos os usuários com customer_id para debug...')
            
            const { data: allUsers, error: allError } = await supabase
              .from('users')
              .select('*')
              .eq('stripe_customer_id', customerId)

            if (!allError && allUsers && allUsers.length > 0) {
              console.log('🔍 Usuários encontrados com customer_id:', allUsers.map(u => ({ 
                id: u.id, 
                email: u.email, 
                is_active: u.is_active,
                stripe_subscription_id: u.stripe_subscription_id 
              })))
              
              // Desativar todos os usuários com esse customer_id
              for (const user of allUsers) {
                console.log('🔄 Desativando usuário:', user.id, user.email)
                const { error } = await supabase
                  .from('users')
                  .update({ 
                    is_active: false,
                    stripe_subscription_id: null 
                  })
                  .eq('id', user.id)
                
                if (error) {
                  console.error('❌ Erro ao desativar usuário:', user.id, error)
                } else {
                  console.log('✅ Usuário desativado por reembolso:', user.id, user.email)
                }
              }
            } else {
              console.log('⚠️ Nenhum usuário encontrado com customer_id:', customerId)
              
              // Debug: mostrar todos os usuários com customer_id para comparação
              const { data: allUsersWithCustomer, error: debugError } = await supabase
                .from('users')
                .select('id, email, stripe_customer_id, is_active')
                .not('stripe_customer_id', 'is', null)
              
              if (!debugError && allUsersWithCustomer) {
                console.log('🔍 Todos os usuários com customer_id no sistema:', allUsersWithCustomer)
              }
            }
          } else if (userByCustomer) {
            console.log('✅ Usuário encontrado por customer_id:', userByCustomer.id, userByCustomer.email)
            
            const { error } = await supabase
              .from('users')
              .update({ 
                is_active: false,
                stripe_subscription_id: null 
              })
              .eq('id', userByCustomer.id)
            
            if (error) {
              console.error('❌ Erro ao desativar usuário por reembolso:', error)
            } else {
              console.log('✅ Usuário desativado por reembolso atualizado:', userByCustomer.id, userByCustomer.email)
            }
          }
        } else {
          console.log('⚠️ Não foi possível obter customer_id do reembolso')
          
          // Como último recurso, tentar buscar por payment_intent (mas isso provavelmente não vai funcionar)
          if (refund.payment_intent) {
            console.log('🔍 Tentando buscar por payment_intent como último recurso:', refund.payment_intent)
            
            const { data: userByPaymentIntent, error: paymentError } = await supabase
              .from('users')
              .select('*')
              .eq('stripe_subscription_id', refund.payment_intent)
              .single()

            if (paymentError) {
              console.log('❌ Não foi possível encontrar usuário por payment_intent:', paymentError.message)
            } else if (userByPaymentIntent) {
              console.log('✅ Usuário encontrado por payment_intent:', userByPaymentIntent.id)
              
              const { error } = await supabase
                .from('users')
                .update({ 
                  is_active: false,
                  stripe_subscription_id: null 
                })
                .eq('id', userByPaymentIntent.id)
              
              if (error) {
                console.error('❌ Erro ao desativar usuário por payment_intent:', error)
              } else {
                console.log('✅ Usuário desativado por reembolso (payment_intent):', userByPaymentIntent.id)
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as any
        console.log('⚠️ Trial vai terminar:', subscription.id)
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          console.log('⚠️ Trial vai terminar para usuário:', user.id)
          console.log('📧 Enviar email de aviso para:', user.email)
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', subscription.id)
        }
        break
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object as any
        console.log('📅 Próxima fatura:', invoice.id)
        
        // Buscar usuário pelo subscription_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (userError) {
          console.error('❌ Erro ao buscar usuário:', userError)
          break
        }

        if (user) {
          console.log('📅 Próxima fatura para usuário:', user.id)
          console.log('📧 Enviar email de lembrete para:', user.email)
        } else {
          console.log('⚠️ Usuário não encontrado para subscription:', invoice.subscription)
        }
        break
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`)
        console.log('📋 Dados do evento:', JSON.stringify(event.data, null, 2))
    }

    console.log('✅ Webhook processado com sucesso')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 