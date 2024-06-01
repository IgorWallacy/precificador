import axios from "axios";

//PRODUCAO
const baseURL = window.location.protocol + "//" + window.location.hostname ;

//DESENVOLVIMENTO
//const baseURL = "http://localhost:2096"

const api_uniplus = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: "Bearer " + JSON.parse(localStorage.getItem("access_token_uniplus")),
  },
});

export default api_uniplus;