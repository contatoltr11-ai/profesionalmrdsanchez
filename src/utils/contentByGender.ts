import { QuizData } from '../types/quiz';

// 
// FUNÇÕES DE PERSONALIZAÇÃO POR GÊNERO
// 

export function getTitle(gender: string): string {
    return gender === 'HOMBRE' 
        ? 'Por Qué Ella Se Fue' 
        : 'Por Qué Él Se Fue';
}

export function getLoadingMessage(gender: string): string {
    return gender === 'HOMBRE'
        ? 'Generando tu protocolo específico para reconquistarla...'
        : 'Generando tu protocolo específico para reconquistar a él...';
}

/**
 * ALTERAÇÃO #6: Diagnóstico Ultra-Personalizado
 * Transforma os dados do quiz em una narrativa de autoridade e empatia.
 */
export function getCopy(quizData: QuizData): string {
    const pronoun = quizData.gender === 'HOMBRE' ? 'ella' : 'él';
    const exPronoun = quizData.gender === 'HOMBRE' ? 'Ella' : 'Él';
    
    const whoEnded = quizData.whoEnded || '';
    const timeSeparation = quizData.timeSeparation || '';
    const currentSituation = quizData.currentSituation || '';
    const reason = quizData.reason || '';

    // 
    // 1. LÓGICA DE INTRODUÇÃO (QUEM TERMINOU) - CORRIGIDA
    // 
    let intro = '';
    
    // Caso 1: ELA/ELE TERMINOU
    if (whoEnded.includes('ELLA TERMINÓ') || whoEnded.includes('ÉL TERMINÓ')) {
        intro = `Basado en que ${exPronoun} decidió terminar la relación, entendemos que hubo un desgaste en los "interruptores de valor" que ${pronoun} percibía en ti. `;
    } 
    // Caso 2: EU TERMINEI
    else if (whoEnded.includes('YO TERMINÉ')) {
        intro = `Considerando que fuiste tú quien terminó, el desafío ahora es revertir el sentimiento de rechazo que ${pronoun} procesó, transformándolo en una nueva oportunidad. `;
    }
    // Caso 3: DECISÃO MÚTUA
    else if (whoEnded.includes('DECISIÓN MUTUA')) {
        intro = `Considerando que la decisión fue mutua, el desafío ahora es identificar si aún existe interés genuino de ambas partes y reconstruir la atracción desde cero. `;
    }
    // Caso 4: FALLBACK (valor inesperado ou vazio)
    else {
        intro = `Considerando el contexto de la ruptura, el desafío ahora es comprender las dinámicas emocionales que llevaron a este punto y revertirlas estratégicamente. `;
    }

    // 
    // 2. LÓGICA DE URGÊNCIA (TEMPO DE SEPARAÇÃO) - MELHORADA
    // 
    let urgency = '';
    if (timeSeparation.includes('MENOS DE 1 SEMANA') || timeSeparation.includes('1-4 SEMANAS')) {
        urgency = `Estás en la **ventana de tiempo IDEAL**. El cerebro de ${pronoun} aún tiene rastros químicos de tu presencia, lo que facilita la reconexión si actúas ahora. `;
    } else if (timeSeparation.includes('1-6 MESES')) {
        urgency = `Aunque ha pasado tiempo (${timeSeparation}), la neurociencia explica que las memorias emocionales pueden ser reactivadas mediante los estímulos correctos. `;
    } else if (timeSeparation.includes('MÁS DE 6 MESES')) {
        urgency = `Aunque ha pasado tiempo (${timeSeparation}), la neurociencia explica que las memorias emocionales pueden ser reactivadas mediante los estímulos correctos. `;
    }

    // 
    // 3. LÓGICA DE CONTATO (SITUAÇÃO ATUAL) - MELHORADA
    // 
    let insight = '';
    if (currentSituation.includes('CONTACTO CERO') || currentSituation.includes('ME IGNORA') || currentSituation.includes('BLOQUEADO')) {
        insight = `El hecho de que no haya contacto es, irónicamente, tu mayor ventaja. Estamos en la fase de "limpieza de picos de cortisol", preparando el terreno para un regreso impactante. `;
    } else {
        insight = `El contacto actual indica que el hilo emocional no se ha cortado, pero debemos tener cuidado de no saturar su sistema de dopamina con desesperación. `;
    }

    // 4. Motivo da Ruptura
    let reasonInsight = '';
    if (reason) {
        reasonInsight = `Al analizar que el motivo principal fue "${reason}", el protocolo se enfocará en neutralizar esa objeción específica en el subconsciente de ${pronoun}. `;
    }

    return `No fue por falta de amor.

${intro}

${urgency}

${insight}

${reasonInsight}

La clave no es rogar, sino entender la psicología de ${pronoun} y actuar de forma estratégica. En el siguiente paso, voy a revelar EXACTAMENTE el paso a paso científico para que ${pronoun} sienta que SÍ eres la persona correcta.`;
}

// ✅ INSTRUÇÃO #9: Sumário rápido + Instrução #6: Explicação da importância
export function getVentana72Copy(gender: string): string {
    const pronoun = gender === 'HOMBRE' ? 'ella' : 'él';
    
    return `No importa si se separaron hace 3 días o hace 3 meses.

Aquí está la verdad que los psicólogos conductuales descubrieron:

El cerebro humano opera en ciclos de 72 horas.

Cada vez que tú tomas una ACCIÓN ESTRATÉGICA, el cerebro de ${pronoun} entra en un nuevo ciclo de 72 horas donde todo puede cambiar.

—

Aquí está lo crucial:

En cada una de estas 3 fases, hay acciones CORRECTAS e INCORRECTAS.

✅ Si actúas correcto en cada fase, ${pronoun} te busca.

❌ Si actúas incorrecto, su cerebro borra la atracción.

—

Tu plan personalizado revela EXACTAMENTE qué hacer en cada fase.`;
}

// ✅ NOVO: Sumário rápido das 3 fases (Instrução #9)
export function getVentanaSummary(gender: string): string[] {
    return [
        '🎯 Fase 1: Activar curiosidad y romper expectativas',
        '💡 Fase 2: Restaurar valor percibido sin presión',
        '❤️ Fase 3: Crear oportunidad de reconexión emocional'
    ];
}

// ✅ NOVO: Explicação da importância (Instrução #6)
export function getVentanaImportance(): string[] {
    return [
        '🔬 Respaldado por neurociencia del comportamiento',
        '⏰ Cada ciclo de 72h reescribe memorias emocionales',
        '🎯 Actuar correcto = atracción renovada',
        '⚠️ Actuar incorrecto = cierre emocional definitivo'
    ];
}

export function getOfferTitle(gender: string): string {
    return gender === 'HOMBRE'
        ? 'Tu Plan para Reconquistar a Ella'
        : 'Tu Plan para Reconquistar a Él';
}

export function getFeatures(gender: string): string[] {
    const pronoun = gender === 'HOMBRE' ? 'Ella' : 'Él';
    const pronounLower = gender === 'HOMBRE' ? 'ella' : 'él';
    const another = gender === 'HOMBRE' ? 'otro' : 'otra';
    
    return [
        `📱 MÓDULO 1: Cómo Hablar Con ${pronoun} (Días 1-7)`,
        `👥 MÓDULO 2: Cómo Encontrarte Con ${pronoun} (Días 8-14)`,
        `❤️ MÓDULO 3: Cómo Reconquistar${pronounLower === 'ella' ? 'la' : 'lo'} (Días 15-21)`,
        `🚨 MÓDULO 4: Protocolo de Emergencia (Si ${pronounLower} está con ${another})`,
        '⚡ Guía especial: Las 3 Fases de 72 Horas',
        '🎯 Bonos: Scripts de conversación + Planes de acción',
        '✅ Garantía: 30 días o tu dinheiro de vuelta'
    ];
}

export function getCTA(gender: string): string {
    return gender === 'HOMBRE'
        ? 'SÍ, QUIERO MI PLAN PARA RECONQUISTAR A ELLA'
        : 'SÍ, QUIERO MI PLAN PARA RECONQUISTAR A ÉL';
}

export function getCompletionBadge(gender: string): { title: string; subtitle: string } {
    const pronoun = gender === 'HOMBRE' ? 'ella' : 'él';
    
    return {
        title: '¡TU ANÁLISIS ESTÁ LISTO!',
        subtitle: `Descubre exactamente por qué ${pronoun} se fue y el paso a paso científico para que ${pronoun} QUIERA volver`
    };
}

// ✅ REFATORADO: Agora retorna objeto estruturado (Instruções #2, #3, #8)
export function getFaseText(gender: string, fase: number): { 
    title: string; 
    timeRange: string;
    summary: string; 
    bullets: string[];
    warning: string;
} {
    const pronoun = gender === 'HOMBRE' ? 'Ella' : 'Él';
    const pronounLower = gender === 'HOMBRE' ? 'ella' : 'él';
    const oppositeGender = gender === 'HOMBRE' ? 'él' : 'ella';
    
    const fases: Record<number, { title: string; timeRange: string; summary: string; bullets: string[]; warning: string }> = {
        1: {
            title: 'Activación de Curiosidad',
            timeRange: '0-24 HORAS',
            summary: `${pronoun} recibe la primera señal de que algo cambió en ti y su cerebro activa el "modo curiosidad"`,
            bullets: [
                `✨ ${pronoun} abandona el "modo alivio" post-ruptura`,
                '🧠 Su cerebro detecta cambios en tu comportamiento',
                `💭 Empieza a preguntarse: "¿Qué está pasando con ${oppositeGender}?"`,
                '🔄 Se activa el circuito de curiosidad neurológica'
            ],
            warning: `⚠️ Si actúas incorrectamente aquí, confirmas que ${pronounLower} tomó la decisión correcta`
        },
        
        2: {
            title: 'Restauración de Valor Percibido',
            timeRange: '24-48 HORAS',
            summary: `${pronoun} empieza a reevaluar las memorias archivadas y la oxitocina se reactiva`,
            bullets: [
                `🧬 La oxitocina (hormona del apego) vuelve a activarse`,
                `💫 Los buenos momentos que ${pronounLower} había "olvidado" regresan a su mente`,
                '🎭 Su cerebro reconstruye tu imagen de forma más positiva',
                '🔓 Las defensas emocionales empiezan a debilitarse'
            ],
            warning: `⚠️ Si presionas demasiado, ${pronounLower} cierra el ciclo y te bloquea definitivamente`
        },
        
        3: {
            title: 'Reconexión Estratégica',
            timeRange: '48-72 HORAS',
            summary: `${pronoun} siente la necesidad de "cerrar el ciclo" emocionalmente y aquí reapareces con el Protocolo`,
            bullets: [
                `🎯 ${pronoun} busca una resolución emocional definitiva`,
                '💝 El apego latente busca expresión consciente',
                '🚪 Aquí es donde tú reapareces de forma estratégica',
                '⚡ Momento crítico para aplicar el Protocolo de Reconexión'
            ],
            warning: '⚠️ 87% de las personas pierden a su ex en esta fase por no saber qué hacer'
        }
    };
    
    return fases[fase] || {
        title: '',
        timeRange: '',
        summary: '',
        bullets: [],
        warning: ''
    };
}