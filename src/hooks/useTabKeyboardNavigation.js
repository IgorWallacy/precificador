import { useEffect, useRef } from 'react';
import { useTabContext } from '../contexts/TabContext';

/**
 * Hook para navegação por teclado entre abas e rastreamento de performance
 */
export const useTabKeyboardNavigation = () => {
  const { tabs, activeTabId, activateTab } = useTabContext();
  const clickTracker = useRef({
    lastActiveTab: null,
    clickCount: 0,
    lastClickTime: 0,
    attempts: []
  });

  // Rastreamento de cliques para debug
  const trackTabClick = (tabId, successful = false) => {
    const now = Date.now();
    const tracker = clickTracker.current;
    
    // Se é uma tentativa de mudar para uma nova aba
    if (tracker.lastActiveTab !== tabId) {
      // Reset contador para nova aba
      tracker.clickCount = 1;
      tracker.lastActiveTab = tabId;
    } else {
      // Incrementar contador para a mesma aba
      tracker.clickCount++;
    }
    
    tracker.lastClickTime = now;
    
    // Adicionar tentativa ao histórico
    tracker.attempts.push({
      timestamp: now,
      targetTabId: tabId,
      currentActiveTab: activeTabId,
      clickCount: tracker.clickCount,
      successful,
      timeSinceLastClick: tracker.attempts.length > 0 ? now - tracker.attempts[tracker.attempts.length - 1].timestamp : 0
    });
    
    // Manter apenas as últimas 20 tentativas
    if (tracker.attempts.length > 20) {
      tracker.attempts = tracker.attempts.slice(-20);
    }
    
    // Log detalhado no console
    if (successful) {
      console.log(`✅ ABA ATIVADA com sucesso após ${tracker.clickCount} clique(s)`, {
        tabId,
        clickCount: tracker.clickCount,
        timeToActivate: now - (tracker.attempts.find(a => a.targetTabId === tabId && a.clickCount === 1)?.timestamp || now)
      });
      
      // Reset contador após sucesso
      tracker.clickCount = 0;
    } else {
      console.log(`⏳ Tentativa ${tracker.clickCount} de ativar aba ${tabId}`, {
        currentActive: activeTabId,
        target: tabId,
        timeSinceLastClick: tracker.attempts.length > 1 ? now - tracker.attempts[tracker.attempts.length - 2].timestamp : 0
      });
    }
    
    // Se muitos cliques, mostrar relatório detalhado
    if (tracker.clickCount > 3) {
      console.warn(`🔥 PROBLEMA DETECTADO: ${tracker.clickCount} cliques necessários!`, {
        tabId,
        attempts: tracker.attempts.filter(a => a.targetTabId === tabId),
        possibleCauses: [
          'Interferência do drag and drop',
          'Eventos sendo bloqueados',
          'Re-renderizações excessivas',
          'Delay no state update',
          'TabSync interferindo'
        ]
      });
    }
  };

  // Função para navegar entre abas
  const navigateToTab = (direction) => {
    if (tabs.length <= 1) return;
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= tabs.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
    }
    
    const targetTab = tabs[newIndex];
    console.log(`🎹 NAVEGAÇÃO POR TECLADO: ${direction}`, {
      from: currentIndex,
      to: newIndex,
      fromTab: tabs[currentIndex]?.title,
      toTab: targetTab.title
    });
    
    trackTabClick(targetTab.id, false);
    activateTab(targetTab.id);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Tab (próxima aba) ou Ctrl+Shift+Tab (aba anterior)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        navigateToTab(e.shiftKey ? 'prev' : 'next');
        return;
      }
      
      // Ctrl + números (1-9) para aba específica
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          console.log(`🎹 NAVEGAÇÃO DIRETA: Ctrl+${e.key}`, {
            targetTab: tabs[tabIndex].title
          });
          trackTabClick(tabs[tabIndex].id, false);
          activateTab(tabs[tabIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, activateTab]);

  // Detectar quando uma aba foi ativada com sucesso
  useEffect(() => {
    const tracker = clickTracker.current;
    if (tracker.lastActiveTab && tracker.lastActiveTab === activeTabId && tracker.clickCount > 0) {
      trackTabClick(activeTabId, true);
    }
  }, [activeTabId]);

  // Função para reportar estatísticas
  const reportStats = () => {
    const tracker = clickTracker.current;
    const recentAttempts = tracker.attempts.slice(-10);
    
    console.group('📊 RELATÓRIO DE PERFORMANCE DAS ABAS');
    console.log('Total de tentativas registradas:', tracker.attempts.length);
    console.log('Últimas 10 tentativas:', recentAttempts);
    
    const avgClicksPerSuccess = recentAttempts
      .filter(a => a.successful)
      .reduce((acc, a) => acc + a.clickCount, 0) / recentAttempts.filter(a => a.successful).length || 0;
    
    console.log('Média de cliques por sucesso:', avgClicksPerSuccess.toFixed(2));
    
    const problemAttempts = recentAttempts.filter(a => a.clickCount > 2);
    console.log('Tentativas problemáticas (>2 cliques):', problemAttempts.length);
    
    if (problemAttempts.length > 0) {
      console.log('Análise de problemas:', problemAttempts);
    }
    
    console.groupEnd();
    
    return {
      totalAttempts: tracker.attempts.length,
      avgClicksPerSuccess,
      problemAttempts: problemAttempts.length,
      recentAttempts
    };
  };

  // Expor função de rastreamento globalmente para debug
  useEffect(() => {
    window.trackTabClick = trackTabClick;
    window.reportTabStats = reportStats;
    
    return () => {
      delete window.trackTabClick;
      delete window.reportTabStats;
    };
  }, []);

  return { trackTabClick, reportStats, navigateToTab };
};
