import "./index.css";
import ImagemDestque from "../../assets/img/undraw_login_re_4vu2.svg";
import ImagemOffline from "../../assets/img/offline.png";

import React, { useState, useContext, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";

import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

import { Button } from "primereact/button";
import axios from "axios";

import Logo from "../../assets/img/logo_duca.png";

import Typing from "react-typing-animation";
import { Badge } from "primereact/badge";

import "primeflex/primeflex.css";

const Login = () => {
  const toast = useRef(null);

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [statusApi, setStatusApi] = useState(null);

  const isLogado = useContext(Context);

  let navigate = useNavigate();

  let clientId = "doks";
  let clientSecret = "1234";

  var params = {
    client: "angular",
    username: usuario?.toUpperCase(),
    password: senha,
    grant_type: "password",
  };

  var headers = {
    Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  //PRODUCAO
  const baseURL =
    window.location.protocol + "//" + window.location.hostname + ":1010";

  //DESENVOLVIMENTO
  //const baseURL = "http://localhost:2096"

  const api = axios.create({
    baseURL: baseURL,
    headers: headers,
    params: params,
  });

  const getStatus = () => {
    api
      .get("/actuator/health")
      .then((r) => {
        setStatusApi(r.data.status);
      })
      .catch((error) => {
        setStatusApi("Offline");
      });
  };

  async function login(e) {
    e.preventDefault();
    isLogado.setLogado(false);
    localStorage.clear();
    setLoading(true);

    await api
      .post("/oauth/token", { params, headers })
      .then((response) => {
        localStorage.clear();
        isLogado.setLogado(true);
        isLogado.setUsuarioLogado(usuario);
        const accessToken = JSON.stringify(response.data);

        localStorage.setItem("access_token", accessToken);

        navigate("/menu");
      })
      .catch((error) => {
        setLoading(false);
        isLogado.setLogado(false);
        localStorage.clear();
        getStatus();
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
          sticky: true,
        });

        if (error.code === "401") {
          toast.current.show({
            severity: "error",
            summary: "Token expirado ",
            detail: "Atualize a pagina e faça login novamente ",
            sticky: true,
          });
        }

        if (error.message === "timeout of 1000ms exceeded") {
          toast.current.show({
            severity: "error",
            summary: "Erro ao conectar com o servidor ",
            detail:
              "Estamos com problemas ao conectar com o servidor. Favor, tente mais tarde ",
            sticky: true,
          });
        }

        if (error.response.data.error === "invalid_grant") {
          toast.current.show({
            severity: "error",
            summary: "Usuário e/ou senha inválidos",
            detail: "Tente novamente!",
            life: 3000,
          });
        }
      });
  }

  useEffect(() => {
    getStatus();
    setInterval(() => {
      getStatus();
    }, 30000);
  }, []);

  return (
    <>
      <Dialog closable={false} visible={statusApi === "Offline"}>
        <h1>API {statusApi} </h1>
        <img
          src={ImagemOffline}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "75%",
          }}
        />
        <h1>Tentando restabelecer a conexão com o servidor </h1>
        <h4>
          {" "}
          caso o problema persista, verifique sua conexão com a internet ou
          reinicie o servidor
        </h4>
      </Dialog>
      <Toast ref={toast} position="bottom-center" />
      <div className="status-api">
        <Badge
          severity={statusApi === "UP" ? "success" : "danger"}
          value={statusApi === "UP" ? "API Online " : "API Offline"}
        ></Badge>
      </div>
      <div
        style={{ marginTop: "10rem" }}
        className="grid grid-nogutter surface-0 text-800"
      >
        <div className=" logo-login col-12 md:col-6 overflow-hidden">
          <img
            src={Logo}
            alt="logo-sistema"
            className="md:ml-auto block md:h-full"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "whitesmoke",
              clipPath: "polygon(0% 0, 100% 35%, 100% 100%, 0 88%)",
            }}
          />
        </div>
        <div className="fundo col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section>
            <div className="form-login">
              <img style={{ width: "250px" }} src={ImagemDestque} />
              <div></div>
              <h4
                style={{
                  fontSize: "20px",
                  margin: "15px",
                  color: "#FFF",
                }}
              >
                <Typing speed={50}>
                  <h1 style={{ fontFamily: "cabin-sketch-bold" }}>
                    {" "}
                    Utilize sua conta uniplus para acesso ao sistema
                  </h1>
                </Typing>{" "}
              </h4>
              <form onSubmit={login}>
                <div>
                  <InputText
                    autoFocus
                    type="text"
                    value={usuario}
                    style={{ width: "100%", margin: "5px" }}
                    placeholder="Código"
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                </div>
                <div>
                  <InputText
                    type="password"
                    value={senha}
                    style={{ width: "100%", margin: "5px" }}
                    placeholder="Senha"
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <Button
                    loading={loading}
                    disabled={loading}
                    type="submit"
                    className=" botao-login"
                    label={loading ? "Autenticando ... " : "Acessar"}
                  ></Button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Login;
