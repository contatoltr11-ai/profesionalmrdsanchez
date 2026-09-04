import { RefObject } from 'react';
import { storage } from '../../utils/storage';
import {
    getVentana72Copy,
    getVentanaSummary,
    getVentanaImportance,
    getFaseText
} from '../../utils/contentByGender';

interface Janela72HorasProps {
    sectionRef: RefObject<HTMLDivElement>;
    fadeOutPhase: number | null;
    buttonChecked: boolean;
    onButtonClick: () => void;
}

export default function Janela72Horas({ sectionRef, fadeOutPhase, buttonChecked, onButtonClick }: Janela72HorasProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';

    return (
        <div 
            ref={sectionRef} 
            className={`revelation fade-in ventana-box-custom ${fadeOutPhase === 3 ? 'fade-out' : ''}`}
        >
            <div className="ventana-header-custom">
                <span>⚡</span>
                <h2>LA VENTANA DE 72 HORAS</h2>
            </div>

            <div className="ventana-scientific-intro">
                <p>
                    Estudios de Harvard y Nature Neuroscience comprueban: existen ventanas neuroquímicas de 72 horas donde el cerebro de tu ex multiplica su receptividad emocional (dopamina, oxitocina, apego). 
                    <strong> Este es el fundamento científico del proceso que verás ahora.</strong>
                </p>
            </div>

            <img 
                src="https://i.ibb.co/twpBx8Wq/reportagem-01.webp" 
                alt="Ventana 72h - Fundamento Científico" 
                className="ventana-img-top"
            />

            <p className="ventana-img-caption">
                La ciencia confirma: 72 horas es la ventana crítica para reactivar vínculos emocionales.
            </p>

            <div className="ventana-importance-box">
                <h3 className="importance-title">🔥 Por qué la Ventana es crucial</h3>
                <div className="importance-bullets">
                    {getVentanaImportance().map((item, index) => (
                        <div key={index} className="importance-item">{item}</div>
                    ))}
                </div>
            </div>

            <p className="ventana-intro" style={{ whiteSpace: 'pre-line' }}>{getVentana72Copy(gender)}</p>

            <div className="ventana-summary-box">
                <h3 className="summary-quick-title">📋 Resumen de las 3 fases:</h3>
                <div className="summary-quick-list">
                    {getVentanaSummary(gender).map((item, index) => (
                        <div key={index} className="summary-quick-item">{item}</div>
                    ))}
                </div>
            </div>

            <div className="fases-list-dopamine">
                {[1, 2, 3].map(f => {
                    const faseData = getFaseText(gender, f);
                    return (
                        <div key={f} className="fase-card-dopamine">
                            <div className="fase-card-header">
                                <div className="fase-number">FASE {f}</div>
                                <div className="fase-timerange">{faseData.timeRange}</div>
                            </div>

                            <h4 className="fase-card-title">
                                {f === 1 ? '🎯' : f === 2 ? '💡' : '❤️'} {faseData.title}
                            </h4>

                            <p className="fase-card-summary">{faseData.summary}</p>

                            <div className="fase-card-bullets">
                                {faseData.bullets.map((bullet, index) => (
                                    <div key={index} className="fase-bullet-item">
                                        {bullet}
                                    </div>
                                ))}
                            </div>

                            <div className="fase-card-warning">{faseData.warning}</div>

                            <div className="fase-card-footer">
                                <span className="fase-check">✔️ Fase {f} concluída</span>
                                {f < 3 && <span className="fase-next">Avance para la próxima →</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {buttonChecked ? (
                <div className="checkmark-container">
                    <div className="checkmark-glow">✅</div>
                </div>
            ) : (
                <button 
                    className="cta-button btn-orange btn-size-3 btn-animation-pulse" 
                    onClick={onButtonClick}
                >
                    ⚡ Ver Mi Plan Y Precio Especial
                </button>
            )}
        </div>
    );
}
