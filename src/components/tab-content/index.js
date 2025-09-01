import React, { useEffect, useRef } from 'react';
import { useTabContext } from '../../contexts/TabContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const TabContent = () => {
  const { tabs, activeTabId, getActiveTab } = useTabContext();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = getActiveTab();
  const contentRefs = useRef({});
  const tabElementsRef = useRef({});

  // Função para renderizar o componente da aba mantendo-o montado
  const renderTabComponent = (tab) => {
    if (!tab || !tab.component) return null;

    const Component = tab.component;
    // Criar e memorizar a instância do elemento por aba para evitar re-renderizações desnecessárias
    if (!tabElementsRef.current[tab.id]) {
      tabElementsRef.current[tab.id] = <Component tabId={tab.id} />;
    }

    return (
      <div
        key={tab.id}
        ref={(el) => (contentRefs.current[tab.id] = el)}
        className={`tab-content ${tab.isActive ? 'active' : 'inactive'}`}
        style={{ display: tab.isActive ? 'block' : 'none' }}
      >
        {tabElementsRef.current[tab.id]}
      </div>
    );
  };

  // Efeito para gerenciar o foco das abas
  useEffect(() => {
    if (activeTab && contentRefs.current[activeTab.id]) {
      // Focar na aba ativa
      const activeElement = contentRefs.current[activeTab.id];
      activeElement.focus();
      
      // Scroll para o topo se necessário
      if (activeElement.scrollTop > 0) {
        activeElement.scrollTop = 0;
      }
    }
  }, [activeTabId]);

  // Se não há abas abertas, mostrar outlet padrão do React Router
  useEffect(() => {
    if (tabs.length === 0) {
      // Redirecionar para o dashboard como página padrão
      if (location.pathname !== '/metabase') {
        navigate('/metabase', { replace: true });
      }
    }
  }, [tabs.length, navigate, location.pathname]);

  if (tabs.length === 0) {
    return (
      <div className="tab-content-container">
        <Outlet />
      </div>
    );
  }

  // Se há abas mas nenhuma ativa, mostrar mensagem
  if (!activeTab) {
    return (
      <div className="no-tabs-message">
        <div className="no-tabs-content">
          <h2>Nenhuma aba aberta</h2>
          <p>Clique em um item do menu para abrir uma nova aba</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content-container">
      {/* Renderizar todas as abas, mantendo o estado de cada uma montada */}
      {tabs.map((tab) => renderTabComponent(tab))}
      
      {/* Fallback para rotas não gerenciadas por abas */}
      <div style={{ display: 'none' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default TabContent;
