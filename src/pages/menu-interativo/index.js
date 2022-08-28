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
} from "@fortawesome/free-solid-svg-icons";

import ImagemDestque from "../../assets/img/undraw_select_option_re_u4qn.svg";

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
      <div className="menu-interativo">
        <div style={{ width: "100%" }} className="menu-categoria">
          <Typing speed={50} startDelay={10}>
            <div className="texto-menu-interativo">
              <img src={ImagemDestque} style={{ width: "150px" }} />
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
        </div>

        <div className="menu-categoria">
          <FontAwesomeIcon icon={faUserGroup} size="2x" />
          <h1>Compras</h1>
          <div className="opcoes-menu">
            <Button
              label="Novo pedido"
              icon="pi pi-users"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/compras/analise/fornecedor")}
            />

            <Button
              label="Consultar pedido"
              icon="pi pi-list"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/compras/consulta")}
            />

            {/*   <Button
            label="Futura"
            icon="pi pi-wallet"
            className="p-button-rounded p-button-help p-button-lg"
            onClick={() => navigate("/vendas/futura")}
  /> */}
          </div>
        </div>
        {filial?.length > 1 ? (
          <>
            <div className="menu-categoria">
              <FontAwesomeIcon icon={faBox} size="2x" />
              <h1>Produtos</h1>
              <div className="opcoes-menu">
                <Button
                  label="Consultar produtos"
                  icon="pi pi-box"
                  className="p-button-rounded p-button-help p-button-lg"
                  onClick={() => navigate("/consulta")}
                />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default MenuInterativo;
