import React, { useState, useEffect } from 'react';
import { useTabContext } from '../../contexts/TabContext';
import './TabContentExample.css';

/**
 * Exemplo de como usar o sistema de abas em um componente de página
 * Este componente demonstra as principais funcionalidades do sistema
 */
const TabContentExample = ({ tabId }) => {
  const { updateTabState, setTabWorking, getActiveTab } = useTabContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  // Obter informações da aba ativa
  const activeTab = getActiveTab();

  // Simular carregamento de dados
  const loadData = async () => {
    setLoading(true);
    setTabWorking(tabId, true);

    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        value: Math.random() * 1000,
        status: 'success'
      };

      setData(mockData);
      
      // Salvar estado na aba
      updateTabState(tabId, {
        lastDataLoad: Date.now(),
        data: mockData,
        loadCount: (activeTab?.state?.loadCount || 0) + 1
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      updateTabState(tabId, { error: error.message });
    } finally {
      setLoading(false);
      setTabWorking(tabId, false);
    }
  };

  // Incrementar contador
  const incrementCounter = () => {
    const newCounter = counter + 1;
    setCounter(newCounter);
    
    // Salvar estado na aba
    updateTabState(tabId, { counter: newCounter });
  };

  // Carregar dados iniciais se não existirem
  useEffect(() => {
    if (!data && !loading) {
      loadData();
    }
  }, []);

  // Restaurar estado da aba se existir
  useEffect(() => {
    if (activeTab?.state) {
      if (activeTab.state.counter !== undefined) {
        setCounter(activeTab.state.counter);
      }
      if (activeTab.state.data) {
        setData(activeTab.state.data);
      }
    }
  }, [activeTab?.state]);

  return (
    <div className="tab-content-example">
      <div className="example-header">
        <h2>Exemplo de Sistema de Abas</h2>
        <p>Esta é a aba: <strong>{activeTab?.title || 'Desconhecida'}</strong></p>
        <p>ID da aba: <code>{tabId}</code></p>
      </div>

      <div className="example-controls">
        <button 
          onClick={loadData} 
          disabled={loading}
          className="control-btn primary"
        >
          {loading ? 'Carregando...' : 'Carregar Dados'}
        </button>
        
        <button 
          onClick={incrementCounter}
          className="control-btn secondary"
        >
          Incrementar Contador ({counter})
        </button>
      </div>

      <div className="example-content">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Carregando dados...</p>
          </div>
        )}

        {data && (
          <div className="data-display">
            <h3>Dados Carregados:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <p>
              <strong>Última atualização:</strong> {new Date(data.timestamp).toLocaleString('pt-BR')}
            </p>
            <p>
              <strong>Contador de carregamentos:</strong> {activeTab?.state?.loadCount || 0}
            </p>
          </div>
        )}

        {activeTab?.state?.error && (
          <div className="error-display">
            <h3>Erro:</h3>
            <p>{activeTab.state.error}</p>
          </div>
        )}
      </div>

      <div className="example-info">
        <h3>Informações da Aba:</h3>
        <ul>
          <li><strong>Ativa:</strong> {activeTab?.isActive ? 'Sim' : 'Não'}</li>
          <li><strong>Trabalhando:</strong> {activeTab?.isWorking ? 'Sim' : 'Não'}</li>
          <li><strong>Última atividade:</strong> {activeTab?.lastActivity ? new Date(activeTab.lastActivity).toLocaleString('pt-BR') : 'N/A'}</li>
          <li><strong>Estado salvo:</strong> {Object.keys(activeTab?.state || {}).length} propriedades</li>
        </ul>
      </div>

      <div className="example-tips">
        <h3>💡 Dicas de Uso:</h3>
        <ul>
          <li>O estado da aba é salvo automaticamente</li>
          <li>Você pode alternar entre abas sem perder dados</li>
          <li>Use <code>setTabWorking</code> para indicar processamento</li>
          <li>Use <code>updateTabState</code> para salvar dados importantes</li>
        </ul>
      </div>
    </div>
  );
};

export default TabContentExample;
