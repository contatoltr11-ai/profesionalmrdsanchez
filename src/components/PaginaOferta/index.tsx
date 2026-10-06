import { RefObject } from 'react';
import { storage } from '../../utils/storage';

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
    spotsLeft,
    peopleBuying,
    selectedPlan,
    setSelectedPlan,
    onCTAClick,
    formatTime
}: PaginaOfertaProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';

    // Detecta o cenário do lead com base no quizData (regra exata)
    const detectScenario = (): 'contacto_cero' | 'con_otro' | 'bloqueo' | 'ruptura_reciente' => {
        if (quizData.currentSituation === 'CONTACTO CERO') return 'contacto_cero';
        if (quizData.currentSituation === 'BLOQUEADO') return 'bloqueo';
        if (
            quizData.exSituation === 'RELACIÓN SERIA' ||
            quizData.exSituation === 'SALIENDO CASUAL' ||
            quizData.exSituation === 'VARIAS PERSONAS'
        ) return 'con_otro';
        if (quizData.timeSeparation === 'MENOS DE 1 SEMANA') return 'ruptura_reciente';
        return 'ruptura_reciente';
    };

    const scenario = detectScenario();

    // 5 variáveis × 4 cenários
    const scenarioContent = {
        escenario_diagnostico: {
            contacto_cero: 'Tu diagnóstico apuntó a un escenario concreto: contacto cero. El silencio no es el final. Pero cada día que pasa, el terreno cambia.',
            con_otro: 'Tu diagnóstico apuntó a un escenario concreto: ella está con otro. Duele. Pero el mapa aún puede leerse con claridad.',
            bloqueo: 'Tu diagnóstico apuntó a un escenario concreto: bloqueo. El primer paso no es insistir. Es entender si todavía existe una aproximación segura.',
            ruptura_reciente: 'Tu diagnóstico apuntó a un escenario concreto: ruptura reciente. El momento importa más que la intensidad.'
        },
        linea_caso: {
            contacto_cero: 'El silencio no es el final. Pero cada día que pasa, el terreno cambia.',
            con_otro: 'Ella está con otro. Pero el mapa aún puede leerse con claridad.',
            bloqueo: 'El bloqueo no significa que la puerta esté cerrada para siempre. Significa que el primer paso es otro.',
            ruptura_reciente: 'El dolor es reciente. Pero el timing decide si tu próxima acción abre o cierra la puerta.'
        },
        testimonio_caso: {
            contacto_cero: {
                texto: 'Estábamos en contacto cero total. Seguí el protocolo de la Fase 1 sin enviar mensajes. A los 12 días, ella me escribió primero. La recuperé.',
                autor: 'Antonio S.'
            },
            con_otro: {
                texto: 'Ella ya estaba con otro tipo y yo estaba destruido. El Módulo 4 (Protocolo de Emergencia) me salvó de cometer errores fatales. 4 días después, no es perfecto, pero ya estamos juntos de nuevo.',
                autor: 'Jose R.'
            },
            bloqueo: {
                texto: 'Me había bloqueado de todo. Pensé que no había vuelta atrás. El diagnóstico me mostró que el primer paso no era insistir, era entender el riesgo. Hoy hablamos con calma.',
                autor: 'Carlos M.'
            },
            ruptura_reciente: {
                texto: 'Terminamos hace poco y yo actué en el impulso, empeoré todo. El plan me mostró qué hacer en cada fase. Hoy hay una conversación tranquila de nuevo.',
                autor: 'Diego F.'
            }
        },
        recomendacion_plan: {
            contacto_cero: 'Para tu escenario (contacto cero), el plan recomendado es el Total: incluye el Protocolo de Emergencia para no perder la ventana en el silencio.',
            con_otro: 'Para tu escenario (ella con otro), el plan recomendado es el Total: el Módulo 4 es el que resuelve casos críticos. El 73% de casos como el tuyo lo elige.',
            bloqueo: 'Para tu escenario (bloqueo), el plan recomendado es el Total: incluye el soporte prioritario para saber qué hacer sin arriesgar la puerta.',
            ruptura_reciente: 'Para tu escenario (ruptura reciente), el plan recomendado es el Total: el timing es lo más delicado y el Módulo 4 evita los errores que cierran la puerta.'
        },
        cta_final: {
            contacto_cero: 'Aplicar mi plan — mi ventana no espera',
            con_otro: 'Aplicar mi plan — el timing es ahora',
            bloqueo: 'Aplicar mi plan — el primer paso correcto',
            ruptura_reciente: 'Aplicar mi plan — antes de que el terreno cambie'
        }
    } as const;

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
                    Ya conoces tu diagnóstico.<br/>
                    Ya viste la Ventana de 72 Horas.<br/>
                    Ya sabes que <strong style={{ color: '#facc15' }}>esto funciona</strong>.<br/><br/>
                    
                    Ahora solo falta una cosa:<br/>
                    <strong style={{ color: '#4ade80', fontSize: 'clamp(1.15rem, 4.5vw, 1.35rem)' }}>
                        APLICARLO EN TU CASO.
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
                            Tu oferta especial expira en:
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
                        src="https://i.ibb.co/k63yYvQZ/01-triste.png" 
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
                        src="https://i.ibb.co/Z1KkPxC9/02-feliz.webp" 
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
                    padding: 'clamp(24px, 5vw, 32px)',
                    marginBottom: 'clamp(24px, 5vw, 32px)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        fontSize: 'clamp(1.25rem, 5vw, 1.6rem)',
                        color: '#10b981',
                        fontWeight: '900',
                        marginBottom: 'clamp(20px, 4vw, 24px)'
                    }}>
                        Únete a los 9.247+ hombres que recuperaron a su ex
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 'clamp(16px, 4vw, 24px)'
                    }}>
                        <div>
                            <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>
                                94%
                            </p>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                volvieron con su ex
                            </p>
                        </div>
                        
                        <div>
                            <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>
                                87%
                            </p>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                notaron cambios en 13-21 días
                            </p>
                        </div>
                        
                        <div>
                            <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>
                                72%
                            </p>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                                autoestima elevada
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
                    Recupera A {gender === 'HOMBRE' ? 'La Mujer Que Amas' : 'El Hombre Que Amas'}
                </h2>

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
                    (O Devolvemos El 100% De Tu Dinero)
                </p>

                {/* Justificativa da pré-seleção do plano por cenário */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.1))',
                    border: '2px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: '14px',
                    padding: 'clamp(16px, 4vw, 20px)',
                    marginBottom: 'clamp(20px, 4vw, 28px)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
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
                                Plan Essencial
                            </h3>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                Para quien quiere empezar
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                                USD 97
                            </p>
                            <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#3b82f6', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>
                                $14
                            </p>
                            <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                USD 0.47 por día (30 días)
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Protocolo de 72 Horas Completo</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Módulos 1-3 (Contacto Cero + Atracción + Reconquista)</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ 10 Templates de Mensajes Irresistibles</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ E-Book: 7 Pasos Para Ser Irresistible</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Soporte por Email</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Garantía de 30 Días</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Módulo 4: Protocolo de Emergencia</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Soporte WhatsApp Prioritario</div>
                                <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Comunidad Privada</div>
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
                            {selectedPlan === 14 ? '✅ PLAN SELECCIONADO' : 'ELEGIR PLAN ESSENCIAL'}
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
                        
                        {/* Aviso casos críticos DENTRO do card $27 */}
                        <div style={{
                            background: 'rgba(234, 179, 8, 0.2)',
                            borderRadius: '8px',
                            padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)',
                            marginBottom: 'clamp(10px, 2.5vw, 12px)',
                            marginTop: '8px',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                                color: '#facc15',
                                fontWeight: '700',
                                margin: 0,
                                lineHeight: '1.3'
                            }}>
                                ⚠️ Casos críticos (ella con otro): 73% eligen este plan
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: 'clamp(14px, 3.5vw, 18px)' }}>
                            <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>
                                Plan Total
                            </h3>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                Para casos críticos (ella con otro)
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>
                            <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                                USD 197
                            </p>
                            <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#10b981', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>
                                $27
                            </p>
                            <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>
                                USD 0.90 por día (30 días)
                            </p>
                            <p style={{ 
                                background: 'rgba(234, 179, 8, 0.2)',
                                color: '#facc15',
                                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                                fontWeight: '900',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                display: 'inline-block'
                            }}>
                                MENOS QUE UN CAFÉ
                            </p>
                        </div>
                        
                        <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>✅ TODO del Plan Essencial +</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Módulo 4: Protocolo de Emergencia</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Soporte WhatsApp Prioritario 24/7</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Comunidad Privada de Apoyo</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Garantía Extendida de 60 Días</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Bônus: Guía "Cómo Leer Su Mente"</div>
                                <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Actualizaciones de por vida</div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setSelectedPlan(27)}
                            style={{
                                background: selectedPlan === 27 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #10b981, #059669)',
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
                            {selectedPlan === 27 ? '✅ PLAN SELECCIONADO' : '🚀 ELEGIR PLAN TOTAL (RECOMENDADO)'}
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
                        ⏰ Tu análisis expira en {formatTime(offerTimeLeft)} • Solo {spotsLeft} vacantes
                    </span>
                    <span style={{
                        fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: '600'
                    }}>
                        🛡️ Garantía de 30 días • Riesgo cero
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
                        Lo Que Dicen Quienes Ya Recuperaron A Su Ex
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
                            {/* Avatar Mateo - COLE O LINK DA FOTO NO src="" */}
                            <img 
                                src="https://i.ibb.co/C3PmYyJ3/juan-prova.webp" 
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
                                src="https://i.ibb.co/yB6rKdt3/Generatedimage-1785944179924.jpg" 
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
                                        Antonio S.
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
                                    "La recuperé. He programado dos citas con ella. La recuperé."
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
                        Lo Que Obtienes Con Tu Plan Personalizado
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
                            <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>🧠</span>
                            <p style={{
                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                color: 'white',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                Técnicas extremadamente poderosas para <strong style={{ color: '#4ade80' }}>activar su oxitocina</strong>, adaptadas a tu perfil de relación
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
                                Ella estará <strong style={{ color: '#4ade80' }}>indefensa e incontrolablemente atraída</strong> hacia ti
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
                                Tendrás <strong style={{ color: '#facc15' }}>confianza y autoestima elevadas</strong>
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
                        GARANTÍA BLINDADA DE 30 DÍAS
                    </h3>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                        lineHeight: '1.6',
                        color: 'white',
                        marginBottom: 'clamp(12px, 3vw, 16px)'
                    }}>
                        Si en 30 días no ves <strong style={{ color: '#4ade80' }}>resultados concretos</strong> en tu reconquista 
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
                                <strong style={{ color: '#4ade80' }}>✅ Sí.</strong> El Módulo 4 (Protocolo de Emergencia) 
                                fue creado específicamente para esa situación. Ya salvó +2.100 casos donde {gender === 'HOMBRE' ? 'ella estaba con otro tipo' : 'él estaba con otra persona'}.
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
                                <strong style={{ color: '#4ade80' }}>La Ventana de 72 Horas empieza HOY.</strong> 
                                La mayoría de los hombres ven los primeros cambios (mensajes, miradas, señales) 
                                entre el día 7 y 21. Casos de emergencia pueden llevar hasta 45 días.
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
                                ❓ ¿Qué necesito para tener éxito?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                Completar las tareas diarias, dar feedback y estudiar los materiales. Hemos diseñado el plan de forma que <strong style={{ color: '#4ade80' }}>cada día te acerca más a tu objetivo</strong>, paso a paso.
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
                                ❓ ¿Y si me cuesta mantenerme motivado?
                            </summary>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',
                                color: 'rgba(255,255,255,0.9)',
                                marginTop: 'clamp(12px, 3vw, 16px)',
                                lineHeight: '1.6'
                            }}>
                                ¡No te preocupes! Nuestro plan está diseñado para <strong style={{ color: '#4ade80' }}>construir motivación gradualmente</strong>, así que no tendrás que depender de ella demasiado desde el principio. Además, estamos aquí para brindarte <strong style={{ color: '#4ade80' }}>apoyo constante</strong> y orientación experta.
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
                            🔥 Vacantes:
                        </p>
                        <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#f97316', fontWeight: '900', margin: 0 }}>
                            {spotsLeft}/50
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
                        ⭐ 4.8/5 estrellas • +9.247 reconquistas exitosas<br/>
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
                    🔒 Compra 100% segura • Acceso instantáneo • 30 días de garantía blindada
                </p>

            </div>
        </>
    );
}
