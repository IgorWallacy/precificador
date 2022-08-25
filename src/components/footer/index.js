import { Badge } from "primereact/badge";

import "./styless.css";

import api from "../../services/axios";
import React, { useState, useEffect } from "react";

const Footer = () => {
  const [statusApi, setStatusApi] = useState("Online");

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

    setInterval(() => {
      getStatus();
    }, 3000);
  }, []);

  return (
    <>
      <div className="footer">
        <div className="status-api">
          <Badge
            severity={statusApi === "UP" ? "success" : "danger"}
            value={statusApi === "UP" ? "API Online " : "API Offline"}
          ></Badge>
        </div>
      </div>
    </>
  );
};

export default Footer;
