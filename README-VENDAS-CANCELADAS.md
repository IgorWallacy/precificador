# Implementação de Vendas Canceladas no Dashboard

## Resumo das Implementações

Este documento descreve as melhorias implementadas no dashboard para exibir informações detalhadas sobre vendas canceladas, utilizando a API `/api/vendas/canceladas` com método POST.

## Funcionalidades Implementadas

### 1. Função de Busca de Vendas Canceladas
- **Função**: `fetchVendasCanceladas()`
- **Endpoint**: `POST /api/vendas/canceladas`
- **Parâmetros**: `startDate` e `endDate` no corpo da requisição
- **Formato de data**: `YYYY-MM-DD`
- **Retorno**: Array de vendas canceladas com detalhes completos

### 2. Função de Análise Comparativa
- **Função**: `fetchVendasCanceladasComparacao()`
- **Funcionalidade**: Busca cancelamentos de hoje, ontem e semana passada
- **Análise**: Compara quantidades e valores para identificar tendências
- **Uso**: Gera alertas e análises temporais

### 3. Função de Estatísticas
- **Função**: `fetchEstatisticasVendasCanceladas()`
- **Funcionalidade**: Calcula estatísticas comparativas (hoje vs ontem)
- **Métricas**: Total, quantidade, variação percentual
- **Integração**: Alimenta o card de estatísticas do dashboard

## Estrutura dos Dados

### Campos Esperados da API
```json
{
  "valorTotal": "number",
  "motivoCancelamento": "string",
  "dataCancelamento": "date",
  "nomeCliente": "string",
  "id": "string"
}
```

### Estado do Dashboard
```javascript
vendasCanceladas: {
  total: 0,           // Valor total cancelado hoje
  quantidade: 0,      // Número de cancelamentos hoje
  variacao: 0,        // Variação percentual vs ontem
  totalOntem: 0,      // Valor total cancelado ontem
  quantidadeOntem: 0, // Número de cancelamentos ontem
  periodo: 'hoje'
}
```

## Atividades Exibidas

### 1. Resumo Geral
- Quantidade total de cancelamentos
- Valor total cancelado
- Média por cancelamento

### 2. Análise por Motivo
- Agrupamento por motivo de cancelamento
- Quantidade e valor por motivo
- Média de valor por motivo

### 3. Maior Cancelamento
- Detalhes da venda com maior valor cancelado
- Motivo, horário e cliente
- Valor total cancelado

### 4. Análise Temporal
- Horário com mais cancelamentos
- Padrões de cancelamento por hora

### 5. Análise Comparativa
- Comparação hoje vs ontem
- Variações percentuais
- Análise semanal com médias

### 6. Alertas Automáticos
- Aumento significativo de cancelamentos (>50%)
- Dobra do valor de cancelamentos
- Status de erro para problemas na API

## Card de Estatísticas

### Localização
- Posicionado após o card de "Transações do Dia"
- Ícone: ❌ (vermelho)
- Cor de fundo: `var(--error-lighter)`

### Informações Exibidas
- **Valor Principal**: Quantidade de cancelamentos hoje
- **Label**: "Vendas Canceladas"
- **Variação**: Percentual vs ontem (verde se diminuiu, vermelho se aumentou)
- **Detalhe**: Valor total cancelado em reais

## Tratamento de Erros

### 1. Falha na API
- Log detalhado do erro
- Atividade de erro no dashboard
- Mensagem amigável para o usuário

### 2. Dados Incompletos
- Valores padrão para campos ausentes
- Fallback para datas e horários
- Validação de campos numéricos

### 3. Sem Cancelamentos
- Mensagem positiva quando não há cancelamentos
- Status "concluida" para indicar sucesso
- Informação sobre transações bem-sucedidas

## Logs e Debug

### Console Logs
- Busca de vendas canceladas
- Dados encontrados
- Análise comparativa
- Estatísticas calculadas

### Monitoramento
- Performance das chamadas da API
- Tempo de resposta
- Quantidade de dados retornados

## Configuração da API

### Endpoint
```
POST /api/vendas/canceladas
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-15"
}
```

### Resposta Esperada
```json
[
  {
    "id": "123",
    "valorTotal": 150.50,
    "motivoCancelamento": "Cliente desistiu",
    "dataCancelamento": "2024-01-15T14:30:00Z",
    "nomeCliente": "João Silva"
  }
]
```

## Benefícios da Implementação

### 1. Visibilidade
- Monitoramento em tempo real de cancelamentos
- Identificação de padrões e tendências
- Alertas para situações críticas

### 2. Análise
- Comparação histórica de cancelamentos
- Análise por motivo e período
- Métricas de performance

### 3. Gestão
- Identificação de problemas operacionais
- Acompanhamento de políticas de cancelamento
- Otimização de processos

### 4. Relatórios
- Dados para relatórios gerenciais
- Análise de impacto financeiro
- Tendências de cancelamento

## Manutenção e Atualizações

### Frequência de Atualização
- Dados atualizados a cada 5 minutos
- Atualização manual disponível
- Contador regressivo visível

### Monitoramento
- Verificar logs de erro
- Validar performance da API
- Acompanhar mudanças na estrutura de dados

## Considerações Técnicas

### Performance
- Chamadas em paralelo para múltiplas datas
- Cache de dados para comparações
- Tratamento assíncrono de erros

### Escalabilidade
- Suporte a múltiplos períodos
- Análise de dados históricos
- Filtros por período personalizado

### Segurança
- Validação de parâmetros de data
- Tratamento seguro de dados da API
- Logs sem exposição de informações sensíveis
