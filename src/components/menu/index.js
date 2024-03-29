import React, { useEffect, useState } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate } from "react-router-dom";
import { Badge } from "primereact/badge";

import api from "../../services/axios";

const Menu = () => {
  const navigate = useNavigate();
  const [filial, setFilial] = useState([]);

  const getFilial = () => {
    return api.get("/api/filial").then((r) => {
      setFilial(r.data);
    });
  };
  const itemRenderer = (item, options) => (
    <a
      style={{backgroundColor:'#f4f4f4'}}
      className="flex gap-3 flex-column justify-content-evenly align-items-center px-3 py-2  cursor-pointer "
      onClick={options.onClick}
    >
      <span className={`${item.icon} text-primary`} />
      <span className={`mx-2 ${item.items && "font-semibold"}`}>
        {item.label}
      </span>
      {item.badge && <Badge className="ml-auto" value={item.badge} />}
      {item.shortcut && (
        <span className="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">
          {item.shortcut}
        </span>
      )}
    </a>
  );

  const items = [
    {
      label: "Início",
      icon: "pi pi-fw pi-globe",
      command: () => navigate("/menu"),
      template: itemRenderer,
    },
    {
      label: "Precificação de notas",
      icon: "pi pi-fw pi-pencil",
      template: itemRenderer,
      items: [
        {
          label: "Agendar",
          icon: "pi pi-calendar",
          command: () => navigate("/precificar-agendar"),
          template: itemRenderer,
        },

        {
          label: "Conferir e atualizar",
          icon: "pi pi-save",
          command: () => navigate("/precificar-executar"),
          template: itemRenderer,
        },
      ],
    },
    {
      label: "Controle de validade e lote",
      icon: "pi pi-fw pi-pencil",
      template: itemRenderer,
      items: [
        {
          label: "Cadastrar",
          icon: "pi pi-save",
          command: () => navigate("/produtos/validade/novo"),
          template: itemRenderer,
        },

        {
          label: "Consultar",
          icon: "pi pi-calendar",
          command: () => navigate("/produtos/validade/consulta"),
          template: itemRenderer,
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
      template: itemRenderer,
      items: [
        {
          label: "PDV",
          icon: "pi pi-shopping-bag",
          command: () => navigate("/vendas"),
          template: itemRenderer,
        },
        {
          label: "Produtos sem vendas",
          icon: "pi pi-times",
          command: () => navigate("/produtos/sem-vendas"),
          template: itemRenderer,
        },
        {
          label: "Indicadores",
          icon: "pi pi-chart-line",
          command: () => navigate("/vendas/indicadores"),
          template: itemRenderer,
        },
        
      ],
    },

    {
      label: "PDV",
      icon: "pi pi-shield",
      template: itemRenderer,
      items: [
        {
          label: "Status",
          icon: "pi pi-star",
          command: () => navigate("/pdv/status"),
          template: itemRenderer,
        },
      ],
    },
    {
      label: "Business Intelligence",
      icon: "pi pi-prime",
      template: itemRenderer,
      items: [
        {
          label: "Análises",
          icon: "pi pi-slack",
          command: () => navigate("/bi/pivot"),
          template: itemRenderer,
        },

        {
          label: "Metas",
          icon: "pi pi-chart-line",
          command: () => navigate("/vendas/metas"),
          template: itemRenderer,
        },
      ],
    },
    {
      label: "Estoque",
      icon: "pi pi-box",
      template: itemRenderer,
      items: [
        {
          label: "Zerar estoque e Exportar",
          icon: "pi pi-file-excel",
          command: () => navigate("/estoque/ajustes"),
          template: itemRenderer,
        },
        {
          label: "Inventários",
          icon: "pi pi-box",
          command: () => navigate("/estoque/lista-inventario"),
          template: itemRenderer,
        },
      ],
    },
  ];

  // Defina o objeto do item "Compras por fornecedor"
  const comprasFornecedor = {
    label: "Compras por fornecedor",
    icon: "pi pi-users",
    template: itemRenderer,
    command: () => navigate("/compras/estoque"),
    template: itemRenderer,
  };

  const precificarProdutos = {
    label: "Precificação de produtos",
    icon: "pi pi-fw pi-pencil",
    template: itemRenderer,
    items: [
      {
        label: "Agendar",
        icon: "pi pi-calendar",
        command: () => navigate("/produtos/precificar-agendar"),
        template: itemRenderer,
      },

      {
        label: "Conferir e atualizar",
        icon: "pi pi-save",
        command: () => navigate("/produtos/precificar-executar"),
        template: itemRenderer,
      },
    ],
  };
  /*
  // Verifique a condição e adicione o objeto ao array 'items' se a condição for atendida
  if (filial.length > 1) {
    items
      .find((item) => item.label === "Business Intelligence")
      .items.push(comprasFornecedor);

      
      items.push(precificarProdutos);
  }
*/
  useEffect(() => {
    getFilial();
  }, []);

  return (
    <>
      <PanelMenu
        model={items}
        style={{
          width: "100%",
          
        }}
      />
    </>
  );
};

export default Menu;
