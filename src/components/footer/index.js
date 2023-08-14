import { Badge } from "primereact/badge";

import "./styless.css";

import api from "../../services/axios";
import React, { useState, useEffect } from "react";

import { Dialog } from "primereact/dialog";

import ImagemOffline from "../../assets/img/undraw_monitor_iqpq.svg";

const Footer = () => {
  const [statusApi, setStatusApi] = useState("Online");

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

  useEffect(() => {
    getStatus();

    setInterval(() => {
      getStatus();
    }, 3000);
  }, []);

  return (
    <>
      <Dialog header={`Aplicativo ` + statusApi} closable={false} visible={statusApi === "Network Error"}>
        
         <div style={{
        display : 'flex',
        flexDirection : 'column',
        justifyContent : 'center',
        alignItems : 'center'
      }}>


        <img
          src={ImagemOffline}
          style={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center",
            width: "65%",
          }}
        />
        <h1>Tentando restabelecer a conexão com o servidor </h1>
        <h4>
          {" "}
          caso o problema persista, verifique sua conexão com a internet ou
          reinicie o servidor
        </h4>
        </div>
      </Dialog>

      <div style={{ position: "absolute", top: "2%", right: "2%" }}>
        <Badge
          severity={statusApi === "UP" ? "success" : "danger"}
          value={statusApi === "UP" ? "Aplicativo On-line " : "Aplicativo Off-line"}
        ></Badge>
      </div>
    </>
  );
};

export default Footer;
