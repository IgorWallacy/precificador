import "./index.css";

import React, { useState, useContext, useRef } from "react";

import { useNavigate } from "react-router-dom";

import Context from "../../contexts";

import { Toast } from "primereact/toast";
import { InputText } from 'primereact/inputtext';


import axios from "axios";

import Logo from "../../assets/img/logo_duca.png";

import Typing from 'react-typing-animation';

import "primeflex/primeflex.css";

const Login = () => {
  const toast = useRef(null);

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const isLogado = useContext(Context);

  let navigate = useNavigate();

  let clientId = "doks";
  let clientSecret = "1234";

  var params = {
    client: "angular",
    username: usuario,
    password: senha,
    grant_type: "password",
  };

  var headers = {
    Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  //PRODUCAO
  const baseURL =
    window.location.protocol + "//" + window.location.hostname + ":1010";

  //DESENVOLVIMENTO
  //const baseURL = "http://localhost:2096"

  const api = axios.create({
    baseURL: baseURL,
    timeout: 1000,
    headers: headers,
    params: params,
  });

  const login = (e) => {
    e.preventDefault()
    isLogado.setLogado(false);
    localStorage.clear();
    api
      .post("/oauth/token", { params, headers })
      .then((response) => {
        localStorage.clear();
        isLogado.setLogado(true);
        isLogado.setUsuarioLogado(usuario);
        const accessToken = JSON.stringify(response.data);

        localStorage.setItem("access_token", accessToken);

        navigate("/menu");
      })
      .catch((error) => {
        isLogado.setLogado(false);
        localStorage.clear();
        //  console.log(error)

        console.log(error);

        if (error.code === "401") {
          toast.current.show({
            severity: "error",
            summary: "Token expirado ",
            detail: "Atualize a pagina e faça login novamente ",
            sticky: true,
          });
        }

        if (error.message === "timeout of 1000ms exceeded") {
          toast.current.show({
            severity: "error",
            summary: "Erro ao conectar com o servidor ",
            detail:
              "Estamos com problemas ao conectar com o servidor. Favor, tente mais tarde ",
            sticky: true,
          });
        }

        if (error.response.data.error === "invalid_grant") {
          toast.current.show({
            severity: "error",
            summary: "Usuário e/ou senha inválidos",
            detail: "Tente novamente!",
            life: 3000,
          });
        }
      });
  };

  return (
    <>
      <Toast ref={toast} position="top-center" />

          


    <div style={{marginTop:'15rem'}} className="grid grid-nogutter surface-0 text-800">
    <div className="fundo col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
        <section>
       
      
      <div className="form-login">
        <div>
       
        </div>
        <h4 style={{  fontSize:'20px' , margin:'15px', color : '#FFF'}}>  <Typing speed={100}  startDelay={10} >Utilize sua conta uniplus para acesso ao sistema</Typing> </h4>
        <form onSubmit={login}>
        <div>
        <InputText autoFocus
          type="text"
          value={usuario}
          style={{ width: "100%", margin:'5px' }}
          placeholder="Código"
          onChange={(e) => setUsuario(e.target.value)}
        />
        </div>
        <div>
        <InputText  
          type="password"
          value={senha}
          style={{ width: "100%", margin : '5px' }}
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
        />
        </div>
       <div style={{textAlign:"center"}}>
        <input type="submit" className="botao-login" value="Acessar"  ></input> 
        </div>
        </form>
        </div>
      
         
        </section>
    </div>
    <div className=" logo-login col-12 md:col-6 overflow-hidden">
    <img src={Logo} alt="logo-sistema"   className="md:ml-auto block md:h-full" style={{ width : '100vh', backgroundColor:"whitesmoke", clipPath: 'polygon(8% 0, 100% 0%, 100% 100%, 0 100%)' }} />
    </div>
</div>
        
        
      
    </>
  );
};

export default Login;
