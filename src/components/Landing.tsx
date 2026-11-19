import { useEffect } from 'react';
import { ga4Tracking } from '../utils/ga4Tracking';

// Cartão de notícia da primeira dobra (17/11/2026) — mesmo jornal "Relaciones Hoy" da imagem da Ventana 72h.
// Substituiu a conversa estilo WhatsApp ("Andrea", foto 01-wpp-foto.webp).
// v3 (18/11/2026): Harvard / lado racional x región primitiva (mecanismo v2). Fonte: expert-lucas/criativo-15-ventana-noticia/landing-card-v3.html
// Anterior: 'https://ssplan.shop/wp-content/uploads/2026/11/landing-noticia-card-v2.webp'
// const NEWS_CARD_URL = '/img/landing-noticia-card-v3.webp'; // versão no ar nos domínios
// PRÉVIA 19/11: cérebro com a região acesa (fonte expert-lucas/criativo-15-ventana-noticia/cerebro-card.html)
const BRAIN_CARD_URL = '/img/landing-cerebro.webp';

interface LandingProps {
    onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
    // ========================================
    // ✅ SISTEMA DE CAPTURA DE UTMs (PRESERVADO)
    // ========================================
    const captureUTMs = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const utms: Record<string, string> = {};
            const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
            utmParams.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });
            const clickIds = ['fbclid', 'gclid', 'ttclid'];
            clickIds.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });
            if (Object.keys(utms).length > 0) {
                localStorage.setItem('quiz_utms', JSON.stringify(utms));
                console.log('✅ UTMs capturadas:', utms);
            } else {
                console.log('ℹ️ Nenhuma UTM encontrada na URL');
            }
        } catch (error) {
            console.error('❌ Erro ao capturar UTMs:', error);
        }
    };

    useEffect(() => {
        captureUTMs();
        ga4Tracking.landingPageView();
    }, []);

    const handleCTAClick = () => {
        ga4Tracking.landingCTAClick();
        onNavigate('chat');
    };

    // Cartão de notícia clicável (17/11/2026): leva ao chat como o botão; GA4 marca a origem separada
    const handleNewsClick = () => {
        ga4Tracking.landingCTAClick('landing_news_card');
        onNavigate('chat');
    };

    return (
        <div className="lp-container">
            <main className="lp-main">
                {/* 1. BARRA DE PROGRESSO — mesmo visual do chat, começa em 4% (o chat começa em 14%) */}
                <div className="lp-progress" aria-hidden="true">
                    <div className="lp-progress-fill"></div>
                </div>

                {/* PRÉVIA 19/11/2026 (modelo Mariana Vabo): título único + cérebro com a região acesa no lugar do card de notícia.
                    Versão no ar nos domínios: card "Relaciones Hoy" (Harvard) + "¿Qué disparador vuelve a encender sus ganas por ti?" */}
                <h1 className="lp-headline">
                    Científicos de Harvard descubrieron la región del cerebro de tu ex que decide{' '}
                    <span className="lp-highlight">por quién se obsesiona</span>
                </h1>

                <button type="button" className="lp-news-btn" onClick={handleNewsClick} aria-label="Empezar: descubre cómo volver a encender esa región">
                    <span className="lp-brain-wrap">
                        <img
                            src={BRAIN_CARD_URL}
                            alt="Cerebro con la región primitiva encendida: la que decide por quién se obsesiona"
                            className="lp-news"
                            width={720}
                            height={512}
                            {...{ fetchpriority: 'high' }}
                            decoding="async"
                        />
                        {/* brilho pulsando + pontilhado girando sobre o ponto vermelho (centro em 53,33% / 50,78% da imagem) */}
                        <span className="lp-brain-glow" aria-hidden="true"></span>
                        <span className="lp-brain-ring" aria-hidden="true"></span>
                    </span>
                </button>

                {/* 4. QUEBRA DE OBJEÇÃO */}
                <p className="lp-objection">Y se puede volver a encender, aunque te haya bloqueado, te deje en visto o ya esté con otro.</p>

                {/* 5. CTA — mesmo handleCTAClick de antes (GA4 + navegação para o chat) */}
                <button className="lp-cta" onClick={handleCTAClick}>
                    QUIERO QUE VUELVA
                </button>

                <p className="lp-micro">
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                        <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                    </svg>
                    <span>Test gratuito · 6 preguntas · 2 minutos · 100% anónimo</span>
                </p>

                {/* 6. BENEFÍCIOS */}
                <ul className="lp-benefits">
                    <li>
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"></path></svg>
                        <span>Qué es el Ancla del Dolor y cómo la estás hundiendo</span>
                    </li>
                    <li>
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"></path></svg>
                        <span>Qué parte de su cerebro decide si vuelve</span>
                    </li>
                    <li>
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"></path></svg>
                        <span>El disparador exacto para tu caso</span>
                    </li>
                </ul>
            </main>

            {/* Classes com prefixo lp- para não colidir com o CSS global (ex.: .progress-bar do chat) */}
            <style>{`
                .lp-brain-wrap { position: relative; display: block; }
                .lp-brain-glow, .lp-brain-ring { position: absolute; left: 53.33%; top: 50.78%; border-radius: 50%; pointer-events: none; transform: translate(-50%, -50%); }
                .lp-brain-glow { width: 30%; aspect-ratio: 1; background: radial-gradient(circle, rgba(255,59,92,0.55) 0%, rgba(255,59,92,0.18) 45%, rgba(255,59,92,0) 70%); animation: lp-brain-pulse 1.6s ease-in-out infinite; }
                .lp-brain-ring { width: 12.9%; aspect-ratio: 1; border: 2px dashed #e0244d; animation: lp-brain-spin 6s linear infinite; }
                @keyframes lp-brain-pulse { 0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; } 50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; } }
                @keyframes lp-brain-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                @media (prefers-reduced-motion: reduce) { .lp-brain-glow, .lp-brain-ring { animation: none; } }

                .lp-container {
                    min-height: 100vh;
                    background: #000;
                    color: #F5F5F5;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                }
                .lp-main {
                    width: 100%;
                    max-width: 440px;
                    box-sizing: border-box;
                    padding: 20px 20px 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                /* ===== PROGRESSO (igual ao do chat) ===== */
                .lp-progress {
                    width: 100%;
                    height: 8px;
                    background: #333;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .lp-progress-fill {
                    width: 4%;
                    height: 100%;
                    border-radius: 4px;
                    background: linear-gradient(90deg, #00FF00 0%, #00AA00 100%);
                    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                }

                /* ===== HEADLINE ===== */
                .lp-headline {
                    margin: 0;
                    font-size: 26px;
                    line-height: 1.22;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                    text-align: center;
                    color: #F5F5F5;
                }
                .lp-highlight {
                    color: #FFB020;
                }
                .lp-sub {
                    margin: -6px 0 0;
                    font-size: 16px;
                    line-height: 1.4;
                    font-weight: 500;
                    text-align: center;
                    color: #D4D4D8;
                }

                /* ===== CARTÃO DE NOTÍCIA ===== */
                .lp-news-btn {
                    display: block;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    border: 0;
                    background: none;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.12s ease;
                }
                .lp-news-btn:active { transform: scale(0.985); }
                .lp-news {
                    display: block;
                    width: 100%;
                    height: auto;
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
                }

                /* ===== CONVERSA (não usada desde 17/11/2026) ===== */
                .lp-chat {
                    background: #0B141A;
                    border: 1px solid #1F2C34;
                    border-radius: 18px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .lp-chat-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 2px 4px 8px;
                    border-bottom: 1px solid #1F2C34;
                }
                .lp-chat-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: #3B4A54;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 15px;
                    color: #E9EDEF;
                    flex-shrink: 0;
                }
                .lp-chat-avatar-photo {
                    object-fit: cover;
                    object-position: 50% 40%;
                    padding: 0;
                }
                .lp-chat-contact {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }
                .lp-chat-name {
                    font-weight: 700;
                    font-size: 15px;
                    color: #E9EDEF;
                }
                .lp-chat-typing {
                    font-size: 12px;
                    font-weight: 600;
                    color: #25D366;
                }
                .lp-bubble {
                    align-self: flex-start;
                    max-width: 80%;
                    background: #202C33;
                    color: #E9EDEF;
                    border-radius: 4px 14px 14px 14px;
                    padding: 8px 12px;
                    font-size: 15px;
                    line-height: 1.35;
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                    text-align: left;
                }
                .lp-bubble-time {
                    font-size: 11px;
                    color: #8696A0;
                    white-space: nowrap;
                }

                /* ===== OBJEÇÃO ===== */
                .lp-objection {
                    margin: 0;
                    font-size: 16px;
                    line-height: 1.45;
                    font-weight: 600;
                    text-align: center;
                    color: #F5F5F5;
                }

                /* ===== CTA ===== */
                .lp-cta {
                    width: 100%;
                    min-height: 56px;
                    border: none;
                    border-radius: 14px;
                    background: #17803F;
                    color: #FFFFFF;
                    font-family: inherit;
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                    padding: 18px 16px;
                    cursor: pointer;
                    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
                    transition: transform 0.15s ease, background 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                .lp-cta:hover {
                    background: #1A9147;
                }
                .lp-cta:active {
                    transform: scale(0.98);
                }
                .lp-cta:focus-visible {
                    outline: 3px solid #FFB020;
                    outline-offset: 3px;
                }

                .lp-micro {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #A1A1AA;
                }

                /* ===== BENEFÍCIOS ===== */
                .lp-benefits {
                    list-style: none;
                    margin: 0;
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    background: #141416;
                    border: 1px solid #26272B;
                    border-radius: 14px;
                }
                .lp-benefits li {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #E4E4E7;
                    text-align: left;
                }
                .lp-benefits svg {
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                /* ===== TELAS MUITO PEQUENAS (ex.: iPhone SE) ===== */
                @media (max-width: 360px) {
                    .lp-main { padding: 16px 16px 28px; gap: 14px; }
                    .lp-headline { font-size: 23px; }
                    .lp-bubble { font-size: 14px; }
                    .lp-cta { font-size: 17px; }
                }
            `}</style>
        </div>
    );
}
