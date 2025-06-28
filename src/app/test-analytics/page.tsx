'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestAnalytics() {
  const [username, setUsername] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testTrackView = async () => {
    if (!username) {
      setResult('Digite um username')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()
      setResult(`Track View: ${response.ok ? 'Sucesso' : 'Erro'} - ${JSON.stringify(data)}`)
    } catch (error) {
      setResult(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testTrackClick = async () => {
    if (!username) {
      setResult('Digite um username')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/analytics/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username,
          productId: 'test-product-id'
        }),
      })

      const data = await response.json()
      setResult(`Track Click: ${response.ok ? 'Sucesso' : 'Erro'} - ${JSON.stringify(data)}`)
    } catch (error) {
      setResult(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkDatabase = async () => {
    setLoading(true)
    try {
      // Verificar tabelas
      const { data: views, error: viewsError } = await supabase
        .from('catalog_views')
        .select('*')
        .limit(5)

      const { data: clicks, error: clicksError } = await supabase
        .from('whatsapp_clicks')
        .select('*')
        .limit(5)

      setResult(`
        Catalog Views: ${views?.length || 0} registros
        ${viewsError ? `Erro: ${viewsError.message}` : ''}
        
        WhatsApp Clicks: ${clicks?.length || 0} registros
        ${clicksError ? `Erro: ${clicksError.message}` : ''}
        
        Últimas visualizações: ${JSON.stringify(views, null, 2)}
        Últimos cliques: ${JSON.stringify(clicks, null, 2)}
      `)
    } catch (error) {
      setResult(`Erro ao verificar banco: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const debugAPI = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch('/api/analytics/debug', {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })

      const data = await response.json()
      setResult(`Debug API: ${response.ok ? 'Sucesso' : 'Erro'} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Erro no debug: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teste de Analytics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuração</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o username para testar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes</h2>
          <div className="space-y-4">
            <button
              onClick={testTrackView}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Testar Track View
            </button>
            
            <button
              onClick={testTrackClick}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-4"
            >
              Testar Track Click
            </button>
            
            <button
              onClick={checkDatabase}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-4"
            >
              Verificar Banco de Dados
            </button>
            
            <button
              onClick={debugAPI}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md disabled:opacity-50 ml-4"
            >
              Debug API
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 