import React, { useContext, useEffect, useState } from "react";

import "./styles.css";
import "../menu/menu.css";

import { Avatar } from "primereact/avatar";

import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";

import Context from "../../contexts";
import { useNavigate } from "react-router-dom";

import Logo from "../../assets/img/logo_duca.png";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import Menu from "../menu";

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

  const isTokenValid = () => {
    let currentDate = new Date();
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    if (a.expires_in * 1000 < currentDate.getTime()) {
      //  navigate('/')
      //   window.location.href("/")
      window.location.reload();
      localStorage.clear();

      return true;
    }

    return false;
  };

  return (
    <>
      <AppBar position="relative" color="transparent">
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setVisibleLeft(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div>
        <Sidebar
          className="p-sidebar-lg"
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
                  <Menu filial={data} />
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </Sidebar>
      </div>
      <div className="logo-rodape">
        <img src={Logo} width="340px" alt="logo do sistema" />
      </div>
    </>
  );
};

export default Header;
