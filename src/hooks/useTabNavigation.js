import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabContext } from '../contexts/TabContext';

// Mapeamento de rotas para títulos e ícones
const routeConfig = {
  '/metabase': {
    title: 'Dashboard',
    icon: '📊'
  },
  '/bi/custo-venda': {
    title: 'BI - Custo Venda',
    icon: '📈'
  },
  '/precificar-agendar': {
    title: 'Precificar - Agendar',
    icon: '📅'
  },
  '/precificar-executar': {
    title: 'Precificar - Executar',
    icon: '⚡'
  },
  '/precificador/agenda/precificador-dataTable-novo': {
    title: 'Precificador - Agenda',
    icon: '📅'
  },
  '/precificador/executa/precificador-dataTable': {
    title: 'Precificador - Executar',
    icon: '⚡'
  },
  '/vendas': {
    title: 'Vendas',
    icon: '💰'
  },
  '/recebimentos/consulta': {
    title: 'Recebimentos',
    icon: '💳'
  },
  '/vendas/crediario/consulta': {
    title: 'Vendas - Crediário',
    icon: '💳'
  },
  '/vendas/crediario': {
    title: 'Vendas - Crediário',
    icon: '💳'
  },
  '/compras/analise/fornecedor': {
    title: 'Compras - Análise Fornecedor',
    icon: '🏪'
  },
  '/compras/estoque': {
    title: 'Compras - Estoque',
    icon: '📦'
  },
  '/estoque/ajustes': {
    title: 'Estoque - Ajustes',
    icon: '📦'
  },
  '/estoque/inventario/incluir-contagem': {
    title: 'Estoque - Incluir Contagem',
    icon: '🔢'
  },
  '/estoque/inventario/contar': {
    title: 'Estoque - Contar Produtos',
    icon: '🔢'
  },
  '/estoque/inventario/contar/:id': {
    title: 'Estoque - Contar Produtos',
    icon: '🔢'
  },
  '/estoque/lista-inventario': {
    title: 'Estoque - Lista Inventário',
    icon: '📋'
  },
  '/estoque/lista-inventario/:id': {
    title: 'Estoque - Análise Inventário',
    icon: '🔍'
  },
  '/estoque': {
    title: 'Estoque',
    icon: '📦'
  },
  '/estoque/contagem': {
    title: 'Estoque - Contagem',
    icon: '🔢'
  },
  '/compras/consulta': {
    title: 'Compras - Consulta',
    icon: '🛒'
  },
  '/compras/lista': {
    title: 'Compras - Lista',
    icon: '📋'
  },
  '/compras/fornecedor': {
    title: 'Compras - Fornecedor',
    icon: '🏪'
  },
  '/pdv/status': {
    title: 'PDV - Status',
    icon: '🖥️'
  },
  '/usuarios/etiqueta': {
    title: 'Usuários - Etiqueta',
    icon: '👤'
  }
};

export const useTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    openTab,
    isRouteOpen,
    getTabByRoute,
    activateTab
  } = useTabContext();

  // Função para navegar para uma rota, abrindo em nova aba se necessário
  const navigateToRoute = useCallback((route, component, customTitle = null, customIcon = null, state = undefined) => {
    const config = routeConfig[route] || {};
    const title = customTitle || config.title || 'Nova Aba';
    const icon = customIcon || config.icon || '📄';

    // Verificar se a rota já está aberta
    if (isRouteOpen(route)) {
      const existingTab = getTabByRoute(route);
      if (existingTab) {
        // Ativar a aba existente
        activateTab(existingTab.id);
        if (location.pathname !== route) {
          navigate(route, state !== undefined ? { state } : undefined);
        }
        return existingTab.id;
      }
    }

    // Abrir nova aba
    const tabId = openTab(route, title, component, icon);
    if (location.pathname !== route) {
      navigate(route, state !== undefined ? { state } : undefined);
    }
    return tabId;
  }, [openTab, isRouteOpen, getTabByRoute, activateTab, navigate, location.pathname]);

  // Função para obter configuração de uma rota (suporta rotas com parâmetros)
  const getRouteConfig = useCallback((route) => {
    // Primeiro, tentar encontrar uma correspondência exata
    if (routeConfig[route]) {
      return routeConfig[route];
    }
    
    // Para rotas com parâmetros, tentar encontrar o padrão base
    const routeParts = route.split('/');
    
    // Procurar por padrões que correspondam
    for (const configRoute in routeConfig) {
      const configParts = configRoute.split('/');
      
      if (configParts.length === routeParts.length) {
        let matches = true;
        
        for (let i = 0; i < configParts.length; i++) {
          if (configParts[i].startsWith(':')) {
            // É um parâmetro, continuar
            continue;
          } else if (configParts[i] !== routeParts[i]) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          // Personalizar título para rotas com parâmetros
          const config = { ...routeConfig[configRoute] };
          if (configRoute.includes(':id')) {
            const id = routeParts[routeParts.length - 1];
            config.title = `${config.title} #${id}`;
          }
          return config;
        }
      }
    }
    
    return { title: 'Nova Aba', icon: '📄' };
  }, []);

  // Função para verificar se uma rota está ativa
  const isRouteActive = useCallback((route) => {
    return location.pathname === route;
  }, [location.pathname]);

  // Função para obter a rota atual
  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  return {
    navigateToRoute,
    getRouteConfig,
    isRouteActive,
    getCurrentRoute,
    currentPath: location.pathname
  };
};
