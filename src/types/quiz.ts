export interface QuizAnswer {
  questionId: number;
  question: string;
  answer: string;
}

export interface QuizData {
  gender: string;
  timeSeparation: string;
  whoEnded: string;
  relationshipDuration: string;
  currentSituation: string;
  exSituation: string;
  commitmentLevel: string;
  // TESTE 4 (lab): culpa, dor e medo
  mainCause?: string;
  // 19/11 (mecanismo v2): "¿qué hiciste sin pensar?" substitui mainCause no chat
  impulso?: string;
  mainPain?: string;
  mainFear?: string;
  answers: QuizAnswer[];
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
}
