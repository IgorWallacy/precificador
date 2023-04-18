import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/login";

import PrecificadorExecuta from "../pages/precificador/executa/precificador-dataTable";
import AnaliseFornecedor from "../pages/compras/analise/fornecedor";

import Context from "../contexts";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import MenuInterativo from "../pages/menu-interativo";
import VendasDataTableComponent from "../pages/vendas/data-table-vendas-por-finalizador";

import ListaCompras from "../pages/compras/lista";
import StatusPdv from "../pages/pdv/status";
import Pivot from "../pages/bi";
import PrecificaProduto from "../pages/produto/precifica";
import ProdutoPrecificadorExecuta from "../pages/produto/executa-precificacao/executa/precificador-dataTable";
import ProdutosSemVendas from "../pages/vendas/produtos/sem-vendas";
import GraficosIndex from "../pages/vendas/graficos";
import Main from "../components/main";
import MetasComponent from "../pages/vendas/produtos/metas";
import PrecosAlteradosComponent from "../pages/produto/precos-alterados";
import EstoqueComprasComponent from "../pages/compras/estoque";

export default function Router() {
  const [logado, setLogado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState();

  const PrivateRoutes = () => {
    const location = useLocation();

    return logado ? (
      <Outlet />
    ) : (
      <Navigate to="/" replace state={{ from: location }} />
    );
  };

  return (
    <Context.Provider
      value={{ logado, setLogado, usuarioLogado, setUsuarioLogado }}
    >
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/" element={<PrivateRoutes />}>
          <Route
            path="produtos/precificar-agendar"
            element={<PrecificaProduto />}
          />

          <Route
            path="produtos/precificar-executar"
            element={<ProdutoPrecificadorExecuta />}
          />
          <Route path="menu" element={<MenuInterativo />} />
          <Route path="precificar-agendar" element={<Main />} />
          <Route path="precificar-executar" element={<PrecificadorExecuta />} />
          <Route path="vendas" element={<VendasDataTableComponent />} />
          <Route path="produtos/sem-vendas" element={<ProdutosSemVendas />} />
          <Route
            path="produtos/precos-alterados"
            element={<PrecosAlteradosComponent />}
          />
          <Route path="vendas/indicadores" element={<GraficosIndex />} />
          <Route path="vendas/metas" element={<MetasComponent />} />
          <Route path="bi/pivot" element={<Pivot />} />
          <Route
            path="compras/analise/fornecedor"
            element={<AnaliseFornecedor />}
          />
          <Route path="compras/estoque" element={<EstoqueComprasComponent />} />
          <Route
            path="compras/analise/fornecedor/pedido/:id"
            exact={true}
            element={<AnaliseFornecedor />}
          />
          <Route path="compras/consulta" element={<ListaCompras />} />
          <Route path="pdv/status" element={<StatusPdv />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}
