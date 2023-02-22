import React, { useEffect, useState } from "react";

import api from "../../services/axios";

import Footer from "../../components/footer";
import Header from "../../components/header";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faTags,
  faBox,
  faUserGroup,
  faGlobe,
  faBusinessTime,
} from "@fortawesome/free-solid-svg-icons";

import "./menu-interativo.css";

import Typing from "react-typing-animation";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const MenuInterativo = () => {
  const [nome, setNome] = useState("");
  const [headers, setHeaders] = useState();
  const [filial, setFilial] = useState(null);

  const navigate = useNavigate();

  const getFilial = () => {
    api
      .get("/api/filial")
      .then((r) => {
        setFilial(r.data);
      })
      .catch((e) => {
        // console.log(e);
      })
      .finally((f) => {});
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
    pegarTokenLocalStorage();
    getFilial();
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setNome(a.nome);
  }, []);

  const greetingMessage = () => {
    //let h = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', hour12: false });
    let h = new Date().getHours();
    switch (true) {
      case h <= 5:
        return "Bom dia";
      case h < 12:
        return "Bom dia";
      case h < 18:
        return "Boa tarde";
      default:
        return "Boa noite";
    }
  };

  return (
    <>
      <Header filial={filial?.length} />
      <Footer />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          color: "#DDDD",
          padding: "1em",
        }}
      >
        <Typing speed={25} startDelay={10}>
          <div className="texto-menu-interativo">
            {greetingMessage()}
            <h1 style={{ fontFamily: "cabin-sketch-bold" }}>{nome}</h1>
            <h2 style={{ fontFamily: "cabin-sketch-bold" }}>
              O que você deseja fazer hoje ?
            </h2>
          </div>
        </Typing>
      </div>
      <div className="menu-interativo">
        <div className="menu-categoria">
          <FontAwesomeIcon icon={faTags} size="2x" />
          <h1>Precificar</h1>
          <div className="opcoes-menu">
            <div>
              <h1>Notas ficais</h1>
            </div>
            <Button
              label="Agendar preços"
              icon="pi pi-calendar"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/precificar-agendar")}
            />
            <Button
              label="Conferir e atualizar preços"
              icon="pi pi-sync"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/precificar-executar")}
            />
          </div>
          <div className="opcoes-menu">
            <div>
              <h1>Produtos</h1>
            </div>
            <Button
              label="Agendar preços"
              icon="pi pi-calendar"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/produtos/precificar-agendar")}
            />
            <Button
              label="Conferir e atualizar preços"
              icon="pi pi-sync"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/produtos/precificar-executar")}
            />
          </div>
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faStore} size="2x" />
          <h1>Vendas</h1>
          <div className="opcoes-menu">
            <Button
              label="PDV"
              icon="pi pi-shopping-cart"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/vendas")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Produtos sem vendas"
              icon="pi  pi-times   "
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/produtos/sem-vendas")}
            />
          </div>
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faBusinessTime} size="2x" />
          <h1>B.I</h1>
          <div className="opcoes-menu">
            <Button
              label="Business Intelligence"
              icon="pi pi-prime"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/bi/pivot")}
            />
          </div>
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faGlobe} size="2x" />
          <h1>Status</h1>
          <div className="opcoes-menu">
            <Button
              label="PDV"
              icon="pi pi-globe"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/pdv/status")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuInterativo;
