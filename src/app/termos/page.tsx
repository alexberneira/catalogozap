import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Termos() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Última atualização: 27 de junho de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Ao acessar e usar o CatálogoZap, você aceita estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 mb-4">
                O CatálogoZap é uma plataforma que permite aos usuários criar catálogos online de produtos 
                com integração ao WhatsApp. Nossos serviços incluem:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criação de catálogos personalizados</li>
                <li>Upload de imagens de produtos</li>
                <li>Integração com WhatsApp</li>
                <li>Sistema de pagamentos via Stripe</li>
                <li>URL personalizada para cada catálogo</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Planos e Preços</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Plano Gratuito</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-2">
                  <li>Até 3 produtos</li>
                  <li>URL personalizada</li>
                  <li>Integração WhatsApp</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Plano Premium - R$ 19/mês</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-2">
                  <li>Produtos ilimitados</li>
                  <li>Estatísticas avançadas</li>
                  <li>Suporte prioritário</li>
                  <li>Personalização avançada</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsabilidades do Usuário</h2>
              <p className="text-gray-700 mb-4">Você é responsável por:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>Não usar o serviço para fins ilegais</li>
                <li>Respeitar os direitos de propriedade intelectual</li>
                <li>Não compartilhar conteúdo ofensivo ou inadequado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Pagamentos e Reembolsos</h2>
              <p className="text-gray-700 mb-4">
                Os pagamentos são processados pelo Stripe. Assinaturas são cobradas mensalmente. 
                Reembolsos podem ser solicitados dentro de 7 dias após a cobrança, 
                desde que o serviço não tenha sido utilizado de forma significativa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancelamento</h2>
              <p className="text-gray-700 mb-4">
                Você pode cancelar sua assinatura a qualquer momento através das configurações da conta 
                ou entrando em contato com nosso suporte. O acesso premium será mantido até o final do período atual.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 mb-4">
                O CatálogoZap não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Perdas de dados ou interrupções do serviço</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Problemas de conectividade do usuário</li>
                <li>Conteúdo criado pelos usuários</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modificações</h2>
              <p className="text-gray-700 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Alterações significativas serão comunicadas por email ou através da plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contato</h2>
              <p className="text-gray-700 mb-4">
                Para dúvidas sobre estes termos, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> suporte@catalogozap.com<br />
                  <strong>WhatsApp:</strong> +55 11 99999-9999
                </p>
              </div>
            </section>
          </div>

          {/* Voltar */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 