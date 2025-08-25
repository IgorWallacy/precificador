# ActionFooter Component

Componente reutilizável para agrupar e posicionar botões de ação próximos ao rodapé das páginas.

## Características

- **Flexível**: Suporta conteúdo à esquerda, centro e direita
- **Posicionamento**: Pode ser `relative`, `sticky` ou `fixed`
- **Responsivo**: Adapta-se automaticamente a diferentes tamanhos de tela
- **Estilizado**: Inclui sombra e bordas para melhor separação visual

## Uso Básico

```jsx
import ActionFooter from '../components/action-footer';
import { Button } from 'primereact/button';

// Exemplo com botões centralizados
<ActionFooter
  centerContent={
    <Button
      label="Pesquisar"
      icon="pi pi-search"
      className="p-button-success"
      onClick={handleSearch}
    />
  }
  position="sticky"
/>

// Exemplo com botões à esquerda e direita
<ActionFooter
  leftContent={
    <>
      <Button label="Voltar" icon="pi pi-arrow-left" className="p-button-danger" />
      <Button label="Recarregar" icon="pi pi-refresh" className="p-button-success" />
    </>
  }
  rightContent={
    <Button label="Salvar" icon="pi pi-save" className="p-button-primary" />
  }
  position="sticky"
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `leftContent` | ReactNode | - | Conteúdo a ser exibido à esquerda |
| `centerContent` | ReactNode | - | Conteúdo a ser exibido no centro |
| `rightContent` | ReactNode | - | Conteúdo a ser exibido à direita |
| `className` | string | '' | Classes CSS adicionais |
| `style` | object | {} | Estilos inline adicionais |
| `position` | string | 'relative' | Posicionamento: 'relative', 'sticky' ou 'fixed' |

## Posicionamento

- **`relative`**: Posicionamento normal no fluxo do documento
- **`sticky`**: Fica "grudado" na parte inferior da viewport quando o usuário rola a página
- **`fixed`**: Fica fixo na parte inferior da tela, sempre visível

## Páginas que já utilizam o componente

- Precificador Executa (`/precificador/executa`)
- Produtos Sem Vendas (`/vendas/produtos/sem-vendas`)
- Consulta de Validade (`/produto/validade/consulta`)