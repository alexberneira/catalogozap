'use client'

export default function TestEnv() {
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
      </div>
    </div>
  )
} 