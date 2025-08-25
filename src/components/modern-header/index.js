import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import Context from "../../contexts";
import "./styles.css";

const ModernHeader = ({ collapsed = false }) => {
  const isLogado = useContext(Context);
  const navigate = useNavigate();
  const op = React.useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [userName, setUserName] = useState("Usuário");
  const [userRole, setUserRole] = useState("Carregando...");
  const [isActive, setIsActive] = useState(true);
  

  const logout = () => {
    localStorage.clear();
    isLogado.setLogado(false);
    navigate("/");
  };

  const menuItems = [
    {
      label: "Perfil",
      icon: "pi pi-user",
      command: () => {
        navigate("/perfil");
      }
    },
    {
      label: "Configurações",
      icon: "pi pi-cog",
      command: () => {
        navigate("/configuracoes");
      }
    },
    {
      separator: true
    },
    {
      label: "Sair",
      icon: "pi pi-sign-out",
      command: logout,
      className: "logout-menu-item"
    }
  ];

  useEffect(() => {
    try {
      let token = localStorage.getItem("access_token");
      if (token) {
        let tokenData = JSON.parse(token);
        setUserName(tokenData.nome || "Usuário");
        
        // Definir permissão (supervisor ou não)
        const isSupervisor = tokenData.supervisor || false;
        setUserRole(isSupervisor ? "Supervisor" : "Operador");
        
        // Definir status (ativo ou inativo)
        const userIsActive = !tokenData.inativo;
        setIsActive(userIsActive);
      }
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error);
      setUserName("Usuário");
      setUserRole("Operador");
      setIsActive(true);
    }
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Implementar lógica de busca aqui
      console.log('Buscar por:', searchQuery);
    }
  };

  return (
    <header className={`modern-header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-container">
        {/* Logo/Brand Section */}
        <div className="header-brand">
          <div className="brand-logo">
            <i className="pi pi-chart-line header-logo-icon"></i>
            <span className="brand-title">JJ </span>
          </div>
          <div className="brand-subtitle">Sistema de Gestão</div>
        </div>

        

        {/* Actions Section */}
        <div className="header-actions">
         
          

          {/* User Section */}
          <div className="header-user">
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className={`user-role ${!isActive ? 'user-inactive' : ''}`}>
                {userRole} {!isActive && '(Inativo)'}
              </span>
            </div>
            
            <div className="user-avatar-container">
              <Avatar
                label={userName.charAt(0).toUpperCase()}
                className="user-avatar"
                shape="circle"
                onClick={(e) => op.current.toggle(e)}
              />
              <div className="status-indicator online"></div>
            </div>

            <OverlayPanel 
              ref={op} 
              className="user-menu" 
              appendTo="body"
              showCloseIcon={false}
              dismissable={true}
              breakpoints={{ '960px': '75vw', '641px': '90vw', '961px': '50vw' }}
              style={{ zIndex: 9999 }}
            >
              <div className="menu-content">
                <div className="menu-header">
                  <Avatar
                    label={userName.charAt(0).toUpperCase()}
                    className="menu-avatar"
                    shape="circle"
                  />
                  <div className="menu-user-info">
                    <span className="menu-user-name">{userName}</span>
                   
                    <span className={`menu-user-role ${!isActive ? 'inactive' : ''}`}>
                      {userRole} {!isActive && '• Inativo'}
                    </span>
                  </div>
                </div>
                <hr className="menu-separator" />
                {menuItems.map((item, index) => {
                  if (item.separator) {
                    return <hr key={index} className="menu-separator" />;
                  }
                  return (
                    <div
                      key={index}
                      className={`menu-item ${item.className || ''}`}
                      onClick={item.command}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </OverlayPanel>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;