import React, { useState, useEffect } from 'react';
import { 
  getAccessStatistics, 
  clearAccessHistory, 
  addPageWeight, 
  simulateAccesses,
  debugAccessHistory 
} from './utils';
import './debug-panel.css';

const DebugPanel = ({ isVisible = false, onClose }) => {
  const [stats, setStats] = useState(null);
  const [isOpen, setIsOpen] = useState(isVisible);

  useEffect(() => {
    if (isOpen) {
      updateStats();
    }
  }, [isOpen]);

  const updateStats = () => {
    const newStats = getAccessStatistics();
    setStats(newStats);
  };

  const handleClearHistory = (keepTopPages = false) => {
    if (window.confirm(`Deseja limpar o histórico${keepTopPages ? ' mantendo as top 10 páginas' : ' completamente'}?`)) {
      clearAccessHistory(keepTopPages);
      updateStats();
    }
  };

  const handleSimulateAccesses = () => {
    simulateAccesses();
    updateStats();
  };

  const handleAddWeight = (route) => {
    addPageWeight(route, 2);
    updateStats();
  };

  if (!isOpen) return null;

  return (
    <div className="debug-panel-overlay" onClick={onClose}>
      <div className="debug-panel" onClick={(e) => e.stopPropagation()}>
        <div className="debug-panel-header">
          <h3>🔧 Painel de Debug - SmartMenu</h3>
          <button className="debug-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="debug-panel-content">
          {stats && (
            <>
              <div className="debug-section">
                <h4>📊 Estatísticas Gerais</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total de Acessos:</span>
                    <span className="stat-value">{stats.totalAccesses}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Páginas Únicas:</span>
                    <span className="stat-value">{stats.uniquePages}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Último Acesso:</span>
                    <span className="stat-value">
                      {stats.lastAccess ? new Date(stats.lastAccess).toLocaleString() : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="debug-section">
                <h4>🏆 Top 10 Páginas Mais Acessadas</h4>
                <div className="top-pages-list">
                  {stats.topPages.map((route, index) => (
                    <div key={route} className="top-page-item">
                      <span className="page-rank">#{index + 1}</span>
                      <span className="page-route">{route}</span>
                      <span className="page-accesses">{stats.history[route]} acessos</span>
                      <button 
                        className="add-weight-btn"
                        onClick={() => handleAddWeight(route)}
                        title="Adicionar peso extra"
                      >
                        ⭐
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="debug-section">
                <h4>🛠️ Ações de Debug</h4>
                <div className="debug-actions">
                  <button 
                    className="debug-btn primary"
                    onClick={handleSimulateAccesses}
                  >
                    🎲 Simular Acessos
                  </button>
                  <button 
                    className="debug-btn warning"
                    onClick={() => handleClearHistory(true)}
                  >
                    🧹 Limpar (Manter Top 10)
                  </button>
                  <button 
                    className="debug-btn danger"
                    onClick={() => handleClearHistory(false)}
                  >
                    🗑️ Limpar Tudo
                  </button>
                  <button 
                    className="debug-btn info"
                    onClick={() => {
                      debugAccessHistory();
                      updateStats();
                    }}
                  >
                    📋 Console Log
                  </button>
                </div>
              </div>

              <div className="debug-section">
                <h4>💾 Histórico Completo (LocalStorage)</h4>
                <div className="history-json">
                  <pre>{JSON.stringify(stats.history, null, 2)}</pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
