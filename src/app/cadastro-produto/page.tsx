'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function CadastroProduto() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [productCount, setProductCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkUserAndProductCount()
  }, [])

  const checkUserAndProductCount = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/login')
      return
    }

    setUser(authUser)

    // Verificar e corrigir status da assinatura
    await checkSubscriptionStatus(authUser)

    // Contar produtos do usuário
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)

    setProductCount(count || 0)
  }

  const checkSubscriptionStatus = async (authUser: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Status da assinatura:', data)
        
        // Atualizar o estado do usuário se necessário
        if (data.is_active !== user?.is_active) {
          setUser((prev: any) => prev ? { ...prev, is_active: data.is_active } : { ...authUser, is_active: data.is_active })
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Erro ao fazer upload da imagem')
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verificar limite de produtos
      if (!user.is_active && productCount >= 3) {
        setError('Limite de produtos atingido. Faça upgrade para adicionar mais produtos.')
        return
      }

      if (user.is_active && productCount >= 20) {
        setError('Limite de produtos atingido. Você já tem 20 produtos no seu plano.')
        return
      }

      if (!image) {
        setError('Selecione uma imagem para o produto')
        return
      }

      // Upload da imagem
      const imageUrl = await uploadImage(image)

      // Criar produto
      const { error: productError } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            price: parseFloat(price),
            image_url: imageUrl,
          },
        ])

      if (productError) {
        setError('Erro ao criar produto. Tente novamente.')
        return
      }

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const canAddProduct = (!user?.is_active && productCount < 3) || (user?.is_active && productCount < 20)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!canAddProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Limite de produtos atingido
            </h2>
            <p className="mt-2 text-gray-600">
              {user.is_active 
                ? `Você já tem ${productCount}/20 produtos no seu plano premium.`
                : `Você já tem ${productCount}/3 produtos no plano gratuito.`
              }
              {!user.is_active && ' Faça upgrade para adicionar até 20 produtos!'}
            </p>
            <div className="mt-6">
              <Link
                href="/upgrade"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium"
              >
                Fazer Upgrade - R$19/mês
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Adicionar novo produto
            </h1>
            <p className="text-slate-600 mb-8">
              Crie um produto que vende no WhatsApp
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Nome do produto *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Smartphone Samsung Galaxy"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição atrativa
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva os benefícios do produto..."
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="pl-12 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Foto do produto *
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Criando produto...' : 'Criar produto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 