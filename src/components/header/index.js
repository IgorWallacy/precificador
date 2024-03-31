import React, { useContext, useEffect, useState } from "react";

import "./styles.css";
import "../menu/menu.css";

import { Avatar } from "primereact/avatar";

import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Calendar } from "primereact/calendar";

import Context from "../../contexts";
import { useNavigate } from "react-router-dom";



import Toolbar from "@mui/material/Toolbar";

import Menu from "../menu";
import moment from "moment/moment";

const Header = (data) => {
  const isLogado = useContext(Context);

  const [nome, setNome] = useState("");
  const [visibleLeft, setVisibleLeft] = useState(false);


  let navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    isLogado.setLogado(false);
    navigate("/");

    //  window.location.href('/')
  };

  useEffect(() => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setNome(a.nome);
  }, []);

  return (
    <>
      <div className="header">

        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "10px",
            
          }}
        >
          <Button
            icon="pi pi-align-justify"
            className="p-button p-button-rounded p-button-sm p-button-help"
          
            onClick={() => setVisibleLeft(true)}
          />

          <Button
            icon="pi pi-home"
            size="small"
            className="p-button p-button-rounded p-button-sm p-button-help"
            onClick={() => navigate("/menu")}
          />
        </Toolbar>

        <div>
          <Sidebar
            modal={true}
            className="p-sidebar-md"
            visible={visibleLeft}
            position="right"
            onHide={() => setVisibleLeft(false)}
          >
            <div className="logo">
              {isLogado.logado ? (
                <>
                  <div className="avatar">
                    <Avatar
                      icon="pi pi-user"
                      className="tooltip-avatar ml-2 mr-2"
                      size="large"
                      style={{
                        backgroundColor: "#f2f2f2",
                        color: "#DC2424",
                        margin: "5px",
                      }}
                      shape="circle"
                    />
                    <h4>
                      {isLogado.usuarioLogado} - {nome}{" "}
                    </h4>
                  </div>

                  <div>
                    <Button
                      label="Sair"
                      onClick={() => logout()}
                      type="button"
                      icon="pi pi-times"
                      className="p-button-rounded p-button-danger ml-2"
                    ></Button>
                  </div>

                  <div style={{ width: "100%" }}>
                    {" "}
                    <Menu />
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </Sidebar>
        </div>
       
        {visibleLeft ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                padding: "15px",
                flexDirection: "column",
                gap: "1.5rem",
                flexWrap: "wrap",
                backgroundImage: 'linear-gradient(to right top, #d16b91, #cb75a9, #c080be, #b18dd0, #9f99dd, #8ea3e3, #80ade6, #75b5e5, #73bde0, #79c4d9, #86c9d1, #97cecb)'
              }}
            >
              <Calendar inline showWeek />
              <h1 style={{ color: "#f2f2f2" }}>
                {" "}
                {moment().format("dddd ,DD  MMMM  YYYY - HH:mm  ")}{" "}
              </h1>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Header;
