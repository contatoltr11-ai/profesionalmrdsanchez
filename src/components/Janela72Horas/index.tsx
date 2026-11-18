import { RefObject } from 'react';
import { storage } from '../../utils/storage';
import {
    getVentana72Copy,
    getVentanaImportance,
    getFaseText,
    getVentanaEnTuCaso
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
    const enTuCaso = getVentanaEnTuCaso(quizData);

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
                    Después de acompañar a más de 9.000 hombres, vi algo que se repite: las 72 horas no empiezan el día en que terminaron. <strong>Empiezan el día en que tú cambias.</strong> Y lo que haces en esas 72 horas decide si ella se acerca o se cierra.
                </p>
                <p style={{ marginTop: 12 }}>
                    Por eso no importa si se separaron hace 3 días o hace 3 meses.
                </p>
            </div>

            <img 
                src="https://ssplan.shop/wp-content/uploads/2026/11/ventana-noticia.webp"
                alt="La Ventana de 72 horas"
                className="ventana-img-top"
            />

            <p className="ventana-img-caption">
                Cada disparador tiene su momento. Usarlo antes o después lo cambia todo.
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

            <div className="ventana-entucaso-box">
                <h3 className="entucaso-title">📍 En tu caso</h3>
                {enTuCaso.situacionTexto && <p className="entucaso-text">{enTuCaso.situacionTexto}</p>}
                <p className="entucaso-clave">⭐ Tu disparador clave: <strong>{enTuCaso.nombre}</strong> (Fase {enTuCaso.fase})</p>
                <p className="entucaso-text">{enTuCaso.claveTexto}</p>
            </div>

            <div className="fases-list-dopamine">
                {[1, 2, 3].map(f => {
                    const faseData = getFaseText(gender, f);
                    return (
                        <div key={f} className={`fase-card-dopamine ${f === enTuCaso.fase ? 'fase-card-clave' : ''}`}>
                            {f === enTuCaso.fase && <div className="fase-clave-badge">⭐ TU DISPARADOR CLAVE</div>}
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
