import { RefObject, CSSProperties, useRef, useState } from 'react';
import { storage } from '../../utils/storage';
import { getTitle, getCopy } from '../../utils/contentByGender';
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
    const dejoDeSentir = quizData.mainCause === 'DEJÓ DE SENTIR Y NO SÉ POR QUÉ';
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
            <div className="revelation-header">
                <div className="revelation-icon">💔</div>
                <h2>{quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES' ? 'Por Qué Ella Se Alejó' : getTitle(gender)}</h2>
            </div>

            <div className="quiz-summary-box">
                <p className="summary-title">📋 TU SITUACIÓN ESPECÍFICA</p>
                <div className="summary-grid">
                    <div><span>✓</span> <strong>Tiempo:</strong> {quizData.timeSeparation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Lo que la alejó:</strong> {quizData.mainCause || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Contacto:</strong> {quizData.currentSituation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>{gender === 'HOMBRE' ? 'Ella' : 'Él'} ahora:</strong> {quizData.exSituation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Lo que más te duele:</strong> {quizData.mainPain || 'No especificado'}</div>
                </div>
            </div>

            {/* TESTE 4 (lab): bloco antigo getEmotionalValidation removido (duplicava o getCopy) */}
            <p className="revelation-text" style={{ whiteSpace: 'pre-line' }}>{getCopy(quizData)}</p>

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
                    Sophia grabó un video corto con algo que pocos tienen el coraje de admitir sobre este momento. ¿Lo vas a ver hasta el final?
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
                        ✅ Sí, quiero verlo y aplicarlo hoy
                    </button>
                    <button 
                        onClick={() => handleSi('diag_si_entender')}
                        style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.45)', borderRadius: '12px', padding: '14px 16px', fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                    >
                        Sí, pero primero quiero entender cómo funciona
                    </button>
                </div>
            )}
        </div>
    );
}