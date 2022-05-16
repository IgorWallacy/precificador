import React , {useContext, useEffect, useState} from 'react';

import "./styles.css";


import Argon from "../../assets/img/argon-white.png";
import { Avatar } from "primereact/avatar";

import Context from '../../contexts'

const Header = () => {

  const isLogado = useContext(Context)

  const [name, setName] = useState()

  const nome = () => {

    let token = localStorage.getItem("access_token")
    setName ( JSON.parse(token) ) 

  }

  
  useEffect ( () => {

    console.log(nome)

  }, [])

  return (
    <>
      <div className="logo">
        <img style={{ width: "120px" }} src={Argon} alt="img" />
          
          {(isLogado.logado) ? (
             <div className="avatar">
             <Avatar
               icon="pi pi-user"
               className="mr-2"
               size="large"
               style={{ backgroundColor: "#f2f2f2", color: "#DC2424" ,margin: '5px' }}
               shape="circle"
               
             />
             <h4>{isLogado.usuarioLogado - name }</h4>
             </div>
          ) : ( <></>)}
         
        
        </div>
      
    </>
  );
};

export default Header;
