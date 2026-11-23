import { RefObject } from 'react';

interface VideoEspecialistaProps {
    sectionRef: RefObject<HTMLDivElement>;
    fadeOutPhase: number | null;
    buttonChecked: boolean;
    isVideoButtonEnabled: boolean;
    videoButtonDelayLeft: number;
    onButtonClick: () => void;
}

export default function VideoEspecialista({
    sectionRef,
    fadeOutPhase,
    buttonChecked,
    isVideoButtonEnabled,
    videoButtonDelayLeft,
    onButtonClick
}: VideoEspecialistaProps) {
    const getDelayEmoji = (secondsLeft: number) => {
        const progress = (10 - secondsLeft) / 10;
        if (progress < 0.2) return '😴';
        if (progress < 0.4) return '⏳';
        if (progress < 0.7) return '🔥';
        return '🚀';
    };

    return (
        <div 
            ref={sectionRef} 
            className={`revelation fade-in vsl-revelation vsl4-root ${fadeOutPhase === 2 ? 'fade-out' : ''}`}
        >
            {/* Lab 19/11 (v4 visual): continua a promessa do diagnóstico ("video corto con lo que está pasando en su cerebro ahora mismo").
                Antes: "Antes de mostrarte tu Ventana de 72 horas, Sophia tiene algo que decirte." */}
            <p className="vsl4-kicker">🎥 Video corto de Sophia</p>
            {/* Etapa 1 (19/11): título que a VSL atual cumpre (antes: "Lo que está pasando en su cerebro ahora mismo") */}
            <h2 className="vsl4-title">Antes de tu Ventana, <span>escucha esto</span></h2>
            <div className="vsl-container">
                <div className="vsl-placeholder"></div> 
            </div>

            {buttonChecked ? (
                <div className="checkmark-container">
                    <div className="checkmark-glow">✅</div>
                </div>
            ) : (
                <div className="video-delay-indicator">
                    {!isVideoButtonEnabled ? (
                        <>
                            <p className="delay-text">
                                {getDelayEmoji(videoButtonDelayLeft)} Tu Ventana de 72 horas se libera en {videoButtonDelayLeft} s
                            </p>
                            <div className="delay-progress-bar-container">
                                <div 
                                    className="delay-progress-bar" 
                                    style={{ width: `${((10 - videoButtonDelayLeft) / 10) * 100}%` }}
                                ></div>
                            </div>
                            <button 
                                className="cta-button btn-yellow btn-size-2 btn-animation-bounce disabled" 
                                disabled
                            >
                                Revelar mi Ventana de 72 horas
                            </button>
                        </>
                    ) : (
                        <button 
                            className="cta-button btn-yellow btn-size-2 btn-animation-bounce" 
                            onClick={onButtonClick}
                        >
                            ⚡ Revelar mi Ventana de 72 horas
                        </button>
                    )}
                </div>
            )}
            <style>{`
                .vsl4-root, .vsl4-root * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .vsl4-kicker { margin: 0 0 6px; text-align: center; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; }
                .vsl4-title { margin: 0; text-align: center; font-size: clamp(1.35rem, 6vw, 1.7rem) !important; line-height: 1.25; font-weight: 800; color: #fff; }
                .vsl4-title span { color: #facc15; }
                .vsl4-root .vsl-container { margin: 16px 0 0; }
                .vsl4-root .vsl-placeholder { background: none !important; border: none !important; padding: 0 !important; min-height: 0 !important; display: block !important; max-width: 420px; }
                .vsl4-root .video-delay-indicator { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px 16px; margin-top: 16px; }
                .vsl4-root .delay-text { font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.9); margin: 0 0 10px; }
            `}</style>
        </div>
    );
}
