import "./index.css";

import React, { useState, useContext, useRef } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";

import { Toast } from "primereact/toast";

import axios from "axios";

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

  const api = axios.create({
    baseURL: "http://localhost:2096",
    timeout: 1000,
    headers: headers,
    params: params,
  });

  const login = () => {
    api
      .post("/oauth/token", { params, headers })
      .then((response) => {
        isLogado.setLogado(true);
        isLogado.setUsuarioLogado(usuario)
        const accessToken = JSON.stringify(response.data)

        localStorage.setItem('access_token', accessToken);

        navigate("/precificar");
      })
      .catch((error) => {
        isLogado.setLogado(false);

        toast.current.show({
          severity: "error",
          summary: "Usuário e/ou senha inválidos",
          detail: "Favor, tente novamnte",
          life: 3000,
        });
      });
  };

  return (
    <>
     <Toast ref={toast} position="top-center" />
      <div className="container-formulario-login">
        <div className="container" id="container">
          <div className="form-container sign-in-container">
            <div className="form-action">
              <h3>Acesso ao sistema</h3>

              <span>Utilize seu login e senha uniplus </span>

              <input
                type="text"
                placeholder="Código"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button onClick={() => login()}>Entrar</button>
            </div>
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-right">
                <h1>Bem vindo</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
