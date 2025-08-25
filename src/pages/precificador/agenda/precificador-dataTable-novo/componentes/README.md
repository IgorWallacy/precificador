# 📁 Componentes da Página de Precificação

Esta pasta contém componentes customizados extraídos da página principal para melhorar a organização e manutenibilidade do código.

## 🎯 Componentes Disponíveis

### 1. **CustoComposicaoDialog** (`CustoComposicaoDialog.js` + `CustoComposicaoDialog.css`)

**Descrição**: Dialog moderno para exibir a composição detalhada do custo de um produto.

**Funcionalidades**:
- ✅ Exibição das informações do produto (nome, quantidade, unidade, embalagem)
- ✅ Breakdown completo dos custos (preços, descontos, impostos, frete)
- ✅ Cálculos automáticos de valores unitários
- ✅ Design responsivo e moderno
- ✅ Animações suaves e efeitos visuais

**Props**:
```jsx
<CustoComposicaoDialog
  visible={boolean}                    // Controla a visibilidade do dialog
  onHide={function}                    // Função chamada ao fechar
  produtoCustoComposicao={array}      // Array com dados do produto
  produtoEmExibicaoSugestaoDialog={object} // Objeto com custo final
/>
```

**Estrutura de Dados Esperada**:
```javascript
produtoCustoComposicao[0] = {
  produto: "Nome do Produto",
  quantidade: 100,
  unidade: "UN",
  embalagem: 10,
  precodecompra: 1500.00,
  desconto: 150.00,
  icmsst: 75.00,
  fcpst: 25.00,
  ipi: 50.00,
  frete: 100.00
}
```

## 🎨 Design System

### **Paleta de Cores**:
- **Header**: Preto com roxo (`#0f0f0f` → `#1a1a1a`)
- **Linha decorativa**: Roxo (`#8b5cf6` → `#a855f7` → `#c084fc`)
- **Preços**: Preto (`#1a1a1a`)
- **Descontos**: Vermelho (`#dc2626`)
- **Impostos**: Verde (`#059669`)
- **Custo Total**: Preto com roxo destacado

### **Características Visuais**:
- **Bordas arredondadas**: 12px para containers, 16px para dialog
- **Sombras**: Múltiplas camadas para profundidade
- **Gradientes**: Transições suaves entre cores
- **Animações**: Fade-in com delays escalonados
- **Hover effects**: Transformações e elevações

## 📱 Responsividade

### **Breakpoints**:
- **Desktop**: 1024px+ (layout em grid 3 colunas)
- **Tablet**: 768px - 1023px (layout em grid 2 colunas)
- **Mobile**: < 768px (layout em coluna única)

### **Adaptações**:
- Redimensionamento automático do dialog
- Reorganização do grid de informações
- Ajuste de tamanhos de fonte e espaçamentos
- Otimização para toque em dispositivos móveis

## 🚀 Como Usar

### **1. Importar o Componente**:
```javascript
import CustoComposicaoDialog from "./componentes/CustoComposicaoDialog";
```

### **2. Usar no JSX**:
```jsx
<CustoComposicaoDialog
  visible={custoComposicaoDialog}
  onHide={() => setCustoComposicaoDialog(false)}
  produtoCustoComposicao={produtoCustoComposicao}
  produtoEmExibicaoSugestaoDialog={produtoEmExibicaoSugestaoDialog}
/>
```

### **3. Estados Necessários**:
```javascript
const [custoComposicaoDialog, setCustoComposicaoDialog] = useState(false);
const [produtoCustoComposicao, setProdutoCustoComposicao] = useState([]);
const [produtoEmExibicaoSugestaoDialog, setProdutoEmExibicaoSugestaoDialog] = useState(null);
```

## 🔧 Personalização

### **Modificar Cores**:
Edite as variáveis CSS no arquivo `CustoComposicaoDialog.css`:

```css
/* Exemplo de personalização */
.custo-composicao-dialog .p-dialog-header {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### **Adicionar Novas Seções**:
Modifique o array `sections` no componente:

```javascript
const sections = [
  // ... seções existentes
  {
    title: "Nova Seção",
    color: "#YOUR_COLOR",
    items: [
      {
        label: "Novo Item",
        value: formatCurrency(novoValor)
      }
    ]
  }
];
```

## 📋 Dependências

### **PrimeReact**:
- `Dialog` - Container do dialog
- `Button` - Botão de fechar

### **CSS**:
- Classes utilitárias do PrimeReact
- Animações CSS personalizadas
- Media queries para responsividade

## 🎯 Próximos Componentes

### **Planejados**:
- `ProdutoInfoPanel` - Painel de informações do produto
- `PriceEditor` - Editor de preços inline
- `FilterPanel` - Painel de filtros avançados
- `ExportDialog` - Dialog para exportação de dados

### **Sugestões**:
- `LoadingSpinner` - Spinner de carregamento customizado
- `NotificationToast` - Sistema de notificações
- `ConfirmationModal` - Modal de confirmação

## 📞 Suporte

Para dúvidas sobre os componentes ou sugestões de melhorias:
1. Verifique a documentação do PrimeReact
2. Consulte os comentários no código
3. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para uma experiência de usuário excepcional**
