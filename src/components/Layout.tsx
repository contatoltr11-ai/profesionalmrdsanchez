import { ReactNode, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    google_tag_manager: any;
  }
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  useEffect(() => {
    // Guard protege SOMENTE o bloco do GTM
    if (window.google_tag_manager) {
      console.log('GTM já está carregado');
      return;
    }

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const gtmId = 'GTM-T8M558NG';

    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

    gtmScript.onload = () => {
      console.log('✅ GTM Web carregado com sucesso');
    };
    gtmScript.onerror = () => {
      console.error('❌ Erro ao carregar GTM');
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }
  }, []);

  return (
    <>
      {/* GTM NoScript (fallback) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-T8M558NG"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {children}
    </>
  );
}