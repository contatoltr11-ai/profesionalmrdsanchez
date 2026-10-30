import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { playKeySound } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { getCompletionBadge } from '../utils/contentByGender';
import { ga4Tracking } from '../utils/ga4Tracking';

interface ChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  type: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  response: string;
  responseByOption?: {
    [option: string]: string;
  };
  dataKey: 'gender' | 'timeSeparation' | 'whoEnded' | 'relationshipDuration' | 'currentSituation' | 'exSituation' | 'commitmentLevel';
}

// ========================================
// ✅ CONSTANTES DE VELOCIDADE E PROGRESSO
// ========================================
const TYPE_SPEED = 22;                  // ms por caractere
const DELAY_BEFORE_RESPONSE = 150;
const DELAY_BEFORE_NEXT_QUESTION = 200;
const DELAY_SHOW_OPTIONS = 100;
const DELAY_BEFORE_FINAL = 300;
const BASE_PROGRESS = 14;

// ========================================
// ✅ CHAT 100% MASCULINO
// Lead: homem reconquistando uma mulher.
// Pergunta de gênero removida. Opções e respostas
// já fixas no masculino — sem optionsByGender,
// sem responseByGender, sem variantes /o.
// ========================================
const QUESTIONS: Question[] = [
  {
    id: 2,
    text: 'Ahora, ¿cuánto tiempo ha pasado desde que se separaron?',
    options: ['MENOS DE 1 SEMANA', '1-4 SEMANAS', '1-6 MESES', 'MÁS DE 6 MESES'],
    response: 'Registrado.',
    responseByOption: {
      'MENOS DE 1 SEMANA': 'Registrado. Una semana es el momento más crítico y, a la vez, el más favorable. Tu ex-pareja todavía tiene la memoria emocional en su punto más alto: la ruptura está fresca y el vínculo sigue activo. Vamos a usar eso antes de que empiece a cerrarse.',
      '1-4 SEMANAS': 'Registrado. Entre una y cuatro semanas se abre la fase de mayor contradicción interna: ya se siente el vacío, pero todavía no se admite. Es la ventana donde el recuerdo empieza a pesar más que el motivo de la ruptura. Vamos a trabajar exactamente ahí.',
      '1-6 MESES': 'Registrado. Entre uno y seis meses es la fase de mayor riesgo de que tu ausencia se vuelva costumbre — pero también la de mayor apertura al recuerdo. Si tocamos la memoria emocional correcta ahora, revertimos el proceso antes de que se consolide.',
      'MÁS DE 6 MESES': 'Registrado. Pasados los seis meses, tu ausencia ya se consolidó como rutina. Eso no significa que esté cerrado: significa que la estrategia cambia de dirección. No vamos a apelar a la nostalgia directa, vamos a reactivar el recuerdo desde otro ángulo. Es el escenario más lento, pero funciona.'
    },
    dataKey: 'timeSeparation',
  },
  {
    id: 3,
    text: 'Bien. ¿Y cómo fue la separación? ¿Quién tomó la iniciativa?',
    options: ['ELLA TERMINÓ', 'YO TERMINÉ', 'DECISIÓN MUTUA'],
    response: 'Entendido. Esto cambia el mapa de la estrategia.',
    responseByOption: {
      'ELLA TERMINÓ': 'Entiendo. Cuando ella toma la decisión de terminar, algo activó un "switch" emocional en su cerebro: ella ya procesó la ruptura antes de decírtelo. La buena noticia: ese switch puede revertirse si tocas la memoria emocional correcta. Vamos a usar eso.',
      'YO TERMINÉ': 'Interesante. Cuando tú terminaste, ella activó un mecanismo de defensa: siente que fue rechazada, y eso la vuelve resistente a cualquier acercamiento directo. Vamos a revertir esa defensa antes de intentar cualquier contacto.',
      'DECISIÓN MUTUA': 'Entiendo. La decisión mutua es el escenario más delicado: no hay un "rechazo" que active la memoria emocional, y sin eso no hay anclaje. Vamos a crear ese anclaje estratégicamente.'
    },
    dataKey: 'whoEnded',
  },
  {
    id: 4,
    text: 'Registrado. ¿Por cuánto tiempo estuvieron juntos?',
    options: ['MENOS DE 6 MESES', '6 MESES-1 AÑO', '1-3 AÑOS', 'MÁS DE 3 AÑOS'],
    response: 'Registrado. Cada detalle cuenta. Perfecto. El tiempo de relación define cuántas "anclas emocionales" creaste en su memoria. Cuanto más tiempo juntos, más profundas las conexiones neuronales. Eso trabaja a tu favor si usas el protocolo correcto.',
    dataKey: 'relationshipDuration',
  },
  {
    id: 5,
    text: '¿Cuál es tu situación actual con tu ex-pareja?',
    options: ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO', 'SÓLO TEMAS NECESARIOS', 'HABLAMOS A VECES', 'SOMOS AMIGOS', 'ENCUENTROS ÍNTIMOS'],
    response: 'Registrado. Esto es clave. Información clave. El nivel de contacto actual revela exactamente en qué fase emocional está ella. Cada escenario requiere un protocolo diferente. Si hay contacto cero, usamos una estrategia. Si hay comunicación, usamos otra completamente distinta.',
    dataKey: 'currentSituation',
  },
  {
    id: 6,
    text: 'Ahora, una información crucial: ¿tu ex-pareja ya está con otra persona?',
    options: ['ESTÁ SOLTERA', 'NO ESTOY SEGURO', 'SALIENDO CASUAL', 'RELACIÓN SERIA', 'VARIAS PERSONAS'],
    response: 'Crucial. Esto define la ruta que vamos a tomar.',
    responseByOption: {
      'ESTÁ SOLTERA': 'Mejor todavía. Si ella está soltera, hay una ventana de oportunidad abierta ahora mismo: el cerebro en soledad busca referencia emocional en el pasado. Vamos a ocupar ese espacio antes de que se cierre.',
      'NO ESTOY SEGURO': 'No importa. Vamos a blindar tu plan para los dos escenarios: la estrategia que funciona si está con alguien también funciona si está soltera. Nada queda al azar.',
      'SALIENDO CASUAL': 'Entendido. Si está saliendo casualmente, no hay vínculo consolidado. Vamos a usar la comparación emocional sin presionar, y eso juega a tu favor.',
      'RELACIÓN SERIA': 'Entendido. Si hay una relación seria, la estrategia no es competir: es activar la memoria emocional de lo que tenía contigo. Eso es más efectivo que cualquier confrontación.',
      'VARIAS PERSONAS': 'Entendido. Si está con varias personas, hay una búsqueda activa de algo que no encontró. Ahí es donde entras tú — y vamos a posicionarte exactamente en ese hueco.'
    },
    dataKey: 'exSituation',
  },
  {
    id: 7,
    text: 'Última pregunta para finalizar el análisis: en una escala de 1 a 4, ¿cuánto quieres recuperar esta relación?',
    options: ['1 - NO ESTOY SEGURO', '2 - LO ESTOY CONSIDERANDO', '3 - LO QUIERO MUCHO', '4 - LO QUIERO CON TODA MI ALMA'],
    response: '¡Análisis completo! Tu nivel de compromiso define la intensidad del protocolo. Cuanto más comprometido estés, más poderosas serán las técnicas que voy a revelarte. Ahora tengo todo lo que necesito para mostrarte el camino exacto para reconquistar a ella.',
    dataKey: 'commitmentLevel',
  }
];

export default function Chat({ onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(BASE_PROGRESS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // ✅ SISTEMA DE PRESERVAÇÃO DE UTMs
  // ========================================
  const ensureUTMs = () => {
    try {
      const storedUTMs = localStorage.getItem('quiz_utms');
      if (storedUTMs) {
        const utms = JSON.parse(storedUTMs);
        console.log('✅ UTMs preservadas no Chat:', utms);
        if (window.location.search === '' && Object.keys(utms).length > 0) {
          const utmString = Object.entries(utms)
            .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
            .join('&');
          window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
          console.log('✅ UTMs anexadas à URL do Chat');
        }
      } else {
        console.log('ℹ️ Nenhuma UTM armazenada encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao preservar UTMs:', error);
    }
  };

  // ========================================
  // ✅ GARANTE gender = 'HOMBRE' NO STORAGE
  // ========================================
  // Sem a pergunta de gênero, quizData.gender ficaria '' e o
  // contentByGender.getCopy cairia no pronome errado.
  // Isso grava 'HOMBRE' antes de qualquer página consumir o dado.
  const ensureGender = () => {
    try {
      const quizData = storage.getQuizData();
      if (!quizData.gender) {
        quizData.gender = 'HOMBRE';
        storage.saveQuizData(quizData);
      }
    } catch (error) {
      console.error('❌ Erro ao garantir gênero:', error);
    }
  };

  useEffect(() => {
    ensureUTMs();
    ensureGender();
    ga4Tracking.chatPageView();
    ga4Tracking.chatStarted();

    // ✅ APRESENTAÇÃO DA SOPHIA (autoridade + promessa)
    const initialMessage: Message = {
      type: 'bot',
      text: 'Hola, soy Sophia Sanchez, especialista en reconquista y psicología conductual. Voy a hacerte 6 preguntas para armar tu plan.',
      isTyping: true,
    };
    setMessages([initialMessage]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages([{ ...initialMessage, isTyping: false }]);
      optionsTimeoutRef.current = setTimeout(() => {
        askQuestion(0);
      }, DELAY_SHOW_OPTIONS);
    }, initialMessage.text.length * TYPE_SPEED);

    return () => {
      if (typewriterTimeoutRef.current) clearTimeout(typewriterTimeoutRef.current);
      if (optionsTimeoutRef.current) clearTimeout(optionsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askQuestion = (questionIndex: number) => {
    const question = QUESTIONS[questionIndex];
    const newMessage: Message = {
      type: 'bot',
      text: question.text,
      isTyping: true,
    };
    setMessages(prev => [...prev, newMessage]);
    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages(prev => prev.map((msg, idx) =>
        idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
      ));
      optionsTimeoutRef.current = setTimeout(() => {
        setShowOptions(true);
        setIsProcessing(false);
      }, DELAY_SHOW_OPTIONS);
    }, question.text.length * TYPE_SPEED);
  };

  const handleAnswer = (option: string) => {
    playKeySound();
    const question = QUESTIONS[currentQuestion];
    setMessages(prev => [...prev, { type: 'user', text: option }]);
    setShowOptions(false);
    setIsProcessing(true);

    const answer: QuizAnswer = {
      questionId: question.id,
      question: question.text,
      answer: option,
    };

    const quizData = storage.getQuizData();
    quizData.answers.push(answer);
    quizData[question.dataKey] = option;
    storage.saveQuizData(quizData);

    ga4Tracking.questionAnswered(question.id, question.text, option);

    const stepSize = (100 - BASE_PROGRESS) / QUESTIONS.length;
    const newProgress = BASE_PROGRESS + (currentQuestion + 1) * stepSize;
    setProgress(newProgress);

    setTimeout(() => {
      setIsProcessing(false);

      // Resposta por opção escolhida; fallback para a resposta padrão
      const responseText =
        (question.responseByOption && question.responseByOption[option]) ||
        question.response;

      const responseMessage: Message = {
        type: 'bot',
        text: responseText,
        isTyping: true,
      };
      setMessages(prev => [...prev, responseMessage]);

      typewriterTimeoutRef.current = setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
        ));

        if (currentQuestion < QUESTIONS.length - 1) {
          optionsTimeoutRef.current = setTimeout(() => {
            setCurrentQuestion(currentQuestion + 1);
            askQuestion(currentQuestion + 1);
          }, DELAY_BEFORE_NEXT_QUESTION);
        } else {
          ga4Tracking.chatCompleted();
          optionsTimeoutRef.current = setTimeout(() => {
            const finalMessage: Message = {
              type: 'bot',
              text: 'Análisis concluido. Tu plan personalizado está listo para ser revelado. Haz clic abajo para accederlo.',
              isTyping: true,
            };
            setMessages(prev => [...prev, finalMessage]);
            typewriterTimeoutRef.current = setTimeout(() => {
              setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
              ));
              optionsTimeoutRef.current = setTimeout(() => {
                setShowOptions(true);
                setIsProcessing(false);
              }, DELAY_SHOW_OPTIONS);
            }, finalMessage.text.length * TYPE_SPEED);
          }, DELAY_BEFORE_FINAL);
        }
      }, responseText.length * TYPE_SPEED);
    }, DELAY_BEFORE_RESPONSE);
  };

  const handleViewPlan = () => {
    ga4Tracking.chatCTAClick();
    onNavigate('resultado');
  };

  // Com opções fixas, não há mais leitura de gender por render.
  const getQuestionOptions = (question: Question): string[] => {
    return question.options;
  };

  const isComplete = progress >= 100;
  const quizData = storage.getQuizData();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">ANÁLISIS: {Math.round(progress)}%</p>
        {isProcessing && (
          <p className="processing-text">ANALIZANDO TU CASO...</p>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="avatar-small">SS</div>
            )}
            <div className="message-bubble">
              {msg.isTyping ? (
                <TypewriterText text={msg.text} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
          </div>
        )}

        {showOptions && currentQuestion >= 0 && currentQuestion < QUESTIONS.length && !isComplete && (
          <div className="options-container">
            {getQuestionOptions(QUESTIONS[currentQuestion]).map((option, idx) => (
              <button key={idx} className="option-button" onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        {showOptions && isComplete && (
          <div className="options-container">
            <div 
              className="completion-badge" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(74, 222, 128, 0.1))',
                borderRadius: '16px',
                marginBottom: '16px',
                border: '2px solid rgba(234, 179, 8, 0.5)',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)'
              }}
            >
              <div style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: '900',
                color: 'rgb(250, 204, 21)',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                {getCompletionBadge(quizData.gender || 'HOMBRE').title}
              </div>
              <div style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: 'white',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {getCompletionBadge(quizData.gender || 'HOMBRE').subtitle}
              </div>
            </div>
            <button className="option-button cta-final" onClick={handleViewPlan}>
              VER MI PLAN PERSONALIZADO
            </button>
            <p className="completion-count">+9.247 planes revelados</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, TYPE_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}<span className="cursor">▋</span></span>;
}