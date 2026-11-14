import { RefObject } from 'react';
import { storage } from '../../utils/storage';
import { getDisparadorClave } from '../../utils/contentByGender';

interface PaginaOfertaProps {
    preOfferRef: RefObject<HTMLDivElement>;
    offerRef: RefObject<HTMLDivElement>;
    offerTimeLeft: number;
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
    peopleBuying,
    selectedPlan,
    setSelectedPlan,
    onCTAClick,
    formatTime
}: PaginaOfertaProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';

    // Detecta o cenário do lead com base no quizData (regra exata)
    const detectScenario = (): 'contacto_cero' | 'con_otro' | 'bloqueo' | 'canal_abierto' | 'ruptura_reciente' => {
        // PRIORIDAD 1: Bloqueo (barrera objetiva, no hay contacto posible)
        if (quizData.currentSituation === 'BLOQUEADO') return 'bloqueo';

        // PRIORIDAD 2: Ex-pareja con otra persona (información más fuerte del quiz)
        if (
            quizData.exSituation === 'RELACIÓN SERIA' ||
            quizData.exSituation === 'SALIENDO CASUAL' ||
            quizData.exSituation === 'VARIAS PERSONAS'
        ) return 'con_otro';

        // PRIORIDAD 3: Ruptura reciente REAL (≤ 4 semanas)
        if (
            quizData.timeSeparation === 'MENOS DE 1 SEMANA' ||
            quizData.timeSeparation === '1-4 SEMANAS'
        ) return 'ruptura_reciente';

        // PRIORIDAD 4: Canal abierto = vínculo activo
        if (
            quizData.currentSituation === 'SOMOS AMIGOS' ||
            quizData.currentSituation === 'HABLAMOS A VECES' ||
            quizData.currentSituation === 'ENCUENTROS ÍNTIMOS'
        ) return 'canal_abierto';

        // PRIORIDAD 5: Sin contacto o contacto frío
        if (
            quizData.currentSituation === 'CONTACTO CERO' ||
            quizData.currentSituation === 'ME IGNORA' ||
            quizData.currentSituation === 'SÓLO TEMAS NECESARIOS'
        ) return 'contacto_cero';

        // Fallback seguro: contacto cero (nunca contradice al lead)
        return 'contacto_cero';
    };

    const scenario = detectScenario();
    // TESTE 3: o mesmo disparador clave do diagnóstico aparece na oferta
    const disparadorClave = getDisparadorClave(quizData);

    // 5 variáveis × 4 cenários
    const scenarioContent = {
        escenario_diagnostico: {
            contacto_cero: 'Tu diagnóstico apuntó a un escenario concreto: contacto cero. El silencio no es el final. Pero cada día que pasa, el terreno cambia.',
            con_otro: 'Tu diagnóstico apuntó a un escenario concreto: ella está con otro. Duele. Pero el mapa aún puede leerse con claridad.',
            bloqueo: 'Tu diagnóstico apuntó a un escenario concreto: bloqueo. El primer paso no es insistir. Es entender si todavía existe una aproximación segura.',
            canal_abierto: 'Tu diagnóstico apuntó a un escenario concreto: canal abierto. Ella ya habla contigo. El problema no es llegar a ella, es cómo te ve cuando lo hace.',
            ruptura_reciente: 'Tu diagnóstico apuntó a un escenario concreto: ruptura reciente. El momento importa más que la intensidad.'
        },
        linea_caso: {
            contacto_cero: 'El silencio no es el final. Pero cada día que pasa, el terreno cambia.',
            con_otro: 'Ella está con otro. Pero el mapa aún puede leerse con claridad.',
            bloqueo: 'El bloqueo no significa que la puerta esté cerrada para siempre. Significa que el primer paso es otro.',
            canal_abierto: 'La amistad que quedó es una puerta abierta. Pero puerta abierta no siempre es entrada.',
            ruptura_reciente: 'La ruptura está fresca. Y el timing decide si tu próxima acción abre o cierra la puerta.'
        },
        testimonio_caso: {
            contacto_cero: {
                texto: 'Pasaron meses sin hablarnos. Un día ella se contactó conmigo: quería hablar. Ya acordamos vernos.',
                autor: 'Antonio S.'
            },
            con_otro: {
                texto: 'Ella estaba con otro y yo pensé que la había perdido. Hoy fue nuestro aniversario y aceptó venir a la casa.',
                autor: 'Jose R.'
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
            }
        },
        recomendacion_plan: {
            contacto_cero: 'Para tu caso te recomiendo el Plan Completo: además de los 3 disparadores, incluye la guía de las señales para saber cuándo romper el silencio sin arriesgar nada.',
            con_otro: 'Para tu caso te recomiendo el Plan Completo: incluye el módulo «Si ya está con otro», que es justo tu situación.',
            bloqueo: 'Para tu caso te recomiendo el Plan Completo: te muestra cuál es el primer paso correcto para no cerrar más la puerta, y cómo leer las señales cuando empiece a abrirse.',
            canal_abierto: 'Para tu caso te recomiendo el Plan Completo: te muestra cómo cambiar la forma en que te ve cuando hablan, sin perder el contacto que ya tienen.',
            ruptura_reciente: 'Para tu caso te recomiendo el Plan Completo: los primeros días son los más delicados, y ahí cada paso en falso pesa el doble.'
        },
        cta_final: {
            contacto_cero: 'Quiero mi plan para romper el silencio',
            con_otro: 'Quiero mi plan aunque esté con otro',
            bloqueo: 'Quiero mi plan y dar el primer paso correcto',
            canal_abierto: 'Quiero mi plan para que me vea distinto',
            ruptura_reciente: 'Quiero mi plan antes de dar otro paso en falso'
        }

    } as const;
    
     const testimonialImgByScenario: Record<string, string> = {
        contacto_cero:    'https://ssplan.shop/wp-content/uploads/2026/10/01-daniela.webp',
        con_otro:         'https://ssplan.shop/wp-content/uploads/2026/10/02-valentina.webp',
        bloqueo:          'https://ssplan.shop/wp-content/uploads/2026/10/03-camila.webp',
        canal_abierto:    'https://ssplan.shop/wp-content/uploads/2026/10/lucia.webp',
        ruptura_reciente: 'https://ssplan.shop/wp-content/uploads/2026/10/04-mariana.webp'
    };

    const testimonialAvatarByScenario: Record<string, string> = {
        contacto_cero:    'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp',
        con_otro:         'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp',
        bloqueo:          'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp',
        canal_abierto:    'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp',
        ruptura_reciente: 'https://ssplan.shop/wp-content/uploads/2026/10/carlos-prova.webp'
    };

    return (
        <>
            {/* Transição pré-oferta */}
            <div 
                ref={preOfferRef}
                className="pre-offer-transition-section fade-in"
                style={{
                    marginBottom: 'clamp(24px, 5vw, 32px)',
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 179, 8, 0.15))',
                    border: '3px solid rgba(249, 115, 22, 0.6)',
                    borderRadius: '16px',
                    padding: 'clamp(24px, 5vw, 32px)',
                    boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: '16px' }}>
                    🎯
                </div>
                
                <h3 style={{
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    color: '#f97316',
                    fontWeight: '900',
                    marginBottom: 'clamp(16px, 4vw, 20px)',
                    lineHeight: '1.3'
                }}>
                    LLEGASTE AL ÚLTIMO PASO
                </h3>

                <p style={{
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    color: '#facc15',
                    lineHeight: '1.6',
                    marginBottom: 'clamp(16px, 4vw, 20px)',
                    fontWeight: '700'
                }}>
                    {scenarioContent.escenario_diagnostico[scenario]}
                </p>

                <p style={{
                    fontSize: 'clamp(1.05rem, 4vw, 1.25rem)',
                    color: 'rgba(255,255,255,0.95)',
                    lineHeight: '1.6',
                    marginBottom: '0',
                    fontWeight: '600'
                }}>
                    Ya sabes cuál es tu disparador clave: <strong style={{ color: '#facc15' }}>{disparadorClave.nombre}</strong>.<br/>
                    Ya viste cómo funciona la Ventana de 72 horas.<br/><br/>
                    
                    Ahora falta lo más importante:<br/>
                    <strong style={{ color: '#4ade80', fontSize: 'clamp(1.15rem, 4.5vw, 1.35rem)' }}>
                        saber exactamente qué hacer en cada fase, en tu caso.
                    </strong>
                </p>
            </div>

            {/* ========================================== */}
            {/* FASE 4: OFERTA - COM TODAS AS 11 MELHORIAS */}
            {/* ========================================== */}
            <div ref={offerRef} className="revelation fade-in offer-section-custom">
                
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
                            Tu precio especial está reservado por:
                        </p>
                        <p style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>
                            {formatTime(offerTimeLeft)}
                        </p>
                    </div>
                </div>

                {/* ✅ MELHORIA #3: 2 Fotos emocionais lado a lado */}
                {/* INSTRUÇÃO: Insira os links das imagens diretamente no atributo src="" abaixo */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'clamp(8px, 2vw, 12px)',
                    marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                    {/* Foto 1 - COLE O LINK DA PRIMEIRA IMAGEM NO src="" */}
                    <img 
                        src="https://ssplan.shop/wp-content/uploads/2026/10/01-triste.png" 
                        alt="Casal reconciliado - Foto 1" 
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '16px',
                            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
                            border: '3px solid rgba(249, 115, 22, 0.3)',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                    
                    {/* Foto 2 - COLE O LINK DA SEGUNDA IMAGEM NO src="" */}
                    <img 
                        src="https://ssplan.shop/wp-content/uploads/2026/10/02-feliz.webp" 
                        alt="Casal reconciliado - Foto 2" 
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '16px',
                            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
                            border: '3px solid rgba(249, 115, 22, 0.3)',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(1.9rem, 6vw, 2.4rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0 }}>
                HOY
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', fontWeight: '600', margin: 0, lineHeight: '1.35', textAlign: 'left' }}>
                Tu plan ya está listo · tú estás aquí
            </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(1.9rem, 6vw, 2.4rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0 }}>
                24h
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', fontWeight: '600', margin: 0, lineHeight: '1.35', textAlign: 'left' }}>
                Ella nota que algo cambió en ti
            </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(1.9rem, 6vw, 2.4rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0 }}>
                72h
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', fontWeight: '600', margin: 0, lineHeight: '1.35', textAlign: 'left' }}>
                Ella siente que te puede perder
            </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(1.9rem, 6vw, 2.4rem)', color: '#10b981', fontWeight: '900', margin: 0, lineHeight: '1', flexShrink: 0 }}>
                7-21
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', fontWeight: '600', margin: 0, lineHeight: '1.35', textAlign: 'left' }}>
                Días · las primeras señales: te escribe, te busca, te mira distinto
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
                    Tu plan para que {gender === 'HOMBRE' ? 'ella vuelva a buscarte' : 'él vuelva a buscarte'}, armado para tu caso
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
                    Con el Protocolo de la Obsesión Inversa. Si en 60 días no ves cambios, te devolvemos el 100% de tu dinero.
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
            {scenarioContent.recomendacion_plan[scenario]}
        </p>
    </div>
</div>

{/* ✅ MELHORIA #5: 2 Planos lado a lado ($14 / $27) */}
<div style={{
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
                Para quien quiere empezar
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
                USD 0.47 por día (30 días)
            </p>
            <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: '#60a5fa', fontWeight: '700', margin: '6px 0 0 0' }}>
                ✅ Pago único, sin mensualidades
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Los 3 disparadores, paso a paso (Curiosidad, Nostalgia, Pérdida)</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Tu Ventana de 72 horas: qué hacer y qué NO hacer en cada fase</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Los mensajes que nunca debes mandarle (y por qué la alejan)</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Guía: cómo dejar de rogar y volver a ser el hombre que ella eligió</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Soporte por email</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Garantía de 60 días</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Módulo «Si ya está con otro»</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Guía: ¿me voy de la casa o me quedo?</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Comunidad privada</div>
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
    <div style={{
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
            ⭐ MÁS VENDIDO • RECOMENDADO
        </div>
        <div style={{ marginBottom: 'clamp(14px, 3.5vw, 18px)' }}>
            <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>
                Plan Completo
            </h3>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Para quien quiere el plan completo, con todos los casos
            </p>
        </div>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                USD 342
            </p>
            <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#10b981', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>
                $27
            </p>
            <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>
                USD 0.90 por día (30 días)
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
                        🎁 +6 bonos incluidos · valor total <span style={{ textDecoration: 'line-through' }}>$342</span>
                    </span>
                </div>
                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: 'white', fontWeight: '700' }}>✅ Todo del Plan Esencial +</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Módulo «Si ya está con otro» (o te dijo que los quiere a los dos) <span style={{ color: '#facc15', fontWeight: '700' }}>· De $47 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Guía: las señales de que está volviendo (y cómo no arruinarlas) <span style={{ color: '#facc15', fontWeight: '700' }}>· De $47 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Comunidad privada de hombres en tu misma situación <span style={{ color: '#facc15', fontWeight: '700' }}>· De $67 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Guía: las 12 frases que ella dice y qué significan de verdad <span style={{ color: '#facc15', fontWeight: '700' }}>· De $37 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Guía: ¿me voy de la casa o me quedo? (si viven juntos o tienen hijos) <span style={{ color: '#facc15', fontWeight: '700' }}>· De $97 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>Actualizaciones de por vida <span style={{ color: '#facc15', fontWeight: '700' }}>· De $47 a GRATIS</span></div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>✉️ Sophia te escribe personalmente para conocer tu caso</div>
                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.7)' }}>Garantía extendida de 60 días</div>
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
{/* ✅ CTA PRINCIPAL - POSIÇÃO OTIMIZADA (logo após os planos) */}
<button 
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
            ? `🚀 ${scenarioContent.cta_final[scenario]} ($${selectedPlan})` 
            : '👆 ELIGE UN PLAN ARRIBA PRIMERO'
        }
    </span>
    <span style={{
        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
        color: '#fef08a',
        fontWeight: '700'
    }}>
        ⏰ Tu precio especial está reservado por {formatTime(offerTimeLeft)}
    </span>
    <span style={{
        fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600'
    }}>
        🛡️ Garantía de 60 días · Riesgo cero
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
                                src={testimonialAvatarByScenario[scenario]} 
                                alt={scenarioContent.testimonio_caso[scenario].autor} 
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
                                        {scenarioContent.testimonio_caso[scenario].autor}
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
                                    {`"${scenarioContent.testimonio_caso[scenario].texto}"`}
                                </p>
                            </div>
                        </div>

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
                                <strong style={{ color: '#4ade80' }}>Que la obsesión pase de ti a ella</strong>: los 3 disparadores en el orden correcto, sin rogar ni perseguirla.
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
                        fontWeight: '900',
                        textTransform: 'uppercase'
                    }}>
                        GARANTÍA BLINDADA DE 60 DÍAS
                    </h3>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                        lineHeight: '1.6',
                        color: 'white',
                        marginBottom: 'clamp(12px, 3vw, 16px)'
                    }}>
                        Si en 60 días no ves <strong style={{ color: '#4ade80' }}>resultados concretos</strong> en tu reconquista 
                        (mensajes de {gender === 'HOMBRE' ? 'ella' : 'él'}, cambio de actitud, reaproximación), 
                        <strong style={{ color: '#4ade80' }}> devolvemos el 100% de tu dinero</strong>.
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
                            ✅ RIESGO CERO PARA TI
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
                        ❓ PREGUNTAS FRECUENTES
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(10px, 2.5vw, 14px)'
                    }}>
                        {/* Pergunta 1 */}
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
                                ❓ ¿Funciona si {gender === 'HOMBRE' ? 'ella ya está con otro' : 'él ya está con otra'}?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí.</strong> Es uno de los casos más comunes. Ahí tu disparador clave es La Pérdida, 
                                y el módulo «Si ya está con otro» te dice qué hacer y qué no, para no empujarla más hacia él.
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
                                ❓ ¿Cuánto tiempo lleva ver resultados?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>Tu Ventana de 72 horas empieza hoy.</strong> 
                                La mayoría de los hombres ve las primeras señales (te escribe, te mira distinto, te busca por algo) 
                                entre el día 7 y el 21.
                            </p>
                        </details>

                        {/* Pergunta 3 (NOVA) */}
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
                                ❓ ¿Sirve si todavía vivimos juntos o tenemos hijos?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí.</strong> Es de los casos más comunes. El Plan Completo incluye una guía solo para cuando la ves todos los días y no puedes desaparecer.
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
                                ❓ ¿Tengo que hacer contacto cero?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>No.</strong> El contacto cero sirve para olvidarla, no para recuperarla. Mientras tú esperas, ella se acostumbra. El plan te dice cuándo hablarle, cuándo esperar y qué no hacer nunca.
                            </p>
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
                                ❓ ¿Sirve si ya probé otros cursos o tengo más de 45 años?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                <strong style={{ color: '#4ade80' }}>✅ Sí.</strong> Casi todos esos cursos están pensados para gente joven y relaciones cortas: no escribir, ir al gimnasio, subir fotos. Este plan parte de tu caso: lo que respondiste, cuánto tiempo estuvieron juntos y en qué punto están hoy.
                            </p>
                        </details>
                    </div>
                </div>

                {/* CTA final secundário */}
                <button 
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
                        ? `✅ ${scenarioContent.cta_final[scenario]} ($${selectedPlan}) →` 
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
                            ⏰ Expira en:
                        </p>
                        <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>
                            {formatTime(offerTimeLeft)}
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
                            60 días
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
                            ✨ {peopleBuying} personas comprando ahora
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
                    🔒 Compra 100% segura • Acceso instantáneo • 60 días de garantía blindada
                </p>

            </div>
        </>
    );
}
