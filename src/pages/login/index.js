import "./index.css";
import ImagemDestque from "../../assets/img/undraw_login_re_4vu2.svg";

import QrCode from "../../assets/img/qrCode.png";
import GooglePlay from "../../assets/img/google_play.json";
import ImagemOffline from "../../assets/img/undraw_monitor_iqpq.svg";

import { Player } from "@lottiefiles/react-lottie-player";

import React, { useState, useContext, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

import { Button } from "primereact/button";
import axios from "axios";

import Logo from "../../assets/img/logo_jj.png";

import { useParams } from "react-router-dom";
import { Badge } from "primereact/badge";

import "primeflex/primeflex.css";

const Login = () => {
  const toast = useRef(null);
  const { invalid_access } = useParams();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [statusApi, setStatusApi] = useState(null);

  const isLogado = useContext(Context);

  const input1Ref = useRef(null);
  const input2Ref = useRef(null);

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
  const baseURLUniplus =
    window.location.protocol + "//" + window.location.hostname;

  //DESENVOLVIMENTO
  //const baseURL = "http://localhost:2096"

  const api = axios.create({
    baseURL: baseURL,
    headers: headers,
    params: params,
  });

  var params_uniplus = {
    // client: "client_credentials",
    // username: usuario?.toUpperCase(),
    // password: senha,
    grant_type: "client_credentials",
  };

  var headers_uniplus = {
    Authorization: "Basic dW5pcGx1czpsNGd0cjFjazJyc3ByM25nY2wzZW50",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const api_uniplus = axios.create({
    baseURL: baseURLUniplus,
    headers: headers_uniplus,
    params: params_uniplus,
  });

  const getToken_uniplus = async () => {
    return await api_uniplus
      .post("/oauth/token")
      .then((r) => {
        //  console.log(r.data)
        const accessToken_uniplus = JSON.stringify(r.data);
        localStorage.setItem("access_token_uniplus", accessToken_uniplus);


      })
      .catch((e) => {
        console.log(e);
      });
  };

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
        localStorage.setItem("ultimoLogado", usuario?.toUpperCase());
        localStorage.setItem("nome_logado", JSON.parse(accessToken)?.nome);

        navigate("/metabase");

        try {
          getToken_uniplus();
        } catch (error) {
          console.log(error);
        }
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

        if (error?.response?.data?.error === "invalid_grant") {
          toast.current.show({
            severity: "error",
            summary: "Usuário e/ou senha inválidos",
            detail: "Tente novamente!",
            life: 3000,
          });
        }
      });
  }

  const handleKeyDown = (e, nextElementRef) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evita o comportamento padrão do Enter

      // Simula pressionar Tab focando no próximo elemento
      nextElementRef.current.focus();
    }
  };

  const verificaUltimoLogado = () => {
    if (localStorage.getItem("ultimoLogado")) {
      setUsuario(localStorage.getItem("ultimoLogado"));
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("ultimoLogado")) {
      input2Ref?.current?.focus();
    } else {
      input1Ref?.current?.focus();
    }
    getStatus();
    verificaUltimoLogado();
    setInterval(() => {
      getStatus();
    }, 30000);
  }, []);

  return (

    <div className="login-container">

      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="login-content">
        <div className="login-section">
          <div className="brand-container">
            <img src={Logo} alt="JJ Logo" className="brand-logo" />

            <p className="brand-slogan">Consultoria em Informática</p>
            <p className="brand-description">Utilize sua conta do Uniplus para acessar o sistema</p>
          </div>

          <form onSubmit={login} className="login-form">
            {invalid_access && (
              <div className="error-message">
                <i className="pi pi-exclamation-triangle"></i>
                <div>
                  <strong>Por motivos de segurança você foi desconectado!</strong>
                  <p>A API de atualização de preços do uniplus expira a cada 60 minutos.</p>
                  <p>Por favor faça login novamente!</p>
                </div>
              </div>
            )}

            {localStorage.getItem("ultimoLogado") ? (
              <div className="welcome-message">
                <h2>Bem-vindo(a) de volta</h2>
                <h1>{(localStorage.getItem("nome_logado"))}</h1>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  <i className="pi pi-user"></i>
                  Código
                </label>
                <InputText
                  autoFocus
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Digite seu código"
                  className="form-input"
                  ref={input1Ref}
                  onKeyDown={(e) => handleKeyDown(e, input2Ref)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <i className="pi pi-lock"></i>
                Senha
              </label>
              <InputText
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="form-input"
                ref={input2Ref}
              />
            </div>

            <Button
              label={loading ? "Autenticando..." : "Entrar"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              iconPos="right"
              loading={loading}
              disabled={loading}
              type="submit"
              className="login-button"
            />


          </form>
        </div>

        <div className="landing-section">
          <div className="landing-content">
            <h2 className="landing-title">Soluções Inteligentes para Seu Supermercado</h2>
            <p className="landing-subtitle">Otimize sua gestão com ferramentas poderosas e intuitivas</p>

            <div className="features-grid">
              <div className="feature-card">
                <i className="pi pi-tag feature-icon"></i>
                <h3>Precificação Inteligente</h3>
                <p>Sugestões automáticas de preços baseadas em markup e markdown para maximizar lucros.</p>
              </div>

              <div className="feature-card">
                <i className="pi pi-calendar feature-icon"></i>
                <h3>Agendamento de Preços</h3>
                <p>Planeje e automatize mudanças de preços para estratégias de venda eficientes.</p>
              </div>

              <div className="feature-card">
                <i className="pi pi-chart-bar feature-icon"></i>
                <h3>Análise Avançada</h3>
                <p>Relatórios detalhados e insights para decisões baseadas em dados reais.</p>
              </div>

              <div className="feature-card">
                <i className="pi pi-mobile feature-icon"></i>
                <h3>App de Inventário</h3>
                <p>Controle de estoque móvel, rápido e preciso para o dia a dia do seu negócio.</p>
              </div>
            </div>

            <div className="app-download">
              <h3>Baixe o App de Inventário</h3>
              <p>Inventário descomplicado na palma da sua mão</p>
              <img src={QrCode} alt="QR Code" className="qr-code" />
              <Player src={GooglePlay} className="google-play" autoplay loop />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        header=""
        closable={false}
        modal
        visible={loading}
        position="center"
        style={{ 
          width: "400px", 
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          borderRadius: "20px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
        }}
        className="loading-dialog"
      >
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          
          <h2 className="loading-title">Conectando ao Sistema</h2>
          <p className="loading-subtitle">Autenticando suas credenciais...</p>
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-text">Verificando conexão...</span>
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Aplicativo ` + statusApi}
        closable={false}
        visible={statusApi === "Offline"}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={ImagemOffline}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
            }}
          />
          <h1>Tentando restabelecer a conexão com o servidor </h1>
          <h2>
            {navigator.onLine
              ? "Seu dispositivo está conectado a rede, porém não conseguimos localizar o servidor"
              : "Seu dispositivo está desconectado da rede"}
          </h2>
          <h3>
            caso o problema persista
            {navigator.onLine
              ? " reinicie o servidor"
              : " verifique cabos e conexões"}
          </h3>
        </div>
      </Dialog>

      <Toast ref={toast} position="bottom-center" />
    </div>
  );
};

export default Login;