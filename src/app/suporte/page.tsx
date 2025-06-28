import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Suporte() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Suporte ao Cliente
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aqui para ajudar você a aproveitar ao máximo o CatálogoZap
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contato */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Entre em Contato</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp</p>
                  <p className="text-gray-600">+55 11 99999-9999</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">suporte@catalogozap.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="w-6 h-6 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Horário de Atendimento</p>
                  <p className="text-gray-600">Seg-Sex: 9h às 18h</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Perguntas Frequentes</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Como funciona o plano gratuito?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  O plano gratuito permite até 3 produtos no seu catálogo. Para produtos ilimitados, faça upgrade para o plano premium.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Como cancelar minha assinatura?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Entre em contato conosco via WhatsApp ou email para solicitar o cancelamento da sua assinatura.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Posso alterar meu username?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sim! Acesse as configurações da sua conta para alterar o username do seu catálogo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos de Ajuda */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recursos de Ajuda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Guia de Uso</h3>
              <p className="text-sm text-gray-600">
                Aprenda a usar todas as funcionalidades do CatálogoZap
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Dicas e Truques</h3>
              <p className="text-sm text-gray-600">
                Descubra como maximizar suas vendas com o catálogo
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">FAQ Completo</h3>
              <p className="text-sm text-gray-600">
                Encontre respostas para todas as suas dúvidas
              </p>
            </div>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 