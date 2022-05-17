import axios from "axios";

  const api = axios.create({
    baseURL: 'http://localhost:2096',
    timeout: 1000,
    headers: {'Authorization': 'Bearer '+ JSON.parse(localStorage.getItem('access_token'))},

  });

  export default api;