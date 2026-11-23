import { RefObject, CSSProperties, useRef, useState } from 'react';
import { storage } from '../../utils/storage';
import { getTitle, getProbabilidad, getDiagnosticoBlocos } from '../../utils/contentByGender';
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
    const d = getDiagnosticoBlocos(quizData);
    // destaca "Ancla del Dolor" em vermelho dentro da abertura
    const [abA, abB] = d.abertura.split('Ancla del Dolor');
    // respostas do quiz vêm em CAIXA ALTA; no resumo, só a primeira letra maiúscula
    const fmt = (v?: string) => v ? v.charAt(0) + v.slice(1).toLowerCase() : 'No especificado';


    // Lab: título acima dos botões, conforme a situação
    const tituloBySituation: Record<string, string> = {
        'CONTACTO CERO':          'El silencio no es el final',
        'ME IGNORA':              'Que no te responda no es el final',
        'BLOQUEADO':              'Que te haya bloqueado no es el final',
        'SÓLO TEMAS NECESARIOS':  'Que solo hablen de lo necesario no es el final',
        'VIVIMOS JUNTOS PERO DISTANTES': 'Que se sientan lejos en casa no es el final',
        'HABLAMOS A VECES':       'Que todavía hablen es tu ventaja',
        'SOMOS AMIGOS':           'Ser su amigo no es el final',
        'ENCUENTROS ÍNTIMOS':     'Que todavía se vean es tu ventaja',
    };

    // Lab: 2 prints de WhatsApp — o 1º é o do caso dele
    const PRINT_A = { src: '/img/print-a.jpg', alt: 'Vivían bajo el mismo techo, como desconocidos' };
    const PRINT_B = { src: '/img/print-b.jpg', alt: 'Ella le había dicho que ya no sentía nada' };
    const PRINT_C = { src: '/img/print-c.jpg', alt: 'Ella ya estaba con otro' };
    const sit = quizData.currentSituation || '';
    const conOtro = ['RELACIÓN SERIA', 'SALIENDO CASUAL', 'VARIAS PERSONAS'].includes(quizData.exSituation || '');
    // Etapa 2 (19/11): Andrea (casal que mora junto) primeiro só para quem mora junto; sem contato nunca vê a Andrea
    const vivenJuntos = sit === 'VIVIMOS JUNTOS PERO DISTANTES';
    const sinContacto = ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO'].includes(sit);
    // 19/11: sem a pergunta do motivo, o print "ya no sentía nada" vai primeiro para quem marcou "me quiere pero no lo suficiente"
    const dejoDeSentir = quizData.mainPain === 'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE';
    const prints = conOtro ? [PRINT_C, PRINT_B]
        : vivenJuntos ? [PRINT_A, PRINT_B]
        : sinContacto ? [PRINT_B, PRINT_C]
        : (sit === 'SÓLO TEMAS NECESARIOS' || dejoDeSentir) ? [PRINT_B, PRINT_A]
        : [PRINT_B, PRINT_C];

    // carrossel: legenda acompanha o print visível
    const legendas = [
        sit === 'BLOQUEADO' ? 'Así le pasó a un hombre que también estaba bloqueado' : 'Así le pasó a un hombre en tu misma situación',
        'Y a otro que pensaba que ya era tarde'
    ];
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
            className={`revelation fade-in diag4-root ${fadeOutPhase === 1 ? 'fade-out' : ''}`}
        >
            {/* Enxuto 23/11 (reconquistaprp): sai a faixa "¡NO SALGAS!"; fica o medidor de probabilidade */}
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
                <h2>{quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES' ? 'Por Qué Ella Se Alejó' : getTitle(gender)}</h2>
            </div>

            <div className="quiz-summary-box">
                <p className="summary-title">📋 TU SITUACIÓN ESPECÍFICA</p>
                <div className="summary-grid">
                    <div><span>✓</span> <strong>Tiempo:</strong> {fmt(quizData.timeSeparation)}</div>
                    <div><span>✓</span> <strong>Lo que hiciste:</strong> {fmt(quizData.impulso)}</div>
                    <div><span>✓</span> <strong>Contacto:</strong> {fmt(quizData.currentSituation)}</div>
                    <div><span>✓</span> <strong>{gender === 'HOMBRE' ? 'Ella' : 'Él'} ahora:</strong> {quizData.exSituation === 'NO ESTOY SEGURO' ? 'No sé si está con alguien' : fmt(quizData.exSituation)}</div>
                    <div><span>✓</span> <strong>Lo que más te duele:</strong> {fmt(quizData.mainPain)}</div>
                </div>
            </div>

            {/* TESTE 4 (lab): bloco antigo getEmotionalValidation removido (duplicava o getCopy) */}
            {/* Diagnóstico v4 (19/11/2026): blocos visuais, fonte de leitura (não monoespaçada) */}
            <div className="diag4">
                <p className="diag4-lead">No fue por falta de amor.</p>
                <p className="diag4-p">
                    {abA}{d.abertura.includes('Ancla del Dolor') && <strong className="diag4-red">Ancla del Dolor</strong>}{abB}
                </p>

                {d.verguenza && <p className="diag4-quote">{d.verguenza}</p>}

                {/* Enxuto 23/11 (reconquistaprp): saíram o bloco de Harvard (fica na landing/sanchezmrd) e o cartão oxitocina/dopamina */}
                {d.enTuCaso && (
                    <div className="diag4-card">
                        <p className="diag4-label">📍 En tu caso</p>
                        <p className="diag4-p">{d.enTuCaso}</p>
                    </div>
                )}

                <div className="diag4-key">
                    <p className="diag4-key-label">⭐ Tu disparador clave</p>
                    <p className="diag4-key-name">{d.disparadorNombre}</p>
                    <p className="diag4-p">{d.disparadorTexto}</p>
                </div>

                <p className="diag4-p">Eso es la <strong>Obsesión Inversa</strong>: {(quizData.impulso || '').startsWith('NO HICE') ? 'dejas de esperarla en silencio' : 'dejas de perseguirla tú'}, y es su cerebro el que empieza a buscarte.</p>
                <p className="diag4-warn">⚠️ Pero cuidado: mal usado, la aleja para siempre.</p>
            </div>
            <style>{`
                .diag4-root, .diag4-root * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .diag4-root .revelation-header { justify-content: center; text-align: center; }
                .diag4-root .summary-grid { grid-template-columns: 1fr; gap: 10px; }
                .diag4-root .summary-grid div { font-size: 1rem; line-height: 1.4; }
                .diag4-root .summary-title { letter-spacing: 0.04em; }
                .diag4 { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: rgba(255,255,255,0.92); }
                .diag4-lead { font-size: clamp(1.25rem, 5.4vw, 1.5rem); font-weight: 800; color: #fff; margin: 4px 0 10px; }
                .diag4-p { font-size: clamp(1rem, 4.3vw, 1.12rem); line-height: 1.6; margin: 0 0 14px; }
                .diag4-strong { font-weight: 700; color: #fff; margin-top: 22px; }
                .diag4-red { color: #f87171; }
                .diag4-green { color: #4ade80; font-weight: 800; }
                .diag4-quote { font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.55; font-style: italic; color: rgba(255,255,255,0.72); border-left: 3px solid rgba(255,255,255,0.3); padding: 2px 0 2px 14px; margin: 0 0 22px; }
                .diag4-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 16px; margin: 0 0 18px; }
                .diag4-card .diag4-p:last-child { margin-bottom: 0; }
                .diag4-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 8px; }
                .diag4-img { width: 100%; height: auto; border-radius: 12px; display: block; margin-top: 4px; }
                .diag4-chem { display: flex; flex-direction: column; gap: 8px; margin: 0 0 12px; }
                .diag4-chem-row { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; }
                .diag4-chem-ico { font-size: 1.6rem; }
                .diag4-chem-name { flex: 1; font-size: 0.95rem; line-height: 1.3; color: rgba(255,255,255,0.8); }
                .diag4-chem-name b { color: #fff; font-size: 1.05rem; }
                .diag4-chem-ok { font-weight: 800; color: #4ade80; white-space: nowrap; }
                .diag4-chem-off { font-weight: 800; color: #f87171; white-space: nowrap; }
                .diag4-key { border: 2px solid #facc15; background: rgba(250,204,21,0.08); border-radius: 14px; padding: 16px; margin: 0 0 18px; }
                .diag4-key-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 4px; }
                .diag4-key-name { font-size: clamp(1.4rem, 6vw, 1.7rem); font-weight: 900; color: #fff; margin: 0 0 8px; }
                .diag4-key .diag4-p { margin-bottom: 0; }
                .diag4-warn { font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.55; color: #fca5a5; font-weight: 600; margin: 0; }
            `}</style>

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
                    {/* Etapa 1 (19/11): promete só o que a VSL atual entrega (antes: "lo que está pasando en su cerebro ahora mismo") */}
                    Sophia grabó un video corto para los hombres que están justo donde estás tú. ¿Te comprometes a verlo hasta el final?
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
                        Sí, pero primero quiero escucharla
                    </button>
                </div>
            )}
        </div>
    );
}