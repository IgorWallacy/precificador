import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTabContext } from '../../contexts/TabContext';
import { useTabKeyboardNavigation } from '../../hooks/useTabKeyboardNavigation';
import './styles.css';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TabBar = () => {
  const {
    tabs,
    activeTabId,
    activateTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    setTabWorking,
    markTabLoaded,
    moveTab
  } = useTabContext();

  // Context menu de abas removido; usaremos menu global simples no layout
  const [sidebarState, setSidebarState] = useState('expanded');
  const [reorderMode, setReorderMode] = useState(false);

  // Hook para navegação por teclado e rastreamento de performance
  const { trackTabClick } = useTabKeyboardNavigation();

  // Detectar estado da sidebar
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) {
        setSidebarState('none');
        return;
      }
      
      if (sidebar.classList.contains('collapsed')) {
        setSidebarState('collapsed');
      } else {
        setSidebarState('expanded');
      }
    };

    // Verificar estado inicial
    checkSidebarState();

    // Observar mudanças na sidebar
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Observar mudanças no DOM para detectar sidebar
    const bodyObserver = new MutationObserver(checkSidebarState);
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
    };
  }, []);

  const handleTabClick = useCallback((tabId) => {
    // Clique direto e simples - sem logs desnecessários
    if (activeTabId === tabId) return; // Ignorar se já está ativa
    
    console.log(`🚀 CLIQUE RÁPIDO: Ativando aba ${tabId} em ${Date.now()}`);
    
    // Ativar aba imediatamente
    activateTab(tabId);
  }, [activeTabId, activateTab]);

  const handleTabClose = (e, tabId) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  // Sem menu de contexto local nas abas

  // Escutar eventos globais de rede para marcar abas como "trabalhando"
  useEffect(() => {
    const handleStart = () => {
      const active = tabs.find(t => t.isActive);
      if (active) setTabWorking(active.id, true);
    };
    const handleEnd = () => {
      const active = tabs.find(t => t.isActive);
      if (active) {
        setTabWorking(active.id, false);
        markTabLoaded(active.id);
      }
    };
    window.addEventListener('tabs:request-start', handleStart);
    window.addEventListener('tabs:request-end', handleEnd);
    window.addEventListener('tabs:request-error', handleEnd);
    return () => {
      window.removeEventListener('tabs:request-start', handleStart);
      window.removeEventListener('tabs:request-end', handleEnd);
      window.removeEventListener('tabs:request-error', handleEnd);
    };
  }, [tabs]);

  // Evitar que o TabSync reative a mesma aba ao clicar
  // Ao clicar numa aba, apenas troca visual/estado; não muda a rota
  // A rota continua sendo controlada pelas ações do menu/abertura inicial

  // Criar sensores SEMPRE antes de qualquer retorno condicional
  const sensors = useSensors(
    // Em modo de reposicionamento, iniciar arraste imediatamente
    // Fora dele, desabilitar completamente o drag
    useSensor(
      PointerSensor,
      reorderMode ? {} : { activationConstraint: { distance: 999999 } } // Distância muito alta para desabilitar
    )
  );

  if (tabs.length === 0) return null;

  // Determinar classe CSS baseada no estado da sidebar
  const getTabBarClass = () => {
    // Forçar largura total da tela, independente do estado da sidebar
    return 'tab-bar full-width';
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = tabs.findIndex(t => String(t.id) === String(active.id));
    const to = tabs.findIndex(t => String(t.id) === String(over.id));
    if (from === -1 || to === -1 || from === to) return;
    moveTab(from, to);
  };

  // Componente de aba simples para modo normal (sem drag and drop)
  const SimpleTab = ({ tab }) => {
    return (
      <div
        className={`tab ${tab.isActive ? 'active' : ''}`}
        onClick={() => handleTabClick(tab.id)}
        title={tab.title}
      >
        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
        <span className="tab-title">{tab.title}</span>
        <button 
          className="tab-close-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleTabClose(e, tab.id);
          }} 
          title="Fechar aba"
        >
          ×
        </button>
      </div>
    );
  };

  // Componente de aba com drag and drop para modo reorder
  const SortableTab = ({ tab }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
      id: String(tab.id), 
      disabled: false 
    });
    const style = { transform: CSS.Transform.toString(transform), transition };
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`tab ${tab.isActive ? 'active' : ''} reorderable`}
        title={tab.title}
        {...attributes}
        {...listeners}
      >
        <span className="tab-drag-handle" aria-label="Reordenar" />
        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
        <span className="tab-title">{tab.title}</span>
        <button 
          className="tab-close-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleTabClose(e, tab.id);
          }} 
          title="Fechar aba"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className={`${getTabBarClass()} ${reorderMode ? 'reorder-mode' : ''}`}>
      {reorderMode ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={tabs.map(t => String(t.id))} strategy={horizontalListSortingStrategy}>
            <div className="tab-list">
              {tabs.map((tab) => (
                <SortableTab key={tab.id} tab={tab} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="tab-list">
          {tabs.map((tab) => (
            <SimpleTab key={tab.id} tab={tab} />
          ))}
        </div>
      )}

      {/* Ações da barra de abas: botão para alternar modo de reposicionamento */}
      <div style={{ position: 'absolute', right: 8, top: 4, display: 'flex', gap: 8 }}>
        {!reorderMode ? (
          <button
            className="p-button p-button-text"
            onClick={() => setReorderMode(true)}
            title="Reposicionar abas"
            style={{ padding: '4px 8px' }}
          >
            <i className="pi pi-arrows-h" style={{ marginRight: 6 }} /> Reposicionar
          </button>
        ) : (
          <button
            className="p-button p-button-text"
            onClick={() => setReorderMode(false)}
            title="Concluir reposicionamento"
            style={{ padding: '4px 8px' }}
          >
            <i className="pi pi-check" style={{ marginRight: 6 }} /> Concluir
          </button>
        )}
      </div>
    </div>
  );
};

export default TabBar;
