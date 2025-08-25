# Menu Inteligente

## Descrição
O Menu Inteligente é um componente React avançado que exibe **todas as rotas do sidebar** em uma barra horizontal compacta, **ordenadas dinamicamente** por frequência de uso. **Integrado ao header** para acesso rápido e eficiente, com sistema de rolagem horizontal e **controle dinâmico baseado no histórico de uso do usuário**.

## 🚀 **Funcionalidades Principais**

### 🎯 **Sistema Dinâmico de Ordenação**
- **Histórico automático** de navegação salvo no localStorage
- **Ordenação inteligente** baseada na frequência de acesso
- **Atualização em tempo real** conforme o usuário navega
- **Sem duplicação** - todas as rotas aparecem apenas uma vez
- **Limpeza automática** para evitar sobrecarga (máximo 50 páginas)

### 🔐 **Logout Integrado**
- **Botão de logout** com design especial e cor vermelha
- **Limpeza automática** do token de acesso
- **Redirecionamento** para página inicial
- **Feedback visual** com animações e efeitos especiais

### 📊 **Sistema de Histórico Inteligente**
- **Contagem de acessos** para cada rota
- **Timestamp** do último acesso
- **Estatísticas completas** de uso
- **Utilitários de debug** para desenvolvimento

### 🎨 **Design e UX Mantidos**
- **Interface elegante** com gradientes e sombras
- **Animações suaves** com cubic-bezier
- **Efeitos hover** interativos
- **Estados visuais** para ativo, hover e foco
- **Cores específicas** para cada categoria

## 🏗️ **Estrutura do Componente**

```jsx
<SmartMenu>
  ├── Botão de rolagem esquerda (quando necessário)
  ├── Container principal com rolagem
  │   └── Todas as rotas do sidebar (9 itens - ORDENADOS por uso)
  └── Botão de rolagem direita (quando necessário)
</SmartMenu>
```

## 📋 **Rotas Disponíveis (Todas do Sidebar)**

1. **Dashboard** - Metabase e relatórios
2. **Agendar Preços** - Sistema de precificação
3. **Emitir Etiquetas** - Emissão e envio para PDV
4. **Novo Inventário** - Criação de inventário
5. **Lançar Produtos** - Adição de produtos ao inventário
6. **Inventário Zerar** - Zerar estoque/contagem
7. **Vendas do PDV** - Relatórios de vendas
8. **Recebimentos** - Controle de recebimentos
9. **Sair** - Logout do sistema

## 📁 **Arquivos do Sistema**

1. **`index.js`** - Componente principal com lógica de ordenação
2. **`styles.css`** - Estilos com suporte ao botão de logout
3. **`utils.js`** - Funções utilitárias para gerenciar histórico
4. **`debug-panel.js`** - Painel de debug para desenvolvimento
5. **`debug-panel.css`** - Estilos do painel de debug
6. **`README.md`** - Documentação completa

## 🛠️ **Como Funciona o Sistema de Ordenação**

### **1. Rastreamento Automático**
```javascript
// Cada navegação é automaticamente registrada
useEffect(() => {
  if (location.pathname) {
    savePageAccess(location.pathname);
    setOrderedMenuItems(orderMenuItemsByUsage());
  }
}, [location.pathname]);
```

### **2. Ordenação por Frequência de Uso**
```javascript
const orderMenuItemsByUsage = () => {
  const mostUsedPages = getMostUsedPages(10); // Top 10 para ordenação
  
  // Criar mapa de frequência para ordenação
  const frequencyMap = {};
  mostUsedPages.forEach((route, index) => {
    frequencyMap[route] = 10 - index; // Maior peso para páginas mais usadas
  });

  // Ordenar itens baseado na frequência de uso
  return [...allMenuItems].sort((a, b) => {
    const aFreq = frequencyMap[a.route] || 0;
    const bFreq = frequencyMap[b.route] || 0;
    
    // Páginas mais usadas primeiro
    if (aFreq !== bFreq) {
      return bFreq - aFreq;
    }
    
    // Se frequência igual, manter ordem original
    return allMenuItems.indexOf(a) - allMenuItems.indexOf(b);
  });
};
```

### **3. Armazenamento no LocalStorage**
```javascript
// Estrutura do localStorage:
{
  "/metabase": 15,           // 15 acessos
  "/precificador/agenda": 8, // 8 acessos
  "/estoque": 12,            // 12 acessos
  "lastAccess": 1640995200000 // Timestamp
}
```

## 🎮 **Uso e Configuração**

### **Uso Básico**
```jsx
import SmartMenu from './components/smart-menu';

function App() {
  return (
    <div>
      <SmartMenu />
    </div>
  );
}
```

### **Adicionar Novas Rotas**
```javascript
// Adicione novas rotas ao array allMenuItems
{
  id: "nova-rota",
  title: "Nova\nFuncionalidade",
  icon: "pi pi-star",
  color: "purple",
  route: "/nova-rota",
  description: "Descrição da nova funcionalidade",
  category: "nova-categoria"
}
```

## 🧪 **Ferramentas de Debug**

### **Painel de Debug**
```javascript
import DebugPanel from './components/smart-menu/debug-panel';

// Use em desenvolvimento para monitorar o sistema
<DebugPanel isVisible={true} onClose={() => setVisible(false)} />
```

### **Funções de Debug no Console**
```javascript
// Acesse via console do navegador:
debugAccessHistory()        // Exibe estatísticas
simulateAccesses()          // Cria dados de teste
clearAccessHistory()        // Limpa histórico
addPageWeight('/route', 2)  // Adiciona peso extra
```

## 📊 **Estatísticas Disponíveis**

- **Total de acessos** a todas as páginas
- **Páginas únicas** acessadas
- **Timestamp** do último acesso
- **Top 10 páginas** mais acessadas
- **Histórico completo** em formato JSON

## 🎨 **Cores e Identidade Visual**

- **Gold** - Precificador e ações principais
- **Orange** - Emissão de etiquetas
- **Brown** - Inventário
- **Green** - Produtos e recebimentos
- **Purple** - Dashboard
- **Blue** - Vendas
- **Red** - Logout (com efeitos especiais)

## 📱 **Responsividade**

- **Desktop (>1400px)**: Altura 70px, botões 32px
- **Tablet (1200px-1400px)**: Altura 60px, botões 30px
- **Mobile (<1200px)**: Altura 55px, botões 28px
- **Mobile (<768px)**: Componente oculto

## 🚀 **Performance e Otimização**

- **Lazy loading** de funcionalidades
- **Event listeners** otimizados
- **Animações CSS** para melhor performance
- **Limpeza automática** de histórico antigo
- **Debounce** para eventos de resize

## 🔧 **Desenvolvimento e Debug**

### **Comandos Úteis no Console**
```javascript
// Ver estatísticas
getAccessStatistics()

// Simular acessos para teste
simulateAccesses()

// Adicionar peso extra a uma rota
addPageWeight('/metabase', 5)

// Limpar histórico
clearAccessHistory(true) // Manter top 10
clearAccessHistory(false) // Limpar tudo
```

### **Monitoramento em Tempo Real**
O sistema atualiza automaticamente a ordenação sempre que:
- O usuário navega para uma nova página
- A localização muda
- O componente é montado

## 🎯 **Casos de Uso**

1. **Usuário frequente**: Rotas mais usadas aparecem à esquerda
2. **Novo usuário**: Ordem padrão é mantida até criar histórico
3. **Mudança de padrão**: Sistema se adapta conforme o uso evolui
4. **Debug**: Painel completo para desenvolvimento e teste

## 🔮 **Futuras Melhorias**

- **Sincronização** com backend para histórico persistente
- **Machine Learning** para prever próximas ações
- **Personalização** manual de ordem dos itens
- **Analytics** avançados de uso
- **Temas** personalizáveis

---

## 🎯 **Resultado Final**

O Smart Menu agora oferece uma **experiência verdadeiramente inteligente** que:

✅ **Inclui todas as rotas** do sidebar  
✅ **Ordena dinamicamente** por frequência de uso  
✅ **Sem duplicação** de itens  
✅ **Implementa logout** do usuário  
✅ **Salva histórico** no localStorage automaticamente  
✅ **Se adapta** ao comportamento do usuário  
✅ **Fornece ferramentas** completas de debug  
✅ **Mantém performance** e responsividade  

O usuário agora tem um menu **completo e inteligente** que **aprende com ele** e **se adapta** ao seu padrão de uso, mantendo sempre visíveis todas as funcionalidades do sistema! 🎉🚀
