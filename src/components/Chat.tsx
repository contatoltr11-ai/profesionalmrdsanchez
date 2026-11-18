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
  dataKey: 'gender' | 'timeSeparation' | 'whoEnded' | 'relationshipDuration' | 'currentSituation' | 'exSituation' | 'commitmentLevel' | 'mainCause' | 'mainPain' | 'mainFear';
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

// Foto da Sophia no avatar do chat (fallback automático para "SS" se não carregar)
const SOPHIA_AVATAR_URL = 'https://ssplan.shop/wp-content/uploads/2026/11/ss-chat.webp';

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
    text: 'Empecemos. ¿Cuánto tiempo ha pasado desde que se separaron?',
    options: ['MENOS DE 1 SEMANA', '1-4 SEMANAS', '1-6 MESES', 'MÁS DE 6 MESES'],
    response: 'Entiendo.',
    responseByOption: {
      'MENOS DE 1 SEMANA': 'Está muy reciente, y eso juega a tu favor: ella todavía tiene todo a flor de piel. Pero también es cuando más fácil es equivocarse. Vamos con calma.',
      '1-4 SEMANAS': 'Es justo cuando ella empieza a sentir el vacío, aunque todavía no lo admita. Bien usado, este tiempo te ayuda.',
      '1-6 MESES': 'Ya pasó un tiempo, y eso no cierra nada. Lo que hagas desde hoy pesa más que todo lo que pasó en estos meses.',
      'MÁS DE 6 MESES': 'Muchos llegan aquí pensando que ya es tarde. Por lo que veo todos los días, no lo es. El camino es otro, nada más.'
    },
    dataKey: 'timeSeparation',
  },
  {
    // TESTE 4 (lab planreconquista): culpa no lugar de "quién terminó"
    id: 8,
    text: 'Y dime algo con sinceridad: ¿qué crees que la fue alejando?',
    options: ['MIS CELOS O MI CARÁCTER', 'ME ENFOQUÉ EN TRABAJAR Y LA DESCUIDÉ', 'PELEAS QUE LA FUERON CANSANDO', 'UNA INFIDELIDAD O UNA MENTIRA', 'DEJÓ DE SENTIR Y NO SÉ POR QUÉ'],
    response: 'Gracias por contármelo.',
    responseByOption: {
      'MIS CELOS O MI CARÁCTER': 'Gracias por decírmelo. Que lo reconozcas ya te pone por delante de la mayoría. Eso se corrige, y ella lo va a notar.',
      'ME ENFOQUÉ EN TRABAJAR Y LA DESCUIDÉ': 'Lo escucho mucho: hombres que lo dieron todo trabajando y pensaron que eso bastaba. Ella necesitaba sentirlo de otra forma, y eso todavía se puede mostrar.',
      'PELEAS QUE LA FUERON CANSANDO': 'Las peleas cansan, pero no borran lo que sintieron. Lo que se desgastó de a poco se puede recuperar.',
      'UNA INFIDELIDAD O UNA MENTIRA': 'Es de los casos más difíciles, no te voy a mentir. Pero he visto a muchos hombres volver después de un error así. Lo que va a contar es lo que ella vea en ti desde hoy.',
      'DEJÓ DE SENTIR Y NO SÉ POR QUÉ': 'Esa frase duele, lo sé. Pero casi nunca significa que el amor se acabó.'
    },
    dataKey: 'mainCause',
  },
  {
    // TESTE 4: dor no lugar de "cuánto tiempo estuvieron juntos"
    id: 9,
    text: 'Ahora quiero entenderte mejor. ¿Qué es lo que más te duele hoy?',
    options: ['QUE ME DEJE EN VISTO', 'VIVIR CON ELLA COMO DOS DESCONOCIDOS', 'IMAGINARLA CON OTRO', 'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE', 'LLEGAR A CASA Y NO SENTIR EL CALOR DE HOGAR'],
    response: 'Te entiendo.',
    responseByOption: {
      'QUE ME DEJE EN VISTO': 'Ver el mensaje leído y sin respuesta angustia mucho, y es normal que lo revises a cada rato. Te adelanto algo: insistir más no la acerca. Hay otra forma, y te la voy a mostrar.',
      'VIVIR CON ELLA COMO DOS DESCONOCIDOS': 'Estar cerca y sentirse invisible es de lo más duro que hay. Y tiene arreglo: muchas veces empieza por que ella vuelva a verte distinto.',
      'IMAGINARLA CON OTRO': 'Esa imagen no te deja dormir, lo sé. Lo que imaginas casi siempre es peor que lo que pasa de verdad. Y aunque hubiera alguien, eso no cierra la puerta.',
      'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE': 'Esa frase confunde mucho, porque abre y cierra la puerta al mismo tiempo. Si todavía te quiere, hay algo con qué trabajar. Falta que vuelva a elegirte.',
      'LLEGAR A CASA Y NO SENTIR EL CALOR DE HOGAR': 'Extrañar tu casa, tu familia, la rutina con ella… es lo que más pesa en relaciones largas. Y justo por esa historia, hay mucho de dónde reconstruir.'
    },
    dataKey: 'mainPain',
  },
  {
    id: 5,
    text: 'Gracias por contarme. ¿Cómo está hoy el contacto entre ustedes?',
    options: ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO', 'SÓLO TEMAS NECESARIOS', 'VIVIMOS JUNTOS PERO DISTANTES', 'HABLAMOS A VECES', 'SOMOS AMIGOS', 'ENCUENTROS ÍNTIMOS'],
    response: 'Entiendo.',
    responseByOption: {
      'CONTACTO CERO': 'El contacto cero se siente como hacer lo correcto, pero mientras tú esperas, ella se acostumbra. Más adelante te explico cuándo romperlo.',
      'ME IGNORA': 'Cuando ignora, casi siempre es una defensa, no indiferencia. Y las defensas bajan cuando dejas de empujar.',
      'BLOQUEADO': 'El bloqueo parece el final, pero muchas veces es lo contrario: se bloquea a quien todavía le mueve algo por dentro.',
      'SÓLO TEMAS NECESARIOS': 'Que todavía hablen, aunque sea de lo necesario, es una puerta abierta. Lo importante es cómo te ve en esas conversaciones.',
      'VIVIMOS JUNTOS PERO DISTANTES': 'Vivir bajo el mismo techo y sentirse lejos duele mucho. Pero verla todos los días es una ventaja enorme si sabes qué hacer y qué no.',
      'HABLAMOS A VECES': 'Que hablen de vez en cuando es muy buena señal. El canal está abierto, falta cambiar lo que ella siente cuando habla contigo.',
      'SOMOS AMIGOS': 'La amistad puede ser una trampa o un puente. Depende de lo que hagas en las próximas semanas.',
      'ENCUENTROS ÍNTIMOS': 'Si todavía hay intimidad, la atracción sigue viva. Falta que vuelva a verte como su pareja.'
    },
    dataKey: 'currentSituation',
  },
  {
    id: 6,
    text: '¿Y ella ya está con otra persona?',
    options: ['ESTÁ SOLTERA', 'NO ESTOY SEGURO', 'SALIENDO CASUAL', 'RELACIÓN SERIA', 'VARIAS PERSONAS'],
    response: 'Entiendo.',
    responseByOption: {
      'ESTÁ SOLTERA': 'Bien. Si está sola, nadie está ocupando tu lugar. Ese espacio es tuyo, pero no va a esperar para siempre.',
      'NO ESTOY SEGURO': 'Tranquilo, es lo más común. Tu plan va a servir en los dos casos.',
      'SALIENDO CASUAL': 'Si es algo casual, no hay nada firme. No compitas con él: lo que funciona es que ella vuelva a comparar, sin que tú la presiones.',
      'RELACIÓN SERIA': 'Duele, lo sé. Pero muchas veces una relación nueva es la forma de no pensar en lo que dejó. No vas a competir con él. Vas a hacer que recuerde lo que tenía contigo.',
      'VARIAS PERSONAS': 'Si está con varias personas, está buscando algo que todavía no encuentra. Eso dice mucho de lo que siente.'
    },
    dataKey: 'exSituation',
  },
  {
    // TESTE 4: medo da perda no lugar da escala de compromiso 1-4
    id: 10,
    text: 'Última pregunta, y es la más importante. Si no haces nada, ¿qué es lo que más miedo te da?',
    options: ['QUE SE ACOSTUMBRE A VIVIR SIN MÍ', 'QUE SE ENAMORE DE OTRO', 'PERDER A MI FAMILIA', 'QUE VOLVAMOS Y PASE LO MISMO'],
    response: 'Te entiendo.',
    responseByOption: {
      'QUE SE ACOSTUMBRE A VIVIR SIN MÍ': 'Ese miedo tiene sentido: el tiempo sin hacer nada sí juega en contra. Por eso tu plan empieza hoy, no cuando te sientas listo.',
      'QUE SE ENAMORE DE OTRO': 'Es el miedo de casi todos los hombres que me escriben. Por eso no puedes quedarte quieto ni actuar por impulso. Hay un momento para cada paso.',
      'PERDER A MI FAMILIA': 'Cuando hay hijos y años de historia, hay más en juego. Y también más de dónde reconstruir. No es tarde.',
      'QUE VOLVAMOS Y PASE LO MISMO': 'Me gusta que lo pienses. Volver no sirve si todo sigue igual. Por eso el plan no es solo para que vuelva, es para que esta vez funcione.'
    },
    dataKey: 'mainFear',
  }
];

export default function Chat({ onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(BASE_PROGRESS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  // Se a foto da Sophia não carregar, volta para as iniciais "SS"
  const [avatarFailed, setAvatarFailed] = useState(false);
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

    // ✅ APRESENTAÇÃO DA SOPHIA (TESTE 4): duas mensagens curtas, estilo WhatsApp
    const intro1: Message = {
      type: 'bot',
      text: 'Hola, soy Sophia. Ya acompañé a más de 9.000 hombres que estaban justo donde estás tú ahora.',
      isTyping: true,
    };
    const intro2: Message = {
      type: 'bot',
      text: 'Te voy a hacer 6 preguntas rápidas. Con tus respuestas te digo cuál de los 3 disparadores pesa más en tu caso. Lo que respondas queda entre tú y yo.',
      isTyping: true,
    };
    setMessages([intro1]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages([{ ...intro1, isTyping: false }, intro2]);
      typewriterTimeoutRef.current = setTimeout(() => {
        setMessages([{ ...intro1, isTyping: false }, { ...intro2, isTyping: false }]);
        optionsTimeoutRef.current = setTimeout(() => {
          askQuestion(0);
        }, DELAY_SHOW_OPTIONS);
      }, intro2.text.length * TYPE_SPEED);
    }, intro1.text.length * TYPE_SPEED);

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
              text: 'Listo. Ya sé cuál es tu disparador clave. Toca abajo y te lo muestro.',
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
              avatarFailed ? (
                <div className="avatar-small">SS</div>
              ) : (
                <img
                  src={SOPHIA_AVATAR_URL}
                  alt="Sophia Sanchez"
                  className="avatar-small"
                  width={40}
                  height={40}
                  decoding="async"
                  onError={() => setAvatarFailed(true)}
                  style={{ objectFit: 'cover', objectPosition: '50% 35%', padding: 0 }}
                />
              )
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
            <p className="completion-count">Más de 9.000 hombres ya vieron su plan</p>
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