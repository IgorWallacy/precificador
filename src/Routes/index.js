import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import Login from "../pages/login";


import Context from "../contexts";
import { Navigate, Outlet, useLocation } from "react-router-dom";

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
          <Route   element={<PrivateRoutes />}>
          <Route path="precificar" element={<App />} />
         
        </Route>
      </Routes>
    </Context.Provider>
  );
}
