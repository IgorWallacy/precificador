import "./index.css";

import React, { useState, useContext, useRef } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";

import { Toast } from "primereact/toast";

import axios from "axios";

import Logo from "../../assets/img/logo_duca.png";

const Login = () => {
  const toast = useRef(null);

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const isLogado = useContext(Context);

  let navigate = useNavigate();

  let clientId = "doks";
  let clientSecret = "1234";

  var params = {
    client: "angular",
    username: usuario,
    password: senha,
    grant_type: "password",
  };

  var headers = {
    Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  //PRODUCAO
  const baseURL = window.location.protocol +'//'+ window.location.hostname + ':1010'

  //DESENVOLVIMENTO
  //const baseURL = "http://localhost:2096"

  const api = axios.create({
    baseURL: baseURL,
    timeout : 1000,
    headers: headers,
    params: params,
  });

  const login = () => {
    isLogado.setLogado(false)
    localStorage.clear()
    api
      .post("/oauth/token", { params, headers })
      .then((response) => {
        localStorage.clear()
        isLogado.setLogado(true);
        isLogado.setUsuarioLogado(usuario);
        const accessToken = JSON.stringify(response.data);

        localStorage.setItem("access_token", accessToken);

        navigate("/precificar");
      })
      .catch((error) => {
        isLogado.setLogado(false);
        localStorage.clear()
      //  console.log(error)

        if(error.message === 'timeout of 1000ms exceeded') {

          toast.current.show({
            severity: "error",
            summary: "Erro ao conectar com o servidor ",
            detail: "Estamos com problemas ao conectar com o servidor. Favor, tente mais tarde ",
            sticky: true
            
          });

        }

        if(error.response.data.error === 'invalid_grant'){
        toast.current.show({
          severity: "error",
          summary: "Usuário e/ou senha inválidos",
          detail: "Tente novamente!",
          life: 3000,
        });
      }
      });
  };

  return (
    <>
      <Toast ref={toast} position="top-center" />

      <div className="container" id="container">
        <div className="form-container sign-up-container"></div>
        <div className="form-container sign-in-container">
          <div className="form-login-container">
            <h4> Utilize sua conta uniplus para acesso ao sistema </h4>
            <input
              type="text"
              value={usuario}
              style={{ width: "50%" }}
              placeholder="Código"
              onChange={(e) => setUsuario(e.target.value)}
            />
            <input
              type="password"
              value={senha}
              style={{ width: "50%" }}
              placeholder="Senha"
              onChange={(e) => setSenha(e.target.value)}
            />
          
            <button onClick={() => login()}>Acessar</button>
          </div>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Bem vindo(a)!</h1>
              <img src={Logo} style={{ width: "450px" }} alt="logo do sistema" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
