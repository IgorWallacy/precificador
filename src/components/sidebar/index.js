import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import "./styles.css";

const MENU_ITEMS = [
  {
    id: "home",
    label: "Dashboard",
    icon: "pi pi-chart-bar",
    items: [
      { id: "metabase", label: "Dashboard Geral", icon: "pi pi-chart-pie", route: "/metabase" }
    ]
  },
  {
    id: "precificador",
    label: "Precificação",
    icon: "pi pi-tag",
    items: [
      { id: "agenda-precos", label: "Agendar Preços", icon: "pi pi-calendar-plus", route: "/precificador/agenda/precificador-dataTable-novo" },
      { id: "emitir-etiquetas", label: "Etiquetas / PDV\nEnviar carga PDV", icon: "pi pi-send", route: "/precificador/executa/precificador-dataTable" }
    ]
  },
  {
    id: "estoque",
    label: "Estoque",
    icon: "pi pi-box",
    items: [
      { id: "novo-inventario", label: "Novo Inventário", icon: "pi pi-plus-circle", route: "/estoque/contagem" },
      { id: "zerar-estoque", label: "Zerar Estoque", icon: "pi pi-refresh", route: "/estoque" }
    ]
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: "pi pi-dollar",
    items: [
      { id: "vendas-pdv", label: "Vendas PDV", icon: "pi pi-chart-line", route: "/vendas" },
      { id: "recebimentos", label: "Recebimentos", icon: "pi pi-credit-card", route: "/recebimentos/consulta" }
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  // Carregar informações do usuário do localStorage
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        // Buscar o access_token no localStorage
        const accessToken = localStorage.getItem('access_token');
        
        if (accessToken) {
          // Decodificar o JWT token (base64)
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            
            // Extrair informações do usuário do token baseado na estrutura real
            const userFromToken = {
              nome: payload.nome || 'Usuário',
              
              cargo: payload.supervisor === 1 ? 'Supervisor' : 'Colaborador',
              empresa: 'JJ Sistemas',
              avatar: payload.avatar || null,
              id: payload.id || null,
              supervisor: payload.supervisor === 1,
              inativo: payload.inativo || false
            };
            
            setUserInfo(userFromToken);
          } catch (tokenError) {
            console.log('Erro ao decodificar token:', tokenError);
            // Fallback para dados padrão
            setUserInfo({
              nome: 'Usuário',
             
              cargo: 'Colaborador',
              empresa: 'JJ Sistemas'
            });
          }
        } else {
          // Se não houver token, tentar outras chaves comuns
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          
          // Combinar todas as informações disponíveis
          const combinedUser = {
            nome: user.nome || userData.nome || authUser.nome || currentUser.nome || 'Usuário',
          
            cargo: user.cargo || userData.cargo || authUser.cargo || currentUser.cargo || 'Colaborador',
            empresa: user.empresa || userData.empresa || authUser.empresa || currentUser.empresa || 'JJ Sistemas',
            avatar: user.avatar || userData.avatar || authUser.avatar || currentUser.avatar || null
          };
          
          setUserInfo(combinedUser);
        }
      } catch (error) {
        console.log('Erro ao carregar dados do usuário:', error);
        setUserInfo({
          nome: 'Usuário',
         
          cargo: 'Colaborador',
          empresa: 'JJ Sistemas'
        });
      }
    };

    loadUserInfo();
    
    // Recarregar quando o localStorage mudar
    const handleStorageChange = () => loadUserInfo();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Detectar dispositivo móvel
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSubmenu = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleNavigate = (route) => {
    navigate(route);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {/* Botão do menu mobile */}
      {isMobile && (
        <button 
          className="mobile-menu-button"
          onClick={toggleSidebar}
        >
          <i className="pi pi-bars" />
        </button>
      )}

      {/* Área de hover para desktop */}
      {!isMobile && (
        <div 
          className="sidebar-hover-area"
          onMouseEnter={() => setIsOpen(true)}
        />
      )}

      {/* Sidebar principal */}
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        {/* Perfil do usuário */}
        {userInfo && (
          <div className="user-profile">
            <div className="user-avatar">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Avatar" />
              ) : (
                <i className="pi pi-user" />
              )}
            </div>
            <div className="user-info">
              <h3>{userInfo.nome}</h3>
              <p>{userInfo.email}</p>
              <span className="user-role">{userInfo.cargo}</span>
              {userInfo.empresa && (
                <span className="user-company">{userInfo.empresa}</span>
              )}
            </div>
          </div>
        )}

        {/* Menu de navegação */}
        <nav className="sidebar-menu">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="menu-section">
              <Button
                className="p-button-text menu-item"
                icon={item.icon}
                label={item.label}
                onClick={() => toggleSubmenu(item.id)}
                badge={expandedItems[item.id] ? '−' : '+'}
                badgeClassName="submenu-toggle"
              />
              
              {/* Submenu */}
              <div className={`submenu ${expandedItems[item.id] ? 'expanded' : ''}`}>
                {item.items.map((subItem) => (
                  <Button
                    key={subItem.id}
                    className={`p-button-text submenu-item ${location.pathname === subItem.route ? 'active' : ''}`}
                    icon={subItem.icon}
                    label={subItem.label}
                    onClick={() => handleNavigate(subItem.route)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Botão de logout */}
          <Button
            className="p-button-text logout-button"
            icon="pi pi-sign-out"
            label="Sair"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          />
        </nav>
      </aside>

      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
