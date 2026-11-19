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
        ? 'En tu caso, la Fase 1 es la que decide: si aquí te equivocas, las otras dos no llegan. Te la marqué abajo.'
        : `En tu caso, la Fase ${fase} es la que decide: ${fase === 2 ? 'la Fase 1 la prepara' : 'las dos primeras la preparan'}, y ahí ella da el paso. Te la marqué abajo.`;

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
    // Diagnóstico enxuto v3 (19/11/2026): 7 blocos, sem repetição. Proposta: expert-lucas/copies/diagnostico-enxuto-v3.md
    const currentSituation = quizData.currentSituation || '';
    const exSituation = quizData.exSituation || '';
    const impulso = quizData.impulso || '';
    const mainPain = quizData.mainPain || '';

    // Bloco 3 · abertura: confissão + Ancla del Dolor
    const aberturaByImpulso: Record<string, string> = {
        'LE MANDÉ UN MENSAJE LARGUÍSIMO': 'No fue por falta de amor. Me contaste que le mandaste un mensaje larguísimo. Lo escribiste por amor, pero su cerebro lo registró como presión. Cada mensaje así le graba una sola idea: este hombre trae dolor. Eso es el ANCLA DEL DOLOR, y mientras más insistes, más se hunde.',
        'LA LLAMÉ VARIAS VECES': 'No fue por falta de amor. Me contaste que la llamaste varias veces. Cada llamada sin respuesta le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el ANCLA DEL DOLOR, y mientras más insistes, más se hunde.',
        'LE PEDÍ PERDÓN Y OTRA OPORTUNIDAD': 'No fue por falta de amor. Me contaste que le pediste perdón y otra oportunidad. Lo hiciste de corazón, pero rogar le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el ANCLA DEL DOLOR, y mientras más insistes, más se hunde.',
        'LA VIGILÉ EN REDES (O PEDÍ A ALGUIEN QUE LO HICIERA)': 'No fue por falta de amor. Me contaste que la vigilaste en redes. Casi todos lo hacen y casi nadie lo admite: revisar su última conexión, mirar sus historias desde otra cuenta, analizar cada foto. Esa ansiedad se nota en todo lo que haces con ella, y le graba una sola idea: este hombre trae presión. Eso es el ANCLA DEL DOLOR.',
        'NO HICE NADA, ME QUEDÉ CALLADO': 'No fue por falta de amor. Me contaste que no hiciste nada. Eso evitó lo peor: no le grabaste a su cerebro la idea de que traes presión, lo que yo llamo el ANCLA DEL DOLOR. Pero quedarte quieto tampoco enciende nada en ella.'
    };
    const abertura = aberturaByImpulso[impulso] || 'No fue por falta de amor. Cada súplica, cada "perdóname", cada intento de convencerla le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el ANCLA DEL DOLOR, y mientras más insistes, más se hunde.';

    // Bloco 4 · vergonha (quem marcou "vigilé en redes" já leu isso na abertura)
    const verguenza = impulso.startsWith('LA VIGILÉ')
        ? ''
        : 'Y sé lo que casi ningún hombre admite: revisar su última conexión a cada rato, mirar sus historias desde otra cuenta, no dormir, no poder concentrarte en el trabajo. No es debilidad. Es química.';

    // Bloco 5 · Harvard (a foto entra no marcador [[FOTO_HARVARD]])
    const harvard = 'LO QUE NADIE TE EXPLICÓ: Investigadores de Harvard escanearon el cerebro de más de 2.500 mujeres mientras miraban la foto de un hombre que las marcó. El lado racional, el que compara y juzga, se apagaba. Se encendía una región primitiva, la del placer, donde se fabrican la oxitocina y la dopamina. Todo lo que hiciste hasta ahora le habló al lado racional. Con ese lado nadie se enamora.';

    // Bloco 6 · a química respondendo à dor dele
    const quimicaByPain: Record<string, string> = {
        'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE': 'Por eso te dice "te quiero, pero no lo suficiente". La oxitocina, el cariño, sigue ahí. La dopamina, las ganas de estar contigo, se apagó. Y las ganas se vuelven a encender.',
        'QUE ME DEJE EN VISTO': 'Por eso te deja en visto. La oxitocina, el cariño, todavía está. Pero la dopamina, las ganas de saber de ti, se apagó: ya no siente nada cuando le llega tu mensaje. Y las ganas se vuelven a encender.',
        'VIVIR CON ELLA COMO DOS DESCONOCIDOS': 'Por eso viven como dos desconocidos. La oxitocina, el cariño, sigue ahí: por eso no se fue del todo. Lo que se apagó es la dopamina, las ganas de estar contigo. Y las ganas se vuelven a encender.',
        'IMAGINARLA CON OTRO': 'Por eso duele tanto imaginarla con otro: él le da algo nuevo, dopamina. Pero el cariño de años, la oxitocina, sigue contigo. Eso él no lo tiene. Y las ganas por ti se vuelven a encender.',
        'LLEGAR A CASA Y NO SENTIR EL CALOR DE HOGAR': 'Por eso la casa se siente fría. La oxitocina, el cariño de años, sigue ahí. Lo que se apagó es la dopamina, las ganas. Y las ganas se vuelven a encender.'
    };
    const quimica = quimicaByPain[mainPain] || 'La oxitocina es el cariño: por eso todavía te dice "te quiero". La dopamina son las ganas: esa se apagó, y por eso hoy no te busca. Y las ganas se vuelven a encender.';

    // Bloco 7 · en tu caso + disparador + Obsesión Inversa
    const sinContacto = ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO'].includes(currentSituation);
    const laVe = ['VIVIMOS JUNTOS PERO DISTANTES', 'SÓLO TEMAS NECESARIOS'].includes(currentSituation);
    const conOtro = ['RELACIÓN SERIA', 'SALIENDO CASUAL', 'VARIAS PERSONAS'].includes(exSituation);
    let enTuCaso = sinContacto
        ? 'EN TU CASO: Hoy no hay contacto, y mientras esperas, ella se acostumbra. Por eso importa más el cuándo que el qué.'
        : laVe
        ? 'EN TU CASO: Todavía la ves, y eso es una ventaja. Lo que cambia todo es cómo te ve cuando están juntos.'
        : currentSituation
        ? 'EN TU CASO: Todavía hablan, y eso es una puerta abierta. Lo que cambia todo es cómo te ve cuando le hablas.'
        : '';
    if (conOtro) enTuCaso = (enTuCaso ? enTuCaso + ' ' : 'EN TU CASO: ') + 'Y que esté con otro no cierra la puerta.';

    const clave = getDisparadorClave(quizData);
    const disparador = `Tu disparador clave: ${clave.nombre}\n${clave.texto}`;

    return [
        abertura,
        verguenza,
        harvard,
        '[[FOTO_HARVARD]]',
        quimica,
        enTuCaso,
        disparador,
        'Eso es la OBSESIÓN INVERSA: dejas de perseguirla tú, y es su cerebro el que empieza a buscarte. Pero cuidado: mal usado, la aleja para siempre. En el siguiente paso te muestro cómo funciona en tu caso.'
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
    cerebro: string;
    summary: string;
    bullets: string[];
    warning: string;
} {
    // Ventana v4 (19/11/2026): 1 linha "no cérebro" + resumo curto + 3 sinais (antes 5 bullets que repetiam o resumo)
    const fases: Record<number, { title: string; timeRange: string; cerebro: string; summary: string; bullets: string[]; warning: string }> = {
        1: {
            title: 'La Curiosidad',
            timeRange: '0 a 24 horas',
            cerebro: '⚓ Se suelta el Ancla del Dolor',
            summary: 'Ya no la presionas, y empieza a preguntarse qué pasa contigo.',
            bullets: [
                'Nota que ya no la persigues',
                'Se pregunta: "¿Qué le pasa? ¿Ya me olvidó?"',
                'Empieza a buscar señales de ti'
            ],
            warning: 'Si aquí le escribes un mensaje largo o le pides volver, le confirmas que hizo bien en irse.'
        },

        2: {
            title: 'La Nostalgia',
            timeRange: '24 a 48 horas',
            cerebro: '🧡 Oxitocina: vuelve el cariño',
            summary: 'Los buenos momentos empiezan a pesar más que las peleas.',
            bullets: [
                'Deja de verte como el hombre de las últimas peleas',
                'Su defensa empieza a bajar',
                'Siente ganas de saber de ti'
            ],
            warning: 'Si presionas aquí, se asusta y te cierra la puerta. Y una puerta que se cierra dos veces cuesta mucho más abrirla.'
        },

        3: {
            title: 'La Pérdida',
            timeRange: '48 a 72 horas',
            cerebro: '⚡ Dopamina: vuelven las ganas',
            summary: 'Siente que te puede perder de verdad, y da el paso.',
            bullets: [
                'Siente que ya no estás disponible como antes',
                'Le da miedo que otra ocupe su lugar',
                'Busca una excusa para escribirte o verte'
            ],
            warning: 'Aquí se pierde la mayoría: reaparecen tarde o con el mensaje equivocado, y ella lo toma como prueba de que nada cambió.'
        }
    };

    return fases[fase] || {
        title: '',
        timeRange: '',
        cerebro: '',
        summary: '',
        bullets: [],
        warning: ''
    };
}

/**
 * Diagnóstico v4 (19/11/2026): mesmo conteúdo do enxuto v3, em blocos para o componente desenhar
 * (cards, química em 2 linhas visuais). getCopy fica como referência/fallback.
 */
export function getDiagnosticoBlocos(quizData: QuizData): {
    abertura: string; verguenza: string; harvard: string; dorFrase: string; enTuCaso: string;
    disparadorNombre: string; disparadorTexto: string;
} {
    const currentSituation = quizData.currentSituation || '';
    const exSituation = quizData.exSituation || '';
    const impulso = quizData.impulso || '';
    const mainPain = quizData.mainPain || '';

    const aberturaByImpulso: Record<string, string> = {
        'LE MANDÉ UN MENSAJE LARGUÍSIMO': 'Me contaste que le mandaste un mensaje larguísimo. Lo escribiste por amor, pero su cerebro lo registró como presión. Cada mensaje así le graba una sola idea: este hombre trae dolor. Eso es el Ancla del Dolor, y mientras más insistes, más se hunde.',
        'LA LLAMÉ VARIAS VECES': 'Me contaste que la llamaste varias veces. Cada llamada sin respuesta le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el Ancla del Dolor, y mientras más insistes, más se hunde.',
        'LE PEDÍ PERDÓN Y OTRA OPORTUNIDAD': 'Me contaste que le pediste perdón y otra oportunidad. Lo hiciste de corazón, pero rogar le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el Ancla del Dolor, y mientras más insistes, más se hunde.',
        'LA VIGILÉ EN REDES (O PEDÍ A ALGUIEN QUE LO HICIERA)': 'Me contaste que la vigilaste en redes. Casi todos lo hacen y casi nadie lo admite: revisar su última conexión, mirar sus historias desde otra cuenta, analizar cada foto. Esa ansiedad se nota en todo lo que haces con ella, y le graba una sola idea: este hombre trae presión. Eso es el Ancla del Dolor.',
        'NO HICE NADA, ME QUEDÉ CALLADO': 'Me contaste que no hiciste nada. Eso evitó lo peor: no le grabaste a su cerebro la idea de que traes presión, lo que yo llamo el Ancla del Dolor. Pero quedarte quieto tampoco enciende nada en ella.'
    };
    const abertura = aberturaByImpulso[impulso] || 'Cada súplica, cada "perdóname", cada intento de convencerla le grabó a su cerebro una sola idea: este hombre trae presión. Eso es el Ancla del Dolor, y mientras más insistes, más se hunde.';

    const verguenza = impulso.startsWith('LA VIGILÉ')
        ? ''
        : 'Y sé lo que casi ningún hombre admite: revisar su última conexión a cada rato, mirar sus historias desde otra cuenta, no dormir, no poder concentrarte en el trabajo. No es debilidad. Es química.';

    const harvard = 'Investigadores de Harvard escanearon el cerebro de más de 2.500 mujeres mientras miraban la foto de un hombre que las marcó. El lado racional, el que compara y juzga, se apagaba. Se encendía una región primitiva, la del placer, donde se fabrican la oxitocina y la dopamina. Todo lo que hiciste hasta ahora le habló al lado racional. Con ese lado nadie se enamora.';

    const dorByPain: Record<string, string> = {
        'QUE ME DIGA QUE ME QUIERE, PERO NO LO SUFICIENTE': 'Por eso te dice "te quiero, pero no lo suficiente":',
        'QUE ME DEJE EN VISTO': 'Por eso te deja en visto y ya no siente nada cuando le llega tu mensaje:',
        'VIVIR CON ELLA COMO DOS DESCONOCIDOS': 'Por eso viven como dos desconocidos bajo el mismo techo:',
        'IMAGINARLA CON OTRO': 'Por eso duele imaginarla con otro: él le da algo nuevo. Pero el cariño de años sigue contigo, y eso él no lo tiene:',
        'LLEGAR A CASA Y NO SENTIR EL CALOR DE HOGAR': 'Por eso la casa se siente fría:'
    };
    const dorFrase = dorByPain[mainPain] || 'Por eso hoy no te busca:';

    const sinContacto = ['CONTACTO CERO', 'ME IGNORA', 'BLOQUEADO'].includes(currentSituation);
    const laVe = ['VIVIMOS JUNTOS PERO DISTANTES', 'SÓLO TEMAS NECESARIOS'].includes(currentSituation);
    const conOtro = ['RELACIÓN SERIA', 'SALIENDO CASUAL', 'VARIAS PERSONAS'].includes(exSituation);
    let enTuCaso = sinContacto
        ? 'Hoy no hay contacto, y mientras esperas, ella se acostumbra. Por eso importa más el cuándo que el qué.'
        : laVe
        ? 'Todavía la ves, y eso es una ventaja. Lo que cambia todo es cómo te ve cuando están juntos.'
        : currentSituation
        ? 'Todavía hablan, y eso es una puerta abierta. Lo que cambia todo es cómo te ve cuando le hablas.'
        : '';
    if (conOtro) enTuCaso = (enTuCaso ? enTuCaso + ' ' : '') + 'Y que esté con otro no cierra la puerta.';
    // 19/11 (noite): volta a frase pelo tempo de separação (tinha saído no enxuto v3)
    const porTiempo: Record<string, string> = {
        'MENOS DE 1 SEMANA': 'Todavía estás a tiempo de hacerlo bien: lo que hagas en los próximos días puede acercarla o alejarla.',
        '1-4 SEMANAS': 'Todavía estás a tiempo de hacerlo bien: lo que hagas en los próximos días puede acercarla o alejarla.',
        '1-6 MESES': 'Ya pasó un tiempo, y eso no la cerró.',
        'MÁS DE 6 MESES': 'Pasaron meses, y no está cerrado: una mujer no olvida años en meses.'
    };
    const tiempo = porTiempo[quizData.timeSeparation || ''] || '';
    if (tiempo) enTuCaso = tiempo + (enTuCaso ? ' ' + enTuCaso : '');

    const clave = getDisparadorClave(quizData);
    return { abertura, verguenza, harvard, dorFrase, enTuCaso, disparadorNombre: clave.nombre, disparadorTexto: clave.texto };
}
