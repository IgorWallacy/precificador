import React, { useEffect, useState } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";

import api from '../../services/axios'

const Menu = () => {
  const navigate = useNavigate();
  const [filial, setFilial] = useState([]);

  const getFilial = () => {

    return api.get("/api/filial").then((r) => {
      setFilial(r.data)
    })
  }

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
      label: "Controle de validade e lote",
      icon: "pi pi-fw pi-pencil",
      items: [
        {
          label: "Cadastrar",
          icon: "pi pi-save",
          command: () => navigate("/produtos/validade/novo"),
        },

        {
          label: "Consultar",
          icon: "pi pi-calendar",
          command: () => navigate("/produtos/validade/consulta"),
        },
      ],
    },
  

    /*
      label: "Alteração de preços",
      icon: "pi pi-fw pi-change",
      command: () => navigate("/produtos/precos-alterados"),
    */

    {
      label: "Vendas",
      icon: "pi pi-shopping-cart",
      items: [
        {
          label: "PDV",
          icon: "pi pi-shopping-bag",
          command: () => navigate("/vendas"),
        },
        {
          label: "Produtos sem vendas",
          icon: "pi pi-times",
          command: () => navigate("/produtos/sem-vendas"),
        },
        {
          label: "Indicadores",
          icon: "pi pi-chart-line",
          command: () => navigate("/vendas/indicadores"),
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

        {
          label: "Metas",
          icon: "pi pi-chart-line",
          command: () => navigate("/vendas/metas"),
        },
      ],
    },
    {
      label: "Estoque",
      icon: "pi pi-box",
      items: [
        {
          label: "Exportar",
          icon: "pi pi-file-excel",
          command: () => navigate("/estoque/ajustes"),
        },
        {
          label: "Inventários",
          icon: "pi pi-box",
          command: () => navigate("/estoque/lista-inventario"),
        },

        
      ],
    },
  ];

  // Defina o objeto do item "Compras por fornecedor"
  const comprasFornecedor = {
    label: "Compras por fornecedor",
    icon: "pi pi-users",
    command: () => navigate("/compras/estoque"),
  };

  const precificarProdutos = {
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
        command: () => navigate("/produtos/precificar-executar"),
      },
    ],
  }

  // Verifique a condição e adicione o objeto ao array 'items' se a condição for atendida
  if (filial.length > 1) {
    items
      .find((item) => item.label === "Business Intelligence")
      .items.push(comprasFornecedor);

      
      items.push(precificarProdutos);
  }

  useEffect(() => {
      getFilial()
  },[])

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
