import axios from "axios";

//PRODUCAO
const baseURL = window.location.protocol + "//" + window.location.hostname + ":1010";

//DESENVOLVIMENTO
//const baseURL = "http://localhost:2096"

const api = axios.create({
  baseURL: baseURL
});

// Eventos globais de rede para o sistema de abas
const emitNetworkEvent = (type, payload) => {
  window.dispatchEvent(new CustomEvent(`tabs:${type}`, { detail: payload }));
};

// Adiciona um interceptor para incluir o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const tokenData = JSON.parse(token);
      // Verifica se o token é um objeto com a propriedade access_token
      const accessToken = tokenData.access_token || tokenData;
      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      console.error('Erro ao processar token:', error);
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }
  // emitir início de requisição
  emitNetworkEvent('request-start', { url: config.url, method: config.method });
  return config;
}, (error) => {
  emitNetworkEvent('request-error', { error });
  return Promise.reject(error);
});

// Adiciona um interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    emitNetworkEvent('request-end', { url: response.config?.url, method: response.config?.method });
    return response;
  },
  async (error) => {
    emitNetworkEvent('request-error', { error });
    if (error.response?.status === 401) {
      // Verifica se não estamos já na página de login para evitar loop
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
