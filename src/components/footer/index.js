import { Badge } from "primereact/badge";
import Logo from "../../assets/img/logo_jj.png";
import "./styless.css";

import api from "../../services/axios";
import React, { useState, useEffect } from "react";

import { Dialog } from "primereact/dialog";

import ImagemOffline from "../../assets/img/undraw_monitor_iqpq.svg";

import moment from "moment/moment";

const Footer = () => {
  const [statusApi, setStatusApi] = useState("Online");
  const [statusRede, setStatusRede] = useState(navigator.onLine);
  const [nome, setNome] = useState(null);
  const [headers, setHeaders] = useState();
  const [saudacao, setSaudacao] = useState(null);

  const greetingMessage = () => {
    //let h = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', hour12: false });
    let h = new Date().getHours();
    switch (true) {
      case h <= 5:
        return setSaudacao("Bom dia");
      case h < 12:
        return setSaudacao("Bom dia");
      case h < 18:
        return setSaudacao("Boa tarde");
      default:
        return setSaudacao("Boa noite");
    }
  };

  const getStatus = () => {
    api
      .get("/actuator/health")
      .then((r) => {
        setStatusApi(r.data.status);
      })
      .catch((error) => {
        setStatusApi(error.message);
      });
  };

  const pegarTokenLocalStorage = () => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);
    var headers = {
      Authorization: "Bearer " + a.access_token,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    setHeaders(headers);

    api.interceptors.request.use(
      (config) => {
        // Do something before request is sent

        config.headers["Authorization"] = "bearer " + a.access_token;
        return config;
      },

      (error) => {
        Promise.reject(error);
      }
    );
  };

  useEffect(() => {
    getStatus();
    greetingMessage();
    pegarTokenLocalStorage();
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setNome(a.nome);

    setInterval(() => {
      getStatus();
    }, 3000);
  }, []);

  useEffect(() => {
    // console.log(statusRede)
    // event listeners to update the state
    window.addEventListener("online", () => {
      setStatusRede(true);
    });

    window.addEventListener("offline", () => {
      setStatusRede(false);
    });
  }, [statusApi]);

  return (
    <>
      <div className="logo-rodape">
        <img src={Logo} width="120px" height="120px" alt="logo do sistema" />
      </div>
      <footer
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
        className="footer"
      >
         <img src={Logo} width="20px" height="20px" alt="logo do sistema" />
         <p>Powered by JJ</p>
       
       
      </footer>

      <Dialog
        header={`Aplicativo ` + statusApi}
        closable={false}
        visible={statusApi === "Network Error" || statusRede === false}
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
            Seu dispositivo está{" "}
            {statusRede
              ? "conectado a rede porém não conseguimos localizar o servidor"
              : "desconectado da rede"}
          </h2>
          <h4>
            {" "}
            caso o problema persista, verifique sua conexão com a internet ou
            reinicie o servidor
          </h4>
        </div>
      </Dialog>

      <div style={{ position: "fixed", top: "2%", right: "2%", zIndex: "998" }}>
        <Badge
          severity={statusApi === "UP" ? "success" : "danger"}
          value={
            statusApi === "UP" ? "Aplicativo On-line " : "Aplicativo Off-line"
          }
        ></Badge>
      </div>
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
        }}
      >
        <Badge
          size="normal"
          severity="warning"
          value={`${saudacao} ${nome}, hoje é ${moment(new Date()).format(
            "dddd - DD/MM/yyyy "
          )}`}
        ></Badge>
      </div>
    </>
  );
};

export default Footer;
