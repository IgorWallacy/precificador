# 🎨 Sistema de Design Unificado - Padrão para Toda a Aplicação

## 📋 Visão Geral

Este documento descreve o sistema de design unificado que deve ser seguido em **TODA** a aplicação. Ele garante consistência visual, melhor experiência do usuário e facilita a manutenção.

## 🚀 Como Usar

### 1. Importar os Estilos Base

Em **TODA** página/componente, importe o arquivo de estilos base:

```javascript
import "../../../components/prime-react-styles.css";
```

### 2. Estrutura HTML Padrão

Sempre use esta estrutura HTML para suas páginas:

```jsx
<div className="page-container">
  <div className="page-card">
    <div className="page-header">
      <h1>Título da Página</h1>
      <p className="subtitle">Subtítulo descritivo</p>
    </div>
    
    {/* Conteúdo da página aqui */}
  </div>
</div>
```

## 🎯 Componentes Padrão

### 📱 Container Principal
```css
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1px;
  padding-bottom: 100px; /* Para painéis fixos */
}
```

### 🃏 Card da Página
```css
.page-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}
```

### 📝 Header da Página
```css
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🔍 Sistema de Filtros Padrão

### Estrutura HTML para Filtros
```jsx
<div className="filters-container">
  <div className="filters-section">
    <h3 className="section-title">
      <i className="pi pi-calendar"></i>
      Filtros de Pesquisa
    </h3>
    
    <div className="filters-grid">
      <div className="filter-group">
        <label className="filter-label">
          <i className="pi pi-calendar-plus"></i>
          Data Inicial
          {dataInicial && <span className="filter-status active">✓</span>}
        </label>
        <Calendar className="filter-calendar" />
      </div>
    </div>
  </div>
</div>
```

### Classes CSS para Filtros
- `.filters-container` - Container principal dos filtros
- `.filters-section` - Seção individual de filtros
- `.section-title` - Título da seção com ícone
- `.filters-grid` - Grid responsivo dos filtros
- `.filter-group` - Grupo individual de filtro
- `.filter-label` - Label do filtro com ícone
- `.filter-status` - Indicador de status do filtro
- `.filter-calendar` - Calendário estilizado

## 🎛️ Sistema de Agrupamento

### Estrutura HTML para Agrupamento
```jsx
<div className="grouping-section">
  <h3 className="section-title">
    <i className="pi pi-sitemap"></i>
    Configuração de Agrupamento
  </h3>
  
  <div className="grouping-content">
    <p className="grouping-description">
      Escolha como deseja organizar os resultados:
    </p>
    
    <div className="toggle-container">
      <ToggleButton className="grouping-toggle" />
      
      <div className="toggle-info">
        <div className="info-item active">
          <i className="pi pi-users"></i>
          <span>Opção 1</span>
          <small>Descrição da opção</small>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 🔘 Sistema de Botões

### Botão de Pesquisa Padrão
```jsx
<div className="search-button-container">
  <div className="search-info">
    <div className="filters-count">
      <i className="pi pi-filter"></i>
      <span>X de Y filtros preenchidos</span>
    </div>
  </div>
  
  <Button className="search-button">
    Pesquisar
  </Button>
</div>
```

### Classes CSS para Botões
- `.search-button-container` - Container do botão de pesquisa
- `.search-info` - Informações sobre os filtros
- `.filters-count` - Contador de filtros
- `.search-button` - Botão principal de pesquisa

## 📊 Sistema de Tabelas

### Estrutura HTML para Tabelas
```jsx
<div className="table-container">
  <div className="table-wrapper">
    <DataTable className="DataTable">
      {/* Colunas da tabela */}
    </DataTable>
  </div>
</div>
```

### Classes CSS para Tabelas
- `.table-container` - Container da tabela
- `.table-wrapper` - Wrapper da tabela
- `.DataTable` - Classe principal da tabela

## 🎭 Sistema de Painéis Fixos

### Estrutura HTML para Painéis
```jsx
<div className={`product-info-panel ${painelExpandido ? 'expanded' : 'collapsed'}`}>
  <div className="panel-header">
    <div className="panel-title">
      <div className="header-main">
        <h3>Título do Painel</h3>
        <div className="header-details">
          <span className="detail-item">
            <i className="pi pi-file"></i>
            Detalhe 1
          </span>
        </div>
      </div>
    </div>
    
    <div className="panel-controls">
      <Button className="p-button p-button-info p-button-sm" />
    </div>
  </div>
  
  {painelExpandido && (
    <div className="panel-content">
      {/* Conteúdo expandido */}
    </div>
  )}
</div>
```

### Classes CSS para Painéis
- `.product-info-panel` - Painel principal
- `.panel-header` - Header do painel
- `.panel-title` - Título do painel
- `.header-main` - Conteúdo principal do header
- `.header-details` - Detalhes do header
- `.detail-item` - Item individual de detalhe
- `.panel-controls` - Controles do painel
- `.panel-content` - Conteúdo expandido do painel

## 💰 Sistema de Preços

### Estrutura HTML para Preços
```jsx
<div className="pricing-compact">
  <div className="price-row">
    <div className="price-item cost">
      <span className="price-label">
        <i className="pi pi-dollar"></i>
        Custo
      </span>
      <span className="price-value">R$ 10,00</span>
      <span className="price-profit">
        <Tag severity="danger" value="Base" />
      </span>
    </div>
    
    <div className="price-item current">
      <span className="price-label">
        <i className="pi pi-chart-line"></i>
        Atual (+20%)
      </span>
      <span className="price-value">R$ 12,00</span>
      <span className="price-profit">
        <Tag severity="success" value="+20%" />
      </span>
    </div>
  </div>
</div>
```

### Classes CSS para Preços
- `.pricing-compact` - Container dos preços
- `.price-row` - Linha de preços
- `.price-item` - Item individual de preço
- `.price-label` - Label do preço
- `.price-value` - Valor do preço
- `.price-profit` - Tag de lucro/prejuízo

## 📱 Responsividade

### Breakpoints Padrão
```css
/* Tablet */
@media (max-width: 768px) {
  .filters-container { padding: 20px; }
  .filters-grid { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 480px) {
  .filters-container { padding: 16px; }
  .section-title { flex-direction: column; }
}
```

## 🎨 Paleta de Cores

### Cores Principais
- **Primária**: `#3b82f6` (Azul)
- **Secundária**: `#64748b` (Cinza)
- **Sucesso**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Amarelo)
- **Erro**: `#ef4444` (Vermelho)

### Gradientes
- **Background**: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`
- **Header**: `linear-gradient(135deg, #1e293b 0%, #475569 100%)`
- **Botão**: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`

## 📝 Exemplo Completo de Página

```jsx
import React, { useState } from 'react';
import { Calendar, Button, DataTable } from 'primereact';
import "../../../components/prime-react-styles.css";

const MinhaPagina = () => {
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();

  return (
    <div className="page-container">
      <div className="page-card">
        <div className="page-header">
          <h1>Minha Página</h1>
          <p className="subtitle">Descrição da funcionalidade</p>
        </div>

        {/* Aviso de atenção */}
        <div className="attention-warning">
          <i className="pi pi-exclamation-triangle"></i>
          <span>Mensagem importante para o usuário</span>
        </div>

        {/* Filtros */}
        <div className="filters-container">
          <div className="filters-section">
            <h3 className="section-title">
              <i className="pi pi-calendar"></i>
              Filtros de Pesquisa
            </h3>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  <i className="pi pi-calendar-plus"></i>
                  Data Inicial
                  {dataInicial && <span className="filter-status active">✓</span>}
                </label>
                <Calendar 
                  className="filter-calendar"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de pesquisa */}
        <div className="search-button-container">
          <div className="search-info">
            <div className="filters-count">
              <i className="pi pi-filter"></i>
              <span>1 de 2 filtros preenchidos</span>
            </div>
          </div>
          
          <Button className="search-button">
            Pesquisar
          </Button>
        </div>

        {/* Tabela */}
        <div className="table-container">
          <div className="table-wrapper">
            <DataTable className="DataTable">
              {/* Conteúdo da tabela */}
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinhaPagina;
```

## ✅ Checklist de Implementação

Para cada nova página, verifique se você implementou:

- [ ] Importou `prime-react-styles.css`
- [ ] Usou `.page-container` como wrapper principal
- [ ] Usou `.page-card` para o conteúdo principal
- [ ] Usou `.page-header` com título e subtítulo
- [ ] Implementou filtros seguindo o padrão `.filters-container`
- [ ] Usou `.search-button-container` para botões de ação
- [ ] Implementou tabelas com `.table-container`
- [ ] Adicionou responsividade com media queries
- [ ] Seguiu a paleta de cores padrão
- [ ] Usou os gradientes e sombras padrão

## 🚨 Regras Importantes

1. **NUNCA** crie estilos inline ou CSS customizado
2. **SEMPRE** use as classes CSS padrão definidas
3. **SEMPRE** importe o arquivo de estilos base
4. **SEMPRE** siga a estrutura HTML padrão
5. **SEMPRE** teste a responsividade em diferentes dispositivos

## 🔧 Manutenção

- Para alterar estilos globais, edite apenas `prime-react-styles.css`
- Para estilos específicos de uma página, use classes adicionais mas mantenha a estrutura base
- Teste sempre em diferentes resoluções antes de finalizar

---

**Lembre-se**: Este sistema de design garante consistência visual em toda a aplicação e melhora significativamente a experiência do usuário! 🎉
