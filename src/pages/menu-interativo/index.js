import React, { useEffect, useState } from "react";

import api from "../../services/axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faStore,  faTags, faUserGroup } from "@fortawesome/free-solid-svg-icons";


import "./menu-interativo.css";

import Typing from "react-typing-animation";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const MenuInterativo = () => {
  const [nome, setNome] = useState("");
  const [headers, setHeaders] = useState();

  const navigate = useNavigate();

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
      <div className="menu-interativo">
      
      <div style={{width : '100%'}}  className="menu-categoria">
      
        <Typing speed={100} startDelay={10}>
          <div className="texto-menu-interativo">
            <em>{greetingMessage()}</em> <h1>{nome}</h1>
            <em>o que você deseja fazer hoje ? </em>{" "}
          </div>
        </Typing>
        </div>

      <div className="menu-categoria">
     
        <FontAwesomeIcon icon={faTags} size="2x" />
        <h1>Precificar</h1>
        <div className="opcoes-menu">
          <Button
            label="Agendar remarcação"
            icon="pi pi-calendar"
            className="p-button-rounded p-button-help p-button-lg"
            onClick={() => navigate("/precificar-agendar")}
          />
          <Button
            label="Iniciar remarcação "
            icon="pi pi-sync"
            className="p-button-rounded p-button-help p-button-lg"
            onClick={() => navigate("/precificar-executar")}
          />
        </div>
      </div>
      <div className="menu-categoria">
        {" "}
        <FontAwesomeIcon icon={faStore}  size="2x" />
        <h1>Vendas</h1>
        <div className="opcoes-menu">
          <Button
            label="PDV"
            icon="pi pi-shopping-cart"
            className="p-button-rounded p-button-help p-button-lg"
            onClick={() => navigate("/vendas")}
          />
        </div>
      </div>


      <div className="menu-categoria">
        {" "}
        <FontAwesomeIcon icon={faUserGroup}  size="2x" />
        <h1>Compras</h1>
        <div className="opcoes-menu">
          <Button
            label="Fornecedor"
            icon="pi pi-users"
            
            className="p-button-rounded p-button-help p-button-lg"
            onClick={() => navigate("/compras/analise/fornecedor")}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default MenuInterativo;
