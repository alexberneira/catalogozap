import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Token não enviado' }, { status: 401 })
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (!user || error) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Verificar se o produto pertence ao usuário
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Deletar produto
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Erro ao deletar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Token não enviado' }, { status: 401 })
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (!user || error) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, image_url } = body

    // Verificar se o produto pertence ao usuário
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar produto
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        title,
        description,
        price: parseFloat(price),
        image_url,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 