# 🔗 Guia de Integração - TicketMedio no Dashboard

## 📋 Objetivo

Integrar os componentes `TicketMedio` e `TicketMedioCards` ao dashboard existente sem quebrar a funcionalidade atual.

## 🚀 Passos para Integração

### 1. Importar os Componentes

No arquivo `src/pages/metabase/index.js`, adicione as importações:

```javascript
import TicketMedio from '../../components/ticket-medio';
import TicketMedioCards from '../../components/ticket-medio-cards';
```

### 2. Substituir os Cards Existentes

Localize a seção dos cards de estatísticas e substitua os cards problemáticos:

```javascript
// ANTES (cards quebrados)
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
    <p className="stat-label">Vendas Realizadas</p>
  </div>
</div>

// DEPOIS (usando o novo componente)
<TicketMedioCards />
```

### 3. Adicionar o Componente TicketMedio

Após os cards de estatísticas, adicione o componente completo:

```javascript
{/* Cards de Estatísticas */}
<TicketMedioCards />

{/* Componente TicketMedio Completo */}
<TicketMedio />
```

### 4. Estrutura Final Recomendada

```javascript
return (
  <div className="dashboard-container">
    {/* Header do Dashboard */}
    <div className="dashboard-header">
      {/* ... header existente ... */}
    </div>

    {/* Cards de Estatísticas - Substituídos pelo TicketMedioCards */}
    <TicketMedioCards />

    {/* Gráfico de Vendas */}
    <div className="chart-section">
      {/* ... gráfico existente ... */}
    </div>

    {/* Componente TicketMedio Completo */}
    <TicketMedio />

    {/* Atividades Recentes */}
    <div className="activities-section">
      {/* ... atividades existentes ... */}
    </div>
  </div>
);
```

## 🎯 Vantagens da Abordagem

### ✅ **Segurança**
- Componentes isolados e testados
- Não afeta o dashboard existente
- Fácil de reverter se necessário

### ✅ **Manutenibilidade**
- Código separado e organizado
- Responsabilidades bem definidas
- Fácil de atualizar e modificar

### ✅ **Reutilização**
- Componentes podem ser usados em outras telas
- Lógica de negócio centralizada
- Estilos consistentes

## 🔧 Configuração Opcional

### Personalizar Estilos

Se quiser manter o estilo atual do dashboard, pode sobrescrever as variáveis CSS:

```css
/* No arquivo de estilos do dashboard */
:root {
  --primary-color: #007bff;
  --primary-lighter: #e3f2fd;
  --secondary-color: #6c757d;
  --secondary-lighter: #f8f9fa;
  --success-color: #28a745;
  --success-lighter: #d4edda;
  --warning-color: #ffc107;
  --warning-lighter: #fff3cd;
  --error-color: #dc3545;
  --error-lighter: #f8d7da;
}
```

### Personalizar Intervalo de Atualização

```javascript
// No componente TicketMedio
useEffect(() => {
  fetchTicketMedio();
  
  // Atualizar a cada 10 minutos (600000ms)
  const interval = setInterval(fetchTicketMedio, 600000);
  
  return () => clearInterval(interval);
}, []);
```

## 🧪 Testando a Integração

### 1. Verificar Console
```javascript
// Deve aparecer:
TicketMedioCards: Buscando dados: {hoje: "2025-08-26", ontem: "2025-08-25"}
TicketMedio: Buscando dados: {hoje: "2025-08-26", ontem: "2025-08-25", semanaPassada: "2025-08-19"}
```

### 2. Verificar Cards
- "Itens Vendidos" deve mostrar total de produtos
- "Transações do Dia" deve mostrar número de vendas
- "Vendas Realizadas" deve mostrar total de transações

### 3. Verificar Componente TicketMedio
- Ticket médio calculado corretamente
- Variações percentuais
- Alertas funcionando

## 🚨 Solução de Problemas

### Erro de API
```javascript
// Verificar se a API está respondendo
GET /api/vendas/ticket_medio/2025-08-26/2025-08-26
```

### Erro de Importação
```javascript
// Verificar caminho correto
import TicketMedio from '../../components/ticket-medio';
// vs
import TicketMedio from '../components/ticket-medio';
```

### Estilos Não Aplicados
```css
/* Verificar se o CSS está sendo importado */
@import '../../components/ticket-medio/styles.css';
```

## 📊 Resultado Esperado

Após a integração, você deve ver:

1. **Cards funcionando** com dados da API do ticket médio
2. **Componente TicketMedio** completo com análises detalhadas
3. **Dashboard estável** sem quebras
4. **Dados precisos** de vendas e transações
5. **Interface consistente** com o design atual

## 🔄 Reversão

Se precisar reverter as mudanças:

1. Remover as importações dos componentes
2. Restaurar os cards originais
3. Remover os componentes `<TicketMedioCards />` e `<TicketMedio />`

A integração é segura e reversível! 🎉
