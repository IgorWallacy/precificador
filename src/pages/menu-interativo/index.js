import React, { useEffect, useState } from "react";

import "./menu-interativo.css";

import Typing from 'react-typing-animation';
import { Button } from 'primereact/button';
import { useNavigate } from "react-router-dom";


const MenuInterativo = () => {

    const [nome, setNome] = useState("");
   
   

    const navigate = useNavigate()

    useEffect ( () => {
        let token = localStorage.getItem("access_token");
        let a = JSON.parse(token);
       
        
        setNome(a.nome);
    }, [])

    const greetingMessage = () => {
      //let h = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', hour12: false }); 
      let h = new Date().getHours();
      switch (true) {
        case h <= 5: return 'Bom dia';
        case h < 12: return 'Bom dia';
        case h < 18: return 'Boa tarde';
        default: return 'Boa noite';
      }
          
    }
    

  return (
    <>
      <div className="menu-interativo">
      <Typing speed={100}  startDelay={10} >
        <div className="texto-menu-interativo"><em>{greetingMessage()}</em> <h1>{nome}</h1> 
        <em>o que você deseja fazer hoje ? </em> </div>
        </Typing>
      </div>
      <div className="opcoes-menu">
      <Button label="Agendar precificação"  
      icon="pi pi-calendar"  className="p-button-rounded p-button-help p-button-lg"
      onClick= {() => navigate('/precificar-agendar')} />
      <Button label="Executar precificação"  icon="pi pi-sync"  className="p-button-rounded p-button-help p-button-lg"
      onClick={() => navigate('/precificar-executar')}
      />
     
      </div>
    </>
  );
};

export default MenuInterativo;
