import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Última atualização: 27 de junho de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <p className="text-gray-700 mb-4">
                Coletamos as seguintes informações quando você usa o CatálogoZap:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Informações de conta:</strong> nome, email, senha, username</li>
                <li><strong>Informações de contato:</strong> número do WhatsApp</li>
                <li><strong>Conteúdo do catálogo:</strong> imagens, títulos, descrições e preços dos produtos</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, tempo de uso, interações</li>
                <li><strong>Informações de pagamento:</strong> processadas pelo Stripe (não armazenamos dados de cartão)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Como Usamos Suas Informações</h2>
              <p className="text-gray-700 mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fornecer e manter nossos serviços</li>
                <li>Processar pagamentos e assinaturas</li>
                <li>Enviar comunicações importantes sobre sua conta</li>
                <li>Melhorar nossos serviços e experiência do usuário</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Stripe:</strong> para processamento de pagamentos</li>
                <li><strong>Supabase:</strong> para armazenamento de dados e autenticação</li>
                <li><strong>Vercel:</strong> para hospedagem da aplicação</li>
                <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de segurança para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Autenticação segura via Supabase</li>
                <li>Backup regular dos dados</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <p className="text-gray-700 mb-4">Você tem o direito de:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Acessar:</strong> solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Corrigir:</strong> atualizar informações incorretas</li>
                <li><strong>Excluir:</strong> solicitar a remoção dos seus dados</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> opor-se ao processamento de seus dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Manter você logado em sua conta</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso do site</li>
                <li>Melhorar a performance</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h2>
              <p className="text-gray-700 mb-4">
                Mantemos suas informações pelo tempo necessário para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fornecer nossos serviços</li>
                <li>Cumprir obrigações legais</li>
                <li>Resolver disputas</li>
                <li>Fazer cumprir nossos acordos</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Quando você cancela sua conta, podemos reter algumas informações por um período limitado 
                para fins legais ou de segurança.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferências Internacionais</h2>
              <p className="text-gray-700 mb-4">
                Seus dados podem ser processados em países diferentes do seu. Garantimos que essas 
                transferências sejam feitas de acordo com as leis de proteção de dados aplicáveis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Menores de Idade</h2>
              <p className="text-gray-700 mb-4">
                O CatálogoZap não é destinado a menores de 18 anos. Não coletamos intencionalmente 
                informações pessoais de menores de idade. Se você é pai ou responsável e acredita 
                que seu filho nos forneceu informações pessoais, entre em contato conosco.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Alterações na Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos atualizar esta política periodicamente. Alterações significativas serão 
                comunicadas por email ou através da plataforma. Recomendamos revisar esta política regularmente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contato</h2>
              <p className="text-gray-700 mb-4">
                Para dúvidas sobre esta política de privacidade, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacidade@catalogozap.com<br />
                  <strong>WhatsApp:</strong> +55 11 99999-9999<br />
                  <strong>Endereço:</strong> São Paulo, SP, Brasil
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