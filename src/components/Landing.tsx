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
        captureUTMs();
        ga4Tracking.landingPageView();
    }, []);

    const handleCTAClick = () => {
        ga4Tracking.landingCTAClick();
        onNavigate('chat');
    };

    return (
        <div className="landing-container">
            <div className="matrix-bg"></div>
            <div className="scanlines"></div>
            <div className="content-wrapper">
                <main className="landing-main-simple">
                    {/* 1. HEADLINE — copy que converte, com hierarquia visual refinada */}
                    <h1 className="hero-headline">
                        <span className="headline-primary">
                            Crees que ser un hombre 'bueno, paciente y comprensivo'
                            <span className="highlight-orange"> es lo que la traerá de vuelta?</span>
                        </span>
                        <span className="headline-secondary">
                            Sí, eso es exactamente lo que el hombre que ella dejó de desear piensa
                            mientras ve <span className="highlight-orange">cómo su propia relación se muere</span>.
                        </span>
                    </h1>

                    {/* 2. SUB — o que ele vai descobrir */}
                    <p className="hero-sub">
                        Responde 7 preguntas y te digo el <strong>próximo paso exacto</strong> para que ella vuelva a verte.
                    </p>

                    {/* 3. CTA — o motor de conversão (urgência de tempo) */}
                    <div className="cta-section">
                        <button className="cta-button" onClick={handleCTAClick}>
                            <span className="cta-glow"></span>
                            <span className="cta-icon">⏰</span>
                            <span className="cta-text">DESCUBRIR SI AÚN HAY TIEMPO</span>
                        </button>
                        <p className="cta-micro">Haz el test rápido — 2 minutos y esto puede cambiar tu caso.</p>
                    </div>
                </main>

                {/* 4. FOOTER — segurança */}
                <footer className="landing-footer">
                    <p className="disclaimer">🔒 100% anónimo • Sin juicio • Sin email</p>
                </footer>
            </div>

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
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: 0;
                }
                .scanlines {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: 1;
                    pointer-events: none;
                }
                .content-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 760px;
                    padding: 2rem 2rem 1rem;
                }
                .landing-main-simple {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 1.75rem;
                    min-height: 72vh;
                }

                /* ===== HEADLINE — hierarquia por tamanho + opacidade ===== */
                .hero-headline {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                    max-width: 680px;
                    margin: 0;
                }
                .headline-primary {
                    font-size: 1.9rem;
                    line-height: 1.28;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.3px;
                }
                .headline-secondary {
                    font-size: 1.05rem;
                    line-height: 1.5;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.82);
                }
                .highlight-orange {
                    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 800;
                }

                /* ===== SUB ===== */
                .hero-sub {
                    font-size: 1.1rem;
                    line-height: 1.55;
                    color: rgba(255, 255, 255, 0.78);
                    max-width: 520px;
                    margin: 0;
                }
                .hero-sub strong {
                    color: #fff;
                    font-weight: 700;
                }

                /* ===== CTA — urgência (vermelho + relógio + pulso) ===== */
                .cta-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.6rem;
                    width: 100%;
                }
                .cta-button {
                    background: linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    padding: 1.4rem 2.5rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    min-width: min(90%, 560px);
                    z-index: 1;
                    animation: pulse-cta 2s ease-in-out infinite;
                }
                @keyframes pulse-cta {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    }
                    50% {
                        transform: scale(1.04);
                        box-shadow: 0 12px 32px rgba(255, 59, 59, 0.7);
                    }
                }
                .cta-button:hover {
                    transform: translateY(-3px) scale(1.04);
                    box-shadow: 0 12px 32px rgba(255, 59, 59, 0.6);
                    animation: none;
                }
                .cta-button:active {
                    transform: translateY(-1px) scale(1.02);
                }
                .cta-icon {
                    font-size: 1.7rem;
                    position: relative;
                    z-index: 2;
                    animation: tick 1.6s ease-in-out infinite;
                }
                @keyframes tick {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(-6deg) scale(1.08); }
                }
                .cta-text {
                    position: relative;
                    z-index: 2;
                }
                .cta-glow {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: glow-slide 3s infinite;
                    z-index: 1;
                }
                @keyframes glow-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .cta-micro {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.55);
                    margin: 0;
                }

                /* ===== FOOTER ===== */
                .landing-footer {
                    text-align: center;
                    padding: 1.5rem 0 0.5rem;
                }
                .disclaimer {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                /* ===== RESPONSIVO ===== */
                @media (max-width: 768px) {
                    .content-wrapper { padding: 1.5rem 1.25rem 0.5rem; }
                    .landing-main-simple { gap: 1.5rem; min-height: auto; }
                    .headline-primary { font-size: 1.6rem; }
                    .headline-secondary { font-size: 0.98rem; }
                    .cta-button { padding: 1.25rem 1.75rem; font-size: 1.1rem; min-width: 100%; }
                }
                @media (max-width: 480px) {
                    .headline-primary { font-size: 1.42rem; }
                    .headline-secondary { font-size: 0.92rem; }
                    .hero-sub { font-size: 1rem; }
                    .cta-button {
                        padding: 1.1rem 1.25rem;
                        font-size: 1rem;
                        flex-direction: column;
                        gap: 0.4rem;
                    }
                    .cta-icon { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
}