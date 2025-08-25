import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Login from "../pages/login";
import NotFound from "../pages/404";

import PrecificadorExecuta from "../pages/precificador/executa/precificador-dataTable";
import AnaliseFornecedor from "../pages/compras/analise/fornecedor";

import Context from "../contexts";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import VendasDataTableComponent from "../pages/vendas/data-table-vendas-por-finalizador";
import Layout from "../components/layout";

import ListaCompras from "../pages/compras/lista";
import StatusPdv from "../pages/pdv/status";



import PrecificadorAgenda from "../pages/precificador/agenda/precificador-dataTable-novo";


import AjusteEstoque from "../pages/estoque";
import ContagemInventario from "../pages/estoque/contagem";


import EstoquePorEmpresa from "../pages/compras/estoquePorEmpresa";


import AnaliseInventario from "../pages/estoque/contagem/analise";
import RecebimentoPorData from "../pages/recebimento/porPagamento";


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
      <Layout>
        <Outlet />
      </Layout>
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
        <Route path="/login/:invalid_access" element={<Login />} />

        <Route path="/" element={<PrivateRoutes />}>
        <Route
            path="metabase"
            element={<Metabase />}
          />
         

         
       
          <Route path="precificar-agendar" element={<PrecificadorAgenda />} />
          <Route path="precificar-executar" element={<PrecificadorExecuta />} />
          
          {/* Rotas específicas do precificador */}
          <Route path="precificador/agenda/precificador-dataTable-novo" element={<PrecificadorAgenda />} />
          <Route path="precificador/executa/precificador-dataTable" element={<PrecificadorExecuta />} />
          
          <Route path="vendas" element={<VendasDataTableComponent />} />
        
         
         
         
          
          
         
          
        
          
          <Route path="recebimentos/consulta" element={<RecebimentoPorData />} />
          <Route path="vendas/crediario/consulta" element={<VendasCrediarioPorData />} />
          
          {/* Rotas específicas de vendas */}
          
          <Route path="vendas/crediario" element={<VendasCrediarioPorData />} />
          
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
          
          {/* Rotas específicas de estoque */}
          <Route path="estoque" element={<AjusteEstoque />} />
          <Route path="estoque/contagem" element={<ContagemInventario />} />
          
          <Route
            path="compras/analise/fornecedor/pedido/:id"
            exact={true}
            element={<AnaliseFornecedor />}
          />
          <Route path="compras/consulta" element={<ListaCompras />} />
          
          {/* Rotas específicas de compras */}
          <Route path="compras/lista" element={<ListaCompras />} />
          <Route path="compras/fornecedor" element={<AnaliseFornecedor />} />
          
          <Route path="pdv/status" element={<StatusPdv />} />
          <Route path="usuarios/etiqueta" element={<EtiquetaUsuario />} />
          
          {/* Rota 404 - deve ser a última rota */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}
