import React from "react";
import "./newsMetricsDialog.css";

// Mapeamento completo de códigos para explicações detalhadas
const explicacoesPadrao = {
  "💰 VENDAS HOJE": "Soma de todas as vendas líquidas realizadas no dia corrente. Representa o faturamento total do período.",
  "🎫 TICKET MÉDIO": "Valor médio gasto pelos clientes por transação no dia corrente. Indica o poder de compra dos clientes.",
  "🛒 TRANSAÇÕES HOJE": "Quantidade de vendas realizadas (documentos/PDVs) no dia corrente. Mostra o volume de atendimentos.",
  "📦 ITENS VENDIDOS HOJE": "Total de itens (quantidade) vendidos no dia corrente. Indica a produtividade das vendas.",
  "📱 VENDAS NFC-e": "Total de vendas realizadas via Nota Fiscal eletrônica. Representa vendas digitais e modernas.",
  "💳 VENDAS ECF": "Total de vendas realizadas via Emissor de Cupom Fiscal. Representa vendas tradicionais em PDV.",
  "🏆 PDV DESTAQUE NFC-e": "PDV com maior volume de vendas via NFC-e. Indica qual equipamento está mais produtivo.",
  "🖥️ PDV DESTAQUE ECF": "PDV com maior volume de vendas via ECF. Mostra qual equipamento tradicional está mais ativo.",
  "🌟 PDV DESTAQUE GERAL": "PDV com maior faturamento total. Indica o equipamento mais rentável da operação.",
  "❌ PRODUTOS CANCELADOS": "Quantidade de produtos cancelados no período. Indica problemas ou mudanças de decisão.",
  "📊 DISTRIBUIÇÃO DOCUMENTOS": "Percentual de vendas por tipo de documento (NFC-e vs ECF). Mostra a modernização da operação.",
  "🎯 EFICIÊNCIA": "Percentual de vendas efetivas vs cancelamentos. Indica a qualidade da operação.",
  "📈 TAXA CANCELAMENTOS": "Percentual de cancelamentos por período. Indica problemas operacionais ou de atendimento.",
  "📊 BI - LUCRO HOJE": "Lucro bruto calculado (vendas - custos) do dia corrente. Métrica fundamental de rentabilidade.",
  "📊 BI - MARGEM HOJE": "Percentual de lucro sobre as vendas. Indica a rentabilidade percentual da operação.",
  "📊 BI - CUSTO TOTAL HOJE": "Custo total dos produtos vendidos. Base para cálculo de lucratividade.",
  "📊 BI - PREÇO MÉDIO HOJE": "Preço médio de venda por item. Compara com custo para análise de margem.",
  "📊 BI - COMPARATIVO ONTEM": "Variação percentual de vendas vs dia anterior. Indica tendência de crescimento.",
  "📊 BI - RESUMO SEMANA": "Resumo consolidado da semana anterior. Permite análise de tendências semanais.",
  "📊 BI - RESUMO MÊS": "Resumo consolidado do mês anterior. Permite análise de tendências mensais.",
  "📊 BI - EFICIÊNCIA OPERACIONAL": "Margem de lucro como indicador de eficiência. Margem >20% é considerada boa.",
  "📊 BI - ANÁLISE CUSTO-BENEFÍCIO": "Quantidade de itens vendidos vs custos. Indica a rentabilidade por item."
};

const obterExplicacao = (codigo) => {
  return explicacoesPadrao[codigo] || "Métrica de desempenho da operação que monitora aspectos importantes do negócio.";
};

const obterCategoria = (codigo) => {
  if (codigo.includes("BI")) return "business-intelligence";
  if (codigo.includes("VENDAS") || codigo.includes("TICKET") || codigo.includes("TRANSAÇÕES")) return "vendas";
  if (codigo.includes("PDV") || codigo.includes("NFC-e") || codigo.includes("ECF")) return "operacional";
  if (codigo.includes("CANCELAMENTOS") || codigo.includes("EFICIÊNCIA")) return "qualidade";
  return "geral";
};

const obterIcone = (codigo) => {
  if (codigo.includes("💰")) return "💰";
  if (codigo.includes("🎫")) return "🎫";
  if (codigo.includes("🛒")) return "🛒";
  if (codigo.includes("📦")) return "📦";
  if (codigo.includes("📱")) return "📱";
  if (codigo.includes("💳")) return "💳";
  if (codigo.includes("🏆")) return "🏆";
  if (codigo.includes("🖥️")) return "🖥️";
  if (codigo.includes("🌟")) return "🌟";
  if (codigo.includes("❌")) return "❌";
  if (codigo.includes("📊")) return "📊";
  if (codigo.includes("🎯")) return "🎯";
  if (codigo.includes("📈")) return "📈";
  return "📋";
};

export default function NewsMetricsDialog({ visible, onHide, metrics = [] }) {
  if (!visible) return null;

  // Agrupar métricas por categoria
  const metricasPorCategoria = metrics.reduce((acc, metric) => {
    const categoria = obterCategoria(metric.code);
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(metric);
    return acc;
  }, {});

  const categorias = {
    "vendas": { nome: "Vendas e Faturamento", cor: "#4CAF50" },
    "operacional": { nome: "Operação e PDVs", cor: "#2196F3" },
    "business-intelligence": { nome: "Business Intelligence", cor: "#9C27B0" },
    "qualidade": { nome: "Qualidade e Eficiência", cor: "#FF9800" },
    "geral": { nome: "Métricas Gerais", cor: "#607D8B" }
  };

  return (
    <div className="metrics-dialog-overlay" onClick={onHide}>
      <div className="metrics-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="header-content">
            <h2>📊 Dashboard de Métricas</h2>
            <p className="header-subtitle">Análise detalhada do desempenho operacional</p>
          </div>
          <button className="close-btn" onClick={onHide}>×</button>
        </div>
        
        <div className="dialog-content">
          {Object.entries(metricasPorCategoria).map(([categoria, metricas]) => (
            <div key={categoria} className="categoria-section">
              <div className="categoria-header" style={{ borderLeftColor: categorias[categoria]?.cor }}>
                <h3>{categorias[categoria]?.nome}</h3>
                <span className="metric-count">{metricas.length} métricas</span>
              </div>
              
              <div className="metrics-grid">
                {metricas.map((metric) => (
                  <div key={metric.id} className={`metric-card ${obterCategoria(metric.code)}`}>
                    <div className="metric-header">
                      <span className="metric-icon">{obterIcone(metric.code)}</span>
                      <h4 className="metric-title">{metric.code.replace(/^[^a-zA-Z0-9]+\s*/, "").trim()}</h4>
                    </div>
                    
                    <div className="metric-value">
                      {metric.value}
                    </div>
                    
                    {metric.change && (
                      <div className="metric-comparison">
                        <span className="comparison-label">📈 Comparação:</span>
                        <span className="comparison-value">{metric.change}</span>
                      </div>
                    )}
                    
                    <div className="metric-description">
                      {obterExplicacao(metric.code)}
                    </div>
                    
                    <div className="metric-trend">
                      <span className={`trend-indicator ${metric.trend}`}>
                        {metric.trend === 'up' ? '↗️ Crescendo' : metric.trend === 'down' ? '↘️ Declinando' : '➡️ Estável'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="dialog-footer">
          <p className="footer-info">
            💡 Dica: Clique fora do diálogo ou no X para fechar. As métricas são atualizadas a cada 5 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
