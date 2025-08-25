import React, { useState, useEffect } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';


const Metabase = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vendas: { total: 0, variacao: 0, periodo: 'hoje' },
    produtos: { total: 0, variacao: 0, periodo: 'hoje' },
    estoque: { total: 0, variacao: 0, periodo: 'hoje' },
    clientes: { total: 0, variacao: 0, periodo: 'hoje' }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        vendas: { total: 15420.50, variacao: 12.5, periodo: 'hoje' },
        produtos: { total: 1247, variacao: -2.3, periodo: 'hoje' },
        estoque: { total: 89234, variacao: 5.7, periodo: 'hoje' },
        clientes: { total: 156, variacao: 8.9, periodo: 'hoje' }
      });

      setRecentActivity([
        {
          id: 1,
          tipo: 'venda',
          descricao: 'Venda realizada - R$ 245,80',
          horario: '14:30',
          status: 'concluida'
        },
        {
          id: 2,
          tipo: 'estoque',
          descricao: 'Produto "Arroz Integral" reabastecido',
          horario: '13:45',
          status: 'concluida'
        },
        {
          id: 3,
          tipo: 'precificacao',
          descricao: 'Alteração de preço agendada para amanhã',
          horario: '12:20',
          status: 'pendente'
        },
        {
          id: 4,
          tipo: 'cliente',
          descricao: 'Novo cliente cadastrado',
          horario: '11:15',
          status: 'concluida'
        }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluida': return 'var(--success-color)';
      case 'pendente': return 'var(--warning-color)';
      case 'erro': return 'var(--error-color)';
      default: return 'var(--neutral-500)';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'venda': return '💰';
      case 'estoque': return '📦';
      case 'precificacao': return '📊';
      case 'cliente': return '👤';
      default: return '📋';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'venda': return 'var(--success-color)';
      case 'estoque': return 'var(--primary-color)';
      case 'precificacao': return 'var(--accent-color)';
      case 'cliente': return 'var(--secondary-color)';
      default: return 'var(--neutral-500)';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header do Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Visão geral do seu supermercado
            </p>
          </div>
          
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-lighter)', color: 'var(--success-color)' }}>
                💰
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.vendas.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.vendas.variacao >= 0 ? '+' : ''}{stats.vendas.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">R$ {stats.vendas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <p className="stat-label">Vendas do Dia</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)' }}>
                📦
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.produtos.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.produtos.variacao >= 0 ? '+' : ''}{stats.produtos.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.produtos.total.toLocaleString('pt-BR')}</h3>
              <p className="stat-label">Produtos Vendidos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--accent-lighter)', color: 'var(--accent-color)' }}>
                🏪
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.estoque.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.estoque.variacao >= 0 ? '+' : ''}{stats.estoque.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.estoque.total.toLocaleString('pt-BR')}</h3>
              <p className="stat-label">Itens em Estoque</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--secondary-lighter)', color: 'var(--secondary-color)' }}>
                👥
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.clientes.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.clientes.variacao >= 0 ? '+' : ''}{stats.clientes.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.clientes.total}</h3>
              <p className="stat-label">Clientes Atendidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="main-content-section">
        <div className="content-grid">
          {/* Atividade Recente */}
          <div className="content-card">
            <div className="card-header">
              <h3>Atividade Recente</h3>
              <button className="btn btn-sm btn-outline">Ver Todas</button>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ backgroundColor: `${getTipoColor(activity.tipo)}20`, color: getTipoColor(activity.tipo) }}>
                      {getTipoIcon(activity.tipo)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-description">{activity.descricao}</p>
                      <div className="activity-meta">
                        <span className="activity-time">{activity.horario}</span>
                        <span
                          className="activity-status"
                          style={{ color: getStatusColor(activity.status) }}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="content-card">
            <div className="card-header">
              <h3>Ações Rápidas</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/precificador/agenda/precificador-dataTable-novo')}>
                  <span className="action-icon">💰</span>
                  <span className="action-text">Agendar Preços</span>

                </button>
                <button className="quick-action-btn" onClick={() => navigate('/precificador/executa/precificador-dataTable')}>
                  <span className="action-icon">🏷️</span>
                  <span className="action-text">Emitir etiquetas de preços / enviar carga para o PDV</span>

                </button>
                <button className="quick-action-btn" onClick={() => navigate('/estoque/lista-inventario')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Novo Inventário</span>

                </button>
                <button className="quick-action-btn" onClick={() => navigate('/estoque/inventario/incluir-contagem')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Lançar produtos no inventário	</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/compras/consulta')}>
                  <span className="action-icon">👥</span>
                  <span className="action-text">Gestão de Compras</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/vendas')}>
                  <span className="action-icon">🛒</span>
                  <span className="action-text">Vendas</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">Configurações</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Vendas */}
        <div className="content-card full-width">
          <div className="card-header">
            <h3>Vendas dos Últimos 7 Dias</h3>
            <div className="chart-controls">
              <button className="btn btn-sm btn-outline">7D</button>
              <button className="btn btn-sm btn-outline">30D</button>
              <button className="btn btn-sm btn-outline">90D</button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              <div className="chart-icon">📈</div>
              <p>Gráfico de vendas será exibido aqui</p>
              <small>Integração com biblioteca de gráficos</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metabase;
