'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catálogo Público - Crie seu catálogo online e integre com WhatsApp",
  description: "Crie seu catálogo online profissional e integre com WhatsApp. Ferramenta completa para empreendedores venderem mais.",
  keywords: ["catálogo", "whatsapp", "vendas", "empreendedor", "produtos"],
  authors: [{ name: "Catálogo Público" }],
  openGraph: {
    title: "CatálogoPúblico - Crie seu catálogo online e integre com WhatsApp",
    description: "Crie seu catálogo online profissional e integre com WhatsApp. Compartilhe seus produtos de forma simples e eficiente.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Não mostrar o Footer na página do catálogo público (rotas dinâmicas)
  const isCatalogPage = pathname && pathname !== '/' && !pathname.startsWith('/api') && !pathname.includes('/dashboard') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/configuracoes') && !pathname.includes('/cadastro-produto') && !pathname.includes('/editar-produto') && !pathname.includes('/estatisticas') && !pathname.includes('/upgrade') && !pathname.includes('/termos') && !pathname.includes('/privacidade');

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          {!isCatalogPage && <Footer />}
        </div>
      </body>
    </html>
  );
}
