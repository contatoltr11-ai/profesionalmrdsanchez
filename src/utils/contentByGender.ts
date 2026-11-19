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
 * Disparador clave do lead (prioridade: com outro > ainda falam > sem contato).
 * Usado no diagnóstico e na página de oferta, para os dois mostrarem o mesmo.
 */
export function getDisparadorClave(quizData: QuizData): { nombre: string; texto: string } {
    const currentSituation = quizData.currentSituation || '';
    const exSituation = quizData.exSituation || '';
    const sinContacto =
        currentSituation.includes('CONTACTO CERO') ||
        currentSituation.includes('ME IGNORA') ||
        currentSituation.includes('BLOQUEADO');
    const conOtro =
        exSituation.includes('RELACIÓN SERIA') ||
        exSituation.includes('SALIENDO CASUAL') ||
        exSituation.includes('VARIAS PERSONAS');

    if (conOtro) {
        return { nombre: 'La Pérdida', texto: 'Su cerebro libera dopamina cuando siente que puede perderte de verdad. Mientras te sienta disponible, no tiene por qué elegirte.' };
    }
    if (currentSituation && !sinContacto) {
        return { nombre: 'La Nostalgia', texto: 'Ella ya te ve. Falta que su cerebro vuelva a asociarte con lo que sentía al principio, y no con el hombre de las últimas peleas. Cuando vuelve el cariño, las ganas vienen detrás.' };
    }
    return { nombre: 'La Curiosidad', texto: 'El primer paso no es escribirle. Es que note que algo cambió en ti sin que se lo digas. Su cerebro no soporta una pregunta sin respuesta, y tú te conviertes en esa pregunta.' };
}

/**
 * Ventana 72h (lab 18/11): bloco "En tu caso".
 * Liga a Ventana ao disparador clave do diagnóstico (marca a fase dele) e
 * traduz a Ventana para a situação de contato que ele respondeu.
 */
export function getVentanaEnTuCaso(quizData: QuizData): { fase: number; nombre: string; claveTexto: string; situacionTexto: string } {
    const { nombre } = getDisparadorClave(quizData);
    const fase = nombre === 'La Pérdida' ? 3 : nombre === 'La Nostalgia' ? 2 : 1;
    const claveTexto = fase === 1
        ? 'Las 3 fases van siempre en este orden, porque cada una prepara la siguiente. En tu caso, la Fase 1 es la que decide: si aquí te equivocas, las otras dos no llegan. Más abajo te la marqué.'
        : `Las 3 fases van siempre en este orden, porque cada una prepara la siguiente. Pero en tu caso, la Fase ${fase} es la que decide: ${fase === 2 ? 'la Fase 1 la prepara' : 'las dos primeras la preparan'}, y ahí ella da el paso. Más abajo te la marqué.`;

    const porSituacion: Record<string, string> = {
        'CONTACTO CERO': 'Sin contacto, la Ventana empieza sin que le escribas: ella nota el cambio por lo que ve de ti, no por lo que le dices.',
        'ME IGNORA': 'Si hoy te ignora, la Ventana empieza el día en que dejas de empujar. Ahí su defensa empieza a bajar.',
        'BLOQUEADO': 'Aunque te tenga bloqueado, la Ventana funciona: el cambio le llega por otros caminos, no por mensajes.',
        'SÓLO TEMAS NECESARIOS': 'Como todavía hablan de lo necesario, la Ventana empieza en esas conversaciones: en cómo le respondes, no en lo que le pides.',
        'VIVIMOS JUNTOS PERO DISTANTES': 'Como viven bajo el mismo techo, la Ventana empieza dentro de casa: en cómo te ve todos los días, no en mensajes.',
        'HABLAMOS A VECES': 'Como todavía hablan a veces, la Ventana empieza en la próxima conversación: cambia lo que ella siente al hablar contigo.',
        'SOMOS AMIGOS': 'Como hoy son amigos, la Ventana empieza el día en que dejas de estar siempre disponible como amigo.',
        'ENCUENTROS ÍNTIMOS': 'Como todavía hay intimidad, la Ventana empieza el día en que dejas de estar disponible siempre que ella quiere.'
    };
    let situacionTexto = porSituacion[quizData.currentSituation || ''] || '';
    const exSituation = quizData.exSituation || '';
    if (exSituation.includes('RELACIÓN SERIA') || exSituation.includes('SALIENDO CASUAL') || exSituation.includes('VARIAS PERSONAS')) {
        situacionTexto += (situacionTexto ? ' ' : '') + 'Y que esté con otra persona no cierra la Ventana: no vas a competir con él.';
    }
    return { fase, nombre, claveTexto, situacionTexto };
}

/**
 * Mecanismo v2 (18/11/2026): probabilidade de volta exibida no diagnóstico.
 * Base 62, ajustada pelas respostas; fica entre ~38% e ~80% (nunca condena, sempre pode subir a 87%).
 */
export function getProbabilidad(quizData: QuizData): number {
    const t = quizData.timeSeparation || '';
    const c = quizData.currentSituation || '';
    const e = quizData.exSituation || '';
    let p = 62;
    if (t.includes('MENOS DE 1 SEMANA')) p += 6;
    else if (t.includes('1-4 SEMANAS')) p += 4;
    else if (t.includes('MÁS DE 6 MESES')) p -= 8;
    if (['HABLAMOS A VECES', 'SOMOS AMIGOS', 'ENCUENTROS ÍNTIMOS'].includes(c)) p += 8;
    else if (['SÓLO TEMAS NECESARIOS', 'VIVIMOS JUNTOS PERO DISTANTES'].includes(c)) p += 4;
    else if (c === 'ME IGNORA') p -= 4;
    else if (c === 'BLOQUEADO') p -= 6;
    if (e === 'ESTÁ SOLTERA') p += 4;
    else if (e === 'VARIAS PERSONAS') p -= 2;
    else if (e === 'SALIENDO CASUAL') p -= 4;
    else if (e === 'RELACIÓN SERIA') p -= 10;
    return Math.max(35, Math.min(80, p));
}

/**
 * TESTE 2 (14/11/2026): Diagnóstico com a Obsesión Inversa.
 * Toda resposta vira boa notícia + "tu disparador clave" conforme a situação.
 * Texto renderizado com pre-line (sem markdown).
 */
export function getCopy(quizData: QuizData): string {
    const timeSeparation = quizData.timeSeparation || '';
    const currentSituation = quizData.currentSituation || '';
    const exSituation = quizData.exSituation || '';

    // 1. TESTE 4 (lab): o que a afastou (culpa) no lugar de "quem terminou"
    const mainCause = quizData.mainCause || '';
    const introByCause: Record<string, string> = {
        'MIS CELOS O MI CARÁCTER': 'Ella se fue cansando de los celos y las discusiones, no de ti. Eso no define quién eres, define cómo actuabas. Y eso se cambia.',
        'ME ENFOQUÉ EN TRABAJAR Y LA DESCUIDÉ': 'Ella se sintió sola mientras tú dabas todo por la casa. Lo que necesita es volver a sentir que es importante para ti.',
        'PELEAS QUE LA FUERON CANSANDO': 'Ella no se alejó de un día para otro. Se fue cansando. Y lo que se apagó por desgaste se puede volver a encender, si dejas de hacer lo que la cansó.',
        'UNA INFIDELIDAD O UNA MENTIRA': 'Lo que pasó le dolió, y su desconfianza es real. Pero si todavía algo se mueve en ella, hay camino. No va a ser con palabras, va a ser con lo que vea en ti.',
        'DEJÓ DE SENTIR Y NO SÉ POR QUÉ': 'Cuando una mujer dice que dejó de sentir, lo que se apagó son las ganas, no el cariño. Y las ganas se vuelven a encender.'
    };
    const intro = introByCause[mainCause] || 'Ella no se fue de un día para otro. Se fue cansando, poco a poco, de algo que veía en la relación. Y lo que se apagó por desgaste se puede volver a encender.';

    // 1b. A dor dele, devolvida com as palavras dele
    const mainPain = quizData.mainPain || '';
    const painByOption: Record<string, string> = {
        'QUE ME DEJE EN VISTO': 'Me dijiste que lo que más te duele es que te deje en visto. Por eso tu plan empieza por lo que NO debes hacer cuando eso pasa.',
        'VIVIR CON ELLA COMO DOS DESCONOCIDOS': 'Me dijiste que lo que más te duele es vivir con ella como dos desconocidos. Tu plan tiene en cuenta que la ves todos los días.',
        'IMAGINARLA CON OTRO': 'Me dijiste que lo que más te duele es imaginarla con otro. Tu plan te dice cómo actuar sin competir y sin rogar.',
        'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE': 'Me dijiste que lo que más te duele es que te quiera, pero no lo suficiente. Ahora vas a entender exactamente por qué te lo dice.',
        'LLEGAR A CASA Y NO SENTIR EL CALOR DE HOGAR': 'Me dijiste que lo que más te duele es no sentir el calor de hogar. Tu plan está pensado para relaciones largas como la tuya.'
    };
    const painEcho = painByOption[mainPain] || '';

    // TESTE 4 (lab): quem mora junto não "vive sem ele"
    const vivenJuntos = currentSituation === 'VIVIMOS JUNTOS PERO DISTANTES';

    // 2. Tempo de separação
    let urgency = '';
    if (timeSeparation.includes('MENOS DE 1 SEMANA') || timeSeparation.includes('1-4 SEMANAS')) {
        urgency = 'Todavía estás a tiempo de hacerlo bien. Ella sigue pensando en ti, pero lo que hagas en los próximos días puede acercarla o alejarla.';
    } else if (timeSeparation.includes('1-6 MESES')) {
        urgency = vivenJuntos
            ? 'Ya pasó un tiempo, y eso no la cerró. Lo que sí pasa es que se está acostumbrando a tenerte cerca sin sentirte cerca. Por eso ahora importa más el cuándo que el qué.'
            : 'Ya pasó un tiempo, y eso no la cerró. Lo que sí pasa es que se está acostumbrando a vivir sin ti. Por eso ahora importa más el cuándo que el qué.';
    } else if (timeSeparation.includes('MÁS DE 6 MESES')) {
        urgency = 'Pasaron meses, y aun así no está cerrado. Una mujer no olvida años en meses. Solo necesita un motivo nuevo para mirarte distinto.';
    }

    // 3. Situação de contato
    const sinContacto =
        currentSituation.includes('CONTACTO CERO') ||
        currentSituation.includes('ME IGNORA') ||
        currentSituation.includes('BLOQUEADO');
    const insight = vivenJuntos
        ? 'Que vivan bajo el mismo techo es una ventaja: no tienes que buscarla, ya está ahí. El problema es cómo te ve dentro de la casa. Si todo sigue igual que antes, nada cambia.'
        : sinContacto
        ? (timeSeparation.includes('1-6 MESES')
            // Lab 18/11: 1-6 meses já ouviu "se está acostumbrando" no bloco do tempo; aqui não repete
            ? 'El silencio no es el final. Pero el silencio solo no la trae de vuelta: esperar sin un plan es dejar que el tiempo decida por ti. Lo que la hace volver es reaparecer en el momento exacto y de la forma correcta.'
            : 'El silencio no es el final. Pero el silencio solo no la trae de vuelta: mientras tú esperas, ella se acostumbra. Lo que la hace volver es reaparecer en el momento exacto y de la forma correcta.')
        : 'Que todavía hablen es una puerta abierta. El problema no es llegar a ella, es cómo te ve cuando le hablas. Si cada conversación se siente igual que antes, nada cambia.';

    // 4. Ela está com outro?
    const conOtro =
        exSituation.includes('RELACIÓN SERIA') ||
        exSituation.includes('SALIENDO CASUAL') ||
        exSituation.includes('VARIAS PERSONAS');
    const otroInsight = conOtro
        ? 'Y que esté con otro no cierra la puerta. Muchas veces es su forma de no pensar en ti.'
        : '';

    // 5. Disparador clave (mesma regra usada na página de oferta)
    const clave = getDisparadorClave(quizData);
    const disparador = `Tu disparador clave: ${clave.nombre}\n${clave.texto}`;

    // Mecanismo v2 (18/11/2026): Ancla del Dolor + Harvard + oxitocina/dopamina + lado racional
    const mecanismo = [
        'LO QUE NADIE TE EXPLICÓ:',
        'Cada súplica, cada "perdóname", cada intento de convencerla le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el ANCLA DEL DOLOR. Y mientras más insistes, más la hundes.',
        'Investigadores de Harvard escanearon el cerebro de más de 2.500 mujeres mientras miraban la foto de un hombre que las marcó. El lado racional se apagaba. Se encendía una región primitiva, la del placer, donde se fabrican la oxitocina y la dopamina.',
        '[[FOTO_HARVARD]]',
        'La oxitocina es el cariño. Por eso todavía te dice "te quiero". La dopamina son las ganas. Esa se apagó, y por eso hoy no te busca.',
        'Todo lo que hiciste hasta ahora le habló a su lado racional. Con ese lado nadie se enamora.'
    ].join('\n\n');

    return [
        'No fue por falta de amor.',
        intro,
        painEcho,
        mecanismo,
        urgency,
        insight,
        otroInsight,
        disparador,
        'Eso es la OBSESIÓN INVERSA: dejas de perseguirla tú, y es su cerebro el que empieza a buscarte.',
        'Pero cuidado: este disparador, mal usado, la aleja para siempre. En el siguiente paso te muestro cómo funciona en tu caso.'
    ].filter(Boolean).join('\n\n');
}

// TESTE 2: Ventana 72h ligada à Obsesión Inversa (sem "psicólogos conductuales")
export function getVentana72Copy(_gender: string): string {
    return `Hoy el obsesionado eres tú: miras si vio tu historia, relees sus mensajes, escribes y borras. Eso es dopamina. Y hoy la está fabricando tu cerebro, no el de ella.

La Obsesión Inversa le da la vuelta. En 72 horas, esa química pasa de tu cerebro al de ella.

✅ Si haces lo correcto en cada fase, ella te busca.

❌ Si te equivocas, el Ancla del Dolor se hunde más y ella se cierra todavía más.

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
        '🧠 Su cerebro cambia en 3 pasos, siempre en el mismo orden',
        '🎯 En el momento correcto, la dopamina vuelve y ella da el paso',
        '⚠️ Fuera de tiempo, hundes el Ancla del Dolor más que antes'
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
        subtitle: `Tu disparador clave y lo que debes hacer primero para que ${pronoun} vuelva a buscarte, según lo que me contaste.`
    };
}

// ✅ REFATORADO: Agora retorna objeto estruturado (Instruções #2, #3, #8)
export function getFaseText(_gender: string, fase: number): {
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
            summary: 'El Ancla del Dolor se suelta: ya no la presionas, y empieza a preguntarse qué pasa contigo.',
            bullets: [
                '🧠 En su cerebro: su lado racional deja de defenderse de ti',
                '✓ Sale del "alivio" de después de la ruptura',
                '✓ Nota que ya no la persigues',
                '✓ Se pregunta: "¿Qué le pasa? ¿Ya me olvidó?"',
                '✓ Empieza a buscar señales de ti'
            ],
            warning: '⚠️ Si aquí le escribes un mensaje largo o le pides volver, le confirmas que hizo bien en irse.'
        },

        2: {
            title: 'Disparador 2 · La Nostalgia',
            timeRange: '24-48 HORAS',
            summary: 'Vuelve la oxitocina: el cariño de los buenos momentos empieza a pesar más que las peleas.',
            bullets: [
                '🧠 En su cerebro: se reactiva la oxitocina. El cariño vuelve primero',
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
            summary: 'Se enciende la dopamina: siente que te puede perder de verdad, y da el paso.',
            bullets: [
                '🧠 En su cerebro: se dispara la dopamina. Vuelven las ganas de ti',
                '✓ Siente que ya no estás disponible como antes',
                '✓ Le da miedo que otra ocupe su lugar',
                '✓ Busca una excusa para escribirte o verte',
                '✓ Aquí reapareces, en el momento y de la forma correcta'
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