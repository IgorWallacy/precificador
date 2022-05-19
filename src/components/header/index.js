import React, { useContext, useEffect, useState } from "react";

import "./styles.css";

import Argon from "../../assets/img/logo_duca.png";
import { Avatar } from "primereact/avatar";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";

import Context from "../../contexts";
import { useNavigate } from "react-router-dom";

import CountdownTimer from "react-component-countdown-timer";

const Header = () => {
  const isLogado = useContext(Context);

  const [nome, setNome] = useState("");
  let navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    isLogado.setLogado(false);
    navigate("/");
  };

  useEffect(() => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setNome(a.nome);
  }, []);

  return (
    <>
      <div className="logo">
        <img
          style={{ width: "300px", borderRadius: "20px" }}
          src={Argon}
          alt="img"
        />

        

        {isLogado.logado ? (
          <>
            <div className="avatar">
              <Tooltip
                target=".tooltip-avatar"
                autoHide={false}
                position="bottom"
              >
                <Button
                  label="Sair"
                  onClick={() => logout()}
                  type="button"
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger ml-2"
                ></Button>
              </Tooltip>

              

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
            <div className="expira">
          <h4>Acesso expira em </h4>{" "}
          <CountdownTimer
            border
            responsive
            color="#FFF"
            backgroundColor="#db3236"
            onEnd={() => document.location.reload(true)}
            hourTitle="Hora(s)"
            minuteTitle="Min"
            secondTitle="Seg"
            count={JSON.parse(localStorage.getItem("access_token")).expires_in}
            hideDay
          />
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
