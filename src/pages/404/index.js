import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/metabase");
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-illustration">
          <div className="error-number">404</div>
          <div className="error-icon">🚫</div>
        </div>
        
        <div className="error-message">
          <h1>Página não encontrada</h1>
          <p>
            Ops! Parece que você se perdeu. A página que você está procurando 
            não existe ou foi movida para outro lugar.
          </p>
        </div>

        <div className="error-actions">
          <button className="btn-primary" onClick={goHome}>
            <span className="btn-icon">🏠</span>
            Voltar ao Início
          </button>
          <button className="btn-secondary" onClick={goBack}>
            <span className="btn-icon">⬅️</span>
            Voltar
          </button>
        </div>

        <div className="error-help">
          <h3>Precisa de ajuda?</h3>
          <div className="help-options">
            <div className="help-option">
              <span className="help-icon">🔍</span>
              <span>Verifique se o endereço está correto</span>
            </div>
            <div className="help-option">
              <span className="help-icon">📱</span>
              <span>Use o menu lateral para navegar</span>
            </div>
            <div className="help-option">
              <span className="help-icon">📧</span>
              <span>Entre em contato com o suporte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
