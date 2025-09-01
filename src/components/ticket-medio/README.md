# 🎯 Componente TicketMedio

## 📋 Descrição

Componente React para exibir informações de ticket médio baseadas na API `/api/vendas/ticket_medio/{dataInicial}/{dataFinal}`.

## 🚀 Funcionalidades

- **Ticket Médio**: Valor médio por venda (hoje vs ontem)
- **Transações**: Número de vendas realizadas
- **Itens Vendidos**: Total de produtos vendidos
- **Variações**: Comparação percentual com o dia anterior
- **Alertas**: Notificações para variações significativas
- **Atualização Automática**: Dados atualizados a cada 5 minutos

## 📥 Instalação

```bash
# O componente já está criado em src/components/ticket-medio/
# Não é necessário instalação adicional
```

## 🔧 Uso

### Importação

```javascript
import TicketMedio from '../../components/ticket-medio';
```

### Uso Básico

```javascript
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <TicketMedio />
    </div>
  );
}
```

### Uso com Props Personalizadas

```javascript
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <TicketMedio 
        showAlerts={true}
        refreshInterval={300000} // 5 minutos
      />
    </div>
  );
}
```

## 📊 Estrutura da API

### Endpoint
```
GET /api/vendas/ticket_medio/{dataInicial}/{dataFinal}
```

### Resposta Esperada
```json
[
  {
    "data": "2025-08-26",
    "filial": "F MOREIRA SOARES EIRELI (B.FATIMA)",
    "quantidadeItens": 235,
    "quantidadeVendas": 101,
    "valorLiquido": 3260.03
  }
]
```

## 🎨 Estilos

O componente usa CSS customizado com variáveis CSS para cores:

```css
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
}
```

## 📱 Responsividade

- **Desktop**: Grid de 3 colunas
- **Tablet**: Grid de 2 colunas
- **Mobile**: Grid de 1 coluna

## 🔄 Atualizações

- **Automática**: A cada 5 minutos
- **Manual**: Botão de refresh
- **Real-time**: Dados sempre atualizados

## 🚨 Alertas

- **Queda >20%**: Alerta de atenção
- **Aumento >30%**: Boa notícia
- **Variação >15%**: Análise detalhada

## 🐛 Debug

O componente inclui logs detalhados no console:

```javascript
console.log('TicketMedio: Buscando dados:', { hoje, ontem });
console.log('TicketMedio: Respostas da API:', responses);
console.log('TicketMedio: Métricas calculadas:', dados);
```

## 📁 Estrutura de Arquivos

```
src/components/ticket-medio/
├── index.js          # Componente principal
├── styles.css        # Estilos
└── README.md         # Documentação
```

## 🔗 Dependências

- **React**: ^16.8.0
- **Moment.js**: Para formatação de datas
- **Axios**: Para requisições HTTP

## ✅ Status

- [x] Componente criado
- [x] Estilos implementados
- [x] API integrada
- [x] Responsividade
- [x] Alertas automáticos
- [x] Atualização automática
- [x] Documentação completa

## 🎯 Próximos Passos

1. Integrar ao dashboard principal
2. Adicionar testes unitários
3. Implementar cache de dados
4. Adicionar gráficos de tendência
