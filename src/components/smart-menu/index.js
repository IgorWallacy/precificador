import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { savePageAccess, getMostUsedPages } from "./utils";
import "./styles.css";
import { InputText } from "primereact/inputtext";

// 🧪 DEBUG: Para usar o painel de debug, importe e renderize:
// import DebugPanel from './debug-panel';
// const [showDebug, setShowDebug] = useState(false);
// {showDebug && <DebugPanel isVisible={showDebug} onClose={() => setShowDebug(false)} />}

const SmartMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const [orderedMenuItems, setOrderedMenuItems] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Todas as rotas do sidebar organizadas por categoria
  const allMenuItems = [
    {
      id: "metabase",
      title: "Dashboard",
      icon: "pi pi-chart-bar",
      color: "purple",
      route: "/metabase",
      description: "Dashboard e relatórios",
      category: "dashboard"
    },
    {
      id: "agenda-precos",
      title: "Agendar\nPreços",
      icon: "pi pi-calendar-plus",
      color: "gold",
      route: "/precificador/agenda/precificador-dataTable-novo",
      description: "Agendar alterações de preços",
      category: "precificador"
    },
    {
      id: "emitir-etiquetas",
      title: "Emitir\nEtiquetas\nEnviar carga PDV",
      icon: "pi pi-tag",
      color: "orange",
      route: "/precificador/executa/precificador-dataTable",
      description: "Emitir etiquetas e enviar para PDV",
      category: "precificador"
    },
    {
      id: "novo-inventario",
      title: "Novo\nInventário",
      icon: "pi pi-box",
      color: "brown",
      route: "/estoque/contagem",
      description: "Criar novo inventário",
      category: "estoque"
    },
    {
      id: "lançar-produtos",
      title: "Lançar\nProdutos",
      icon: "pi pi-plus-circle",
      color: "green",
      route: "/estoque/inventario/incluir-contagem",
      description: "Adicionar produtos ao inventário",
      category: "estoque"
    },
    {
      id: "estoque-zerar",
      title: "Inventário\nZerar",
      icon: "pi pi-building",
      color: "brown",
      route: "/estoque",
      description: "Zerar estoque/contagem",
      category: "estoque"
    },
    {
      id: "vendas-pdv",
      title: "Vendas do PDV",
      icon: "pi pi-chart-line",
      color: "blue",
      route: "/vendas",
      description: "Relatórios de vendas do PDV",
      category: "vendas"
    },
    {
      id: "recebimentos",
      title: "Recebimentos",
      icon: "pi pi-credit-card",
      color: "green",
      route: "/recebimentos/consulta",
      description: "Controle de recebimentos",
      category: "recebimentos"
    },
    {
      id: "vendas-crediario",
      title: "Vendas\nCrediário",
      icon: "pi pi-credit-card",
      color: "green",
      route: "/vendas/crediario",
      description: "Vendas no crediário",
      category: "vendas"
    },
    {
      id: "sair",
      title: "Sair",
      icon: "pi pi-sign-out",
      color: "red",
      route: "logout",
      description: "Sair do sistema",
      category: "sair",
      isLogout: true
    }
  ];

  // Função para ordenar itens baseado no histórico de uso
  const orderMenuItemsByUsage = () => {
    const mostUsedPages = getMostUsedPages(10); // Pegar top 10 para ordenação
    
    // Criar mapa de frequência para ordenação
    const frequencyMap = {};
    mostUsedPages.forEach((route, index) => {
      frequencyMap[route] = 10 - index; // Maior peso para páginas mais usadas
    });

    // Ordenar itens baseado na frequência de uso
    const orderedItems = [...allMenuItems].sort((a, b) => {
      const aFreq = frequencyMap[a.route] || 0;
      const bFreq = frequencyMap[b.route] || 0;
      
      // Páginas mais usadas primeiro
      if (aFreq !== bFreq) {
        return bFreq - aFreq;
      }
      
      // Se frequência igual, manter ordem original
      return allMenuItems.indexOf(a) - allMenuItems.indexOf(b);
    });

    return orderedItems;
  };

  // Verificar itens ocultos e mostrar overlay se necessário
  const checkHiddenItems = () => {
    console.log('🔍 checkHiddenItems chamada');
    
    if (!scrollContainerRef.current) {
      console.log('❌ scrollContainerRef.current não encontrado');
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const items = container.querySelectorAll('.smart-menu-item');
    
    console.log('📊 Container encontrado:', {
      width: containerRect.width,
      height: containerRect.height,
      left: containerRect.left,
      right: containerRect.right
    });
    console.log('📋 Total de itens encontrados:', items.length);
    
    const hidden = [];
    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      
      // Verificar se o item está completamente visível na área do container
      // Considerar o scroll horizontal
      const isFullyVisible = (
        itemRect.left >= containerRect.left &&
        itemRect.right <= containerRect.right &&
        itemRect.top >= containerRect.top &&
        itemRect.bottom <= containerRect.bottom
      );
      
      // Verificar se o item está parcialmente visível (para casos de scroll)
      const isPartiallyVisible = (
        (itemRect.left < containerRect.right && itemRect.right > containerRect.left) &&
        (itemRect.top < containerRect.bottom && itemRect.bottom > containerRect.top)
      );
      
      console.log(`📱 Item ${index + 1}:`, {
        title: item.querySelector('.smart-menu-label')?.textContent || 'Sem título',
        left: itemRect.left,
        right: itemRect.right,
        isFullyVisible,
        isPartiallyVisible
      });
      
      // Se não está nem totalmente nem parcialmente visível, considerar como oculto
      if (!isFullyVisible && !isPartiallyVisible) {
        const itemId = item.querySelector('.smart-menu-button').id;
        const menuItem = allMenuItems.find(mi => mi.id === itemId);
        if (menuItem) {
          hidden.push(menuItem);
          console.log(`🚫 Item oculto detectado: ${menuItem.title}`);
        }
      }
    });

    // Debug: log para verificar quantos itens estão sendo detectados
    console.log('🎯 Itens detectados como ocultos:', hidden.length, hidden.map(h => h.title));
    console.log('📊 Container dimensions:', {
      width: containerRect.width,
      height: containerRect.height,
      scrollWidth: container.scrollWidth,
      clientWidth: container.clientWidth
    });
    
    setHiddenItems(hidden);
  };

  // Atualizar ordenação quando a localização mudar
  useEffect(() => {
    if (location.pathname) {
      savePageAccess(location.pathname);
      setOrderedMenuItems(orderMenuItemsByUsage());
    }
  }, [location.pathname]);

  // Inicializar ordenação
  useEffect(() => {
    setOrderedMenuItems(orderMenuItemsByUsage());
  }, []);

  // Verificar se há rolagem necessária
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollLeft(scrollLeft > 0);
        setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        
        // Verificar itens ocultos quando o scroll mudar
        setTimeout(checkHiddenItems, 50);
      }
    };

    const handleScroll = () => {
      checkScroll();
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Adicionar listener para o evento de scroll do container
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScroll);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Verificar itens ocultos quando a tela mudar de tamanho
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkHiddenItems, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Verificar inicialmente com delay para garantir que o DOM esteja renderizado
    setTimeout(checkHiddenItems, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [orderedMenuItems]);

  // Verificar itens ocultos quando os itens ordenados mudarem
  useEffect(() => {
    // Aguardar o DOM ser renderizado antes de verificar
    const timer = setTimeout(() => {
      checkHiddenItems();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [orderedMenuItems]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleActionClick = (route, itemId) => {
    // Tratar logout
    if (route === 'logout') {
      localStorage.removeItem("access_token");
      navigate("/");
      return;
    }

    // Se o item já está em foco (rota atual), não navegar
    if (location.pathname === route) {
      // Adicionar feedback visual para indicar que já está na página atual
      const button = document.getElementById(itemId);
      if (button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1.1)';
        }, 200);
      }
      return;
    }

    // Salvar acesso à página e navegar
    savePageAccess(route);
    navigate(route);
  };

  const isCurrentRoute = (route) => {
    if (route === 'logout') return false;
    return location.pathname === route;
  };

  const getItemClassName = (item) => {
    let className = "smart-menu-item";
    
    if (isCurrentRoute(item.route)) {
      className += " active";
    }

    if (item.isLogout) {
      className += " logout-item";
    }
    
    return className;
  };

  // Filtrar itens baseado no termo de pesquisa
  const filteredOverlayItems = hiddenItems.filter(item => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(searchLower);
    const descriptionMatch = item.description.toLowerCase().includes(searchLower);
    const categoryMatch = item.category.toLowerCase().includes(searchLower);
    
    return titleMatch || descriptionMatch || categoryMatch;
  });

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
    // Limpar pesquisa quando abrir/fechar overlay
    if (!showOverlay) {
      setSearchTerm("");
    }
  };

  return (
    <div className="smart-menu-container">
      {/* Botão de rolagem esquerda */}
      {showScrollLeft && (
        <Button
          icon="pi pi-chevron-left"
          className="smart-menu-scroll-btn scroll-left"
          onClick={scrollLeft}
          aria-label="Rolar para esquerda"
        />
      )}

      {/* Container principal com rolagem */}
      <div className="smart-menu-toolbar" ref={scrollContainerRef}>
        {/* Todos os itens do menu ordenados por uso */}
        {orderedMenuItems.map((item) => (
          <div key={item.id} className={getItemClassName(item)}>
            <Tooltip target={`#${item.id}`} position="bottom" />
            <div 
              className="smart-menu-clickable-area"
              onClick={() => handleActionClick(item.route, item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleActionClick(item.route, item.id);
                }
              }}
            >
              <Button
                id={item.id}
                icon={item.icon}
                className={`smart-menu-button smart-menu-button-${item.color} ${
                  isCurrentRoute(item.route) ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Evitar duplo clique
                  handleActionClick(item.route, item.id);
                }}
                data-pr-tooltip={item.description}
              />
              <span className="smart-menu-label">{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de rolagem direita */}
      {showScrollRight && (
        <Button
          icon="pi pi-chevron-right"
          className="smart-menu-scroll-btn scroll-right"
          onClick={scrollRight}
          aria-label="Rolar para direita"
        />
      )}

      {/* Botão para mostrar overlay com itens ocultos */}
      {hiddenItems.length > 0 && (
        <Button
          icon="pi pi-ellipsis-h"
          className="smart-menu-overlay-toggle"
          onClick={toggleOverlay}
          aria-label="Mostrar mais opções"
        />
      )}

      {/* Overlay com itens ocultos */}
      {showOverlay && (
        <div className="smart-menu-overlay">
          <div className="overlay-backdrop" onClick={toggleOverlay}></div>
          <div className="overlay-content">
            <div className="overlay-header">
              <h3>Mais Opções</h3>
              <Button
                icon="pi pi-times"
                className="overlay-close-btn"
                onClick={toggleOverlay}
                aria-label="Fechar"
              />
            </div>
            
            {/* Barra de pesquisa */}
            <div className="overlay-search">
              <div className="search-input-container">
                <i className="pi pi-search search-icon"></i>
                <InputText
                size="small"
                  width="100%"
                  type="text"
                  placeholder="Pesquisar opções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                {searchTerm && (
                  <Button
                    icon="pi pi-times"
                    className="search-clear-btn"
                    onClick={() => setSearchTerm("")}
                    aria-label="Limpar pesquisa"
                  />
                )}
              </div>
              {searchTerm && (
                <div className="search-results-info">
                  {filteredOverlayItems.length} de {hiddenItems.length} resultados
                </div>
              )}
            </div>

            {/* Lista de itens filtrados */}
            <div className="overlay-items">
              {filteredOverlayItems.length > 0 ? (
                filteredOverlayItems.map((item) => (
                  <div key={item.id} className="overlay-item">
                    <Tooltip target={`#overlay-${item.id}`} position="bottom" />
                    <div 
                      className="overlay-clickable-area"
                      onClick={() => {
                        handleActionClick(item.route, item.id);
                        toggleOverlay();
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleActionClick(item.route, item.id);
                          toggleOverlay();
                        }
                      }}
                    >
                      <Button
                        id={`overlay-${item.id}`}
                        icon={item.icon}
                        className={`overlay-button overlay-button-${item.color} ${
                          isCurrentRoute(item.route) ? 'active' : ''
                        }`}
                        data-pr-tooltip={item.description}
                      />
                      <span className="overlay-label">{item.title}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="overlay-no-results">
                  <i className="pi pi-search" style={{ fontSize: '2rem', color: '#9ca3af' }}></i>
                  <p>Nenhum resultado encontrado para "{searchTerm}"</p>
                  <small>Tente usar termos diferentes ou verifique a ortografia</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🧪 DEBUG: Exportar funções utilitárias para facilitar o debug no console
export default SmartMenu;
export * from './utils';
