import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import Login from "../pages/login";

import PrecificadorExecuta from "../pages/precificador/executa/precificador-dataTable";
import AnaliseFornecedor from "../pages/compras/analise/fornecedor";

import Context from "../contexts";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import MenuInterativo from "../pages/menu-interativo";
import VendasDataTableComponent from "../pages/vendas/data-table-vendas-por-finalizador";
import ConsultaProduto from "../pages/produto/consulta";
import ListaCompras from "../pages/compras/lista";
import StatusPdv from "../pages/pdv/status";
import Pivot from "../pages/bi";
import PrecificaProduto from "../pages/produto/precifica";
import ProdutoPrecificadorExecuta from "../pages/produto/executa-precificacao/executa/precificador-dataTable";
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
          <Route path="precificar-agendar" element={<App />} />
          <Route path="precificar-executar" element={<PrecificadorExecuta />} />
          <Route path="vendas" element={<VendasDataTableComponent />} />
          <Route path="bi/pivot" element={<Pivot />} />
          <Route
            path="compras/analise/fornecedor"
            element={<AnaliseFornecedor />}
          />
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
