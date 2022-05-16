import axios from "axios";

  const api = axios.create({
    baseURL: 'http://localhost:2096'

  });

  export default api;