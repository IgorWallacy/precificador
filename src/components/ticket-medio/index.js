import React, { useState, useEffect } from 'react';
import api from '../../services/axios';
import moment from 'moment';
import './styles.css';

const TicketMedio = () => {
  const [dados, setDados] = useState({
    hoje: 0,
    ontem: 0,
    variacao: 0,
    vendas: { hoje: 0, ontem: 0, semana: 0 },
    totais: { hoje: 0, ontem: 0, semana: 0 },
    itens: { hoje: 0, ontem: 0, semana: 0 }
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
      const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      console.log('TicketMedio: Buscando dados:', { hoje, ontem, semanaPassada });
      
      // Buscar dados em paralelo
      const [responseHoje, responseOntem, responseSemana] = await Promise.all([
        api.get(`/api/vendas/ticket_medio/${hoje}/${hoje}`),
        api.get(`/api/vendas/ticket_medio/${ontem}/${ontem}`),
        api.get(`/api/vendas/ticket_medio/${semanaPassada}/${hoje}`)
      ]);
      
      console.log('TicketMedio: Respostas da API:', {
        hoje: responseHoje.data,
        ontem: responseOntem.data,
        semana: responseSemana.data
      });
      
      // Extrair dados da resposta
      const dadosHoje = responseHoje.data || [];
      const dadosOntem = responseOntem.data || [];
      const dadosSemana = responseSemana.data || [];
      
      // Calcular métricas
      const calcularMetricas = (dados) => {
        if (!Array.isArray(dados) || dados.length === 0) {
          return { valor: 0, vendas: 0, itens: 0 };
        }
        
        const totalValor = dados.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);
        const totalVendas = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);
        const totalItens = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeItens || 0), 0);
        
        const ticketMedio = totalVendas > 0 ? totalValor / totalVendas : 0;
        
        return {
          valor: ticketMedio,
          vendas: totalVendas,
          itens: totalItens,
          totalValor: totalValor
        };
      };
      
      const metricasHoje = calcularMetricas(dadosHoje);
      const metricasOntem = calcularMetricas(dadosOntem);
      const metricasSemana = calcularMetricas(dadosSemana);
      
      // Calcular variação
      const variacao = metricasOntem.valor > 0 ? 
        ((metricasHoje.valor - metricasOntem.valor) / metricasOntem.valor) * 100 : 0;
      
      const novosDados = {
        hoje: metricasHoje.valor,
        ontem: metricasOntem.valor,
        variacao: parseFloat(variacao.toFixed(1)),
        vendas: {
          hoje: metricasHoje.vendas,
          ontem: metricasOntem.vendas,
          semana: metricasSemana.vendas
        },
        totais: {
          hoje: metricasHoje.totalValor,
          ontem: metricasOntem.totalValor,
          semana: metricasSemana.totalValor
        },
        itens: {
          hoje: metricasHoje.itens,
          ontem: metricasOntem.itens,
          semana: metricasSemana.itens
        }
      };
      
      console.log('TicketMedio: Métricas calculadas:', novosDados);
      setDados(novosDados);
      
    } catch (error) {
      console.error('TicketMedio: Erro ao buscar dados:', error);
      setError('Erro ao carregar dados do ticket médio');
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
      <div className="ticket-medio-loading">
        <div className="loading-spinner"></div>
        <p>Carregando ticket médio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-medio-error">
        <p>❌ {error}</p>
        <button onClick={handleRefresh} className="retry-button">
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-medio-container">
      <div className="ticket-medio-header">
        <h3>📊 Ticket Médio</h3>
        <button onClick={handleRefresh} className="refresh-button" title="Atualizar dados">
          🔄
        </button>
      </div>
      
      <div className="ticket-medio-stats">
        <div className="stat-item">
          <div className="stat-label">Ticket Médio Hoje</div>
          <div className="stat-value">
            R$ {dados.hoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className={`stat-variacao ${dados.variacao >= 0 ? 'positive' : 'negative'}`}>
            {dados.variacao >= 0 ? '+' : ''}{dados.variacao}% vs ontem
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Transações Hoje</div>
          <div className="stat-value">{dados.vendas.hoje.toLocaleString('pt-BR')}</div>
          <div className="stat-detail">
            {dados.vendas.ontem > 0 ? 
              `${dados.vendas.hoje >= dados.vendas.ontem ? '+' : ''}${((dados.vendas.hoje - dados.vendas.ontem) / dados.vendas.ontem * 100).toFixed(1)}% vs ontem` : 
              'Primeiro dia com dados'
            }
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Itens Vendidos</div>
          <div className="stat-value">{dados.itens.hoje.toLocaleString('pt-BR')}</div>
          <div className="stat-detail">
            {dados.itens.ontem > 0 ? 
              `${dados.itens.hoje >= dados.itens.ontem ? '+' : ''}${((dados.itens.hoje - dados.itens.ontem) / dados.itens.ontem * 100).toFixed(1)}% vs ontem` : 
              'Primeiro dia com dados'
            }
          </div>
        </div>
      </div>
      
      <div className="ticket-medio-summary">
        <div className="summary-item">
          <span className="summary-label">Total Vendido Hoje:</span>
          <span className="summary-value">
            R$ {dados.totais.hoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Ticket Médio Ontem:</span>
          <span className="summary-value">
            R$ {dados.ontem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Média Semanal:</span>
          <span className="summary-value">
            R$ {(dados.totais.semana / 7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      
      {dados.variacao < -20 && (
        <div className="ticket-medio-alert warning">
          ⚠️ Queda significativa no ticket médio! ({dados.variacao}%)
        </div>
      )}
      
      {dados.variacao > 30 && (
        <div className="ticket-medio-alert success">
          🚀 Aumento significativo no ticket médio! (+{dados.variacao}%)
        </div>
      )}
    </div>
  );
};

export default TicketMedio;
