import CustoVendaBI from "../pages/bi/custo-venda";
import Metabase from "../pages/metabase";
import PrecificadorAgenda from "../pages/precificador/agenda/precificador-dataTable-novo";
import PrecificadorExecuta from "../pages/precificador/executa/precificador-dataTable";
import ContagemInventario from "../pages/estoque/contagem";
import IncluirContagemInventario from "../pages/estoque/contagem/incluir";
import IncluirContagemProdutosInventario from "../pages/estoque/contagem/incluir/contagemProdutos";
import AjusteEstoque from "../pages/estoque";
import VendasDataTableComponent from "../pages/vendas/data-table-vendas-por-finalizador";
import RecebimentoPorData from "../pages/recebimento/porPagamento";
import VendasCrediarioPorData from "../pages/vendas/crediario";
import AnaliseInventario from "../pages/estoque/contagem/analise";
import AnaliseFornecedor from "../pages/compras/analise/fornecedor";
import EstoquePorEmpresa from "../pages/compras/estoquePorEmpresa";
import ListaCompras from "../pages/compras/lista";
import StatusPdv from "../pages/pdv/status";
import EtiquetaUsuario from "../pages/usuario/etiqueta";

export const routeComponentMap = {
  '/metabase': Metabase,
  '/bi/custo-venda': CustoVendaBI,
  '/precificar-agendar': PrecificadorAgenda,
  '/precificar-executar': PrecificadorExecuta,
  '/precificador/agenda/precificador-dataTable-novo': PrecificadorAgenda,
  '/precificador/executa/precificador-dataTable': PrecificadorExecuta,
  '/vendas': VendasDataTableComponent,
  '/recebimentos/consulta': RecebimentoPorData,
  '/vendas/crediario/consulta': VendasCrediarioPorData,
  '/vendas/crediario': VendasCrediarioPorData,
  '/compras/analise/fornecedor': AnaliseFornecedor,
  '/compras/estoque': EstoquePorEmpresa,
  '/estoque/ajustes': AjusteEstoque,
  '/estoque/inventario/incluir-contagem': IncluirContagemInventario,
  '/estoque/inventario/contar': IncluirContagemProdutosInventario,
  '/estoque/inventario/contar/:id': IncluirContagemProdutosInventario,
  '/estoque/lista-inventario': ContagemInventario,
  '/estoque/lista-inventario/:id': AnaliseInventario,
  '/estoque': AjusteEstoque,
  '/estoque/contagem': ContagemInventario,
  '/compras/consulta': ListaCompras,
  '/compras/lista': ListaCompras,
  '/compras/fornecedor': AnaliseFornecedor,
  '/pdv/status': StatusPdv,
  '/usuarios/etiqueta': EtiquetaUsuario
};

export const getComponentForRoute = (currentRoute) => {
  if (routeComponentMap[currentRoute]) return routeComponentMap[currentRoute];
  const routeParts = currentRoute.split('/');
  for (const mappedRoute in routeComponentMap) {
    const mappedParts = mappedRoute.split('/');
    if (mappedParts.length !== routeParts.length) continue;
    let matches = true;
    for (let i = 0; i < mappedParts.length; i++) {
      if (mappedParts[i].startsWith(':')) continue;
      if (mappedParts[i] !== routeParts[i]) { matches = false; break; }
    }
    if (matches) return routeComponentMap[mappedRoute];
  }
  return null;
};
