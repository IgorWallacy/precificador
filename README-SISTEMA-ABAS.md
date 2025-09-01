# Sistema de Navegação por Abas

## 📋 Visão Geral

O sistema de navegação por abas foi implementado para proporcionar uma experiência de usuário similar aos navegadores modernos, onde cada página é aberta em uma nova aba, permitindo navegação entre múltiplas funcionalidades sem perder o estado de trabalho.

## ✨ Funcionalidades Principais

### 🔄 Navegação Inteligente
- **Abertura automática**: Cada item do menu abre em uma nova aba
- **Reutilização de abas**: Se uma rota já estiver aberta, a aba existente é ativada
- **Persistência de estado**: As abas mantêm seu estado mesmo quando não estão ativas

### 🎯 Controle de Abas
- **Ativação**: Clique em uma aba para ativá-la
- **Fechamento**: Botão X em cada aba para fechá-la
- **Menu de contexto**: Clique direito para opções adicionais
- **Indicadores visuais**: Abas ativas, trabalhando e inativas

### 💾 Persistência
- **LocalStorage**: Abas são salvas automaticamente
- **Estado da sessão**: Recuperação de abas ao recarregar a página
- **Aba ativa**: Lembra qual aba estava ativa

## 🏗️ Arquitetura

### Componentes Principais

#### 1. TabContext (`src/contexts/TabContext.js`)
- **Gerenciamento centralizado** de todas as abas
- **Estado persistente** no localStorage
- **Funções de controle**: abrir, fechar, ativar, atualizar estado

#### 2. TabBar (`src/components/tab-bar/index.js`)
- **Interface visual** das abas
- **Controles de navegação** e fechamento
- **Menu de contexto** com opções avançadas

#### 3. TabContent (`src/components/tab-content/index.js`)
- **Renderização condicional** do conteúdo das abas
- **Gerenciamento de foco** e scroll
- **Estados visuais** (ativo/inativo)

#### 4. useTabNavigation (`src/hooks/useTabNavigation.js`)
- **Hook personalizado** para navegação
- **Integração** com o sistema de rotas
- **Configuração automática** de títulos e ícones

### Estrutura de Dados

```javascript
// Estrutura de uma aba
{
  id: 1,
  route: "/metabase",
  title: "Dashboard",
  icon: "📊",
  isActive: true,
  isWorking: false,
  lastActivity: 1640995200000,
  state: {} // Estado específico da aba
}
```

## 🚀 Como Usar

### 1. Navegação Básica
```javascript
import { useTabNavigation } from '../hooks/useTabNavigation';

const MyComponent = () => {
  const { navigateToRoute } = useTabNavigation();
  
  const handleClick = () => {
    // Abrir nova aba ou ativar existente
    navigateToRoute('/metabase', MetabaseComponent, 'Dashboard', '📊');
  };
  
  return <button onClick={handleClick}>Abrir Dashboard</button>;
};
```

### 2. Controle de Estado da Aba
```javascript
import { useTabContext } from '../contexts/TabContext';

const MyComponent = () => {
  const { updateTabState, setTabWorking } = useTabContext();
  
  const handleDataLoad = async () => {
    setTabWorking(true); // Indicar que está trabalhando
    
    try {
      const data = await fetchData();
      updateTabState(activeTabId, { data, lastUpdate: Date.now() });
    } finally {
      setTabWorking(false); // Parar indicador
    }
  };
  
  return <div>...</div>;
};
```

### 3. Verificação de Abas Abertas
```javascript
const { isRouteOpen, getTabByRoute } = useTabContext();

if (isRouteOpen('/metabase')) {
  const existingTab = getTabByRoute('/metabase');
  console.log('Aba já está aberta:', existingTab);
}
```

## 🎨 Personalização

### Estilos CSS
- **Variáveis CSS**: Use as variáveis definidas em `src/components/tab-bar/styles.css`
- **Temas**: Personalize cores, espaçamentos e animações
- **Responsividade**: Adapte para diferentes tamanhos de tela

### Ícones e Títulos
- **Configuração automática**: Baseada no mapeamento de rotas
- **Personalização**: Passe títulos e ícones customizados
- **Emojis**: Suporte completo a emojis como ícones

## 🔧 Configuração

### 1. Adicionar Nova Rota
```javascript
// Em src/hooks/useTabNavigation.js
const routeConfig = {
  '/nova-rota': {
    title: 'Nova Funcionalidade',
    icon: '🆕'
  }
};
```

### 2. Integrar Componente
```javascript
// No menu ou navegação
const handleClick = () => {
  navigateToRoute('/nova-rota', NovoComponente);
};
```

### 3. Configurar Menu
```javascript
// Em src/components/smart-menu/index.js
{
  id: "nova-funcionalidade",
  title: "Nova Funcionalidade",
  icon: "pi pi-plus",
  route: "/nova-rota",
  component: NovoComponente,
  category: "geral"
}
```

## 📱 Responsividade

### Desktop
- **Layout completo** com todas as funcionalidades
- **Barra de abas** horizontal com scroll
- **Menu de contexto** completo

### Tablet
- **Abas adaptadas** para telas médias
- **Scroll horizontal** otimizado
- **Touch-friendly** para dispositivos touch

### Mobile
- **Abas compactas** para telas pequenas
- **Navegação simplificada**
- **Otimização** para uso com dedos

## 🚨 Considerações Importantes

### Performance
- **Renderização condicional**: Apenas abas ativas são renderizadas
- **Estado persistente**: Evita recarregamentos desnecessários
- **Lazy loading**: Componentes são carregados sob demanda

### Memória
- **Limpeza automática**: Abas fechadas são removidas da memória
- **Estado otimizado**: Apenas dados essenciais são mantidos
- **Garbage collection**: Referências são limpas adequadamente

### Acessibilidade
- **Navegação por teclado**: Suporte completo a Tab, Enter, Espaço
- **ARIA labels**: Descrições para leitores de tela
- **Foco visual**: Indicadores claros de aba ativa

## 🐛 Solução de Problemas

### Aba não abre
1. Verifique se o componente está importado corretamente
2. Confirme se a rota está configurada no `routeConfig`
3. Verifique se não há erros no console

### Estado não persiste
1. Verifique se o localStorage está habilitado
2. Confirme se não há erros de serialização
3. Verifique se o estado é serializável

### Performance lenta
1. Verifique se há muitas abas abertas
2. Confirme se os componentes não têm loops infinitos
3. Monitore o uso de memória

## 🔮 Futuras Melhorias

### Funcionalidades Planejadas
- **Drag & Drop**: Reordenar abas por arrastar
- **Grupos de abas**: Organizar abas em categorias
- **Sincronização**: Compartilhar abas entre dispositivos
- **Histórico**: Navegação entre abas fechadas

### Otimizações
- **Virtualização**: Para muitas abas abertas
- **Cache inteligente**: Prevenção de recarregamentos
- **Lazy loading**: Carregamento sob demanda de componentes

## 📚 Referências

- **React Context API**: Gerenciamento de estado global
- **React Router**: Navegação e roteamento
- **LocalStorage API**: Persistência de dados
- **CSS Grid/Flexbox**: Layout responsivo

## 🤝 Contribuição

Para contribuir com o sistema de abas:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** as mudanças
4. **Teste** em diferentes dispositivos
5. **Submeta** um pull request

---

**Desenvolvido com ❤️ pela equipe JJ Sistemas**
