import { Badge } from "primereact/badge";

import "./styless.css";

import api from "../../services/axios";
import React, { useState, useEffect } from "react";

const Footer = () => {
  const [statusApi, setStatusApi] = useState(null);

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

  useEffect(() => {
    getStatus();
  }, []);

  return (
    <>
      <div className="footer">
        <div className="status-api">
          <Badge
            severity={statusApi === "UP" ? "success" : "danger"}
            value={
              statusApi === "UP"
                ? "Sistema online"
                : "Sistema Offline, Informe ao administrador"
            }
          ></Badge>
        </div>
      </div>
    </>
  );
};

export default Footer;
