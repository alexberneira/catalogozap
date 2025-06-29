import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

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
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
