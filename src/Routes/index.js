import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

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
import PrecificadorAgenda from "../pages/precificador/agenda/precificador-dataTable-novo";
import MetasComponent from "../pages/vendas/produtos/metas";
import PrecosAlteradosComponent from "../pages/produto/precos-alterados";
import CadastrarValidade from "../pages/produto/validade/novo";
import AjusteEstoque from "../pages/estoque";
import ContagemInventario from "../pages/estoque/contagem";
import ResumoVendas from "../pages/vendas/resumo";

import EstoquePorEmpresa from "../pages/compras/estoquePorEmpresa";
import ConsultaLote from "../pages/produto/validade/consulta";

import AnaliseInventario from "../pages/estoque/contagem/analise";
import RecebimentoPorData from "../pages/recebimento/porPagamento";
import ConsultaProduto from "../pages/produto/consulta";

import { jwtDecode } from "jwt-decode"; 
import Metabase from "../pages/metabase";
import IncluirContagemInventario from "../pages/estoque/contagem/incluir";
import IncluirContagemProdutosInventario from '../pages/estoque/contagem/incluir/contagemProdutos'
import VendasCrediarioPorData from "../pages/vendas/crediario";
import EtiquetaUsuario from "../pages/usuario/etiqueta";


export default function Router() {
  const [logado, setLogado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState();
 

  const PrivateRoutes = () => {
    const location = useLocation();
   
    const [haveToken , setHaveToken] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
      setHaveToken(localStorage.getItem('access_token'));
    },[])

    useEffect(()=> {

      const token = localStorage.getItem('access_token');
      if(token){
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // convertendo milissegundos para segundos
        if (decodedToken.exp > currentTime) {
          // Token ainda é válido
          setLogado(true)
          
        } else {
          setHaveToken(null)
          setLogado(false)
         // navigation('/')
         
        }
      }
  
    },[location])

    return haveToken ? (
      <>
       <Outlet />
      
      </>
     
    ) : (
      <>
      
      <Navigate to="/" replace state={{ from: location }} />
     
      </>
      
    );
  };

  return (
    <Context.Provider
      value={{ logado, setLogado, usuarioLogado, setUsuarioLogado }}
    
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login/:invalid_access" element={<Login />} />

        <Route path="/" element={<PrivateRoutes />}>
        <Route
            path="metabase"
            element={<Metabase />}
          />
          <Route
            path="produtos/precificar-agendar"
            element={<PrecificaProduto />}
          />

          <Route
            path="produtos/precificar-executar"
            element={<ProdutoPrecificadorExecuta />}
          />
          <Route path="menu" element={<MenuInterativo />} />
          <Route path="precificar-agendar" element={<PrecificadorAgenda />} />
          <Route path="precificar-executar" element={<PrecificadorExecuta />} />
          <Route path="vendas" element={<VendasDataTableComponent />} />
          <Route path="produtos/sem-vendas" element={<ProdutosSemVendas />} />
          <Route
            path="produtos/validade/novo"
            element={<CadastrarValidade />}
          />
          <Route path="produtos/consulta" element={<ConsultaProduto />} />
          <Route path="produtos/validade/consulta" element={<ConsultaLote />} />
          <Route
            path="produtos/precos-alterados"
            element={<PrecosAlteradosComponent />}
          />
          <Route path="vendas/indicadores" element={<GraficosIndex />} />
          <Route path="vendas/resumo" element={<ResumoVendas />} />
          <Route path="vendas/metas" element={<MetasComponent />} />
          <Route path="bi/pivot" element={<Pivot />} />
          <Route path="recebimentos/consulta" element={<RecebimentoPorData />} />
          <Route path="vendas/crediario/consulta" element={<VendasCrediarioPorData />} />
        
          <Route
            path="compras/analise/fornecedor"
            element={<AnaliseFornecedor />}
          />
          <Route path="compras/estoque" element={<EstoquePorEmpresa />} />
          <Route path="estoque/ajustes" element={<AjusteEstoque />} />
          <Route
            path="estoque/inventario/incluir-contagem"
            element={<IncluirContagemInventario />}
          />
           <Route
            path="estoque/inventario/contar"
            element={<IncluirContagemProdutosInventario />}
          />
          <Route
            path="estoque/lista-inventario"
            element={<ContagemInventario />}
          />
          <Route
            path="estoque/lista-inventario/:id"
            exact={true}
            element={<AnaliseInventario />}
          />
          

          <Route
            path="compras/analise/fornecedor/pedido/:id"
            exact={true}
            element={<AnaliseFornecedor />}
          />
          <Route path="compras/consulta" element={<ListaCompras />} />
          <Route path="pdv/status" element={<StatusPdv />} />
          <Route path="usuarios/etiqueta" element={<EtiquetaUsuario />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}
