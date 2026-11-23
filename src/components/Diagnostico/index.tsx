import { RefObject } from 'react';
import { storage } from '../../utils/storage';
import { getTitle, getCopy } from '../../utils/contentByGender';
import { getEmotionalValidation } from '../../utils/emotionalValidation';

interface DiagnosticoProps {
    sectionRef: RefObject<HTMLDivElement | null>;
    fadeOutPhase: number | null;
    buttonChecked: boolean;
    onButtonClick: () => void;
}

export default function Diagnostico({ sectionRef, fadeOutPhase, buttonChecked, onButtonClick }: DiagnosticoProps) {
    const quizData = storage.getQuizData();
    const gender = quizData.gender || 'HOMBRE';

    // ✅ CTA específico por situación — valores idénticos a los del Chat.tsx (dataKey: 'currentSituation')
    const ctaBySituation: Record<string, string> = {
        'CONTACTO CERO':          '🔓 Ver Por Qué El Silencio No Es El Final',
        'ME IGNORA':              '🔓 Ver Qué Hacer Cuando Ella No Responde',
        'BLOQUEADO':              '🔓 Ver El Camino Que No Requiere Mensaje',
        'SÓLO TEMAS NECESARIOS':  '🔓 Ver Cómo Romper El Contacto Funcional',
        'HABLAMOS A VECES':       '🔓 Ver Cómo Convertir Chats En Encuentros',
        'SOMOS AMIGOS':           '🔓 Ver Cómo Salir De La Friendzone',
        'ENCUENTROS ÍNTIMOS':     '🔓 Ver Cómo Convertir Sexo En Relación',
    };

    return (
        <div 
            ref={sectionRef} 
            className={`revelation fade-in ${fadeOutPhase === 1 ? 'fade-out' : ''}`}
        >
            <div className="revelation-header">
                <div className="revelation-icon">💔</div>
                <h2>{getTitle(gender)}</h2>
            </div>

            <div className="quiz-summary-box">
                <p className="summary-title">📋 TU SITUACIÓN ESPECÍFICA</p>
                <div className="summary-grid">
                    <div><span>✓</span> <strong>Tiempo:</strong> {quizData.timeSeparation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Quién terminó:</strong> {quizData.whoEnded || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Contacto:</strong> {quizData.currentSituation || 'No especificado'}</div>
                    <div><span>✓</span> <strong>Compromiso:</strong> {quizData.commitmentLevel || 'No especificado'}</div>
                </div>
            </div>

            {/* ✅ ORDEN CORREGIDO: validación emocional ANTES del diagnóstico técnico */}
            <div className="emotional-validation">
                <p><strong>Tu situación específica:</strong><br />{getEmotionalValidation(quizData)}</p>
            </div>

            <p className="revelation-text" style={{ whiteSpace: 'pre-line' }}>{getCopy(quizData)}</p>

            {buttonChecked ? (
                <div className="checkmark-container">
                    <div className="checkmark-glow">✅</div>
                </div>
            ) : (
                <button 
                    className="cta-button btn-green btn-size-1 btn-animation-fadein" 
                    onClick={onButtonClick}
                >
                    {ctaBySituation[quizData.currentSituation] || '🔓 Desbloquear El Vídeo Secreto'}
                </button>
            )}
        </div>
    );
}