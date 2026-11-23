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
        const progress = (50 - secondsLeft) / 50;
        if (progress < 0.2) return '😴';
        if (progress < 0.4) return '⏳';
        if (progress < 0.7) return '🔥';
        return '🚀';
    };

    return (
        <div 
            ref={sectionRef} 
            className={`revelation fade-in vsl-revelation ${fadeOutPhase === 2 ? 'fade-out' : ''}`}
        >
            <div className="revelation-header">
                <h2>Ahora solo falta un paso más para recuperar a la mujer que amas.</h2>
            </div>
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
                                {getDelayEmoji(videoButtonDelayLeft)} Próxima sección en {videoButtonDelayLeft} segundos...
                            </p>
                            <div className="delay-progress-bar-container">
                                <div 
                                    className="delay-progress-bar" 
                                    style={{ width: `${((50 - videoButtonDelayLeft) / 50) * 100}%` }}
                                ></div>
                            </div>
                            <button 
                                className="cta-button btn-yellow btn-size-2 btn-animation-bounce disabled" 
                                disabled
                            >
                                Revelar VENTANA DE 72 HORAS
                            </button>
                        </>
                    ) : (
                        <button 
                            className="cta-button btn-yellow btn-size-2 btn-animation-bounce" 
                            onClick={onButtonClick}
                        >
                            ⏳ Revelar VENTANA DE 72 HORAS
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
