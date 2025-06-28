import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Página não encontrada
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Voltar ao Início
            </Link>
            
            <div className="text-center">
              <p className="text-gray-500 mb-2">Ou tente uma dessas páginas:</p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Cadastro
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Precisa de ajuda?
              </h3>
              <p className="text-gray-600 mb-4">
                Entre em contato conosco para suporte
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 suporte@catalogozap.com</p>
                <p>📱 +55 11 99999-9999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 