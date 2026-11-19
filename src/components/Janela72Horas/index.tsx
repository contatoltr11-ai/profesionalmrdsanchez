import { RefObject } from 'react';
import { storage } from '../../utils/storage';
import {
    getFaseText,
    getVentanaEnTuCaso
} from '../../utils/contentByGender';

interface Janela72HorasProps {
    sectionRef: RefObject<HTMLDivElement>;
    fadeOutPhase: number | null;
    buttonChecked: boolean;
    onButtonClick: () => void;
}

// Ventana v4 (19/11/2026): mesma linguagem visual do diagnóstico v4 (fonte de leitura, cards, linhas químicas).
// Saiu o box "Por qué la Ventana es crucial" (repetia a intro e o ✅/❌).
export default function Janela72Horas({ sectionRef, fadeOutPhase, buttonChecked, onButtonClick }: Janela72HorasProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';
    const enTuCaso = getVentanaEnTuCaso(quizData);
    // Etapa 2 (19/11): abertura certa para quem mora junto e para quem não fez nada
    const vivenJuntos = quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES';
    const noHizoNada = (quizData.impulso || '').startsWith('NO HICE');

    return (
        <div
            ref={sectionRef}
            className={`revelation fade-in ventana-box-custom vent4-root ${fadeOutPhase === 3 ? 'fade-out' : ''}`}
        >
            <p className="vent4-kicker">⚡ Paso 3 de 4</p>
            <h2 className="vent4-title">La Ventana de <span>72 horas</span></h2>

            <p className="vent4-lead">{vivenJuntos ? 'No empieza el día en que se alejaron.' : 'No empieza el día en que terminaron.'}</p>
            <p className="vent4-p">
                Empieza el día en que <b className="vent4-red">{noHizoNada ? 'dejas de esperar sin un plan' : 'dejas de hundir el Ancla del Dolor'}</b>. Lo vi en más de 9.000 hombres: desde ese día, su cerebro pasa por 3 cambios, siempre en el mismo orden.
            </p>
            <p className="vent4-p">{vivenJuntos ? 'Por eso no importa si llevan 3 días o 3 meses así.' : 'Por eso no importa si se separaron hace 3 días o hace un año.'}</p>

            {/* Lab 18/11: foto da Sophia com homens (sem legenda) */}
            <img
                src="/img/sophia-hombres.webp"
                alt="Sophia"
                className="vent4-img"
                width={1200}
                height={675}
            />

            <p className="vent4-quote">
                Hoy el obsesionado eres tú: miras si vio tu historia, relees sus mensajes, escribes y borras. Eso es dopamina, y hoy la fabrica tu cerebro, no el de ella.
            </p>
            <p className="vent4-p">
                <b>La Obsesión Inversa le da la vuelta.</b> En 72 horas, esa química pasa de tu cerebro al de ella.
            </p>

            <div className="vent4-rows">
                <div className="vent4-row"><span className="vent4-ico">✅</span><span>Si haces lo correcto en cada fase, <b className="vent4-green">ella te busca</b>.</span></div>
                <div className="vent4-row"><span className="vent4-ico">❌</span><span>Si te equivocas, el Ancla del Dolor se hunde más y <b className="vent4-redtxt">ella se cierra</b>.</span></div>
            </div>

            <div className="vent4-card">
                <p className="vent4-label">📍 En tu caso</p>
                {enTuCaso.situacionTexto && <p className="vent4-p">{enTuCaso.situacionTexto}</p>}
                <div className="vent4-key">
                    <p className="vent4-key-label">⭐ Tu disparador clave · Fase {enTuCaso.fase}</p>
                    <p className="vent4-key-name">{enTuCaso.nombre}</p>
                    <p className="vent4-p">{enTuCaso.claveTexto}</p>
                </div>
            </div>

            <p className="vent4-sec">Las 3 fases, en orden</p>
            <div className="vent4-fases">
                {[1, 2, 3].map(f => {
                    const faseData = getFaseText(gender, f, vivenJuntos);
                    const esClave = f === enTuCaso.fase;
                    return (
                        <div key={f} className={`vent4-fase ${esClave ? 'vent4-fase-clave' : ''}`}>
                            {esClave && <div className="vent4-badge">⭐ TU DISPARADOR CLAVE</div>}
                            <p className="vent4-fase-top">Fase {f} · {faseData.timeRange}</p>
                            <h4 className="vent4-fase-title">{faseData.title}</h4>
                            <div className="vent4-chem">{faseData.cerebro}</div>
                            <p className="vent4-p">{faseData.summary}</p>
                            <ul className="vent4-list">
                                {faseData.bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                            <p className="vent4-warn">⚠️ {faseData.warning}</p>
                        </div>
                    );
                })}
            </div>

            <p className="vent4-p vent4-close">Tu plan te dice exactamente qué hacer en cada fase, en tu caso.</p>

            {buttonChecked ? (
                <div className="checkmark-container">
                    <div className="checkmark-glow">✅</div>
                </div>
            ) : (
                <button
                    className="cta-button btn-orange btn-size-3 btn-animation-pulse"
                    onClick={onButtonClick}
                >
                    ⚡ Ver mi plan y precio especial
                </button>
            )}

            <style>{`
                .vent4-root, .vent4-root * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .vent4-root { color: rgba(255,255,255,0.92); }
                .vent4-kicker { text-align: center; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #fb923c; margin: 0 0 6px; }
                .vent4-title { text-align: center; font-size: clamp(1.6rem, 7vw, 2.1rem); font-weight: 900; color: #fff; line-height: 1.15; margin: 0 0 22px !important; }
                .vent4-title span { color: #f97316; }
                .vent4-lead { font-size: clamp(1.25rem, 5.4vw, 1.5rem); font-weight: 800; color: #fff; margin: 0 0 10px; line-height: 1.3; }
                .vent4-p { font-size: clamp(1rem, 4.3vw, 1.12rem); line-height: 1.6; margin: 0 0 14px; }
                .vent4-p b { color: #fff; }
                .vent4-root .vent4-red { color: #f87171; }
                .vent4-root .vent4-green { color: #4ade80; }
                .vent4-root .vent4-redtxt { color: #f87171; }
                .vent4-img { width: 100%; height: auto; display: block; border-radius: 12px; margin: 6px 0 20px; }
                .vent4-quote { font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.55; font-style: italic; color: rgba(255,255,255,0.75); border-left: 3px solid rgba(255,255,255,0.3); padding: 2px 0 2px 14px; margin: 0 0 16px; }
                .vent4-rows { display: flex; flex-direction: column; gap: 8px; margin: 0 0 22px; }
                .vent4-row { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.4; }
                .vent4-ico { font-size: 1.3rem; }
                .vent4-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 16px; margin: 0 0 26px; }
                .vent4-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 8px; }
                .vent4-key { border: 2px solid #facc15; background: rgba(250,204,21,0.08); border-radius: 12px; padding: 14px; }
                .vent4-key-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 4px; }
                .vent4-key-name { font-size: clamp(1.4rem, 6vw, 1.7rem); font-weight: 900; color: #fff; margin: 0 0 6px; }
                .vent4-key .vent4-p { margin-bottom: 0; }
                .vent4-sec { text-align: center; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin: 0 0 12px; }
                .vent4-fases { display: flex; flex-direction: column; gap: 14px; margin: 0 0 20px; }
                .vent4-fase { background: rgba(255,255,255,0.05); border: 1px solid rgba(249,115,22,0.35); border-radius: 14px; padding: 16px; }
                .vent4-fase-clave { border: 2px solid #facc15; background: rgba(250,204,21,0.06); box-shadow: 0 0 22px rgba(250,204,21,0.18); }
                .vent4-badge { display: inline-block; background: #facc15; color: #111; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.04em; padding: 5px 12px; border-radius: 20px; margin-bottom: 10px; }
                .vent4-fase-top { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #fb923c; margin: 0 0 2px; }
                .vent4-fase-title { font-size: clamp(1.3rem, 5.6vw, 1.5rem); font-weight: 900; color: #fff; margin: 0 0 10px; }
                .vent4-chem { background: rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 12px; font-weight: 700; color: #fff; font-size: clamp(0.95rem, 4vw, 1.05rem); margin: 0 0 12px; }
                .vent4-list { list-style: none; padding: 0; margin: 0 0 12px; display: flex; flex-direction: column; gap: 6px; }
                .vent4-list li { position: relative; padding-left: 24px; font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.45; }
                .vent4-list li::before { content: '✓'; position: absolute; left: 2px; color: #4ade80; font-weight: 900; }
                .vent4-warn { font-size: clamp(0.92rem, 3.9vw, 1rem); line-height: 1.5; color: #fca5a5; font-weight: 600; margin: 0; }
                .vent4-close { text-align: center; font-weight: 700; color: #fff; }
            `}</style>
        </div>
    );
}
