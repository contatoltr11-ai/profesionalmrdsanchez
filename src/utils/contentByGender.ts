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
 * TESTE 2 (14/11/2026): Diagnóstico com a Obsesión Inversa.
 * Toda resposta vira boa notícia + "tu disparador clave" conforme a situação.
 * Texto renderizado com pre-line (sem markdown).
 */
export function getCopy(quizData: QuizData): string {
    const whoEnded = quizData.whoEnded || '';
    const timeSeparation = quizData.timeSeparation || '';
    const currentSituation = quizData.currentSituation || '';
    const exSituation = quizData.exSituation || '';

    // 1. Quem terminou
    let intro = '';
    if (whoEnded.includes('ELLA TERMINÓ') || whoEnded.includes('ÉL TERMINÓ')) {
        intro = 'Ella no se fue de un día para otro. Se fue cansando, poco a poco, de algo que veía en la relación. Y eso es una buena noticia: lo que se apagó por desgaste se puede volver a encender, si dejas de hacer lo que la cansó.';
    } else if (whoEnded.includes('YO TERMINÉ')) {
        intro = 'Cuando tú terminaste, ella se sintió rechazada y levantó una defensa. Por eso, si hoy la buscas de frente, se cierra más. El camino es que vuelva a verte sin sentirse presionada.';
    } else if (whoEnded.includes('DECISIÓN MUTUA')) {
        intro = 'Cuando la decisión es de los dos, nadie quedó con la herida del rechazo. Eso juega a tu favor: no hay una herida que reparar, hay un interés que volver a despertar.';
    }

    // 2. Tempo de separação
    let urgency = '';
    if (timeSeparation.includes('MENOS DE 1 SEMANA') || timeSeparation.includes('1-4 SEMANAS')) {
        urgency = 'Todavía estás a tiempo de hacerlo bien. Ella sigue pensando en ti, pero lo que hagas en los próximos días puede acercarla o alejarla.';
    } else if (timeSeparation.includes('1-6 MESES')) {
        urgency = 'Ya pasó un tiempo, y eso no la cerró. Lo que sí pasa es que se está acostumbrando a vivir sin ti. Por eso ahora importa más el cuándo que el qué.';
    } else if (timeSeparation.includes('MÁS DE 6 MESES')) {
        urgency = 'Pasaron meses, y aun así no está cerrado. Una mujer no olvida años en meses. Solo necesita un motivo nuevo para mirarte distinto.';
    }

    // 3. Situação de contato
    const sinContacto =
        currentSituation.includes('CONTACTO CERO') ||
        currentSituation.includes('ME IGNORA') ||
        currentSituation.includes('BLOQUEADO');
    const insight = sinContacto
        ? 'El silencio no es el final. Pero el silencio solo no la trae de vuelta: mientras tú esperas, ella se acostumbra. Lo que la hace volver es reaparecer en el momento exacto y de la forma correcta.'
        : 'Que todavía hablen es una puerta abierta. El problema no es llegar a ella, es cómo te ve cuando le hablas. Si cada conversación se siente igual que antes, nada cambia.';

    // 4. Ela está com outro?
    const conOtro =
        exSituation.includes('RELACIÓN SERIA') ||
        exSituation.includes('SALIENDO CASUAL') ||
        exSituation.includes('VARIAS PERSONAS');
    const otroInsight = conOtro
        ? 'Y que esté con otro no cierra la puerta. Muchas veces es su forma de no pensar en ti.'
        : '';

    // 5. Disparador clave (prioridade: com outro > ainda falam > sem contato)
    let disparador: string;
    if (conOtro) {
        disparador = 'Tu disparador clave: La Pérdida\nEn tu caso, ella necesita sentir que puede perderte de verdad. Mientras te sienta disponible, no tiene por qué elegirte.';
    } else if (currentSituation && !sinContacto) {
        disparador = 'Tu disparador clave: La Nostalgia\nEn tu caso, ella ya te ve. Falta que vuelva a recordar lo que sentía contigo, y no al hombre de las últimas peleas.';
    } else {
        disparador = 'Tu disparador clave: La Curiosidad\nEn tu caso, el primer paso no es escribirle. Es que ella note que algo cambió en ti, sin que tú se lo digas.';
    }

    return [
        'No fue por falta de amor.',
        intro,
        urgency,
        insight,
        otroInsight,
        disparador,
        'Los 3 disparadores se aplican en orden, pero en tu caso todo depende de este.',
        'La clave no es rogar ni desaparecer. Es saber qué hacer y en qué momento. En el siguiente paso te muestro cómo funciona en tu caso.'
    ].filter(Boolean).join('\n\n');
}

// TESTE 2: Ventana 72h ligada à Obsesión Inversa (sem "psicólogos conductuales")
export function getVentana72Copy(_gender: string): string {
    return `No importa si se separaron hace 3 días o hace 3 meses.

Hoy el obsesionado eres tú: miras si vio tu historia, relees sus mensajes, escribes y borras.

La Obsesión Inversa da vuelta a eso. Con 3 disparadores, en el orden y el momento correctos, ella empieza a pensar en ti.

En cada fase hay cosas que hacer y cosas que NO hacer.

✅ Si haces lo correcto en cada fase, ella te busca.

❌ Si te equivocas, se cierra todavía más.

Tu plan te dice exactamente qué hacer en cada fase, en tu caso.`;
}

// Sumário rápido das 3 fases = 3 disparadores
export function getVentanaSummary(_gender: string): string[] {
    return [
        '🎯 Disparador 1 · La Curiosidad (0 a 24 h)',
        '💡 Disparador 2 · La Nostalgia (24 a 48 h)',
        '❤️ Disparador 3 · La Pérdida (48 a 72 h)'
    ];
}

// Por qué la Ventana es crucial
export function getVentanaImportance(): string[] {
    return [
        '🔁 Hoy el obsesionado eres tú. Esto lo da vuelta',
        '⏰ Cada disparador tiene su momento dentro de las 72 horas',
        '🎯 En el momento correcto, ella da el paso',
        '⚠️ Fuera de tiempo, la alejas más que antes'
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
    const fases: Record<number, { title: string; timeRange: string; summary: string; bullets: string[]; warning: string }> = {
        1: {
            title: 'Disparador 1 · La Curiosidad',
            timeRange: '0-24 HORAS',
            summary: 'Ella nota que algo cambió en ti y empieza a preguntarse qué pasa.',
            bullets: [
                '✓ Sale del "alivio" de después de la ruptura',
                '✓ Nota que ya no la persigues',
                '✓ Se pregunta: "¿Qué le pasa? ¿Ya me olvidó?"',
                '✓ Vuelve a mirar tus historias'
            ],
            warning: '⚠️ Si aquí le escribes un mensaje largo o le pides volver, le confirmas que hizo bien en irse.'
        },

        2: {
            title: 'Disparador 2 · La Nostalgia',
            timeRange: '24-48 HORAS',
            summary: 'Ella vuelve a recordar lo bueno, y lo malo pierde peso.',
            bullets: [
                '✓ Vuelven los buenos momentos que había guardado',
                '✓ Deja de verte como el hombre de las últimas peleas',
                '✓ Su defensa empieza a bajar',
                '✓ Siente ganas de saber de ti'
            ],
            warning: '⚠️ Si presionas en este momento, se asusta y te cierra la puerta. Y una puerta que se cierra dos veces es mucho más difícil de abrir.'
        },

        3: {
            title: 'Disparador 3 · La Pérdida',
            timeRange: '48-72 HORAS',
            summary: 'Ella siente que te puede perder de verdad, y da el paso.',
            bullets: [
                '✓ Siente que ya no estás disponible como antes',
                '✓ Le da miedo que otra ocupe su lugar',
                '✓ Busca una excusa para escribirte o verte',
                '✓ Aquí reapareces, con el mensaje correcto'
            ],
            warning: '⚠️ Aquí se pierde la mayoría. Reaparecen tarde o con el mensaje equivocado, y ella lo toma como la prueba de que nada cambió.'
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