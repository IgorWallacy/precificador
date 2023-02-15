import React, { useState } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";

const Menu = (data) => {
  const navigate = useNavigate();

  const [filial, setFilial] = useState(data.filial);

  const items = [
    {
      label: "Início",
      icon: "pi pi-fw pi-globe",
      command: () => navigate("/menu"),
    },
    {
      label: "Precificação de notas",
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
    {
      label: "Precificação de produtos",
      icon: "pi pi-fw pi-pencil",
      items: [
        {
          label: "Agendar",
          icon: "pi pi-calendar",
          command: () => navigate("/produtos/precificar-agendar"),
        },

        {
          label: "Conferir e atualizar",
          icon: "pi pi-save",
          command: () => navigate("/precificar-executar"),
        },
      ],
    },
    {
      label: "Vendas",
      icon: "pi pi-shopping-cart",
      items: [
        {
          label: "PDV",
          icon: "pi pi-shopping-bag",
          command: () => navigate("/vendas"),
        },
      ],
    },

    {
      label: "Compras",
      icon: "pi pi-shopping-bag",
      items: [
        {
          label: "Novo pedido",
          icon: "pi pi-shopping-bag",
          command: () => navigate("/compras/analise/fornecedor"),
        },

        {
          label: "Consultar pedidos",
          icon: "pi pi-list",
          command: () => navigate("/compras/consulta"),
        },
      ],
    },
    {
      label: "PDV",
      icon: "pi pi-shield",
      items: [
        {
          label: "Status",
          icon: "pi pi-star",
          command: () => navigate("/pdv/status"),
        },
      ],
    },
    {
      label: "Business Intelligence",
      icon: "pi pi-prime",
      items: [
        {
          label: "Análises",
          icon: "pi pi-slack",
          command: () => navigate("/bi/pivot"),
        },
      ],
    },
  ];

  return (
    <>
      <PanelMenu
        className="menu-left"
        model={items}
        style={{ width: "100%" }}
      />
    </>
  );
};

export default Menu;
