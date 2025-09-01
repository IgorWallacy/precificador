import React, { useState, useEffect } from 'react';
import api from '../../services/axios';
import moment from 'moment';
import './styles.css';

const TicketMedioCards = () => {
  const [dados, setDados] = useState({
    vendas: { hoje: 0, ontem: 0, variacao: 0 },
    itens: { hoje: 0, ontem: 0, variacao: 0 },
    transacoes: { hoje: 0, ontem: 0, variacao: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar dados de ticket médio
  const fetchTicketMedio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
      
      console.log('TicketMedioCards: Buscando dados:', { hoje, ontem });
      
      // Buscar dados de hoje e ontem
      const [responseHoje, responseOntem] = await Promise.all([
        api.get(`/api/vendas/ticket_medio/${hoje}/${hoje}`),
        api.get(`/api/vendas/ticket_medio/${ontem}/${ontem}`)
      ]);
      
      console.log('TicketMedioCards: Respostas da API:', {
        hoje: responseHoje.data,
        ontem: responseOntem.data
      });
      
      // Extrair dados da resposta
      const dadosHoje = responseHoje.data || [];
      const dadosOntem = responseOntem.data || [];
      
      // Calcular métricas
      const calcularMetricas = (dados) => {
        if (!Array.isArray(dados) || dados.length === 0) {
          return { vendas: 0, itens: 0, transacoes: 0 };
        }
        
        const totalVendas = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);
        const totalItens = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeItens || 0), 0);
        
        return {
          vendas: totalVendas,
          itens: totalItens,
          transacoes: totalVendas // Transações = número de vendas
        };
      };
      
      const metricasHoje = calcularMetricas(dadosHoje);
      const metricasOntem = calcularMetricas(dadosOntem);
      
      // Calcular variações
      const calcularVariacao = (hoje, ontem) => {
        if (ontem === 0) return 0;
        return ((hoje - ontem) / ontem) * 100;
      };
      
      const novosDados = {
        vendas: {
          hoje: metricasHoje.vendas,
          ontem: metricasOntem.vendas,
          variacao: parseFloat(calcularVariacao(metricasHoje.vendas, metricasOntem.vendas).toFixed(1))
        },
        itens: {
          hoje: metricasHoje.itens,
          ontem: metricasOntem.itens,
          variacao: parseFloat(calcularVariacao(metricasHoje.itens, metricasOntem.itens).toFixed(1))
        },
        transacoes: {
          hoje: metricasHoje.transacoes,
          ontem: metricasOntem.transacoes,
          variacao: parseFloat(calcularVariacao(metricasHoje.transacoes, metricasOntem.transacoes).toFixed(1))
        }
      };
      
      console.log('TicketMedioCards: Métricas calculadas:', novosDados);
      setDados(novosDados);
      
    } catch (error) {
      console.error('TicketMedioCards: Erro ao buscar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketMedio();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchTicketMedio, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchTicketMedio();
  };

  if (loading) {
    return (
      <div className="ticket-medio-cards-loading">
        <div className="loading-spinner"></div>
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-medio-cards-error">
        <p>❌ {error}</p>
        <button onClick={handleRefresh} className="retry-button">
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-medio-cards-container">
      {/* Card de Itens Vendidos */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)' }}>
            📦
          </div>
          <div className="stat-trend">
            <span className={`trend-value ${dados.itens.variacao >= 0 ? 'positive' : 'negative'}`}>
              {dados.itens.variacao >= 0 ? '+' : ''}{dados.itens.variacao}%
            </span>
            <span className="trend-period">vs ontem</span>
          </div>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">{dados.itens.hoje.toLocaleString('pt-BR')}</h3>
          <p className="stat-label">Itens Vendidos</p>
          <small className="stat-detail">
            {dados.itens.hoje > 0 
              ? `Total: ${dados.itens.hoje} produtos` 
              : 'Sem vendas hoje'}
          </small>
        </div>
      </div>

      {/* Card de Transações do Dia */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: 'var(--secondary-lighter)', color: 'var(--secondary-color)' }}>
            👥
          </div>
          <div className="stat-trend">
            <span className={`trend-value ${dados.transacoes.variacao >= 0 ? 'positive' : 'negative'}`}>
              {dados.transacoes.variacao >= 0 ? '+' : ''}{dados.transacoes.variacao}%
            </span>
            <span className="trend-period">vs ontem</span>
          </div>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">{dados.transacoes.hoje.toLocaleString('pt-BR')}</h3>
          <p className="stat-label">Transações do Dia</p>
          <small className="stat-detail">
            {dados.transacoes.hoje > 0 
              ? `${dados.transacoes.hoje} vendas realizadas` 
              : 'Sem transações hoje'}
          </small>
        </div>
      </div>

      {/* Card de Vendas */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-lighter)', color: 'var(--success-color)' }}>
            💰
          </div>
          <div className="stat-trend">
            <span className={`trend-value ${dados.vendas.variacao >= 0 ? 'positive' : 'negative'}`}>
              {dados.vendas.variacao >= 0 ? '+' : ''}{dados.vendas.variacao}%
            </span>
            <span className="trend-period">vs ontem</span>
          </div>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">{dados.vendas.hoje.toLocaleString('pt-BR')}</h3>
          <p className="stat-label">Vendas Realizadas</p>
          <small className="stat-detail">
            {dados.vendas.hoje > 0 
              ? `${dados.vendas.hoje} transações` 
              : 'Sem vendas hoje'}
          </small>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="refresh-section">
        <button onClick={handleRefresh} className="refresh-all-button">
          🔄 Atualizar Estatísticas
        </button>
        <small className="refresh-info">
          Dados atualizados automaticamente a cada 5 minutos
        </small>
      </div>
    </div>
  );
};

export default TicketMedioCards;
