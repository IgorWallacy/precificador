# Análise de Inventário - Funcionalidades de Exportação e Impressão

## Funcionalidades Implementadas

### 1. Exportação para Excel (.xlsx)
- **Botão**: "Exportar Excel" (verde)
- **Funcionalidade**: Exporta todos os dados do inventário para uma planilha Excel
- **Conteúdo**:
  - Planilha "Análise do Inventário": Dados detalhados de cada produto
  - Planilha "Resumo": Estatísticas gerais do inventário
- **Arquivo**: `Analise_Inventario_[ID]_[DATA-HORA].xlsx`

### 2. Exportação para PDF
- **Botão**: "Exportar PDF" (vermelho)
- **Funcionalidade**: Gera um relatório em PDF com resumo e dados detalhados
- **Conteúdo**:
  - Cabeçalho com informações do inventário
  - Resumo estatístico
  - Tabela com todos os produtos
- **Arquivo**: `Analise_Inventario_[ID]_[DATA-HORA].pdf`

### 3. Impressão com Resumo
- **Botão**: "Imprimir" (amarelo)
- **Funcionalidade**: Abre uma nova janela com layout otimizado para impressão
- **Conteúdo**:
  - Cabeçalho com informações do inventário
  - Resumo estatístico em grid
  - Tabela detalhada dos produtos
  - Botões para imprimir e fechar

## Resumo Estatístico Incluído

O sistema agora gera automaticamente um resumo com:

- **Total de Produtos**: Quantidade total de produtos no inventário
- **Produtos Sem Divergência**: Produtos onde o estoque físico = estoque do sistema
- **Produtos Com Divergência**: Produtos com diferenças entre físico e sistema
- **Produtos Em Recontagem**: Produtos marcados para recontagem
- **Total Quantidade no Estoque (Sistema)**: Soma das quantidades do sistema
- **Total Quantidade no Inventário (Físico)**: Soma das quantidades contadas
- **Total Quantidade Vendida Durante**: Soma das vendas durante o inventário
- **Total Divergência**: Diferença total entre físico e sistema

## Dependências Utilizadas

- **xlsx**: Para exportação Excel
- **jspdf**: Para geração de PDF
- **jspdf-autotable**: Para tabelas no PDF
- **moment**: Para formatação de datas

## Como Usar

1. **Exportar Excel**: Clique no botão verde "Exportar Excel"
2. **Exportar PDF**: Clique no botão vermelho "Exportar PDF"
3. **Imprimir com Resumo**: Clique no botão amarelo "Imprimir"

## Arquivos Gerados

Todos os arquivos são nomeados automaticamente com:
- ID do inventário
- Data e hora da exportação
- Formato apropriado (.xlsx, .pdf)

## Observações

- As exportações incluem todos os produtos, independente dos filtros aplicados na tela
- O resumo é calculado em tempo real baseado nos dados atuais
- A impressão abre em nova janela para melhor controle do layout
- Todos os arquivos são baixados automaticamente na pasta de downloads padrão
