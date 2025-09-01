import React, { useState, useEffect } from 'react';
import './styles.css';

const TabShortcutsInfo = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar instruções por alguns segundos ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Auto-esconder após 8 segundos
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      
      return () => clearTimeout(hideTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar novamente quando pressionar F1
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsVisible(true);
        // Auto-esconder após 10 segundos
        setTimeout(() => setIsVisible(false), 10000);
      }
      
      // Esconder com Escape
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="tab-shortcuts-info">
      <div className="shortcuts-header">
        <h3>⌨️ Atalhos de Navegação das Abas</h3>
        <button 
          className="close-btn"
          onClick={() => setIsVisible(false)}
          title="Fechar (ESC)"
        >
          ×
        </button>
      </div>
      
      <div className="shortcuts-list">
        <div className="shortcut-item">
          <span className="keys">
            <kbd>Ctrl</kbd> + <kbd>Tab</kbd>
          </span>
          <span className="description">Próxima aba</span>
        </div>
        
        <div className="shortcut-item">
          <span className="keys">
            <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd>
          </span>
          <span className="description">Aba anterior</span>
        </div>
        
        <div className="shortcut-item">
          <span className="keys">
            <kbd>Ctrl</kbd> + <kbd>1-9</kbd>
          </span>
          <span className="description">Ir para aba específica</span>
        </div>
        
        <div className="shortcut-item">
          <span className="keys">
            <kbd>F1</kbd>
          </span>
          <span className="description">Mostrar esta ajuda</span>
        </div>
      </div>
      
      <div className="debug-info">
        <p><strong>🔧 Debug:</strong> Abra o Console (F12) para ver logs detalhados dos cliques</p>
        <p><strong>📊 Stats:</strong> Digite <code>reportTabStats()</code> no console para relatório</p>
      </div>
    </div>
  );
};

export default TabShortcutsInfo;
