import React , {useContext, useEffect, useState} from 'react';

import "./styles.css";


import Argon from "../../assets/img/logo_duca.png";
import { Avatar } from "primereact/avatar";

import Context from '../../contexts'

const Header = () => {

  const isLogado = useContext(Context)

  const [nome, setNome] = useState("")

  
  useEffect ( () => {

    let token = localStorage.getItem("access_token")
    let a = JSON.parse(token)
    
    setNome(a.nome)

    
   

  }, [])

  return (
    <>
      <div className="logo">
        <img style={{ width: "300px" , borderRadius : '20px' }} src={Argon} alt="img" />
          
          {(isLogado.logado) ? (
             <div className="avatar">
             <Avatar
               icon="pi pi-user"
               className="mr-2"
               size="large"
               style={{ backgroundColor: "#f2f2f2", color: "#DC2424" ,margin: '5px' }}
               shape="circle"
               
             />
             <h4>{isLogado.usuarioLogado   } - {nome} </h4>
             </div>
          ) : ( <></>)}
         
        
        </div>
      
    </>
  );
};

export default Header;
