import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getComponentForRoute } from '../Routes/registry';

const TabContext = createContext();

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext deve ser usado dentro de um TabProvider');
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [nextTabId, setNextTabId] = useState(1);

  // Carregar abas do localStorage ao inicializar
  useEffect(() => {
    const savedTabs = localStorage.getItem('app_tabs');
    const savedActiveTab = localStorage.getItem('app_active_tab');
    
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        // Reidratar componentes usando a rota
        const validTabs = parsedTabs
          .filter(tab => tab.route && tab.title && tab.id)
          .map(tab => ({
            ...tab,
            component: getComponentForRoute(tab.route) || tab.component || null,
            isActive: false,
          }));
        setTabs(validTabs);
        setNextTabId(Math.max(...validTabs.map(tab => tab.id), 0) + 1);
      } catch (error) {
        console.error('Erro ao carregar abas:', error);
        localStorage.removeItem('app_tabs');
        localStorage.removeItem('app_active_tab');
      }
    }
    
    if (savedActiveTab) {
      setActiveTabId(parseInt(savedActiveTab));
    }
  }, []);

  // Salvar abas no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('app_tabs', JSON.stringify(tabs));
  }, [tabs]);

  // Salvar aba ativa no localStorage
  useEffect(() => {
    if (activeTabId !== null) {
      localStorage.setItem('app_active_tab', activeTabId.toString());
    }
  }, [activeTabId]);

  // Abrir nova aba
  const openTab = useCallback((route, title, component, icon = null) => {
    const newTab = {
      id: nextTabId,
      route,
      title,
      component,
      icon,
      isActive: true,
      isWorking: false,
      lastActivity: Date.now(),
      state: {} // Estado específico da aba
    };

    setTabs(prevTabs => {
      // Desativar todas as outras abas
      const updatedTabs = prevTabs.map(tab => ({
        ...tab,
        isActive: false
      }));
      
      return [...updatedTabs, newTab];
    });

    setActiveTabId(newTab.id);
    setNextTabId(prev => prev + 1);

    return newTab.id;
  }, [nextTabId]);

  // Fechar aba
  const closeTab = useCallback((tabId) => {
    setTabs(prevTabs => {
      const filteredTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // Se a aba fechada era a ativa, ativar a última aba
      if (activeTabId === tabId && filteredTabs.length > 0) {
        const lastTab = filteredTabs[filteredTabs.length - 1];
        setActiveTabId(lastTab.id);
        lastTab.isActive = true;
      }
      
      return filteredTabs;
    });
  }, [activeTabId]);

  // Ativar aba - versão otimizada
  const activateTab = useCallback((tabId) => {
    // Evitar atualizações desnecessárias
    if (activeTabId === tabId) return;
    
    setTabs(prevTabs => {
      // Verificar se realmente precisa atualizar
      const currentActive = prevTabs.find(tab => tab.isActive);
      if (currentActive && currentActive.id === tabId) return prevTabs;
      
      return prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
        lastActivity: tab.id === tabId ? Date.now() : tab.lastActivity
      }));
    });
    
    setActiveTabId(tabId);
  }, [activeTabId]);

  // Atualizar estado de uma aba
  const updateTabState = useCallback((tabId, newState) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, state: { ...tab.state, ...newState }, lastActivity: Date.now() }
          : tab
      )
    );
  }, []);

  // Marcar aba como trabalhando
  const setTabWorking = useCallback((tabId, isWorking) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, isWorking, lastActivity: Date.now() }
          : tab
      )
    );
  }, []);

  // Marcar aba como "conteúdo carregado"
  const markTabLoaded = useCallback((tabId) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, recentlyLoaded: true }
          : tab
      )
    );
    // Remover flag após breve intervalo
    setTimeout(() => {
      setTabs(prevTabs => prevTabs.map(tab => tab.id === tabId ? { ...tab, recentlyLoaded: false } : tab));
    }, 1200);
  }, []);

  // Fechar todas as abas exceto a ativa
  const closeOtherTabs = useCallback((tabId) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.id === tabId));
    setActiveTabId(tabId);
  }, []);

  // Fechar todas as abas
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  // Reordenar abas
  const moveTab = useCallback((fromIndex, toIndex) => {
    setTabs(prevTabs => {
      const updated = [...prevTabs];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Verificar se uma rota já está aberta (suporta rotas com parâmetros)
  const isRouteOpen = useCallback((route) => {
    return tabs.some(tab => tab.route === route);
  }, [tabs]);

  // Obter aba por rota
  const getTabByRoute = useCallback((route) => {
    return tabs.find(tab => tab.route === route);
  }, [tabs]);

  // Obter aba ativa
  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  const value = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    activateTab,
    updateTabState,
    setTabWorking,
    markTabLoaded,
    closeOtherTabs,
    closeAllTabs,
    moveTab,
    isRouteOpen,
    getTabByRoute,
    getActiveTab,
    setTabs // expor para reordenação por drag-and-drop
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};
