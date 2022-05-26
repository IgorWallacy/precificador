import React from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";

const Menu = () => {
 const navigate = useNavigate()

  const items = [
    {
      label: "Início",
      icon: "pi pi-fw pi-globe",
      command: () => navigate("/menu")
    
    },
    {
      label: "Precificação",
      icon: "pi pi-fw pi-pencil",
      items: [
        {
          label: "Agendar",
          icon: "pi pi-calendar",
          command: () => navigate("/precificar-agendar"),
        },

        {
          label: "Conferir e atualizar",
          icon: "pi pi-save",
          command: () => navigate("/precificar-executar"),
        },
      ],
    },
  ];

  return (
    <>
      <PanelMenu
        className="menu-left"
        model={items}
        style={{ width: "100vh" }}
      />
    </>
  );
};

export default Menu;
