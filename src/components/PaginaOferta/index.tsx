import { RefObject, useEffect, useRef, useState } from 'react';
import { storage } from '../../utils/storage';
import { ga4Tracking } from '../../utils/ga4Tracking';
import { getDisparadorClave, getProbabilidad } from '../../utils/contentByGender';

interface PaginaOfertaProps {
    preOfferRef: RefObject<HTMLDivElement>;
    offerRef: RefObject<HTMLDivElement>;
    offerTimeLeft: number;
    offerTimerStage: number;
    spotsLeft: number;
    peopleBuying: number;
    selectedPlan: number | null;
    setSelectedPlan: (plan: number) => void;
    onCTAClick: () => void;
    formatTime: (seconds: number) => string;
}

export default function PaginaOferta({
    preOfferRef,
    offerRef,
    offerTimeLeft,
    offerTimerStage,
    spotsLeft,
    peopleBuying,
    selectedPlan,
    setSelectedPlan,
    onCTAClick,
    formatTime
}: PaginaOfertaProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';

    // Bloco 1 (19/11, v2): botão fixo "Volver a mi Plan Completo" — só aparece DEPOIS que o lead
    // passou pelos planos (ele lê tudo até o preço sem distração; decisão do usuário).
    // Leva ao card do $27 (não compra direto e não troca o plano que ele escolheu).
    // Some quando os planos, o CTA principal ou o CTA final estão na tela.
    const plansRef = useRef<HTMLDivElement>(null);
    const completoRef = useRef<HTMLDivElement>(null);
    const mainCtaRef = useRef<HTMLButtonElement>(null);
    const finalCtaRef = useRef<HTMLButtonElement>(null);
    const [visibleTargets, setVisibleTargets] = useState<Record<string, boolean>>({});
    const [passedPlans, setPassedPlans] = useState(false);
    useEffect(() => {
        const targets: [string, Element | null][] = [
            ['plans', plansRef.current],
            ['main', mainCtaRef.current],
            ['final', finalCtaRef.current],
        ];
        const obs = new IntersectionObserver(entries => {
            setVisibleTargets(prev => {
                const next = { ...prev };
                entries.forEach(e => {
                    const t = targets.find(([, el]) => el === e.target);
                    if (t) next[t[0]] = e.isIntersecting;
                });
                return next;
            });
        });
        targets.forEach(([, el]) => el && obs.observe(el));
        const onScroll = () => {
            const p = plansRef.current;
            setPassedPlans(!!p && p.getBoundingClientRect().bottom < 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll); };
    }, []);
    const showSticky = passedPlans && !Object.values(visibleTargets).some(Boolean);
    const goToCompleto = () => {
        ga4Tracking.offerStickyClick();
        const el = completoRef.current;
        if (!el) return;
        const bar = document.querySelector('.progress-bar-container') as HTMLElement | null;
        const top = el.getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 0) - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    // Detecta o cenário do lead com base no quizData (regra exata)
    const detectScenario = (): 'contacto_cero' | 'con_otro' | 'bloqueo' | 'canal_abierto' | 'ruptura_reciente' | 'mismo_techo' => {
        // PRIORIDAD 1: Bloqueo (barrera objetiva, no hay contacto posible)
        if (quizData.currentSituation === 'BLOQUEADO') return 'bloqueo';

        // PRIORIDAD 2: Ex-pareja con otra persona (información más fuerte del quiz)
        if (
            quizData.exSituation === 'RELACIÓN SERIA' ||
            quizData.exSituation === 'SALIENDO CASUAL' ||
            quizData.exSituation === 'VARIAS PERSONAS'
        ) return 'con_otro';

        // PRIORIDAD 2b (lab 18/11): quien vive junto ve su escenario aunque la ruptura sea reciente
        if (quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES') return 'mismo_techo';

        // PRIORIDAD 3: Ruptura reciente REAL (≤ 4 semanas)
        if (
            quizData.timeSeparation === 'MENOS DE 1 SEMANA' ||
            quizData.timeSeparation === '1-4 SEMANAS'
        ) return 'ruptura_reciente';

        // PRIORIDAD 3b: Hablan solo de lo necesario (viven juntos / hijos). Coherente con el diagnóstico
        // ("todavía hablan") y con el disparador La Nostalgia — no es contacto cero.
        if (quizData.currentSituation === 'SÓLO TEMAS NECESARIOS' || quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES') return 'mismo_techo';

        // PRIORIDAD 4: Canal abierto = vínculo activo
        if (
            quizData.currentSituation === 'SOMOS AMIGOS' ||
            quizData.currentSituation === 'HABLAMOS A VECES' ||
            quizData.currentSituation === 'ENCUENTROS ÍNTIMOS'
        ) return 'canal_abierto';

        // PRIORIDAD 5: Sin contacto o contacto frío
        if (
            quizData.currentSituation === 'CONTACTO CERO' ||
            quizData.currentSituation === 'ME IGNORA'
        ) return 'contacto_cero';

        // Fallback seguro: contacto cero (nunca contradice al lead)
        return 'contacto_cero';
    };

    const scenario = detectScenario();
    // TESTE 3: o mesmo disparador clave do diagnóstico aparece na oferta
    const disparadorClave = getDisparadorClave(quizData);

    // TESTE 4 (lab): quem marcou "VIVIMOS JUNTOS" vê o próprio cenário (não "temas necesarios")
    const vivenJuntos = quizData.currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES';

    // TESTE 4 (lab): o medo que ele escolheu no chat, devolvido antes do preço
    const miedoByOption: Record<string, string> = {
        'QUE SE ACOSTUMBRE A VIVIR SIN MÍ': 'Me dijiste que lo que más miedo te da es que se acostumbre a vivir sin ti. Por eso tu plan empieza hoy.',
        'QUE SE ENAMORE DE OTRO': 'Me dijiste que lo que más miedo te da es que se enamore de otro. Por eso tu plan te dice qué hacer y en qué momento, sin actuar a ciegas.',
        'PERDER A MI FAMILIA': 'Me dijiste que lo que más miedo te da es perder a tu familia. Por eso cada paso de tu plan está pensado para no arriesgar lo que tienen.',
        'QUE VOLVAMOS Y PASE LO MISMO': 'Me dijiste que lo que más miedo te da es que vuelvan y pase lo mismo. Por eso, además de qué hacer, vas a ver qué no repetir.'
    };
    const miedoEco = miedoByOption[quizData.mainFear || ''] || '';

    // Lab 18/11 (J): no Plan Esencial, o ❌ do que o caso dele precisa aparece primeiro e destacado
    // Etapa 3A (19/11): bônus com nome de curiosidade ligado ao mecanismo
    const itensFaltantes = [
        'Mapa de señales (cómo saber que está volviendo)',
        'Protocolo La Pérdida (si ya está con otro)',
        'Protocolo Mismo Techo (si la sigues viendo)',
        'Círculo privado'
    ];
    // 19/11: bloqueado E ela com outro → o disparador dele é La Pérdida, então o item do caso é o módulo «Si ya está con otro»
    const bloqueoConOtro = scenario === 'bloqueo' && ['RELACIÓN SERIA', 'SALIENDO CASUAL', 'VARIAS PERSONAS'].includes(quizData.exSituation || '');
    const casoConOtro = scenario === 'con_otro' || bloqueoConOtro;
    const casoItemFaltante =
        casoConOtro ? 'Protocolo La Pérdida (si ya está con otro)'
        : scenario === 'mismo_techo' ? 'Protocolo Mismo Techo (si la sigues viendo)'
        : 'Mapa de señales (cómo saber que está volviendo)';
    const casoItemTexto =
        casoConOtro ? 'el Protocolo La Pérdida (si ya está con otro)'
        : scenario === 'mismo_techo' ? 'el Protocolo Mismo Techo (si la sigues viendo)'
        : 'el Mapa de señales (cómo saber que está volviendo)';
    const subtituloCompleto =
        casoConOtro ? 'Armado para tu caso: incluye el Protocolo La Pérdida (si ya está con otro)'
        : scenario === 'mismo_techo' ? 'Armado para tu caso: incluye el Protocolo Mismo Techo (si la sigues viendo)'
        : 'Armado para tu caso: incluye el Mapa de señales (cómo saber que está volviendo)';

    // 5 variáveis × 4 cenários
    const scenarioContent = {
        escenario_diagnostico: {
            contacto_cero: 'Tu diagnóstico apuntó a un escenario concreto: contacto cero.',
            con_otro: 'Tu diagnóstico apuntó a un escenario concreto: ella está con otro.',
            bloqueo: 'Tu diagnóstico apuntó a un escenario concreto: bloqueo. Insistir ahora solo la aleja más.',
            mismo_techo: 'Tu diagnóstico apuntó a un escenario concreto: se hablan solo de lo necesario.',
            canal_abierto: 'Tu diagnóstico apuntó a un escenario concreto: canal abierto. Ella ya habla contigo. El problema no es llegar a ella, es cómo te ve cuando lo hace.',
            ruptura_reciente: 'Tu diagnóstico apuntó a un escenario concreto: ruptura reciente. El momento importa más que la intensidad.'
        },
        linea_caso: {
            contacto_cero: 'El silencio no es el final. Pero cada día que pasa, el terreno cambia.',
            con_otro: 'Que esté con otro no significa que te olvidó. Lo que decide no es lo que él hace, es lo que haces tú mientras tanto, sin competir con él.',
            mismo_techo: 'Hablan, pero como dos desconocidos. Lo que cambia eso no es hablar más, es cómo te ve cuando hablan.',
            bloqueo: 'El bloqueo no significa que la puerta esté cerrada para siempre. Significa que el primer paso es otro.',
            canal_abierto: 'Que todavía tengan contacto es una ventaja. Pero cada conversación cuenta: puede acercarla o dejarte en el mismo lugar de siempre.',
            ruptura_reciente: 'Seguro te estás preguntando si escribirle o esperar. Es la duda de casi todos al principio, y la respuesta depende del momento, no de las ganas.'
        },
        testimonio_caso: {
            contacto_cero: {
                texto: 'Pasaron meses sin hablarnos. Un día ella se contactó conmigo: quería hablar. Ya acordamos vernos.',
                autor: 'Antonio S.'
            },
            con_otro: {
                texto: 'Ella estaba con otro y yo pensé que la había perdido. Hoy fue nuestro aniversario y aceptó venir a la casa.',
                autor: 'José R.'
            },
            bloqueo: {
                texto: 'Me tenía bloqueado por todas partes. Dejé de insistir y seguí el plan. Me desbloqueó, y después me escribió para vernos.',
                autor: 'Carlos M.'
            },
            canal_abierto: {
                texto: 'Hablábamos, pero frío, como dos conocidos. Ahora la noto cambiada, y para bien. Está más cariñosa conmigo.',
                autor: 'Rodrigo V.'
            },
            ruptura_reciente: {
                texto: 'Al principio actué por impulso y empeoré todo. Después seguí el plan, fase por fase. Una noche me llamó y me dijo que no puede tirar todo a la basura.',
                autor: 'Diego F.'
            },
            mismo_techo: {
                texto: 'Éramos como desconocidos bajo el mismo techo. Ahora me dice que me nota distinto, que me estoy arreglando más.',
                autor: 'Jorge P.'
            }
        },
        recomendacion_plan: {
            contacto_cero: 'Para tu caso te recomiendo el Plan Completo: además de los 3 disparadores, incluye el Mapa de señales para saber cuándo romper el silencio sin arriesgar nada.',
            con_otro: 'Para tu caso te recomiendo el Plan Completo: incluye el Protocolo La Pérdida (si ya está con otro), que es justo tu situación.',
            bloqueo: 'Para tu caso te recomiendo el Plan Completo: te muestra cuál es el primer paso correcto para no cerrar más la puerta, y cómo leer las señales cuando empiece a abrirse.',
            canal_abierto: 'Para tu caso te recomiendo el Plan Completo: incluye el Mapa de señales, para saber cuándo avanzar sin perder el contacto que ya tienen.',
            ruptura_reciente: 'Para tu caso te recomiendo el Plan Completo: incluye el Mapa de señales, para saber si está volviendo y cuándo dar el siguiente paso.',
            mismo_techo: 'Para tu caso te recomiendo el Plan Completo: incluye el Protocolo Mismo Techo, para cuando todavía la ves (por la casa o por los hijos) y no puedes desaparecer.'
        },
        cta_final: {
            contacto_cero: 'Quiero mi plan para romper el silencio',
            con_otro: 'Quiero mi plan aunque esté con otro',
            bloqueo: 'Quiero mi plan y dar el primer paso correcto',
            canal_abierto: 'Quiero mi plan para que me vea distinto',
            ruptura_reciente: 'Quiero mi plan antes de dar otro paso en falso',
            mismo_techo: 'Quiero mi plan para que me vuelva a mirar'
        }

    } as const;
    
     const testimonialImgByScenario: Record<string, string> = {
        contacto_cero:    'https://ssplan.shop/wp-content/uploads/2026/10/01-daniela.webp',
        con_otro:         'https://ssplan.shop/wp-content/uploads/2026/10/02-valentina.webp',
        bloqueo:          'https://ssplan.shop/wp-content/uploads/2026/10/03-camila.webp',
        canal_abierto:    'https://ssplan.shop/wp-content/uploads/2026/10/lucia.webp',
        ruptura_reciente: 'https://ssplan.shop/wp-content/uploads/2026/10/04-mariana.webp',
        mismo_techo:      'https://ssplan.shop/wp-content/uploads/2026/10/lucia.webp'
    };

    const testimonialAvatarByScenario: Record<string, string> = {
        contacto_cero:    'https://ssplan.shop/wp-content/uploads/2026/11/avatar-50.webp',
        con_otro:         'https://ssplan.shop/wp-content/uploads/2026/11/avatar-55.webp',
        bloqueo:          'https://ssplan.shop/wp-content/uploads/2026/11/avatar-45.webp',
        canal_abierto:    'https://ssplan.shop/wp-content/uploads/2026/11/avatar-40.webp',
        ruptura_reciente: 'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp',
        mismo_techo:      'https://ssplan.shop/wp-content/uploads/2026/11/avatar-50.webp'
    };

    // Etapa 3A (19/11): escassez, bônus do caso primeiro, prova perto do preço, FAQ do caso primeiro
    const probabilidad = getProbabilidad(quizData);
    const cuposSophia = Math.max(3, Math.round((spotsLeft || 50) / 4));
    const bonos = [
        { k: 'otro', n: 'Protocolo La Pérdida: si ya está con otro (o te dijo que los quiere a los dos)', v: 47 },
        { k: 'senales', n: 'Mapa de señales: cómo saber que está volviendo (y no arruinarlo)', v: 47 },
        { k: 'circulo', n: 'Círculo privado de hombres en tu misma situación', v: 67 },
        { k: 'reset', n: 'Reset del Ancla: cómo dejar de rogar y volver a ser el hombre que ella eligió', v: 37 },
        { k: 'deco', n: 'Decodificador: las 12 frases que ella dice y lo que de verdad significan', v: 37 },
        { k: 'techo', n: 'Protocolo Mismo Techo: si la sigues viendo (casa, hijos o trabajo)', v: 97 },
    ];
    const casoKey = casoConOtro ? 'otro' : scenario === 'mismo_techo' ? 'techo' : 'senales';
    const bonosOrdenados = [...bonos.filter(b => b.k === casoKey), ...bonos.filter(b => b.k !== casoKey)];
    // Prints da oferta = WhatsApp escuro, diferentes dos do diagnóstico (Carolina / Mónica / Verónica)
    const printPrecio = casoConOtro ? '/img/oferta-otro.jpg' : scenario === 'mismo_techo' ? '/img/oferta-casa.jpg' : '/img/oferta-senales.jpg';
    const faqPrimero =
        scenario === 'bloqueo' && !casoConOtro ? 'rafael'
        : casoConOtro ? 'tiago'
        : scenario === 'mismo_techo' ? (quizData.currentSituation === 'SÓLO TEMAS NECESARIOS' ? 'daniel' : 'jorge')
        : quizData.timeSeparation === 'MÁS DE 6 MESES' ? 'marcos'
        : scenario === 'ruptura_reciente' ? 'silvio'
        : '';

    // Etapa 2 (19/11): textos certos para SÓLO TEMAS (sem morar junto), "no hice nada", quem mora junto e bloqueado
    const soloTemas = quizData.currentSituation === 'SÓLO TEMAS NECESARIOS';
    const noHizoNada = (quizData.impulso || '').startsWith('NO HICE');
    const testimonio: { texto: string; autor: string } =
        (scenario === 'ruptura_reciente' && noHizoNada)
            ? { texto: 'No hice nada por semanas, esperando que volviera sola. Cuando empecé el plan, a los pocos días me escribió para saber cómo estaba.', autor: 'Diego F.' }
        : (scenario === 'mismo_techo' && soloTemas)
            ? scenarioContent.testimonio_caso.canal_abierto
        : scenarioContent.testimonio_caso[scenario];
    const testimonioAvatar = (scenario === 'mismo_techo' && soloTemas)
        ? testimonialAvatarByScenario.canal_abierto
        : testimonialAvatarByScenario[scenario];
    const ctaFinal = (scenario === 'ruptura_reciente' && noHizoNada)
        ? 'Quiero mi plan antes de dar el primer paso'
        : scenarioContent.cta_final[scenario];
    const camino1 = vivenJuntos
        ? 'Otra noche bajo el mismo techo sin mirarse. Otra conversación solo de cuentas y horarios. Y ver cómo se acostumbra a tenerte cerca sin sentirte cerca.'
        : soloTemas
        ? 'Otra conversación solo de lo necesario, fría y corta. Otra vez que ella se despide sin sentir nada. Y mirar desde afuera cómo se aleja, tal vez hacia otro.'
        : scenario === 'bloqueo'
        ? 'Revisar a cada rato si ya te desbloqueó. Buscar sus historias desde otra cuenta. Y mirar desde afuera cómo se aleja, tal vez hacia otro.'
        : 'Un mensaje más que va a quedar en visto. Otro intento de contacto cero que la acostumbra a vivir sin ti. Y mirar desde afuera cómo se aleja, tal vez hacia otro.';
    const mostrarPablo = !['bloqueo', 'contacto_cero', 'con_otro'].includes(scenario);

    return (
        <>
            {/* Transição pré-oferta */}
            <div 
                ref={preOfferRef}
                className="pre-offer-transition-section fade-in of4-root"
                style={{
                    marginBottom: 'clamp(24px, 5vw, 32px)',
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 179, 8, 0.15))',
                    border: '3px solid rgba(249, 115, 22, 0.6)',
                    borderRadius: '16px',
                    padding: 'clamp(24px, 5vw, 32px)',
                    boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
                    textAlign: 'left'
                }}
            >
                <p className="of4-kicker">🎯 Paso 4 de 4</p>
                <h3 className="of4-title">Llegaste al <span>último paso</span></h3>

                <div className="of4-escenario">
                    <p className="of4-label">📍 Tu escenario</p>
                    <p className="of4-p">
                        {(scenario === 'mismo_techo' && vivenJuntos
                            ? 'Tu diagnóstico apuntó a un escenario concreto: viven bajo el mismo techo, pero distantes.'
                            : scenarioContent.escenario_diagnostico[scenario]
                        ).replace('Tu diagnóstico apuntó a un escenario concreto: ', '').replace(/^./, c => c.toUpperCase())}
                    </p>
                </div>

                {miedoEco && <p className="of4-quote">{miedoEco}</p>}

                <div className="of4-rows">
                    <div className="of4-row"><span>✅</span><span>Ya sabes por qué se alejó: <b>el cariño sigue ahí, las ganas se apagaron.</b></span></div>
                    <div className="of4-row"><span>✅</span><span>Ya sabes tu disparador clave: <b className="of4-yellow">{disparadorClave.nombre}</b></span></div>
                    <div className="of4-row"><span>✅</span><span>Tu probabilidad hoy: <b className="of4-yellow">{probabilidad}%</b> · con tu disparador activado: <b>hasta 87%</b>.</span></div>
                    <div className="of4-row"><span>✅</span><span>Ya viste cómo cambia su cerebro en la Ventana de 72 horas.</span></div>
                </div>

                <p className="of4-p" style={{ marginBottom: 4 }}>Ahora falta lo más importante:</p>
                <p className="of4-green-lead">saber exactamente qué hacer en cada fase para volver a encender sus ganas, en tu caso.</p>
            </div>

            {/* ========================================== */}
            {/* FASE 4: OFERTA - COM TODAS AS 11 MELHORIAS */}
            {/* ========================================== */}
            <div ref={offerRef} className="revelation fade-in offer-section-custom of4-root">
                
                {/* ✅ MELHORIA #2: Timer de 10 minutos no topo da oferta */}
                <div className="offer-urgency-timer" style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.15))',
                    border: '3px solid rgba(234, 179, 8, 0.5)',
                    borderRadius: '16px',
                    padding: 'clamp(16px, 4vw, 20px)',
                    marginBottom: 'clamp(20px, 4vw, 24px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>⏰</span>
                    <div>
                        <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.8)', margin: '0 0 4px 0' }}>
                            {offerTimerStage === 2
                                ? <><strong style={{ color: '#facc15' }}>⚠️ Tu tiempo terminó</strong>, pero tu precio se mantiene mientras no cierres esta página.</>
                                : offerTimerStage === 1
                                ? <><strong style={{ color: '#facc15' }}>⏳ Sophia te dio 5 minutos más.</strong> Tu precio y tu lugar siguen reservados por:</>
                                : 'Tu precio y tu lugar con Sophia están reservados por:'}
                        </p>
                        {offerTimerStage < 2 && (
                        <p style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>
                            {formatTime(offerTimeLeft)}
                        </p>
                        )}
                        <p style={{ fontSize: 'clamp(0.8rem, 3.2vw, 0.9rem)', color: 'rgba(255,255,255,0.8)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                            Este precio es solo para quienes terminan el diagnóstico hoy. Si sales de esta página, no se guarda.
                        </p>
                    </div>
                </div>

                {/* Etapa 2 (19/11): fotos triste/feliz removidas (homem ~25 anos, fora do público; encurta a página) */}

{/* ✅ MELHORIA #4: Estatísticas de prova social */}
<div style={{
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
    border: '2px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    padding: 'clamp(20px, 4vw, 28px)',
    marginBottom: 'clamp(24px, 5vw, 32px)'
}}>
    <h3 style={{
        fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)',
        color: '#10b981',
        fontWeight: '900',
        marginBottom: 'clamp(16px, 3vw, 20px)',
        textAlign: 'center',
        lineHeight: '1.3'
    }}>
        Tu plan ya está listo según lo que respondiste
    </h3>

    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'clamp(10px, 2.5vw, 16px)'
    }}>
        {[
            { t: 'HOY', d: 'Empiezas hoy · tú estás aquí', n: '' },
            { t: '24h', d: 'La Curiosidad: el Ancla del Dolor se suelta', n: 'La Curiosidad' },
            { t: '48h', d: 'La Nostalgia: el cariño le gana a las peleas (oxitocina)', n: 'La Nostalgia' },
            { t: '72h', d: 'La Pérdida: se encienden las ganas (dopamina)', n: 'La Pérdida' }
        ].map(step => (
            <div key={step.t} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
                <p style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0, minWidth: '64px' }}>
                    {step.t}
                </p>
                <p style={{ fontSize: 'clamp(0.95rem, 4vw, 1.05rem)', color: 'rgba(255,255,255,0.88)', fontWeight: '600', margin: 0, lineHeight: '1.4', textAlign: 'left' }}>
                    {step.d}
                    {step.n === disparadorClave.nombre && (
                        <span style={{ display: 'block', color: '#facc15', fontWeight: '800', marginTop: '2px' }}>⭐ tu disparador clave</span>
                    )}
                </p>
            </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0, minWidth: '64px' }}>
                7-21
            </p>
            <p style={{ fontSize: 'clamp(0.95rem, 4vw, 1.05rem)', color: 'rgba(255,255,255,0.88)', fontWeight: '600', margin: 0, lineHeight: '1.4', textAlign: 'left' }}>
                Días · ella te escribe, te llama o busca una excusa para verte
            </p>
        </div>
    </div>
</div>

                {/* Título principal */}
                <h2 style={{
                    fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
                    color: 'white',
                    fontWeight: '900',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    marginBottom: 'clamp(12px, 3vw, 16px)'
                }}>
                    Tu plan de 72 horas para que {gender === 'HOMBRE' ? 'ella empiece a buscarte' : 'él empiece a buscarte'}, sin rogar ni perseguirla
                </h2>

                <p style={{
                    fontSize: 'clamp(1.05rem, 4.2vw, 1.25rem)',
                    color: '#facc15',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    marginBottom: 'clamp(8px, 2vw, 10px)',
                    fontWeight: '800'
                }}>
                    Tu disparador clave: {disparadorClave.nombre}
                </p>

                <p style={{
                    fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)',
                    color: '#4ade80',
                    textAlign: 'center',
                    lineHeight: '1.5',
                    marginBottom: 'clamp(12px, 3vw, 16px)',
                    fontWeight: '600'
                }}>
                    {scenarioContent.linea_caso[scenario]}
                </p>

                <p style={{
                    fontSize: 'clamp(1.05rem, 4vw, 1.25rem)',
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: 'center',
                    marginBottom: 'clamp(24px, 5vw, 32px)',
                    fontStyle: 'italic'
                }}>
                    Con el Protocolo de la Obsesión Inversa. Unos 10 minutos al día, desde tu celular. Garantía de 90 días: si ella no te busca ni cambia contigo, te devuelvo tu dinero.
                </p>

                {/* Justificativa da pré-seleção do plano por cenário */}
 <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(12px, 3vw, 16px)',
    marginBottom: 'clamp(20px, 4vw, 28px)'
}}>
    <img
        src={testimonialImgByScenario[scenario]}
        alt="Así le fue a alguien con tu mismo caso"
        loading="lazy"
        style={{
            width: '100%',
            maxWidth: '340px',
            borderRadius: '16px',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            display: 'block'
        }}
    />
    <p style={{
        fontSize: 'clamp(0.85rem, 3.2vw, 1rem)',
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '600',
        margin: 0,
        textAlign: 'center'
    }}>
        Así le fue a alguien con tu mismo caso
    </p>
    <div style={{
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.1))',
        border: '2px solid rgba(234, 179, 8, 0.4)',
        borderRadius: '14px',
        padding: 'clamp(16px, 4vw, 20px)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        width: '100%'
    }}>
        <span style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', flexShrink: 0 }}>👉</span>
        <p style={{
            fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)',
            color: 'white',
            lineHeight: '1.55',
            margin: 0,
            fontWeight: '600'
        }}>
            {bloqueoConOtro
                ? 'Para tu caso te recomiendo el Plan Completo: incluye el Protocolo La Pérdida (si ya está con otro), y te muestra el primer paso correcto para no cerrar más la puerta mientras te tiene bloqueado.'
                : scenarioContent.recomendacion_plan[scenario]}
        </p>
    </div>
</div>

{/* Mecanismo v2 (19/11/2026): âncora "¿Cuánto ya gastaste?" (modelo Mariana Vabo) */}
<div style={{ background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: 'clamp(16px, 4vw, 22px)', marginBottom: 'clamp(20px, 4vw, 28px)' }}>
    <h3 style={{ fontSize: 'clamp(1.15rem, 4.8vw, 1.45rem)', color: 'white', fontWeight: 900, textAlign: 'center', margin: '0 0 12px' }}>
        ¿Cuánto ya gastaste tratando de recuperarla?
    </h3>
    <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.08rem)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, margin: '0 0 12px' }}>
        Las flores que ni contestó. La cena que pagaste pensando que lo arreglaba. El regalo que te devolvió. Las noches sin dormir, las horas mirando el celular.
    </p>
    <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.08rem)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, margin: '0 0 12px' }}>
        Una consulta privada con Sophia cuesta <strong style={{ color: 'white' }}>USD 297</strong>, y tiene lista de espera.
    </p>
    <p style={{ fontSize: 'clamp(1.05rem, 4.2vw, 1.2rem)', color: '#4ade80', fontWeight: 800, lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
        Hoy tienes el plan completo de tu caso por $27. Menos que una cena para dos.
    </p>
</div>

{/* Etapa 3A (19/11): prova colada ao preço — print do caso dele */}
<div style={{ textAlign: 'center', margin: '0 0 clamp(20px, 4vw, 28px)' }}>
    <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#facc15', fontWeight: 700, margin: '0 0 10px' }}>Así le escribió ella a un hombre en tu misma situación</p>
    <img src={printPrecio} alt="Mensaje de WhatsApp de ella" loading="lazy" style={{ display: 'block', margin: '0 auto', width: '78%', maxWidth: '280px', borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.45)' }} />
</div>

{/* ✅ MELHORIA #5: 2 Planos lado a lado ($14 / $27) */}
<div ref={plansRef} style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'clamp(20px, 4vw, 24px)',
    marginBottom: 'clamp(32px, 6vw, 40px)'
}}>
    {/* PLANO 1: ESSENCIAL - $14 */}
    <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1))',
        border: selectedPlan === 14 ? '3px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: 'clamp(20px, 5vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: selectedPlan === 14 ? 'scale(1.02)' : 'scale(1)'
    }}>
        <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
            <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#3b82f6', fontWeight: '900', margin: '0 0 8px 0' }}>
                Plan Esencial
            </h3>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                El método general, sin lo de tu caso
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                USD 147
            </p>
            <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#3b82f6', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>
                $14
            </p>
            <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Acceso inmediato en tu celular
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: '#60a5fa', fontWeight: '700', margin: '6px 0 0 0' }}>
                ✅ Pago único, sin mensualidades
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Fase 1 · La Curiosidad: lo que ella tiene que notar en ti en las primeras 24 horas</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Fase 2 · La Nostalgia: cómo hacer que recuerde lo bueno, sin presionarla</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Fase 3 · La Pérdida: cuándo y cómo reaparecer</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Qué NO hacer en cada fase (los errores que la alejan)</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Soporte por email</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Garantía de 90 días</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: '#fca5a5', fontWeight: '700', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '8px 10px' }}>
                    ❌ Lo que tu caso necesita: {casoItemTexto} (solo en el Plan Completo)
                </div>
                {itensFaltantes.filter(item => item !== casoItemFaltante).map(item => (
                    <div key={item} style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ {item}</div>
                ))}
            </div>
        </div>
        <button 
            onClick={() => setSelectedPlan(14)}
            style={{
                background: selectedPlan === 14 ? '#3b82f6' : 'transparent',
                color: 'white',
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                fontWeight: '900',
                padding: 'clamp(16px, 4vw, 20px)',
                borderRadius: '12px',
                border: '3px solid #60a5fa',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease'
            }}
        >
            {selectedPlan === 14 ? '✅ PLAN SELECCIONADO' : 'ELEGIR PLAN ESENCIAL'}
        </button>
    </div>
    {/* PLANO 2: TOTAL (RECOMENDADO) - $27 */}
    <div ref={completoRef} style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
        border: selectedPlan === 27 ? '4px solid #10b981' : '3px solid rgba(16, 185, 129, 0.5)',
        borderRadius: '16px',
        padding: 'clamp(20px, 5vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: selectedPlan === 27 ? 'scale(1.05)' : 'scale(1.02)',
        boxShadow: '0 12px 48px rgba(16, 185, 129, 0.4)',
        transition: 'all 0.3s ease'
    }}>
        <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #eab308, #f59e0b)',
            color: 'black',
            fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
            fontWeight: '900',
            padding: '6px 16px',
            borderRadius: '20px',
            whiteSpace: 'nowrap'
        }}>
            ⭐ RECOMENDADO PARA TU CASO
        </div>
        <div style={{ marginBottom: 'clamp(14px, 3.5vw, 18px)' }}>
            <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>
                Plan Completo
            </h3>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                {subtituloCompleto}
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                USD 379
            </p>
            <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#10b981', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>
                $27
            </p>
            <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>
                Menos que una cena para dos
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: '#4ade80', fontWeight: '700', margin: '6px 0 0 0' }}>
                ✅ Pago único, sin mensualidades
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* ✅ MELHORIA #8: Ancoragem de valor (limpa, sem ruído) */}
                <div style={{
                    background: 'rgba(234, 179, 8, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'center',
                    marginBottom: '4px'
                }}>
                    <span style={{ fontSize: 'clamp(0.9rem, 3.4vw, 1.05rem)', color: '#facc15', fontWeight: '800' }}>
                        🎁 +7 bonos incluidos de regalo
                    </span>
                </div>
                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: 'white', fontWeight: '700' }}>✅ Todo del Plan Esencial +</div>
                {bonosOrdenados.map(b => (
                    b.k === casoKey ? (
                        <div key={b.k} style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.45)', borderRadius: '8px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.06em', color: '#facc15', marginBottom: '4px' }}>⭐ LO QUE TU CASO NECESITA</div>
                            <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white', fontWeight: 700 }}>{b.n} <span style={{ color: '#facc15', fontWeight: '700' }}>· De ${b.v} a GRATIS</span></div>
                        </div>
                    ) : (
                        <div key={b.k} style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>{b.n} <span style={{ color: '#facc15', fontWeight: '700' }}>· De ${b.v} a GRATIS</span></div>
                    )
                ))}
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-label="WhatsApp" style={{ flexShrink: 0 }}>
                        <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/>
                        <path fill="#fff" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
                    </svg>
                    <span>Sophia te escribe personalmente para conocer tu caso<br/><span style={{ color: '#facc15', fontWeight: 800 }}>Solo 20 hombres por día: hoy quedan {cuposSophia}</span></span>
                </div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.7)' }}>Garantía de 90 días</div>
                <div style={{ fontSize: 'clamp(0.85rem, 3.3vw, 0.95rem)', color: 'rgba(255,255,255,0.6)' }}>Actualizaciones de por vida <span style={{ color: '#facc15', fontWeight: '700' }}>· De $47 a GRATIS</span></div>
            </div>
        </div>
        <button 
            onClick={() => setSelectedPlan(27)}
            style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                fontWeight: '900',
                padding: 'clamp(16px, 4vw, 20px)',
                borderRadius: '12px',
                border: '3px solid #4ade80',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease',
                animation: selectedPlan !== 27 ? 'pulse 1.5s infinite' : 'none'
            }}
        >
            {selectedPlan === 27 ? '✅ PLAN SELECCIONADO' : '🚀 ELEGIR PLAN COMPLETO (RECOMENDADO)'}
        </button>
    </div>
</div>
<p style={{ textAlign: 'center', fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)', color: 'rgba(255,255,255,0.85)', fontWeight: 700, margin: '0 0 14px' }}>👥 Más de 9.000 hombres ya siguieron su plan</p>
{/* ✅ CTA PRINCIPAL - POSIÇÃO OTIMIZADA (logo após os planos) */}
<button
    ref={mainCtaRef}
    className="cta-button btn-green btn-size-4 btn-animation-pulse"
    onClick={onCTAClick}
    style={{
        width: '100%',
        background: selectedPlan ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100,100,100,0.5)',
        color: 'white',
        fontWeight: '900',
        padding: 'clamp(20px, 4vw, 26px)',
        borderRadius: '16px',
        border: selectedPlan ? '4px solid #4ade80' : '4px solid rgba(150,150,150,0.5)',
        cursor: selectedPlan ? 'pointer' : 'not-allowed',
        boxShadow: selectedPlan ? '0 8px 32px rgba(16, 185, 129, 0.6)' : 'none',
        animation: selectedPlan ? 'pulse 1.5s infinite' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(6px, 1.5vw, 8px)',
        marginBottom: 'clamp(16px, 3vw, 24px)',
        transition: 'all 0.3s ease'
    }}
>
    <span style={{
        fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
        lineHeight: '1.3'
    }}>
        {selectedPlan 
            ? `🚀 ${ctaFinal} ($${selectedPlan})` 
            : '👆 ELIGE UN PLAN ARRIBA PRIMERO'
        }
    </span>
    <span style={{
        fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600'
    }}>
        🛡️ Garantía de 90 días · Riesgo cero
    </span>
</button>

                {/* ✅ MELHORIA #6: 2 Depoimentos (Mateo + Pablo) */}
                <div style={{
                    marginTop: 'clamp(20px, 4vw, 32px)',
                    marginBottom: 'clamp(20px, 4vw, 32px)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)',
                        color: 'white',
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: 'clamp(16px, 3vw, 24px)'
                    }}>
                        Lo que cuentan los hombres que ya pasaron por esto
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(12px, 3vw, 16px)'
                    }}>
                        
                        {/* DEPOIMENTO 1: Mateo R. - Argentina */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
                            border: '2px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(14px, 3.5vw, 20px)',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            gap: 'clamp(12px, 3vw, 16px)',
                            alignItems: 'flex-start',
                            flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}>
                            {/* Avatar por cenário — vem da lookup testimonialAvatarByScenario */}
                            <img 
                                src={testimonioAvatar} 
                                alt={testimonio.autor} 
                                style={{
                                    width: 'clamp(55px, 14vw, 70px)',
                                    height: 'clamp(55px, 14vw, 70px)',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid rgba(16, 185, 129, 0.6)',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: 'clamp(6px, 1.5vw, 10px)',
                                    flexWrap: 'wrap'
                                }}>
                                    <strong style={{
                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                                        color: '#10b981'
                                    }}>
                                        {testimonio.autor}
                                    </strong>
                                    <span style={{
                                        fontSize: 'clamp(0.7rem, 2.8vw, 0.8rem)',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>
                                         • 4 días atrás
                                    </span>
                                </div>
                                <div style={{
                                    color: '#facc15',
                                    fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                                    marginBottom: 'clamp(6px, 1.5vw, 8px)'
                                }}>
                                    ⭐⭐⭐⭐⭐
                                </div>
                                <p style={{
                                    fontSize: 'clamp(0.85rem, 3.2vw, 1rem)',
                                    lineHeight: '1.5',
                                    color: 'white',
                                    margin: 0,
                                    fontStyle: 'italic'
                                }}>
                                    {`"${testimonio.texto}"`}
                                </p>
                            </div>
                        </div>

                        {/* Etapa 2 (19/11): Pablo ("me dice que me quede") só para quem ainda tem contato com ela */}
                        {mostrarPablo && (<>
                        {/* DEPOIMENTO 2: Pablo S. - España (CURTO) */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
                            border: '2px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(12px, 3vw, 16px)',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            gap: 'clamp(12px, 3vw, 16px)',
                            alignItems: 'flex-start',
                            flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}>
                            {/* Avatar Pablo - COLE O LINK DA FOTO NO src="" */}
                            <img 
                                src="https://ssplan.shop/wp-content/uploads/2026/10/pablo.webp" 
                                alt="Pablo S." 
                                style={{
                                    width: 'clamp(55px, 14vw, 70px)',
                                    height: 'clamp(55px, 14vw, 70px)',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid rgba(16, 185, 129, 0.6)',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: 'clamp(6px, 1.5vw, 10px)',
                                    flexWrap: 'wrap'
                                }}>
                                    <strong style={{
                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                                        color: '#10b981'
                                    }}>
                                        Pablo S.
                                    </strong>
                                    <span style={{
                                        fontSize: 'clamp(0.7rem, 2.8vw, 0.8rem)',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>
                                        
                                    </span>
                                </div>
                                <div style={{
                                    color: '#facc15',
                                    fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                                    marginBottom: 'clamp(6px, 1.5vw, 8px)'
                                }}>
                                    ⭐⭐⭐⭐⭐
                                </div>
                                <p style={{
                                    fontSize: 'clamp(0.85rem, 3.2vw, 1rem)',
                                    lineHeight: '1.5',
                                    color: 'white',
                                    margin: 0,
                                    fontStyle: 'italic',
                                    fontWeight: '700'
                                }}>
                                    "Le tendí la mano y no me la quiso soltar. Hasta ella me dice que me quede."
                                </p>
                            </div>
                        </div>
                        </>)}
                        
                    </div>
                </div>

                {/* ✅ MELHORIA #7: Seção de 3 benefícios/transformações */}
                <div style={{
                    marginTop: 'clamp(20px, 4vw, 32px)',
                    marginBottom: 'clamp(20px, 4vw, 32px)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)',
                        color: 'white',
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: 'clamp(16px, 3vw, 24px)'
                    }}>
                        Lo que vas a saber hacer con tu plan
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(12px, 3vw, 16px)'
                    }}>
                        
                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: '4px solid #10b981',
                            borderRadius: '8px',
                            padding: 'clamp(12px, 3vw, 16px)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>⏰</span>
                            <p style={{
                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                color: 'white',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                <strong style={{ color: '#4ade80' }}>Cuándo hablarle y cuándo esperar</strong>: qué hacer cuando te deja en visto, cuando te responde frío y cuando por fin te escribe.
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: '4px solid #10b981',
                            borderRadius: '8px',
                            padding: 'clamp(12px, 3vw, 16px)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>❤️</span>
                            <p style={{
                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                color: 'white',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                <strong style={{ color: '#4ade80' }}>Que la obsesión pase de ti a ella</strong>: volver a encender sus ganas (su dopamina) con los 3 disparadores en el orden correcto, sin rogar ni perseguirla.
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: '4px solid #eab308',
                            borderRadius: '8px',
                            padding: 'clamp(12px, 3vw, 16px)',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>💪</span>
                            <p style={{
                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                color: 'white',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                <strong style={{ color: '#facc15' }}>Qué significa de verdad</strong> cuando te dice "necesito tiempo" o "te quiero, pero no lo suficiente", y qué no hacer en ese momento.
                            </p>
                        </div>
                        
                    </div>
                </div>

                {/* CTA secundário removido - já está após os planos */}

                {/* ✅ MELHORIA #9: Garantia compactada */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(16, 185, 129, 0.1))',
                    border: '3px solid rgba(74, 222, 128, 0.4)',
                    borderRadius: '16px',
                    padding: 'clamp(16px, 4vw, 24px)',
                    margin: '0 0 clamp(20px, 4vw, 32px) 0',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(74, 222, 128, 0.3)'
                }}>
                    <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', marginBottom: 'clamp(10px, 2.5vw, 14px)' }}>
                        🛡️
                    </div>
                    <h3 style={{
                        fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                        color: '#4ade80',
                        marginBottom: 'clamp(12px, 3vw, 16px)',
                        fontWeight: '900'
                    }}>
                        Garantía de 90 días: el riesgo es todo mío
                    </h3>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                        lineHeight: '1.6',
                        color: 'white',
                        marginBottom: 'clamp(10px, 2.5vw, 12px)',
                        textAlign: 'left'
                    }}>
                        Las 3 fases empiezan en 72 horas, pero el cerebro de ella no cambia de un día para otro: primero vuelve la curiosidad, después el cariño y al final las ganas. Por eso no te doy 7 días. Te doy 90.
                    </p>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                        lineHeight: '1.6',
                        color: 'white',
                        marginBottom: 'clamp(10px, 2.5vw, 12px)',
                        textAlign: 'left'
                    }}>
                        Aplica tu plan. Si en 90 días ella no te escribe, no te busca y no cambia contigo, <strong style={{ color: '#4ade80' }}>te devuelvo cada centavo.</strong>
                    </p>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                        lineHeight: '1.6',
                        color: '#facc15',
                        fontWeight: 700,
                        marginBottom: 'clamp(12px, 3vw, 16px)'
                    }}>
                        Solo hay dos caminos: o ella vuelve a buscarte, o recuperas tu dinero. En los dos, ganas tú.
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'clamp(8px, 2vw, 12px)',
                        textAlign: 'left'
                    }}>
                        <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                            ✅ Sin preguntas incómodas
                        </p>
                        <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                            ✅ Sin burocracia
                        </p>
                        <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                            ✅ Reembolso en 24-48 horas
                        </p>
                        <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: '#facc15', margin: 0, fontWeight: '700' }}>
                            ✅ Riesgo cero para ti
                        </p>
                    </div>
                </div>

                {/* ✅ MELHORIA #10: FAQ expandido (4 perguntas) */}
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: 'clamp(14px, 3.5vw, 20px)',
                    marginBottom: 'clamp(20px, 4vw, 32px)'
                }}>
                    <h3 style={{
                        fontSize: 'clamp(1.15rem, 4.5vw, 1.4rem)',
                        color: 'white',
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: 'clamp(14px, 3vw, 18px)'
                    }}>
                        Preguntas frecuentes
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(10px, 2.5vw, 14px)'
                    }}>
                        {/* Mecanismo v2: FAQ com nomes (Martín, Esteban, Marcos; ids internos rafael/silvio/tiago mantidos) */}
                        <details open={faqPrimero === 'rafael'} style={{ order: faqPrimero === 'rafael' ? -1 : 0,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Martín: "Me bloqueó en todo. ¿Funciona igual?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Funciona, Martín.</strong> El bloqueo es su lado racional defendiéndose. Tu plan no empieza con mensajes: ella nota el cambio por lo que ve de ti. Y te dice cuándo y cómo reaparecer cuando te desbloquee.
                            </p>
                        </details>
                        <details open={faqPrimero === 'silvio'} style={{ order: faqPrimero === 'silvio' ? -1 : 0,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Esteban: "Terminamos hace una semana. ¿Es muy pronto?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>Es el mejor momento, Esteban.</strong> Las primeras semanas son cuando más hombres hunden el Ancla del Dolor: ruegan, mandan textos largos, regalos. Quien empieza ahora, empieza antes de arruinarlo.
                            </p>
                        </details>
                        <details open={faqPrimero === 'marcos'} style={{ order: faqPrimero === 'marcos' ? -1 : 0,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Marcos: "Pasaron 8 meses. ¿Ya es tarde?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>No, Marcos.</strong> Lo que vivieron no se borra en unos meses. Lo que cambia es el primer paso, y tu plan te dice exactamente cuál es en tu caso.
                            </p>
                        </details>
                        {/* Pergunta 1 */}
                        <details open={faqPrimero === 'tiago'} style={{ order: faqPrimero === 'tiago' ? -1 : 0,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Santiago: "Ya está con otro. ¿Funciona igual?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí, Santiago.</strong> La mayoría de las veces esa relación es una anestesia para no sentir lo que dejó contigo. No vas a competir con él: tu disparador es La Pérdida, 
                                y el Protocolo La Pérdida (si ya está con otro) te dice qué hacer y qué no, para no empujarla más hacia él.
                            </p>
                        </details>

                        {/* Pergunta 2 */}
                        <details style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                ¿Cuánto tiempo lleva ver resultados?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>Tu Ventana de 72 horas empieza hoy.</strong> 
                                Muchos hombres ven la primera señal en esos 3 días. Para la mayoría, entre el día 7 y el 21 
                                ella ya te escribe, te mira distinto o te busca por algo.
                            </p>
                        </details>

                        {/* 19/11: FAQ própria para SÓLO TEMAS NECESARIOS (só aparece para eles, aberta e primeiro) */}
                        {faqPrimero === 'daniel' && (
                        <details open style={{ order: -1,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Daniel: "Solo hablamos de lo necesario (hijos, cuentas, trabajo). ¿Sirve?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí, Daniel.</strong> Es una de las mejores puertas: ya tienen un canal y ella no lo cerró. El Plan Completo incluye el Protocolo Mismo Techo: cómo comportarte en cada intercambio para que ella note el cambio sin que se lo digas.
                            </p>
                        </details>
                        )}

                        {/* Pergunta 3 (NOVA) */}
                        <details open={faqPrimero === 'jorge'} style={{ order: faqPrimero === 'jorge' ? -1 : 0,
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Jorge: "Todavía vivimos juntos y tenemos hijos. ¿Sirve?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí, Jorge.</strong> Es de los casos más comunes. El Plan Completo incluye el Protocolo Mismo Techo, solo para cuando la ves todos los días y no puedes desaparecer.
                            </p>
                        </details>

                        {/* Pergunta 4 (NOVA) */}
                        <details style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                ¿Tengo que hacer contacto cero?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>No.</strong> El contacto cero es desaparecer y esperar a que ella decida, y así se acostumbra a vivir sin ti. En tu plan, el silencio tiene un objetivo y una fecha: sabes qué tiene que notar en ti, cuándo reaparecer y qué no hacer nunca.</p>
                        </details>

                        {/* Pergunta 5 (TESTE 3) */}
                        <details style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                Andrés: "Ya probé de todo y otros cursos. ¿Por qué esto sería distinto?"
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>Porque todo lo que probaste le habló a su lado racional</strong>: cartas, disculpas, contacto cero. Este plan le habla al lado que decide de quién se enamora. Y no está pensado para chicos de 20 años: parte de tu caso, de lo que respondiste y de en qué punto están hoy.
                            </p>
                        </details>
                        <details style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                ¿Cuánto tiempo al día me lleva?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>Unos 10 minutos.</strong> Tu plan te dice qué hacer hoy y qué no hacer. No tienes que escribirle textos largos ni estudiar horas.
                            </p>
                        </details>
                        <details style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            borderLeft: '4px solid #eab308',
                            padding: 'clamp(14px, 3.5vw, 16px)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <summary style={{
                                fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                cursor: 'pointer',
                                listStyle: 'none'
                            }}>
                                ¿Ella se va a enterar?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>No.</strong> Tu plan se abre en tu celular, con tu acceso. Ella solo ve el cambio en ti.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Mecanismo v2: fechamento "Tienes dos caminos" (modelo Julio/Vabo) */}
                <div style={{ background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: 'clamp(16px, 4vw, 22px)', marginBottom: 'clamp(16px, 4vw, 22px)' }}>
                    <h3 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', color: 'white', fontWeight: 900, textAlign: 'center', margin: '0 0 14px' }}>Tienes dos caminos</h3>
                    <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.08rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 12px' }}>
                        <strong style={{ color: '#f87171' }}>Camino 1:</strong> cerrar esta página y seguir igual. {camino1}
                    </p>
                    <p style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.08rem)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.6, margin: '0 0 12px' }}>
                        <strong style={{ color: '#4ade80' }}>Camino 2:</strong> empezar hoy tu Ventana de 72 horas, con tu disparador, en el orden correcto. Sin rogar. Sin perseguirla. Y con 90 días para comprobarlo.
                    </p>
                    <p style={{ fontSize: 'clamp(0.9rem, 3.6vw, 1rem)', color: '#facc15', fontWeight: 700, textAlign: 'center', margin: 0 }}>
                        Tu precio especial es solo para hoy, mientras estés en esta página.
                    </p>
                </div>

                {/* CTA final secundário */}
                <button
                    ref={finalCtaRef}
                    className="cta-button btn-green btn-size-4 btn-animation-pulse"
                    onClick={onCTAClick}
                    style={{
                        width: '100%',
                        background: selectedPlan ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100,100,100,0.5)',
                        color: 'white',
                        fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                        fontWeight: '900',
                        padding: 'clamp(20px, 4.5vw, 28px)',
                        borderRadius: '16px',
                        border: selectedPlan ? '4px solid #4ade80' : '4px solid rgba(150,150,150,0.5)',
                        cursor: selectedPlan ? 'pointer' : 'not-allowed',
                        lineHeight: '1.3',
                        marginBottom: 'clamp(20px, 4vw, 24px)'
                    }}
                >
                    {selectedPlan 
                        ? `✅ ${ctaFinal} ($${selectedPlan}) →` 
                        : '👆 ELIGE UN PLAN ARRIBA PRIMERO'
                    }
                </button>

                {/* Grid de urgência final */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'clamp(12px, 3vw, 16px)',
                    marginBottom: 'clamp(20px, 4vw, 24px)'
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: 'clamp(12px, 3vw, 14px)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        border: '2px solid rgba(234, 179, 8, 0.3)'
                    }}>
                        <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px 0' }}>
                            {offerTimerStage === 2 ? '⚠️ Tu tiempo terminó' : offerTimerStage === 1 ? '⏳ 5 minutos más:' : '⏰ Expira en:'}
                        </p>
                        <p style={{ fontSize: offerTimerStage === 2 ? 'clamp(0.85rem, 3.4vw, 1rem)' : 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>
                            {offerTimerStage === 2 ? 'Precio activo mientras no cierres' : formatTime(offerTimeLeft)}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: 'clamp(12px, 3vw, 14px)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        border: '2px solid rgba(234, 179, 8, 0.3)'
                    }}>
                        <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px 0' }}>
                            🛡️ Garantía:
                        </p>
                        <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#4ade80', fontWeight: '900', margin: 0 }}>
                            90 días
                        </p>
                    </div>
                </div>

                {/* Rodapé de prova social */}
                <div style={{
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '2px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '10px',
                    padding: 'clamp(14px, 3.5vw, 16px)',
                    textAlign: 'center',
                    marginBottom: 'clamp(16px, 4vw, 20px)'
                }}>
                    <p style={{
                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                        color: '#4ade80',
                        fontWeight: '700',
                        margin: 0
                    }}>
                        Más de 9.000 hombres acompañados<br/>
                        <span style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', opacity: 0.8 }}>
                            ✨ {peopleBuying} {peopleBuying === 1 ? 'persona' : 'personas'} comprando ahora
                        </span>
                    </p>
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                    lineHeight: '1.6',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontStyle: 'italic',
                    margin: 0
                }}>
                    🔒 Compra 100% segura • Acceso instantáneo • Garantía de 90 días
                </p>

                <style>{`
                    .of4-root, .of4-root * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                    .of4-kicker { text-align: center; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #fb923c; margin: 0 0 6px; }
                    .of4-title { text-align: center; font-size: clamp(1.6rem, 7vw, 2.1rem); font-weight: 900; color: #fff; line-height: 1.15; margin: 0 0 20px !important; }
                    .of4-title span { color: #f97316; }
                    .of4-p { font-size: clamp(1rem, 4.3vw, 1.12rem); line-height: 1.6; color: rgba(255,255,255,0.92); margin: 0 0 14px; }
                    .of4-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #facc15; margin: 0 0 6px; }
                    .of4-escenario { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 14px 16px; margin: 0 0 16px; }
                    .of4-escenario .of4-p { margin: 0; color: #fff; font-weight: 600; }
                    .of4-quote { font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.55; font-style: italic; color: rgba(255,255,255,0.78); border-left: 3px solid rgba(255,255,255,0.3); padding: 2px 0 2px 14px; margin: 0 0 16px; }
                    .of4-rows { display: flex; flex-direction: column; gap: 8px; margin: 0 0 18px; }
                    .of4-row { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; font-size: clamp(0.95rem, 4vw, 1.05rem); line-height: 1.45; color: rgba(255,255,255,0.92); }
                    .of4-row b { color: #fff; }
                    .of4-root .of4-yellow { color: #facc15; }
                    .of4-root details > summary { line-height: 1.4; }
                    .of4-green-lead { font-size: clamp(1.15rem, 4.8vw, 1.3rem); line-height: 1.45; font-weight: 800; color: #4ade80; margin: 0; }
                `}</style>

            </div>

            {/* Bloco 1 (19/11): botão fixo no rodapé até o lead ver os planos */}
            <div
                aria-hidden={!showSticky}
                style={{
                    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
                    padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
                    background: 'rgba(10,10,10,0.92)', borderTop: '1px solid rgba(74,222,128,0.35)',
                    backdropFilter: 'blur(6px)',
                    transform: showSticky ? 'translateY(0)' : 'translateY(110%)',
                    transition: 'transform 0.25s ease',
                    pointerEvents: showSticky ? 'auto' : 'none'
                }}
            >
                <button
                    onClick={goToCompleto}
                    tabIndex={showSticky ? 0 : -1}
                    style={{
                        width: '100%', maxWidth: '520px', margin: '0 auto', display: 'block',
                        background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                        border: '2px solid #4ade80', borderRadius: '12px', padding: '12px 14px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
                        fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.25, cursor: 'pointer'
                    }}
                >
                    👆 Volver a mi Plan Completo · USD 27
                    <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, opacity: 0.95, marginTop: '2px' }}>
                        Recomendado para tu caso · Garantía de 90 días
                    </span>
                </button>
            </div>
        </>
    );
}
