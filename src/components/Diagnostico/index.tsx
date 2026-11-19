import { RefObject, CSSProperties, useRef, useState } from 'react';
import { storage } from '../../utils/storage';
import { getTitle, getCopy, getProbabilidad } from '../../utils/contentByGender';
import { ga4Tracking } from '../../utils/ga4Tracking';

interface DiagnosticoProps {
    sectionRef: RefObject<HTMLDivElement | null>;
    fadeOutPhase: number | null;
    buttonChecked: boolean;
    onButtonClick: () => void;
}

export default function Diagnostico({ sectionRef, fadeOutPhase, buttonChecked, onButtonClick }: DiagnosticoProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';
    const probabilidad = getProbabilidad(quizData);


    // Lab: título acima dos botões, conforme a situação
    const tituloBySituation: Record<string, string> = {
        'CONTACTO CERO':          'Ahora: por qué el silencio no es el final',
        'ME IGNORA':              'Ahora: qué hacer cuando ella no responde',
        'BLOQUEADO':              'Ahora: el camino que no requiere mensaje',
        'SÓLO TEMAS NECESARIOS':  'Ahora: cómo romper el contacto funcional',
        'VIVIMOS JUNTOS PERO DISTANTES': 'Ahora: cómo dejar de ser invisible en casa',
        'HABLAMOS A VECES':       'Ahora: cómo convertir chats en encuentros',
        'SOMOS AMIGOS':           'Ahora: cómo salir de la friendzone',
        'ENCUENTROS ÍNTIMOS':     'Ahora: cómo convertir encuentros en relación',
    };

    // Lab: 2 prints de WhatsApp — o 1º é o do caso dele
    const PRINT_A = { src: '/img/print-a.jpg', alt: 'Vivían bajo el mismo techo, como desconocidos' };
    const PRINT_B = { src: '/img/print-b.jpg', alt: 'Ella le había dicho que ya no sentía nada' };
    const PRINT_C = { src: '/img/print-c.jpg', alt: 'Ella ya estaba con otro' };
    const sit = quizData.currentSituation || '';
    const conOtro = ['RELACIÓN SERIA', 'SALIENDO CASUAL', 'VARIAS PERSONAS'].includes(quizData.exSituation || '');
    const vivenJuntos = sit === 'VIVIMOS JUNTOS PERO DISTANTES' || sit === 'SÓLO TEMAS NECESARIOS';
    // 19/11: sem a pergunta do motivo, o print "ya no sentía nada" vai primeiro para quem marcou "me quiere pero no lo suficiente"
    const dejoDeSentir = quizData.mainPain === 'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE';
    const prints = conOtro ? [PRINT_C, PRINT_B]
        : vivenJuntos ? [PRINT_A, PRINT_B]
        : dejoDeSentir ? [PRINT_B, PRINT_A]
        : [PRINT_B, PRINT_C];

    // carrossel: legenda acompanha o print visível
    const legendas = ['Así le pasó a un hombre en tu misma situación', 'Y a otro que pensaba que ya era tarde'];
    const carrosselRef = useRef<HTMLDivElement>(null);
    const [slide, setSlide] = useState(0);
    const onCarrosselScroll = () => {
        const el = carrosselRef.current;
        if (!el) return;
        const s = el.scrollLeft > (el.scrollWidth - el.clientWidth) / 2 ? 1 : 0;
        if (s !== slide) setSlide(s);
    };
    const irPara = (idx: number) => {
        const el = carrosselRef.current;
        if (!el) return;
        const alvo = el.children[idx] as HTMLElement | undefined;
        if (alvo) el.scrollTo({ left: alvo.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    };

    const handleSi = (location: string) => {
        ga4Tracking.diagnosticoCTAClick(location);
        onButtonClick();
    };

    const legenda: CSSProperties = { fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#facc15', fontWeight: 700, textAlign: 'center', margin: '0 0 10px' };

    return (
        <div 
            ref={sectionRef} 
            className={`revelation fade-in ${fadeOutPhase === 1 ? 'fade-out' : ''}`}
        >
            {/* Mecanismo v2 (18/11/2026): alerta + medidor de probabilidade */}
            <div style={{ background: '#dc2626', color: 'white', borderRadius: '12px', padding: '12px 14px', textAlign: 'center', margin: '0 0 16px' }}>
                <p style={{ fontWeight: 900, fontSize: 'clamp(1.05rem, 4.6vw, 1.25rem)', margin: 0, letterSpacing: '0.02em' }}>¡NO SALGAS DE ESTA PÁGINA!</p>
                <p style={{ fontSize: 'clamp(0.9rem, 3.6vw, 1rem)', margin: '4px 0 0', opacity: 0.95 }}>Lee hasta el final. Lo que sigue es tu caso.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '16px', margin: '0 0 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', fontWeight: 800, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', margin: 0 }}>PROBABILIDAD DE QUE VUELVA HOY</p>
                <p style={{ fontSize: 'clamp(2.4rem, 11vw, 3rem)', fontWeight: 900, color: '#facc15', margin: '4px 0 8px', lineHeight: 1 }}>{probabilidad}%</p>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.12)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${probabilidad}%`, height: '100%', background: 'linear-gradient(90deg, #dc2626, #facc15)', borderRadius: '6px' }} />
                    <div style={{ position: 'absolute', left: '87%', top: 0, bottom: 0, width: '2px', background: '#22c55e' }} />
                </div>
                <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)', color: 'white', margin: '10px 0 0', lineHeight: 1.4 }}>Con tu disparador activado en las próximas 72 horas: <strong style={{ color: '#22c55e' }}>hasta 87%</strong>.</p>
                <p style={{ fontSize: 'clamp(0.85rem, 3.4vw, 0.95rem)', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>Todavía hay tiempo, pero cada día cuenta.</p>
            </div>

            <div className="revelation-header">
                <div className="revelation-icon">💔</div>
                <h2>{quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES' ? 'Por Qué Ella Se Alejó' : getTitle(gender)}</h2>
            </div>

            <div className="quiz-summary-box">
                <p className="summary-title">📋 TU SITUACIÓN ESPECÍFICA</p>
                <div className="summary-grid">
                    <div><span>✓</span> <strong>Tiempo:</strong> {quizData.timeSeparation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Lo que hiciste:</strong> {quizData.impulso || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Contacto:</strong> {quizData.currentSituation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>{gender === 'HOMBRE' ? 'Ella' : 'Él'} ahora:</strong> {quizData.exSituation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Lo que más te duele:</strong> {quizData.mainPain || 'No especificado'}</div>
                </div>
            </div>

            {/* TESTE 4 (lab): bloco antigo getEmotionalValidation removido (duplicava o getCopy) */}
            {/* Mecanismo v2: foto da Sophia em Harvard logo após o parágrafo do estudo (marcador [[FOTO_HARVARD]] no getCopy).
                Foto provisória (cabelo ondulado; o usuário vai trocar por uma com cabelo liso). */}
            {getCopy(quizData).split('[[FOTO_HARVARD]]').map((trecho, i, arr) => (
                <div key={i}>
                    <p className="revelation-text" style={{ whiteSpace: 'pre-line' }}>{trecho.trim()}</p>
                    {i < arr.length - 1 && (
                        <figure style={{ margin: '4px 0 22px' }}>
                            <img
                                src="/img/sophia-harvard.webp"
                                alt="Sophia Sanchez en Harvard"
                                width={720}
                                height={720}
                                loading="lazy"
                                style={{ width: '100%', height: 'auto', borderRadius: '14px', display: 'block' }}
                            />
                            <figcaption style={{ fontSize: 'clamp(0.85rem, 3.4vw, 0.95rem)', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: '8px', lineHeight: 1.4 }}>
                                Sophia Sanchez en Harvard, donde estudió cómo el cerebro femenino decide a quién elegir.
                            </figcaption>
                        </figure>
                    )}
                </div>
            ))}

            {/* Lab: prova (2 prints) em carrossel com a ponta do 2º aparecendo + compromisso sí/sí */}
            <div style={{ margin: 'clamp(24px, 6vw, 32px) 0 0' }}>
                <p style={legenda}>{legendas[slide]}</p>
                <style>{`.prints-carrossel::-webkit-scrollbar{display:none}`}</style>
                <div
                    ref={carrosselRef}
                    className="prints-carrossel"
                    onScroll={onCarrosselScroll}
                    style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', padding: '4px 0 10px' }}
                >
                    {prints.map((p, idx) => (
                        <img
                            key={p.src}
                            src={p.src}
                            alt={p.alt}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            onClick={() => irPara(idx === 0 ? 1 : 0)}
                            style={{ flex: '0 0 78%', width: '78%', maxWidth: '280px', scrollSnapAlign: 'start', borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.45)', cursor: 'pointer' }}
                        />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                    {prints.map((p, idx) => (
                        <button
                            key={p.src}
                            aria-label={`Ver mensaje ${idx + 1}`}
                            onClick={() => irPara(idx)}
                            style={{ width: '9px', height: '9px', padding: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: slide === idx ? '#facc15' : 'rgba(255,255,255,0.35)' }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ margin: 'clamp(28px, 7vw, 36px) 0 0', textAlign: 'center' }}>
                {tituloBySituation[sit] && (
                    <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.3rem)', color: 'white', fontWeight: 800, margin: '0 0 8px' }}>
                        {tituloBySituation[sit]}
                    </p>
                )}
                <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '0 0 16px' }}>
                    Sophia grabó un video corto con lo que está pasando en su cerebro ahora mismo, y lo que pocos hombres se atreven a hacer. ¿Te comprometes a verlo hasta el final?
                </p>
            </div>

            {buttonChecked ? (
                <div className="checkmark-container">
                    <div className="checkmark-glow">✅</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        className="cta-button btn-green btn-size-1 btn-animation-fadein" 
                        onClick={() => handleSi('diag_si_aplicar_hoy')}
                    >
                        ✅ Sí, quiero verlo y aplicarlo HOY
                    </button>
                    <button 
                        onClick={() => handleSi('diag_si_entender')}
                        style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.45)', borderRadius: '12px', padding: '14px 16px', fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                    >
                        Sí, quiero entender qué pasa en su cerebro
                    </button>
                </div>
            )}
        </div>
    );
}