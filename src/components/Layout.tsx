import { ReactNode, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    pixelId: string;
    google_tag_manager: any;
  }
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  useEffect(() => {
    // ========================================
    // ✅ PREVENIR CARREGAMENTO DUPLICADO
    // ========================================
    if (window.google_tag_manager) {
      console.log('GTM já está carregado');
      return;
    }

    // ========================================
    // ✅ INICIALIZAR DATALAYER
    // ========================================
    window.dataLayer = window.dataLayer || [];
    
    // ✅ PUSH DO GTM.START (OBRIGATÓRIO)
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // ========================================
    // ✅ GOOGLE TAG MANAGER WEB (DIRETO DO GOOGLE)
    // ========================================
    const gtmId = 'GTM-T8M558NG';
    
    // ✅ CRIAR E INSERIR SCRIPT DO GTM
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    
    // ✅ CALLBACK APÓS CARREGAMENTO
    gtmScript.onload = () => {
      console.log('✅ GTM Web carregado com sucesso');
    };
    
    gtmScript.onerror = () => {
      console.error('❌ Erro ao carregar GTM');
    };
    
    // ✅ INSERIR NO HEAD (PRIMEIRO SCRIPT)
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }

    // ========================================
    // ✅ ULTIMIZE PIXEL (SCRIPT NOVO — CONTA NOVA)
    // ========================================
    try {
      // Config codificada fornecida pela Ultimize
      const encodedConfig = "DBP6bTqvmWQxiQXalmjYGEjDu14T4XGu5mDAQhXM/Qof/HG3/3WDQ1nA9EpT+yqp9WGTHU7cthRY8WC2uWOTFV/Dtw5Cqyn492eOH1PN7BBU+ifgzU7WT13D9gZQ5Xb4rEiBT1TO9AETsyeq/2ufAXPLu0gT/2S243bYVxiZ+F1Q7DPtoyWZWFvO+gcCvTPsoCrLWQyN5DlM";

      // 1. Decodifica base64 → bytes
      const bytes = Array.from(atob(encodedConfig), (char) => char.charCodeAt(0) & 255);

      // 2. Extrai chave e payload (mesma lógica do script original)
      const keyLength = bytes[0];
      const key = bytes.slice(1, 1 + keyLength);
      const payload = bytes.slice(1 + keyLength);

      // 3. Decripta (XOR com chave repetida)
      const decrypted = payload.map((byte, index) => byte ^ key[index % keyLength]);

      // 4. Converte para UTF-8 e faz o parse da config
      const config = JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted)));

      // 5. Aplica os globals da config (ex.: pixelId da conta nova)
      const globals = config.globals || [];
      globals.forEach(({ name, value }: { name: string; value: string }) => {
        (window as any)[name] = value;
      });

      // 6. Injeta o script do pixel apontado pela config
      const ultimizePixelScript = document.createElement('script');
      ultimizePixelScript.src = config.url;
      ultimizePixelScript.async = true;
      ultimizePixelScript.defer = true;

      const attributes = config.attributes || [];
      attributes.forEach(({ name, value }: { name: string; value: string }) => {
        ultimizePixelScript.setAttribute(name, value);
      });

      (document.head || document.documentElement).appendChild(ultimizePixelScript);
    } catch (error) {
      console.error('❌ Erro ao carregar o pixel Ultimize:', error);
    }

    // ========================================
    // ✅ UTMIFY UTM TRACKER
    // ========================================
    const utmifyUtmScript = document.createElement("script");
    utmifyUtmScript.src = "https://cdn.utmify.com.br/scripts/utms/latest.js";
    utmifyUtmScript.setAttribute("data-utmify-prevent-subids", "");
    utmifyUtmScript.async = true;
    utmifyUtmScript.defer = true;
    document.head.appendChild(utmifyUtmScript);

    // ✅ LOG DE DEBUG
    console.log('🚀 GTM Web inicializado');

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