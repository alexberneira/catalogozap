# CatálogoZap 🛍️

Um microSaaS completo que permite criar catálogos online simples e bonitos para WhatsApp. Cada produto tem um botão que abre uma conversa no WhatsApp com mensagem automática.

## 🚀 Funcionalidades

- ✅ **Cadastro e Login** via Supabase Auth
- ✅ **Dashboard** para gerenciar produtos
- ✅ **Upload de imagens** via Supabase Storage
- ✅ **Catálogo público** com URL personalizada
- ✅ **Integração WhatsApp** com mensagens automáticas
- ✅ **Assinatura mensal** via Stripe (R$19/mês)
- ✅ **Limite gratuito** de 3 produtos
- ✅ **Design responsivo** mobile-first

## 🛠️ Stack Tecnológica

- **Next.js 15** com TypeScript
- **Tailwind CSS** para estilização
- **Supabase** para banco de dados, auth e storage
- **Stripe** para pagamentos
- **Vercel** para deploy

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta no Stripe
- Conta no Vercel (opcional)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/catalogozap.git
cd catalogozap
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

4. **Configure o banco de dados Supabase**

Execute estes SQLs no seu projeto Supabase:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT,
  username TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Políticas para produtos
CREATE POLICY "Users can view all products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid()::text = user_id);
```

5. **Configure o Stripe**

- Crie um produto no Stripe com preço recorrente de R$19/mês
- Copie o `price_id` para a variável `STRIPE_PRICE_ID`
- Configure o webhook para `/api/webhook` com os eventos:
  - `checkout.session.completed`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`

6. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/
│   │   └── webhook/
│   ├── dashboard/
│   ├── cadastro-produto/
│   └── [username]/
├── components/
│   ├── Navbar.tsx
│   └── ProductCard.tsx
└── lib/
    ├── supabaseClient.ts
    └── stripe.ts
```

## 🚀 Deploy na Vercel

1. **Conecte seu repositório** no Vercel
2. **Configure as variáveis de ambiente** no painel do Vercel
3. **Deploy automático** será feito a cada push

## 📱 Como Usar

1. **Cadastre-se** no site
2. **Configure** seu número de WhatsApp e username
3. **Adicione produtos** (máximo 3 no plano gratuito)
4. **Compartilhe** o link do seu catálogo
5. **Receba pedidos** diretamente no WhatsApp!

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start

# Lint
npm run lint
```

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as [diretrizes de contribuição](CONTRIBUTING.md) antes de submeter um PR.

## 📞 Suporte

- 📧 Email: suporte@catalogozap.com
- 💬 Discord: [CatálogoZap Community](https://discord.gg/catalogozap)
- 📱 WhatsApp: +55 11 99999-9999

---

**Última atualização:** 27/06/2025 - Sistema atualizado e funcionando perfeitamente! 🚀
