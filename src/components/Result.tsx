import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { playKeySound, getHotmartUrl } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { ga4Tracking } from '../utils/ga4Tracking';

import {
    getTitle,
    getCopy,
    getVentana72Copy,
    getVentanaSummary,
    getVentanaImportance,
    getOfferTitle,
    getFeatures,
    getCTA,
    getFaseText
} from '../utils/contentByGender';
import { getEmotionalValidation } from '../utils/emotionalValidation';

import Diagnostico from './Diagnostico';
import VideoEspecialista from './VideoEspecialista';
import Janela72Horas from './Janela72Horas';
import PaginaOferta from './PaginaOferta';

interface ResultProps {
    onNavigate: (page: string) => void;
}

export default function Result({ onNavigate }: ResultProps) {
    const [currentPhase, setCurrentPhase] = useState(0);
    const [fadeOutPhase, setFadeOutPhase] = useState<number | null>(null);
    const [videoButtonDelayLeft, setVideoButtonDelayLeft] = useState(10);
    const [isVideoButtonEnabled, setIsVideoButtonEnabled] = useState(false);
    const [buttonCheckmarks, setButtonCheckmarks] = useState<{ [key: number]: boolean }>({
        0: false,
        1: false,
        2: false
    });

    // ✅ MELHORIA #2: Timer de 10 minutos APENAS para a oferta
    const [offerTimeLeft, setOfferTimeLeft] = useState(10 * 60); // 600 segundos
    // 19/11: ao zerar, +5 min uma vez (etapa 1); ao zerar de novo, mensagem sem relógio (etapa 2)
    const [offerTimerStage, setOfferTimerStage] = useState(0);

    // ✅ MELHORIA #5: State para seleção de plano (Plan Total $27 pré-selecionado)
    const [selectedPlan, setSelectedPlan] = useState<number | null>(27);

    const [spotsLeft, setSpotsLeft] = useState(storage.getSpotsLeft());
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);
    const [peopleBuying, setPeopleBuying] = useState(Math.floor(Math.random() * 5) + 1);

    const quizData = storage.getQuizData();
    const diagnosticoSectionRef = useRef<HTMLDivElement>(null);
    const videoSectionRef = useRef<HTMLDivElement>(null);
    const ventana72SectionRef = useRef<HTMLDivElement>(null);
    const preOfferVideoSectionRef = useRef<HTMLDivElement>(null);
    const offerSectionRef = useRef<HTMLDivElement>(null);


    // 19/11: carregamento personalizado — as respostas dele aparecem uma por uma (~5 s)
    const tiempoTxt: Record<string, string> = {
        'MENOS DE 1 SEMANA': 'Hace menos de 1 semana', '1-4 SEMANAS': 'Hace 1 a 4 semanas',
        '1-6 MESES': 'Hace 1 a 6 meses', 'MÁS DE 6 MESES': 'Hace más de 6 meses'
    };
    const contactoTxt: Record<string, string> = {
        'CONTACTO CERO': 'sin contacto', 'ME IGNORA': 'te ignora', 'BLOQUEADO': 'te bloqueó',
        'SÓLO TEMAS NECESARIOS': 'solo hablan de lo necesario', 'VIVIMOS JUNTOS PERO DISTANTES': 'viven juntos, pero distantes',
        'HABLAMOS A VECES': 'hablan a veces', 'SOMOS AMIGOS': 'son amigos', 'ENCUENTROS ÍNTIMOS': 'todavía se ven a solas'
    };
    const impulsoTxt: Record<string, string> = {
        'LE MANDÉ UN MENSAJE LARGUÍSIMO': 'Le mandaste un mensaje larguísimo', 'LA LLAMÉ VARIAS VECES': 'La llamaste varias veces',
        'LE PEDÍ PERDÓN Y OTRA OPORTUNIDAD': 'Le pediste perdón', 'LA VIGILÉ EN REDES (O PEDÍ A ALGUIEN QUE LO HICIERA)': 'La vigilaste en redes',
        'NO HICE NADA, ME QUEDÉ CALLADO': 'No hiciste nada'
    };
    const ellaTxt: Record<string, string> = {
        'ESTÁ SOLTERA': 'Ella está sola', 'NO ESTOY SEGURO': 'No sabes si está con alguien',
        'SALIENDO CASUAL': 'Ella está saliendo con alguien', 'RELACIÓN SERIA': 'Ella está con otra persona',
        'VARIAS PERSONAS': 'Ella está conociendo a varias personas'
    };
    const linhaCaso = [tiempoTxt[quizData.timeSeparation], contactoTxt[quizData.currentSituation]].filter(Boolean).join(' · ');
    const loadingSteps = [
        ...(linhaCaso ? [{ icon: '📍', text: linhaCaso }] : []),
        ...(impulsoTxt[quizData.impulso || ''] ? [{ icon: '💬', text: impulsoTxt[quizData.impulso || ''] }] : []),
        ...(ellaTxt[quizData.exSituation] ? [{ icon: '👤', text: ellaTxt[quizData.exSituation] }] : []),
        { icon: '🧠', text: 'Comparando con más de 9.000 casos como el tuyo…' },
        { icon: '⭐', text: 'Buscando tu disparador clave…' }
    ].map((s, i, arr) => ({ ...s, duration: Math.round(i * 4400 / arr.length) }));

    // TESTE 4 (lab): fotos de casais trocando durante o "Analizando tu caso"
    const loadingImages = ['/img/carga-1.webp', '/img/carga-2.jpg', '/img/carga-3.jpg'];
    const [loadingImageIndex, setLoadingImageIndex] = useState(0);

    const getUTMs = (): Record<string, string> => {
        try {
            const storedUTMs = localStorage.getItem('quiz_utms');
            return storedUTMs ? JSON.parse(storedUTMs) : {};
        } catch (error) {
            return {};
        }
    };

    const ensureUTMs = () => {
        const utms = getUTMs();
        if (Object.keys(utms).length > 0 && window.location.search === '') {
            const utmString = Object.entries(utms)
                .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
                .join('&');
            window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
        }
    };


    useEffect(() => {
        ensureUTMs();
        ga4Tracking.resultPageView();
        window.scrollTo(0, 0);

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        // pré-carrega as fotos e troca a cada 1,4 s
        loadingImages.forEach(src => { const img = new Image(); img.src = src; });
        const imageInterval = setInterval(() => {
            setLoadingImageIndex(prev => (prev < loadingImages.length - 1 ? prev + 1 : prev));
        }, 1400);

        loadingSteps.forEach((step, index) => {
            setTimeout(() => setLoadingStep(index), step.duration);
        });

        const timerPhase1 = setTimeout(() => {
            setCurrentPhase(1);
            playKeySound();
            ga4Tracking.revelationViewed('Por qué te dejó', 1);
        }, 5200);

        const spotsInterval = setInterval(() => {
            setSpotsLeft(prev => {
                if (prev > 15) {
                    const newSpots = prev - 1;
                    storage.setSpotsLeft(newSpots);
                    ga4Tracking.spotsUpdated(newSpots);
                    return newSpots;
                }
                return prev;
            });
        }, 45000);

        const buyingInterval = setInterval(() => {
            setPeopleBuying(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                let newCount = prev + change;
                if (newCount < 1) newCount = 1;
                if (newCount > 7) newCount = 7;
                return newCount;
            });
        }, Math.floor(Math.random() * 10000) + 5000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(imageInterval);
            clearTimeout(timerPhase1);
            clearInterval(spotsInterval);
            clearInterval(buyingInterval);
        };
    }, []);

    // ✅ MELHORIA #2: useEffect que inicia timer de 10min quando chega na Fase 4
    useEffect(() => {
        if (currentPhase >= 4) {
            const offerTimer = setInterval(() => {
                setOfferTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
            }, 1000);

            return () => clearInterval(offerTimer);
        }
    }, [currentPhase]);

    useEffect(() => {
        if (currentPhase < 4 || offerTimeLeft > 0) return;
        if (offerTimerStage === 0) { setOfferTimerStage(1); setOfferTimeLeft(5 * 60); }
        else if (offerTimerStage === 1) setOfferTimerStage(2);
    }, [offerTimeLeft, offerTimerStage, currentPhase]);

    useEffect(() => {
        let delayInterval: NodeJS.Timeout;
        if (currentPhase === 2) {
            setVideoButtonDelayLeft(10);
            setIsVideoButtonEnabled(false);

            delayInterval = setInterval(() => {
                setVideoButtonDelayLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(delayInterval);
                        setIsVideoButtonEnabled(true);
                        ga4Tracking.videoButtonUnlocked({ unlock_time_seconds: 10, video_name: 'VSL Plan Personalizado' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (delayInterval) clearInterval(delayInterval);
        };
    }, [currentPhase]);

    useEffect(() => {
        if (currentPhase !== 2 || !videoSectionRef.current) return;

        const timer = setTimeout(() => {
            const vslPlaceholder = videoSectionRef.current?.querySelector('.vsl-placeholder');
            if (vslPlaceholder) {
                vslPlaceholder.innerHTML = `
                    <div style="position: relative; width: 100%; max-width: 400px; margin: 0 auto; aspect-ratio: 9 / 16; background: #000; border-radius: 8px; overflow: hidden;">
                        <vturb-smartplayer id="vid-6b04f7d4c7ae969980aae7ad" style="display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></vturb-smartplayer>
                    </div>
                `;
                if (!document.querySelector('script[src*="6b04f7d4c7ae969980aae7ad"]')) {
                    const s = document.createElement("script");
                    s.src = "https://scripts.converteai.net/f7158ddf-38af-4713-91e8-34a818b9c9f2/players/6b04f7d4c7ae969980aae7ad/v4/player.js";
                    s.async = true;
                    document.head.appendChild(s);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPhase]);

    useEffect(() => {
        let targetRef: React.RefObject<HTMLDivElement> | null = null;

        switch (currentPhase) {
            case 1:
                targetRef = diagnosticoSectionRef;
                break;
            case 2:
                targetRef = videoSectionRef;
                break;
            case 3:
                targetRef = ventana72SectionRef;
                break;
            case 4:
                targetRef = preOfferVideoSectionRef;
                break;
        }

        if (targetRef && targetRef.current) {
            // Bloco 1 (19/11): rolagem instantânea descontando a barra fixa de etapas.
            // O scrollIntoView suave não terminava quando a página encolhia (vídeo cortado no 375×667)
            // e o título da etapa ficava escondido atrás da barra.
            setTimeout(() => {
                const el = targetRef!.current;
                if (!el) return;
                const bar = document.querySelector('.progress-bar-container') as HTMLElement | null;
                const offset = (bar ? bar.offsetHeight : 0) + 12;
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
            }, 100);
        }
    }, [currentPhase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePhase1ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 0: true }));
        setFadeOutPhase(1);

        setTimeout(() => {
            setCurrentPhase(2);
            ga4Tracking.phaseProgressionClicked({ phase_from: 1, phase_to: 2, button_name: 'Desbloquear El Vídeo Secreto' });
            ga4Tracking.videoStarted();
            setFadeOutPhase(null);
        }, 400);
    };

    const handlePhase2ButtonClick = () => {
        if (!isVideoButtonEnabled) return;
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 1: true }));
        setFadeOutPhase(2);

        setTimeout(() => {
            setCurrentPhase(3);
            ga4Tracking.window72hRevealed({ phase_from: 2, phase_to: 3, button_name: 'Revelar VENTANA DE 72 HORAS' });
            setFadeOutPhase(null);
        }, 400);
    };

    const handlePhase3ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 2: true }));
        setFadeOutPhase(3);

        setTimeout(() => {
            setCurrentPhase(4);
            ga4Tracking.offerRevealedStep({ phase_from: 3, phase_to: 4, button_name: 'Revelar Mi Plan Personalizado' });
            ga4Tracking.offerRevealed();
            setFadeOutPhase(null);
        }, 400);
    };

    // ✅ MELHORIA #5: handleCTAClick atualizado para validar plano selecionado
    const handleCTAClick = () => {
        if (!selectedPlan) {
            alert('Por favor, elige un plan primero');
            return;
        }
        ga4Tracking.buyClickStep({ phase_from: 4, phase_to: 4, button_name: 'Comprar Ahora' });
        // Lab 18/11: plano escolhido no button_location (result_buy_main_14 / result_buy_main_27)
        ga4Tracking.ctaBuyClicked(`result_buy_main_${selectedPlan}`);
        window.open(getHotmartUrl(selectedPlan), '_blank');
    };

    const phases = ['Diagnóstico', 'Vídeo', 'Ventana 72h', 'Solución'];

    return (
        <div className="result-container">
            {/* ✅ MELHORIA #1: Header SEM timer de 47 minutos */}
            {/* Lab 18/11: título "Tu Plan Personalizado Está Listo" removido (só ocupava espaço); fica a barra de etapas */}

            {currentPhase > 0 && (
                <div className="progress-bar-container fade-in">
                    {phases.map((label, index) => (
                        <div key={index} className={`progress-step ${currentPhase > index + 1 ? 'completed' : ''} ${currentPhase === index + 1 ? 'active' : ''}`}>
                            <div className="step-circle">{currentPhase > index + 1 ? '✅' : index + 1}</div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="revelations-container">

                {/* FASE 0: Loading - MANTIDA */}
                {currentPhase === 0 && (
                    <div className="revelation fade-in loading-box-custom">
                        <div className="loading-inner">
                            <img
                                key={loadingImageIndex}
                                src={loadingImages[loadingImageIndex]}
                                alt=""
                                className="fade-in"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    maxWidth: 'min(230px, 27vh)', // 19/11: menor em tela baixa (iPhone SE) p/ caber as 5 linhas
                                    aspectRatio: '4 / 5',
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                    margin: '0 auto 16px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                }}
                            />
                            <h2>ANALIZANDO TU CASO</h2>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="progress-outer"><div className="progress-inner" style={{ width: `${loadingProgress}%` }}></div></div>
                                <div className="progress-labels"><span>{Math.round(loadingProgress)}%</span><span>⏱️ {Math.ceil((100 - loadingProgress) / 20)}s...</span></div>
                            </div>
                            <div className="loading-steps-list">
                                {loadingSteps.map((step, i) => (
                                    <div key={i} className={`loading-step-item ${i <= loadingStep ? 'active fade-in' : ''}`} style={{ visibility: i <= loadingStep ? 'visible' : 'hidden' }}>
                                        {i < loadingStep ? '✅' : step.icon} {step.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FASE 1: Diagnóstico */}
                {currentPhase === 1 && (
                    <Diagnostico
                        sectionRef={diagnosticoSectionRef}
                        fadeOutPhase={fadeOutPhase}
                        buttonChecked={buttonCheckmarks[0]}
                        onButtonClick={handlePhase1ButtonClick}
                    />
                )}

                {/* FASE 2: VSL */}
                {currentPhase === 2 && (
                    <VideoEspecialista
                        sectionRef={videoSectionRef}
                        fadeOutPhase={fadeOutPhase}
                        buttonChecked={buttonCheckmarks[1]}
                        isVideoButtonEnabled={isVideoButtonEnabled}
                        videoButtonDelayLeft={videoButtonDelayLeft}
                        onButtonClick={handlePhase2ButtonClick}
                    />
                )}

                {/* FASE 3: Ventana 72h */}
                {currentPhase === 3 && (
                    <Janela72Horas
                        sectionRef={ventana72SectionRef}
                        fadeOutPhase={fadeOutPhase}
                        buttonChecked={buttonCheckmarks[2]}
                        onButtonClick={handlePhase3ButtonClick}
                    />
                )}

                {/* FASE 4: Pré-oferta + Oferta */}
                {currentPhase >= 4 && (
                    <PaginaOferta
                        preOfferRef={preOfferVideoSectionRef}
                        offerRef={offerSectionRef}
                        offerTimeLeft={offerTimeLeft}
                        offerTimerStage={offerTimerStage}
                        spotsLeft={spotsLeft}
                        peopleBuying={peopleBuying}
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        onCTAClick={handleCTAClick}
                        formatTime={formatTime}
                    />
                )}
            </div>

            <style>{`
                .result-container { padding-bottom: 100px; }
                .result-header { text-align: center; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 12px; margin-bottom: 20px; }
                .result-title { font-size: clamp(1.5rem, 6vw, 2.5rem); color: white; margin: 0; font-weight: 900; }
                .progress-bar-container { display: flex; justify-content: space-between; margin: 20px auto; max-width: 800px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 12px; position: sticky; top: 0; z-index: 999; backdrop-filter: blur(5px); gap: 10px; }
                .progress-step { flex: 1; display: flex; flex-direction: column; align-items: center; color: rgba(255,255,255,0.5); font-size: 0.8rem; }
                .step-circle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; margin-bottom: 5px; font-weight: bold; }
                .progress-step.active .step-circle { background: #eab308; color: black; }
                .progress-step.completed .step-circle { background: #4ade80; color: white; }
                .step-label { font-size: 0.7rem; text-align: center; }
                .revelations-container { max-width: 800px; margin: 0 auto; }
                .revelation { background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1); border-radius: 16px; padding: clamp(20px, 5vw, 40px); margin-bottom: 30px; }
                .revelation-header { text-align: center; margin-bottom: 30px; }
                .revelation-icon { font-size: 3rem; display: block; margin-bottom: 15px; }
                .revelation h2 { font-size: clamp(1.5rem, 6vw, 2rem); color: white; margin: 0; font-weight: 900; }
                .revelation-text { font-size: clamp(1rem, 4vw, 1.2rem); line-height: 1.8; color: rgba(255,255,255,0.95); }
                .quiz-summary-box { background: rgba(234, 179, 8, 0.1); border: 2px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px; }
                .summary-title { color: rgb(253, 224, 71); font-weight: bold; margin-bottom: 15px; }
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .summary-grid div { font-size: clamp(0.85rem, 3.5vw, 1rem); color: white; }
                .summary-grid span { color: #4ade80; font-weight: bold; }
                .emotional-validation { background: rgba(74, 222, 128, 0.1); border: 2px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px; color: #4ade80; }
                .loading-box-custom { background: rgba(234, 179, 8, 0.1); border: 2px solid #eab308; border-radius: 16px; padding: clamp(20px, 5vw, 40px); text-align: center; }
                .loading-inner { display: flex; flex-direction: column; align-items: center; gap: 20px; }
                .spin-brain { font-size: 4rem; animation: spin 2s linear infinite; }
                .loading-steps-list { display: flex; flex-direction: column; gap: 10px; text-align: left; }
                .loading-step-item { font-size: clamp(0.9rem, 3.5vw, 1.1rem); color: rgba(255,255,255,0.8); }
                .loading-step-item.active { color: #4ade80; font-weight: bold; }
                .progress-outer { width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }
                .progress-inner { height: 100%; background: linear-gradient(90deg, #eab308, #10b981); width: 0%; transition: width 0.1s linear; }
                .progress-labels { display: flex; justify-content: space-between; font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.7); }
                .vsl-container { margin: 30px 0; }
                .vsl-placeholder { width: 100%; max-width: 400px; margin: 0 auto; }
                .video-delay-indicator { background: rgba(0,0,0,0.4); border: 2px solid #eab308; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center; color: white; display: flex; flex-direction: column; align-items: center; gap: 15px; }
                .delay-text { font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .delay-progress-bar-container { width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }
                .delay-progress-bar { height: 100%; background: linear-gradient(90deg, #eab308, #10b981); transition: width 1s linear; }
                .checkmark-container { display: flex; justify-content: center; margin: 20px 0; }
                .checkmark-glow { font-size: 4rem; animation: glow 1.5s ease-in-out infinite alternate; }
                .fade-in { animation: fadeIn 0.5s ease-out; }
                .fade-out { animation: fadeOut 0.4s ease-out forwards; }
                .cta-button { font-weight: bold; border: none; cursor: pointer; transition: all 0.3s ease; display: block; width: 100%; text-align: center; }
                .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
                .btn-yellow { background: linear-gradient(135deg, #eab308, #ca8a04); color: black; }
                .btn-orange { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
                .btn-size-1 { font-size: clamp(1rem, 4vw, 1.3rem); padding: clamp(14px, 3.5vw, 18px) clamp(24px, 5vw, 32px); border-radius: 12px; }
                .btn-size-2 { font-size: clamp(1.1rem, 4.5vw, 1.4rem); padding: clamp(16px, 4vw, 20px) clamp(28px, 5.5vw, 36px); border-radius: 12px; }
                .btn-size-3 { font-size: clamp(1.2rem, 5vw, 1.5rem); padding: clamp(18px, 4.5vw, 24px) clamp(32px, 6vw, 40px); border-radius: 14px; }
                .btn-size-4 { font-size: clamp(1.3rem, 5.5vw, 1.75rem); padding: clamp(20px, 5vw, 28px) clamp(36px, 7vw, 48px); border-radius: 16px; }
                .btn-animation-fadein { animation: fadeIn 0.5s ease-out; }
                .btn-animation-bounce { animation: bounce 2s infinite; }
                .btn-animation-pulse { animation: pulse 1.5s infinite; }
                .cta-button.disabled { opacity: 0.5; cursor: not-allowed; }
                .ventana-box-custom { background: linear-gradient(180deg, rgba(249, 115, 22, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 2px solid rgba(249, 115, 22, 0.4); }
                .ventana-header-custom { text-align: center; margin-bottom: 24px; }
                .ventana-header-custom span { font-size: 3rem; display: block; margin-bottom: 12px; }
                .ventana-header-custom h2 { font-size: clamp(1.5rem, 6vw, 2.2rem); color: #f97316; margin: 0; font-weight: 900; text-transform: uppercase; }
                .ventana-scientific-intro { background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }
                .ventana-scientific-intro p { font-size: clamp(0.95rem, 3.8vw, 1.1rem); color: rgba(255,255,255,0.9); line-height: 1.6; margin: 0; }
                .ventana-img-top { width: 100%; max-width: 600px; margin: 0 auto 16px auto; display: block; border-radius: 12px; border: 2px solid rgba(249, 115, 22, 0.3); }
                .ventana-img-caption { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.6); text-align: center; font-style: italic; margin-bottom: 24px; }
                .ventana-importance-box { background: rgba(234, 179, 8, 0.1); border: 2px solid rgba(234, 179, 8, 0.4); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }
                .importance-title { font-size: clamp(1.1rem, 4.5vw, 1.4rem); color: #facc15; margin: 0 0 16px 0; font-weight: 900; }
                .importance-bullets { display: flex; flex-direction: column; gap: 10px; }
                .importance-item { font-size: clamp(0.9rem, 3.5vw, 1.05rem); color: white; line-height: 1.5; }
                .ventana-intro { font-size: clamp(1rem, 4vw, 1.2rem); line-height: 1.8; color: rgba(255,255,255,0.95); margin-bottom: 24px; }
                .ventana-summary-box { background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.15); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }
                .summary-quick-title { font-size: clamp(1rem, 4vw, 1.2rem); color: #facc15; margin: 0 0 16px 0; font-weight: 700; }
                .summary-quick-list { display: flex; flex-direction: column; gap: 10px; }
                .summary-quick-item { font-size: clamp(0.9rem, 3.5vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.5; }
                .fases-list-dopamine { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }
                .ventana-entucaso-box { background: rgba(250, 204, 21, 0.08); border: 2px solid #facc15; border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }
                .entucaso-title { font-size: clamp(1.1rem, 4.5vw, 1.4rem); color: #facc15; margin: 0 0 12px 0; font-weight: 900; }
                .entucaso-text { font-size: clamp(0.95rem, 3.8vw, 1.1rem); color: rgba(255,255,255,0.92); line-height: 1.6; margin: 0 0 12px 0; }
                .entucaso-text:last-child { margin-bottom: 0; }
                .entucaso-clave { font-size: clamp(1rem, 4vw, 1.15rem); color: white; font-weight: 700; margin: 0 0 8px 0; }
                .fase-card-clave { border: 3px solid #facc15 !important; box-shadow: 0 0 24px rgba(250, 204, 21, 0.25); }
                .fase-clave-badge { display: inline-block; background: #facc15; color: #111; font-size: clamp(0.75rem, 3vw, 0.9rem); font-weight: 900; padding: 5px 12px; border-radius: 20px; margin-bottom: 12px; }
                .fase-card-dopamine { background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.05)); border: 2px solid rgba(249, 115, 22, 0.3); border-radius: 16px; padding: clamp(20px, 5vw, 28px); }
                .fase-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
                .fase-number { background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: clamp(0.8rem, 3vw, 0.95rem); font-weight: 900; padding: 6px 14px; border-radius: 20px; }
                .fase-timerange { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.7); font-weight: 600; }
                .fase-card-title { font-size: clamp(1.1rem, 4.5vw, 1.4rem); color: white; margin: 0 0 12px 0; font-weight: 900; }
                .fase-card-summary { font-size: clamp(0.95rem, 3.8vw, 1.1rem); color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 16px; }
                .fase-card-bullets { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
                .fase-bullet-item { font-size: clamp(0.85rem, 3.5vw, 1rem); color: #4ade80; line-height: 1.5; }
                .fase-card-warning { background: rgba(234, 179, 8, 0.15); border-left: 4px solid #eab308; padding: 12px; border-radius: 8px; font-size: clamp(0.85rem, 3.5vw, 1rem); color: #facc15; margin-bottom: 16px; }
                .fase-card-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
                .fase-check { font-size: clamp(0.8rem, 3vw, 0.95rem); color: #4ade80; font-weight: 700; }
                .fase-next { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.6); }
                .offer-section-custom { background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 3px solid rgba(16, 185, 129, 0.4); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
                @keyframes glow { from { text-shadow: 0 0 10px #4ade80, 0 0 20px #4ade80; } to { text-shadow: 0 0 20px #4ade80, 0 0 40px #4ade80, 0 0 60px #4ade80; } }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
                @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
                details summary::-webkit-details-marker { display: none; }
                details summary::before { content: '▶ '; transition: transform 0.3s; display: inline-block; }
                details[open] summary::before { transform: rotate(90deg); }
            `}</style>
        </div>
    );
}
