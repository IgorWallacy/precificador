import { Badge } from "primereact/badge";

import "./styless.css";

import api from "../../services/axios";
import React, { useState, useEffect } from "react";

import { Dialog } from "primereact/dialog";

import ImagemOffline from "../../assets/img/offline.png";

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
      <Dialog closable={false} visible={statusApi === "Network Error"}>
        <h1>API {statusApi} </h1>
        <img
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "75%",
          }}
          src={ImagemOffline}
        />
        <h1>Tentando restabelecer a conexão com o servidor </h1>
        <h4>
          {" "}
          caso o problema persista, verifique sua conexão com a internet ou
          reinicie o servidor
        </h4>
      </Dialog>

      <div style={{ position: "absolute", top: "2%", right: "2%" }}>
        <Badge
          severity={statusApi === "UP" ? "success" : "danger"}
          value={statusApi === "UP" ? "API Online " : "API Offline"}
        ></Badge>
      </div>
    </>
  );
};

export default Footer;
