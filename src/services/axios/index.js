import axios from "axios";

  const api = axios.create({
    baseURL: 'http://localhost:2096/api_precificacao'

  });

  export default api;