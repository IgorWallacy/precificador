import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTabContext } from '../../contexts/TabContext';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { getComponentForRoute } from '../../Routes/registry';

// Importar componentes para mapeamento automático
import CustoVendaBI from "../../pages/bi/custo-venda";
import Metabase from "../../pages/metabase";
import PrecificadorAgenda from "../../pages/precificador/agenda/precificador-dataTable-novo";
import PrecificadorExecuta from "../../pages/precificador/executa/precificador-dataTable";
import ContagemInventario from "../../pages/estoque/contagem";
import IncluirContagemInventario from "../../pages/estoque/contagem/incluir";
import IncluirContagemProdutosInventario from "../../pages/estoque/contagem/incluir/contagemProdutos";
import AjusteEstoque from "../../pages/estoque";
import VendasDataTableComponent from "../../pages/vendas/data-table-vendas-por-finalizador";
import RecebimentoPorData from "../../pages/recebimento/porPagamento";
import VendasCrediarioPorData from "../../pages/vendas/crediario";
import AnaliseInventario from "../../pages/estoque/contagem/analise";
import AnaliseFornecedor from "../../pages/compras/analise/fornecedor";
import EstoquePorEmpresa from "../../pages/compras/estoquePorEmpresa";
import ListaCompras from "../../pages/compras/lista";
import StatusPdv from "../../pages/pdv/status";
import EtiquetaUsuario from "../../pages/usuario/etiqueta";

// Funções utilitárias movidas para routes/registry

/**
 * Componente para sincronizar a rota atual com o sistema de abas
 * Detecta mudanças de rota e abre/ativa abas automaticamente
 */
const TabSync = () => {
  const location = useLocation();
  const { tabs, isRouteOpen, getTabByRoute, activateTab } = useTabContext();
  const { navigateToRoute, getRouteConfig } = useTabNavigation();

  useEffect(() => {
    const currentRoute = location.pathname;
    
    // Ignorar rota de login
    if (currentRoute === '/' || currentRoute.includes('/login')) {
      return;
    }

    // Removido bloqueio por largura de tela para sempre abrir abas ao navegar

    // Verificar se a rota atual já tem uma aba aberta
    const existingTab = getTabByRoute(currentRoute);
    if (existingTab) {
      // Ativar imediatamente para refletir o clique na barra de abas
      if (!existingTab.isActive) activateTab(existingTab.id);
      return;
    }

    // Verificar se já existe uma aba para esta rota exata
    // Removido retorno precoce: vamos garantir que a aba exista/esteja ativa

    // Evitar reabrir a mesma rota várias vezes: só abre se não existir aba
    const component = getComponentForRoute(currentRoute);
    if (!component) return;

    // Obter configuração da rota (título e ícone)
    const routeConfig = getRouteConfig(currentRoute);
    
    // Abrir nova aba automaticamente (sem navegar novamente para evitar reset visual)
    // Preservar o state da navegação original ao abrir a aba
    navigateToRoute(currentRoute, component, routeConfig.title, routeConfig.icon, location.state);
    
  // Importante: depender apenas da rota, para não interferir na troca manual de abas
  }, [location.pathname]);

  // Este componente não renderiza nada
  return null;
};

export default TabSync;
