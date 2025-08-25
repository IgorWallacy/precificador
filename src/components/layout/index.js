import React from "react";
import "./styles.css";
import SmartMenu from "../smart-menu";
import Sidebar from "../sidebar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Header fixo */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📈</span>
            <span className="logo-text">JJ Sistemas</span>
          </div>
        </div>

        {/* Menu Inteligente integrado ao header */}
        <div className="header-center">
          <SmartMenu />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;