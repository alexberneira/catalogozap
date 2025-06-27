'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'

export default function TestEnv() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  const listAllUsers = async () => {
    setLoading(true)
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) {
        setTestResult(`Erro ao buscar usuários: ${usersError.message}`)
        return
      }

      setUsers(allUsers || [])
      setTestResult(`Encontrados ${allUsers?.length || 0} usuários no banco de dados`)
    } catch (error) {
      setTestResult(`Erro geral: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createDemoData = async () => {
    setLoading(true)
    try {
      // Usar função SQL para contornar RLS
      const { data, error } = await supabase.rpc('create_demo_data')
      
      if (error) {
        setTestResult(`Erro ao criar dados de exemplo: ${error.message}. Você precisa executar o SQL manualmente no Supabase.`)
        return
      }

      setTestResult('Dados de exemplo criados com sucesso! Agora você pode acessar /demo para ver o catálogo.')
      
      // Recarregar lista de usuários
      listAllUsers()
    } catch (error) {
      setTestResult(`Erro geral: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    try {
      // Testar busca de usuário 'demo'
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'demo')
        .single()

      if (userError) {
        setTestResult(`Erro ao buscar usuário: ${userError.message}`)
        return
      }

      if (!user) {
        setTestResult('Usuário "demo" não encontrado')
        return
      }

      // Testar busca de produtos do usuário
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

      if (productsError) {
        setTestResult(`Erro ao buscar produtos: ${productsError.message}`)
        return
      }

      setTestResult(`Conexão OK! Usuário encontrado: ${user.username}, Produtos: ${products?.length || 0}`)
    } catch (error) {
      setTestResult(`Erro geral: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkDemoData = async () => {
    setLoading(true)
    try {
      // Buscar usuário demo
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'demo')

      // Buscar produtos do usuário demo
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', '066db407-752b-4b52-8e96-8158820e4ec3')

      let result = ''
      if (userError) {
        result += `Erro ao buscar usuário demo: ${userError.message}\n`
      } else if (!users || users.length === 0) {
        result += 'Usuário demo não encontrado.\n'
      } else {
        result += `Usuário demo encontrado: ${users[0].email} (id: ${users[0].id})\n`
      }

      if (productsError) {
        result += `Erro ao buscar produtos: ${productsError.message}`
      } else {
        result += `Produtos encontrados para demo: ${products ? products.length : 0}`
      }

      setTestResult(result)
    } catch (error) {
      setTestResult(`Erro geral: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Variáveis de Ambiente</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <p className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado'}
          </p>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <p className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
              'Não configurado'
            }
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button 
            onClick={listAllUsers}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
          >
            {loading ? 'Carregando...' : 'Listar Todos os Usuários'}
          </button>

          <button 
            onClick={createDemoData}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
          >
            {loading ? 'Criando...' : 'Criar Dados de Exemplo'}
          </button>

          <button 
            onClick={testSupabaseConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Usuário Demo'}
          </button>

          <button 
            onClick={checkDemoData}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
          >
            {loading ? 'Verificando...' : 'Checar Demo no Banco'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <strong>Resultado:</strong>
              <p className="text-sm">{testResult}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold text-yellow-800 mb-2">Como resolver o problema RLS:</h3>
            <p className="text-sm text-yellow-700 mb-2">
              O banco de dados está protegido por políticas de segurança. Para criar dados de exemplo, você precisa:
            </p>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Acessar o painel do Supabase</li>
              <li>Ir para SQL Editor</li>
              <li>Executar o seguinte código:</li>
            </ol>
            <pre className="mt-2 p-2 bg-gray-800 text-green-400 text-xs rounded overflow-x-auto">
{`-- Criar função para inserir dados de exemplo
CREATE OR REPLACE FUNCTION create_demo_data()
RETURNS void AS $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Inserir usuário demo (desabilitar RLS temporariamente)
  INSERT INTO users (id, email, username, whatsapp_number, is_active)
  VALUES (
    gen_random_uuid(),
    'demo@catalogozap.com',
    'demo',
    '5511999999999',
    true
  ) RETURNING id INTO demo_user_id;

  -- Inserir produtos de exemplo
  INSERT INTO products (user_id, title, description, image_url, price)
  VALUES 
    (demo_user_id, 'Smartphone Galaxy S23', 'Smartphone Samsung Galaxy S23 com 128GB, tela de 6.1", câmera tripla de 50MP. Perfeito para fotos e jogos.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop', 3499.99),
    (demo_user_id, 'Notebook Dell Inspiron', 'Notebook Dell Inspiron com Intel i5, 8GB RAM, SSD 256GB. Ideal para trabalho e estudos.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop', 2899.99),
    (demo_user_id, 'Fone de Ouvido Bluetooth', 'Fone de ouvido sem fio com cancelamento de ruído, bateria de longa duração. Qualidade de som premium.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', 299.99);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função
SELECT create_demo_data();`}
            </pre>
          </div>

          {users.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <strong>Usuários encontrados:</strong>
              <div className="mt-2 space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="text-sm p-2 bg-white rounded border">
                    <strong>Username:</strong> {user.username} | 
                    <strong>Email:</strong> {user.email} | 
                    <strong>WhatsApp:</strong> {user.whatsapp_number}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 