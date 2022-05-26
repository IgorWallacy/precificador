import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import Login from "../pages/login";


import PrecificadorExecuta from '../pages/precificador/executa/precificador-dataTable'



import Context from "../contexts";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import MenuInterativo from "../pages/menu-interativo";

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
    <Context.Provider value={{ logado, setLogado , usuarioLogado, setUsuarioLogado }}>
      <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/"  element={<PrivateRoutes />}>
          <Route path="menu" element={<MenuInterativo />} />
          <Route path="precificar-agendar" element={<App />} />
          <Route path="precificar-executar" element={<PrecificadorExecuta />} />
         
        </Route>
      </Routes>
    </Context.Provider>
  );
}
