import "./index.css";
import ImagemDestque from "../../assets/img/undraw_login_re_4vu2.svg";
import ImagemOffline from "../../assets/img/undraw_monitor_iqpq.svg";
import ImagemFundo from '../../assets/img/icones-tela-login.svg'

import React, { useState, useContext, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";
import { ProgressBar } from 'primereact/progressbar';
import { Avatar } from "primereact/avatar";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

import { Button } from "primereact/button";
import axios from "axios";

import Logo from "../../assets/img/logo_jj.png";

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
        localStorage.setItem("ultimoLogado", usuario?.toUpperCase());

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
    if(localStorage.getItem("ultimoLogado")) {
      input2Ref?.current?.focus()

    } else {
      input1Ref?.current?.focus()
    }
    getStatus();
    verificaUltimoLogado();
    setInterval(() => {
      getStatus();
    }, 30000);
  }, []);

  return (
    <>
    <Dialog
        header={loading? 'Acessando ...' : ''}
        closable={false}
        modal
        visible={loading}
        position="bottom"
        style={{width:'50%', height:'250px'}}
      >
       <div style={{display:'flex', justifyContent:'center'}}>
       <h1> ... Acessando o servidor ... </h1>
         

       </div>
         
       <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
         
       
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
     
      <div
        style={{
          display: "flex",
          flexDirection :'column',
          alignItems: "center",
          gap:'5px',
          flexWrap : 'wrap',
          minHeight: '100vh',
          padding:'1rem',
          
          backgroundImage: `url(${ImagemFundo})`,
          backgroundRepeat : 'no-repeat',
          backgroundPosition:'bottom' 
        }}
      >
         <div
            style={{
              backgroundColor: "#FFFF",
              borderRadius : '50px',
              width:'250px',
             padding:'10px',
              height:'250px',
              border : '1px solid #FFFF'
            }}
          >
            <img
              src={Logo}
              alt="logo-sistema"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
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
                    Utilize sua conta <b style={{color:'red'}}><u>uniplus</u></b> para acesso ao sistema
                  </h1>
                </Typing>{" "}
              </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap:'20px'
          }}
        >
         

          <section>
            <div className="form-login">
              {localStorage.getItem("ultimoLogado") ? (
                <Avatar
                  label={localStorage.getItem("ultimoLogado")}
                  size="xlarge"
                  shape="circle"
                />
              ) : (
                <img style={{ width: "250px" }} src={ImagemDestque} />
              )}
              <div></div>
             
              <Badge
              style={{margin:'5px'}}
                severity={statusApi === "UP" ? "success" : "danger"}
                value={
                  statusApi === "UP"
                    ? "Aplicativo On-line "
                    : "Aplicativo Off-line"
                }
              ></Badge>
              <form onSubmit={login}>
                <div >
                  {localStorage.getItem("ultimoLogado") ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          color: "#ffff",
                          margin: "5px",
                          flexDirection: "column",
                        }}
                      >
                        <h1>Bem vindo(a) de volta </h1>
                        <h2>
                          {
                            JSON.parse(localStorage.getItem("access_token"))
                              ?.nome
                          }
                        </h2>
                      </div>
                    </>
                  ) : (
                    <>
                      <InputText
                        
                        inputMode="text"
                        type="text"
                        value={usuario}
                        style={{ width: "100%", margin: "5px" }}
                        placeholder="Código"
                        onChange={(e) => setUsuario(e.target.value)}
                        ref={input1Ref}
                        onKeyDown={(e) => handleKeyDown(e, input2Ref)}
                      />
                    </>
                  )}
                </div>
                <div>
                  <InputText
                    
                    type="password"
                    inputMode="text"
                    value={senha}
                    style={{ width: "100%", margin: "5px" }}
                    placeholder="Senha"
                    onChange={(e) => setSenha(e.target.value)}
                    ref={input2Ref}
                     
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <Button
                    icon="pi pi-sign-in"
                    iconPos="right"
                    loading={loading}
                    disabled={loading}
                    type="submit"
                    className=" p-button p-button-rounded p-button-secondary p-button-md botao-login"
                    label={loading ? "Autenticando ... " : "Entrar"}
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
