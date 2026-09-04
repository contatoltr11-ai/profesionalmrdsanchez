import { useEffect } from 'react';
import { storage } from '../utils/storage';
import { ga4Tracking } from '../utils/ga4Tracking';

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
        // ✅ CAPTURA UTMs ASSIM QUE A PÁGINA CARREGA
        captureUTMs();

        // Removido: tracking.pageView (gerenciado pelo Utmify)
        ga4Tracking.landingPageView();

        // Removido: scrollObserver (não necessário)
    }, []);

    const handleCTAClick = () => {
        // Removido: tracking.ctaClicked (gerenciado pelo Utmify)
        ga4Tracking.landingCTAClick();
        onNavigate('chat');
    };

    return (
        <div className="landing-container">
            <div className="matrix-bg"></div>
            <div className="scanlines"></div>

            <div className="content-wrapper">
                <main className="landing-main-simple">

                    {/* 1. HEADLINE */}
                    <h1 className="hero-headline">Ella todavía te extraña.</h1>

                    {/* 2. SUB (2 linhas) */}
                    <p className="hero-sub">
                        Hay un momento exacto para reaparecer.<br />
                        El quiz te muestra cuándo.
                    </p>

                    {/* 3. IMAGEM (hero) */}
                    <img
                        className="hero-image"
                        src="https://i.ibb.co/tMqxS6SX/wpp-dobra1.png"
                        alt="Conversación de reaproximación por WhatsApp"
                    />

                    {/* 4. LINHA DE COBERTURA */}
                    <p className="hero-coverage">No importa si hay silencio o si hay otra persona.</p>

                    {/* 5. BOTÃO CTA */}
                    <button className="hero-cta" onClick={handleCTAClick}>
                        QUIERO RECUPERARLA
                    </button>

                    {/* 6. MICRO-LINHA DE SEGURANÇA */}
                    <p className="hero-safety">Anónimo · 2 minutos · Sin email</p>

                </main>
            </div>

            {/* CSS INLINE */}
            <style jsx="true">{`
                .landing-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #000;
                    overflow: hidden;
                }

                .matrix-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }

                .scanlines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                }

                .content-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 800px;
                    padding: 2rem;
                }

                /* ========================================
                   PRIMEIRA DOBRA — ORDEM:
                   HEADLINE → SUB → IMAGEM → COBERTURA → BOTÃO → SEGURANÇA
                   ======================================== */
                .landing-main-simple {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 1.25rem;
                    min-height: 70vh;
                }

                /* 1. HEADLINE */
                .hero-headline {
                    text-align: center;
                    font-size: 2.5rem;
                    line-height: 1.2;
                    color: #fff;
                    font-weight: 800;
                    margin: 0;
                }

                /* 2. SUB */
                .hero-sub {
                    text-align: center;
                    font-size: 1.05rem;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.75);
                    margin: 0;
                }

                /* 3. IMAGEM HERO */
                .hero-image {
                    display: block;
                    width: 100%;
                    max-width: 400px;
                    height: auto;
                    border-radius: 16px;
                    margin: 0 auto;
                }

                /* 4. LINHA DE COBERTURA */
                .hero-coverage {
                    text-align: center;
                    font-size: 1rem;
                    line-height: 1.4;
                    color: rgba(255, 255, 255, 0.85);
                    margin: 0;
                    font-weight: 500;
                }

                /* 5. BOTÃO CTA */
                .hero-cta {
                    background: #16a34a;
                    color: #fff;
                    border: none;
                    border-radius: 14px;
                    padding: 16px 40px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
                    max-width: 90%;
                    text-align: center;
                    line-height: 1.25;
                    animation: pulse-cta 2s ease-in-out infinite;
                }

                @keyframes pulse-cta {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
                    }
                    50% { 
                        transform: scale(1.04);
                        box-shadow: 0 12px 32px rgba(22, 163, 74, 0.65);
                    }
                }

                .hero-cta:hover {
                    transform: translateY(-3px) scale(1.04);
                    box-shadow: 0 12px 32px rgba(22, 163, 74, 0.6);
                    animation: none;
                }

                .hero-cta:active {
                    transform: translateY(-1px) scale(1.02);
                }

                /* 6. MICRO-LINHA DE SEGURANÇA */
                .hero-safety {
                    text-align: center;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                /* RESPONSIVO */
                @media (max-width: 768px) {
                    .content-wrapper {
                        padding: 1.25rem;
                    }

                    .landing-main-simple {
                        gap: 1rem;
                        min-height: auto;
                    }

                    .hero-headline {
                        font-size: 2rem;
                    }

                    .hero-sub {
                        font-size: 1.05rem;
                    }

                    .hero-image {
                        max-width: 320px;
                    }

                    .hero-cta {
                        padding: 15px 34px;
                        font-size: 1.15rem;
                    }
                }

                @media (max-width: 480px) {
                    .content-wrapper {
                        padding: 1rem;
                    }

                    .landing-main-simple {
                        gap: 0.85rem;
                    }

                    .hero-headline {
                        font-size: 1.9rem;
                    }

                    .hero-sub {
                        font-size: 1rem;
                    }

                    .hero-image {
                        max-width: 280px;
                    }

                    .hero-coverage {
                        font-size: 0.95rem;
                    }

                    .hero-cta {
                        padding: 14px 32px;
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
}
