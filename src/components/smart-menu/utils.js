// Utilitários para gerenciar o histórico de acesso do SmartMenu

/**
 * Salva o acesso a uma página no localStorage
 * @param {string} route - Rota acessada
 * @param {number} timestamp - Timestamp do acesso (opcional)
 */
export const savePageAccess = (route, timestamp = Date.now()) => {
  try {
    const accessHistory = JSON.parse(localStorage.getItem('pageAccessHistory') || '{}');
    
    // Incrementar contador de acesso
    accessHistory[route] = (accessHistory[route] || 0) + 1;
    
    // Salvar timestamp do último acesso
    accessHistory.lastAccess = timestamp;
    
    // Manter apenas as últimas 50 páginas para evitar sobrecarga
    const routes = Object.keys(accessHistory).filter(key => key !== 'lastAccess');
    if (routes.length > 50) {
      const sortedRoutes = routes.sort((a, b) => accessHistory[b] - accessHistory[a]);
      const routesToKeep = sortedRoutes.slice(0, 50);
      
      const newHistory = { lastAccess: accessHistory.lastAccess };
      routesToKeep.forEach(route => {
        newHistory[route] = accessHistory[route];
      });
      
      localStorage.setItem('pageAccessHistory', JSON.stringify(newHistory));
    } else {
      localStorage.setItem('pageAccessHistory', JSON.stringify(accessHistory));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar histórico de acesso:', error);
    return false;
  }
};

/**
 * Obtém as páginas mais acessadas
 * @param {number} limit - Número máximo de páginas a retornar
 * @returns {Array} Array de rotas ordenadas por frequência de uso
 */
export const getMostUsedPages = (limit = 4) => {
  try {
    const accessHistory = JSON.parse(localStorage.getItem('pageAccessHistory') || '{}');
    
    const pages = Object.entries(accessHistory)
      .filter(([route]) => route !== 'lastAccess')
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([route]) => route);
    
    return pages;
  } catch (error) {
    console.error('Erro ao obter histórico de acesso:', error);
    return [];
  }
};

/**
 * Obtém estatísticas completas do histórico de acesso
 * @returns {Object} Estatísticas do histórico
 */
export const getAccessStatistics = () => {
  try {
    const accessHistory = JSON.parse(localStorage.getItem('pageAccessHistory') || '{}');
    
    const routes = Object.keys(accessHistory).filter(key => key !== 'lastAccess');
    const totalAccesses = routes.reduce((sum, route) => sum + accessHistory[route], 0);
    const uniquePages = routes.length;
    
    return {
      totalAccesses,
      uniquePages,
      lastAccess: accessHistory.lastAccess,
      topPages: getMostUsedPages(10),
      history: accessHistory
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalAccesses: 0,
      uniquePages: 0,
      lastAccess: null,
      topPages: [],
      history: {}
    };
  }
};

/**
 * Limpa o histórico de acesso
 * @param {boolean} keepTopPages - Manter apenas as top 10 páginas
 */
export const clearAccessHistory = (keepTopPages = false) => {
  try {
    if (keepTopPages) {
      const topPages = getMostUsedPages(10);
      const accessHistory = JSON.parse(localStorage.getItem('pageAccessHistory') || '{}');
      
      const newHistory = { lastAccess: accessHistory.lastAccess };
      topPages.forEach(route => {
        newHistory[route] = accessHistory[route];
      });
      
      localStorage.setItem('pageAccessHistory', JSON.stringify(newHistory));
    } else {
      localStorage.removeItem('pageAccessHistory');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    return false;
  }
};

/**
 * Adiciona peso extra para páginas específicas (favoritas do usuário)
 * @param {string} route - Rota a receber peso extra
 * @param {number} weight - Peso adicional (padrão: 2)
 */
export const addPageWeight = (route, weight = 2) => {
  try {
    const accessHistory = JSON.parse(localStorage.getItem('pageAccessHistory') || '{}');
    accessHistory[route] = (accessHistory[route] || 0) + weight;
    localStorage.setItem('pageAccessHistory', JSON.stringify(accessHistory));
    return true;
  } catch (error) {
    console.error('Erro ao adicionar peso à página:', error);
    return false;
  }
};

/**
 * Debug: Exibe o histórico de acesso no console
 */
export const debugAccessHistory = () => {
  const stats = getAccessStatistics();
  console.group('📊 Histórico de Acesso do SmartMenu');
  console.log('Total de acessos:', stats.totalAccesses);
  console.log('Páginas únicas:', stats.uniquePages);
  console.log('Último acesso:', new Date(stats.lastAccess).toLocaleString());
  console.log('Top 10 páginas:', stats.topPages);
  console.log('Histórico completo:', stats.history);
  console.groupEnd();
};

/**
 * Debug: Simula acessos para testar o sistema
 */
export const simulateAccesses = () => {
  const testRoutes = [
    '/metabase',
    '/precificador/agenda/precificador-dataTable-novo',
    '/precificador/executa/precificador-dataTable',
    '/estoque/contagem',
    '/vendas',
    '/recebimentos/consulta'
  ];
  
  testRoutes.forEach((route, index) => {
    // Simular diferentes frequências de acesso
    const accessCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < accessCount; i++) {
      savePageAccess(route, Date.now() - Math.random() * 86400000); // Últimos 24h
    }
  });
  
  console.log('✅ Acessos simulados criados!');
  debugAccessHistory();
};
