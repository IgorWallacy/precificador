import React, { useEffect, useState } from "react";

import api from "../../services/axios";
import api_uniplus from "../../services/axios/axios_uniplus";
import { Dialog } from "primereact/dialog";

import Footer from "../../components/footer";
import Header from "../../components/header";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faTags,
  faGlobe,
  faBusinessTime,
  faUserTie,
  faCalendar,
  faBarcode,
  faFileInvoice,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import "./menu-interativo.css";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const MenuInterativo = () => {
  const [nome, setNome] = useState("");
  const [verificarInativo, setVerificarInativo] = useState(false);
  const [headers, setHeaders] = useState();
  const [filial, setFilial] = useState(1);

  const navigate = useNavigate();

  const getFilial = () => {
    return api
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
    console.log(a?.inativo);
    setVerificarInativo(a?.inativo);
  }, []);

  return (
    <>
      <Header />
      <Footer />
      {verificarInativo ? (
        <>
          <Dialog
            header="Aviso"
            visible={verificarInativo}
            style={{ width: "50vw" }}
            onHide={() => localStorage.clear()}
            closable={false}
            draggable={false}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesomeIcon icon={faUserTie} size="3x" />
              <h1>Usuário inativo</h1>
              <p>
                Seu usuário está inativo, favor entrar em contato com o
                administrador
              </p>
              <Button
                label="Sair"
                icon="pi pi-sign-out"
                className="p-button p-button-rounded p-button-danger"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();}}
              />
            </div>
          </Dialog>
        </>
      ) : (
        <> Ativo</>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          color: "#DDDD",
          padding: "1em",
        }}
      ></div>
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
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faGlobe} size="2x" />
          <h1>Compras</h1>
          <div className="opcoes-menu">
            <Button
              label="Pedido de compra"
              icon="pi pi-globe"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/compras/consulta")}
            />
          </div>
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faBarcode} size="2x" />
          <h1>Inventário</h1>
          <div className="opcoes-menu">
            <Button
              label="Cadastrar inventários"
              icon="pi pi-qrcode"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/estoque/lista-inventario")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Iniciar contagem"
              icon="pi pi-qrcode"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/estoque/inventario/incluir-contagem")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Zerar estoque"
              icon="pi pi-qrcode"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/estoque/ajustes")}
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
          {/*
          <div className="opcoes-menu">
            <Button
              label="Resumo de vendas"
              icon="pi pi-prime"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/vendas/resumo")}
            />
          </div>
          */}
          <div className="opcoes-menu">
            <Button
              label="Produtos sem vendas"
              icon="pi  pi-times   "
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/produtos/sem-vendas")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Dashboard"
              icon="pi  pi-chart-line   "
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/metabase")}
            />
          </div>
          {/*
          <div className="opcoes-menu">
            <Button
              label="Indicadores"
              icon="pi  pi-chart-line   "
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/vendas/indicadores")}
            />
          </div> */}
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faBusinessTime} size="2x" />
          <h1>B.I</h1>
          <div className="opcoes-menu">
            <Button
              label="Análise de Custo e Preço"
              icon="pi pi-prime"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/bi/pivot")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Metas"
              icon="pi  pi-chart-bar   "
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/vendas/metas")}
            />
          </div>{" "}
          {filial.length > 1 ? (
            <>
              <div className="opcoes-menu">
                <Button
                  label="Análise de compras x vendas "
                  icon="pi pi-users"
                  className="p-button-rounded p-button-help p-button-lg"
                  onClick={() => navigate("/compras/estoque")}
                />
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faFileInvoice} size="2x" />
          <h1>Recebimentos</h1>
          <div className="opcoes-menu">
            <Button
              label="Consultar recebimentos"
              icon="pi pi-dollar"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/recebimentos/consulta")}
            />
          </div>
          <div className="opcoes-menu">
            <Button
              label="Consultar vendas do crediário"
              icon="pi pi-dollar"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/vendas/crediario/consulta")}
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
        <div className="menu-categoria">
          {" "}
          <FontAwesomeIcon icon={faUser} size="2x" />
          <h1>Usuários</h1>
          <div className="opcoes-menu">
            <Button
              label="Gerar etiqueta de senha para usuários"
              icon="pi pi-globe"
              className="p-button-rounded p-button-help p-button-lg"
              onClick={() => navigate("/usuarios/etiqueta")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuInterativo;
