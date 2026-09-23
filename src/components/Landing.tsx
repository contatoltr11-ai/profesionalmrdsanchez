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
                    <h1 className="hero-headline">
                        La ciencia descubrió la región exacta del cerebro que decide por quién{' '}
                        <span className="accent">se obsesiona</span>.
                    </h1>

                    {/* 2. SUB (2 linhas) */}
                    <p className="hero-sub">
                        Sin importar si te bloqueó o si ya está con otra persona,<br />
                        todavía hay una forma de reactivar lo que siente por ti.
                    </p>

                    {/* 3. CEREBRO + REGIÓN PRIMITIVA (pulse ring em CSS, sem GIF) */}
                    <div className="hero-image">
                        <div className="brain-wrap">
                            <svg className="brain-svg" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cerebro con la región primitiva resaltada">
                                <defs>
                                    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                                        <stop offset="55%" stopColor="#ef4444" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                    </radialGradient>
                                    <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
                                        <feGaussianBlur stdDeviation="3.5" result="b" />
                                        <feMerge>
                                            <feMergeNode in="b" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Contorno do cérebro */}
                                <path
                                    d="M200 56 C232 50 258 58 274 76 C293 66 315 74 328 96 C345 100 361 120 354 146 C372 160 375 190 359 206 C363 228 348 250 324 254 C313 274 288 284 262 278 C245 294 214 296 200 286 C186 296 155 294 138 278 C112 284 87 274 76 254 C52 250 37 228 41 206 C25 190 28 160 46 146 C39 120 55 100 72 96 C85 74 107 66 126 76 C142 58 168 50 200 56 Z"
                                    fill="#0b1220" stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="2"
                                />

                                {/* Fissura central */}
                                <path d="M200 58 C197 130 203 200 200 282" stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="1.5" />

                                {/* Giros (detalhes internos) */}
                                <path d="M196 96 C180 100 166 112 152 126 M192 150 C176 156 162 170 150 186 M198 210 C184 218 170 232 160 248" stroke="#22d3ee" strokeOpacity="0.22" strokeWidth="1.5" />
                                <path d="M204 96 C220 100 234 112 248 126 M208 150 C224 156 238 170 250 186 M202 210 C216 218 230 232 240 248" stroke="#22d3ee" strokeOpacity="0.22" strokeWidth="1.5" />

                                {/* Nós neurais decorativos */}
                                <circle cx="152" cy="126" r="2.5" fill="#22d3ee" opacity="0.5" />
                                <circle cx="248" cy="126" r="2.5" fill="#22d3ee" opacity="0.5" />
                                <circle cx="150" cy="186" r="2.5" fill="#22d3ee" opacity="0.5" />
                                <circle cx="250" cy="186" r="2.5" fill="#22d3ee" opacity="0.5" />
                                <circle cx="160" cy="248" r="2.5" fill="#22d3ee" opacity="0.5" />
                                <circle cx="240" cy="248" r="2.5" fill="#22d3ee" opacity="0.5" />

                                {/* REGIÃO PRIMITIVA — ponto focal vermelho */}
                                <circle cx="200" cy="168" r="34" fill="url(#coreGlow)" />
                                <circle cx="200" cy="168" r="10" fill="#ef4444" filter="url(#softGlow)" />
                                <circle cx="200" cy="168" r="3.2" fill="#ffffff" />
                            </svg>

                            {/* PULSE RING — anel pulsando (radar) em loop */}
                            <span className="pulse-ring r1"></span>
                            <span className="pulse-ring r2"></span>
                            <span className="pulse-ring r3"></span>
                        </div>

                        <p className="brain-label">
                            <span className="tag">Región primitiva</span>
                            <span className="desc">la región que decide por quién se obsesiona</span>
                        </p>
                    </div>

                    {/* 4. LINHA DE COBERTURA */}
                    <p className="hero-coverage">
                        Existe una forma de activarla — el test te muestra exactamente cómo.
                    </p>

                    {/* 5. BOTÃO CTA */}
                    <button className="hero-cta" onClick={handleCTAClick}>
                        QUIERO RECUPERAR A MI EX
                    </button>

                    {/* 5.1 MICRO-LINHA DO CTA */}
                    <p className="cta-micro">
                        Haz clic aquí, haz el test rápido y descubre cómo.
                    </p>

                    {/* 5.2 LISTA DE BENEFÍCIOS (3 caixas de checkmark) */}
                    <div className="benefits">
                        <div className="benefit">
                            <span className="check">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </span>
                            <p>Un protocolo de recuperación <strong>personalizado</strong> según tu caso exacto.</p>
                        </div>
                        <div className="benefit">
                            <span className="check">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </span>
                            <p>El <strong>error</strong> que “apaga” esa región y la aleja para siempre.</p>
                        </div>
                        <div className="benefit">
                            <span className="check">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </span>
                            <p>El <strong>gatillo biológico</strong> que reaviva su obsesión por ti.</p>
                        </div>
                    </div>

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
                   HEADLINE → SUB → CEREBRO → COBERTURA → CTA → BENEFÍCIOS → SEGURANÇA
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
                    font-size: 2.4rem;
                    line-height: 1.15;
                    color: #fff;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    max-width: 720px;
                    margin: 0;
                }

                .hero-headline .accent {
                    color: #ef4444;
                }

                /* 2. SUB */
                .hero-sub {
                    text-align: center;
                    font-size: 1.05rem;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.78);
                    font-style: italic;
                    max-width: 540px;
                    margin: 0;
                }

                /* 3. CEREBRO HERO */
                .hero-image {
                    position: relative;
                    width: 100%;
                    max-width: 380px;
                    margin: 0 auto;
                }

                .brain-wrap {
                    position: relative;
                    width: 100%;
                }

                .brain-svg {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                /* Halo de luz atrás da região primitiva */
                .brain-wrap::before {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 52.5%;
                    width: 130px;
                    height: 130px;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(239, 68, 68, 0.18), transparent 70%);
                    filter: blur(6px);
                    border-radius: 50%;
                    pointer-events: none;
                }

                /* PULSE RING — anéis concêntricos pulsando (radar) */
                .pulse-ring {
                    position: absolute;
                    left: 50%;
                    top: 52.5%;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 2px solid rgba(239, 68, 68, 0.75);
                    transform: translate(-50%, -50%) scale(0.4);
                    animation: pulse-ring 2.1s ease-out infinite;
                    pointer-events: none;
                }

                .r1 { animation-delay: 0s; }
                .r2 { animation-delay: 0.7s; }
                .r3 { animation-delay: 1.4s; }

                @keyframes pulse-ring {
                    0% {
                        transform: translate(-50%, -50%) scale(0.4);
                        opacity: 0.9;
                    }
                    70% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2.8);
                        opacity: 0;
                    }
                }

                /* Legenda da região */
                .brain-label {
                    text-align: center;
                    margin: 0.9rem auto 0;
                    max-width: 420px;
                }

                .brain-label .tag {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    color: #f87171;
                    text-transform: uppercase;
                }

                .brain-label .desc {
                    display: block;
                    font-size: 0.82rem;
                    color: rgba(255, 255, 255, 0.72);
                    margin-top: 2px;
                }

                /* 4. LINHA DE COBERTURA */
                .hero-coverage {
                    text-align: center;
                    font-size: 1rem;
                    line-height: 1.4;
                    color: rgba(255, 255, 255, 0.85);
                    margin: 0;
                    font-weight: 500;
                    max-width: 520px;
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

                /* 5.1 MICRO-LINHA DO CTA */
                .cta-micro {
                    text-align: center;
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0;
                }

                /* 5.2 BENEFÍCIOS */
                .benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    width: 100%;
                    max-width: 440px;
                    margin: 0 auto;
                    text-align: left;
                }

                .benefit {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.7rem;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 0.8rem 0.95rem;
                }

                .benefit .check {
                    flex-shrink: 0;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: rgba(22, 163, 74, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 1px;
                }

                .benefit p {
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.45;
                    color: rgba(255, 255, 255, 0.85);
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
                        font-size: 1.8rem;
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

                    .benefit p {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
}