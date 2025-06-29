'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Não mostrar o Footer na página do catálogo público (rotas dinâmicas)
  const isCatalogPage = pathname && pathname !== '/' && !pathname.startsWith('/api') && !pathname.includes('/dashboard') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/configuracoes') && !pathname.includes('/cadastro-produto') && !pathname.includes('/editar-produto') && !pathname.includes('/estatisticas') && !pathname.includes('/upgrade') && !pathname.includes('/termos') && !pathname.includes('/privacidade');

  if (isCatalogPage) {
    return null;
  }

  return <Footer />;
} 