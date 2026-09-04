// 
// SISTEMA DE TRACKING GA4 - CORRIGIDO PARA GTM
// 

declare global {
  interface Window {
    dataLayer: any[];
  }
}

class GA4Tracking {
  
  // ✅ Garante que o dataLayer existe
  private ensureDataLayer(): void {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }
  }

  // ✅ Verifica se o dataLayer está disponível
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
  }

  // ✅ Envia evento via dataLayer.push() (CORRIGIDO)
  private sendEvent(eventName: string, params?: Record<string, any>) {
    // ✅ GARANTE QUE O DATALAYER EXISTE
    this.ensureDataLayer();
    
    if (this.isAvailable()) {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
      console.log(`📊 GA4 Event: ${eventName}`, params);
    } else {
      console.warn('⚠️ DataLayer não disponível ainda');
    }
  }

  // 
  // LANDING PAGE
  // 

  landingPageView() {
    this.sendEvent('page_view', {
      page_title: 'Landing Page',
      page_location: window.location.href,
      page_path: '/'
    });
  }

  landingCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'Iniciar Análisis',
      button_location: 'landing_primary',
      page: 'landing'
    });
  }

  landingScrollDepth(depth: number) {
    this.sendEvent('scroll_depth', {
      depth_percentage: depth,
      page: 'landing'
    });
  }

  // 
  // CHAT
  // 

  chatPageView() {
    this.sendEvent('page_view', {
      page_title: 'Chat Analysis',
      page_location: window.location.href,
      page_path: '/chat'
    });
  }

  chatStarted() {
    this.sendEvent('chat_started', {
      page: 'chat'
    });
  }

  questionAnswered(questionId: number, questionText: string, answer: string) {
    this.sendEvent('question_answered', {
      question_id: questionId,
      question_text: questionText,
      answer: answer,
      page: 'chat'
    });
  }

  chatCompleted() {
    this.sendEvent('chat_completed', {
      page: 'chat'
    });
  }

  chatCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'Ver Mi Plan Personalizado',
      button_location: 'chat_complete',
      page: 'chat'
    });
  }

  // 
  // RESULTADO
  // 

  resultPageView() {
    this.sendEvent('page_view', {
      page_title: 'Result Page',
      page_location: window.location.href,
      page_path: '/resultado'
    });
  }

  revelationViewed(revelationName: string, phaseNumber?: number) {
    this.sendEvent('revelation_viewed', {
      revelation_name: revelationName,
      phase_number: phaseNumber,
      page: 'resultado'
    });
  }

  videoStarted() {
    this.sendEvent('video_started', {
      video_name: 'VSL Plan Personalizado',
      page: 'resultado'
    });
  }

  offerRevealed() {
    this.sendEvent('offer_revealed', {
      page: 'resultado'
    });
  }

  offerViewed() {
    this.sendEvent('offer_viewed', {
      page: 'resultado'
    });
  }

  ctaBuyClicked(buttonLocation: string) {
    this.sendEvent('cta_buy_click', {
      button_name: 'Comprar Ahora',
      button_location: buttonLocation,
      page: 'resultado',
      value: 1
    });
  }

  // 
  // CONVERSÃO (IMPORTANTE!)
  // 

  purchase(value: number, currency: string = 'BRL') {
    this.sendEvent('purchase', {
      transaction_id: `TXN-${Date.now()}`,
      value: value,
      currency: currency,
      items: [{
        item_name: 'Plan de Reconquista 21 Días',
        item_category: 'Digital Product',
        price: value,
        quantity: 1
      }]
    });
  }

  // 
  // COUNTDOWN & URGÊNCIA
  // 

  spotsUpdated(spotsLeft: number) {
    if (spotsLeft === 20 || spotsLeft === 10 || spotsLeft === 5) {
      this.sendEvent('spots_alert', {
        spots_remaining: spotsLeft,
        page: 'resultado'
      });
    }
  }

  // 
  // NOVOS EVENTOS PARA PROGRESSÃO MANUAL E VSL DINÂMICO
  // 

  /**
   * Registra o clique no botão "Continuar" para avançar de fase.
   */
  phaseProgressionClicked(params: { phase_from: number; phase_to: number; button_name: string }) {
    this.sendEvent('phase_progression_clicked', {
      phase_from: params.phase_from,
      phase_to: params.phase_to,
      button_name: params.button_name,
      page: 'resultado'
    });
  }

  /**
   * Transição vídeo → janela de 72 horas (fase 2 → 3).
   */
  window72hRevealed(params: { phase_from: number; phase_to: number; button_name: string }) {
    this.sendEvent('window_72h_revealed', {
      phase_from: params.phase_from,
      phase_to: params.phase_to,
      button_name: params.button_name,
      page: 'resultado'
    });
  }

  /**
   * Transição janela → página de oferta (fase 3 → 4).
   */
  offerRevealedStep(params: { phase_from: number; phase_to: number; button_name: string }) {
    this.sendEvent('offer_revealed_step', {
      phase_from: params.phase_from,
      phase_to: params.phase_to,
      button_name: params.button_name,
      page: 'resultado'
    });
  }

  /**
   * Clique no botão de compra.
   */
  buyClickStep(params: { phase_from: number; phase_to: number; button_name: string }) {
    this.sendEvent('buy_click_step', {
      phase_from: params.phase_from,
      phase_to: params.phase_to,
      button_name: params.button_name,
      page: 'resultado'
    });
  }

  /**
   * Registra o clique no botão "Desbloquear Vídeo".
   */
  videoButtonUnlocked(params: { unlock_time_seconds: number; video_name: string }) {
    this.sendEvent('video_button_unlocked', {
      unlock_time_seconds: params.unlock_time_seconds,
      video_name: params.video_name,
      page: 'resultado'
    });
  }

  /**
   * Registra quando o vídeo é finalmente exibido após o delay de desbloqueio.
   */
  videoUnlockedViewed(videoDuration: number, unlockDelay: number) {
    this.sendEvent('video_unlocked_viewed', {
      video_duration_seconds: videoDuration,
      unlock_delay_ms: unlockDelay,
      page: 'resultado'
    });
  }

  /**
   * Registra quando o fallback automático de progressão de fase é acionado.
   */
  phaseTimeoutWarning(phase: number, timeSpentSeconds: number) {
    this.sendEvent('phase_timeout_warning', {
      phase_number: phase,
      time_spent_seconds: timeSpentSeconds,
      page: 'resultado'
    });
  }

  /**
   * Registra quando a seção de oferta é alcançada.
   */
  offerSectionReached(pathTaken: string, totalTimeSpent: number) {
    this.sendEvent('offer_section_reached', {
      path_taken: pathTaken,
      total_time_spent_seconds: Math.round(totalTimeSpent / 1000),
      page: 'resultado'
    });
  }

  /**
   * Registra a impressão do CTA final (geralmente no sticky footer).
   */
  finalCtaImpression(ctaPosition: string, visibilityTime: number) {
    this.sendEvent('final_cta_impression', {
      cta_position: ctaPosition,
      visibility_time_seconds: Math.round(visibilityTime / 1000),
      page: 'resultado'
    });
  }
}

// ✅ Exporta instância única
export const ga4Tracking = new GA4Tracking();
